
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { Client } from "pg";
import { OBOS_DATABASE_URL } from "$env/static/private";
import { getAuthStatus } from "$lib/slitherAuth";

// GET route to get all of a participant's meal scans, and their dietary restrictions
// params:
//     email: string
// returns:
//     status: MealCode[]
//     dietaryRestrictions: string (containing valid JSON)
export const GET: RequestHandler = async ({ url, request }) => {
    const authStatus = await getAuthStatus(request);
    if (!authStatus.loggedIn) {
        return json({ "error": "Not logged in" }, { status: 401 });
    }
    else if (!authStatus.authorized) {
        return json({ "error": "Not authorized" }, { status: 403 });
    }
    
    const email = url.searchParams.get("email");

    if (!email) {
        error(400, "No email provided");
    }

    const client = new Client({
        connectionString: OBOS_DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    });
    client.connect();

    // Query for meal scans

    const query = `
        SELECT food.meal
        FROM user_user u
        JOIN volunteer_foodevent food ON u.id = food.user_id
        WHERE u.email = $1
    `;
    const values = [email];

    let mealScans = null;
    try {
        const result = await client.query(query, values);
        mealScans = result.rows.map(row => row.meal);
    } catch (err) {
        console.error("Error querying database", err);
        error(500, "Error querying database");
    }

    // Query for dietary restrictions

    const query2 = `
        SELECT apps.dietary_restrictions
        FROM user_user u
        JOIN application_application apps ON u.id = apps.user_id
        WHERE u.email = $1
    `;
    const values2 = [email];

    let dietaryRestrictions = null;
    try {
        const result = await client.query(query2, values2);
        dietaryRestrictions = result.rows[0].dietary_restrictions;
        client.end();
    } catch (err) {
        console.error("Error querying database", err);
        client.end();
        error(500, "Error querying database");
    }

    return json({ mealScans, dietaryRestrictions });
};

// POST route to log a meal scan
// params:
//     email: string
//     mealCode: MealCode
// returns:
//     nothing
export const POST: RequestHandler = async ({ url, request }) => {
    const authStatus = await getAuthStatus(request);
    if (!authStatus.loggedIn) {
        return json({ "error": "Not logged in" }, { status: 401 });
    }
    else if (!authStatus.authorized) {
        return json({ "error": "Not authorized" }, { status: 403 });
    }

    const email = url.searchParams.get("email");
    const mealCode = url.searchParams.get("mealCode");

    if (!email) {
        error(400, "No email provided");
    }
    if (!mealCode) {
        error(400, "No meal code provided");
    }

    const client = new Client({
        connectionString: OBOS_DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    });
    client.connect();

    const query = `
        INSERT INTO volunteer_foodevent (timestamp, user_id, meal)
        VALUES (
            NOW(),
            (SELECT id FROM user_user WHERE email = $1),
            $2
        )
    `;
    const values = [email, mealCode];

    try {
        await client.query(query, values);
        client.end();
    } catch (err) {
        console.error("Error querying database", err);
        client.end();
        error(500, "Error querying database");
    }

    return json({});
};

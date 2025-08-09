
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import pg from "pg";
const { Client } = pg;
import { OBOS_DATABASE_URL } from "$env/static/private";
import { getAuthStatus } from "$lib/slitherAuth";
import { ouroborosURL } from "$lib/slitherConfig";

// GET route to get all of a participant's meal scans, and their dietary restrictions
// params:
//     email: string
// returns:
//     status: MealCode[]
//     dietaryRestrictions: string (containing valid JSON)
//     mealGroup: string
export const GET: RequestHandler = async ({ fetch, url, request }) => {
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

    try {
        const response = await fetch(`${ouroborosURL}/api/volunteer/food?email=${email}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": request.headers.get("Authorization") || "",
            },
        });
        if (response.status !== 200) {
            error(response.status, "Error in Ouroboros API call");
        }

        const data = await response.json()
        return json({...data})
    } catch (err) {
        console.error("Error in Ouroboros API call", err);
        return json({ error: 'Error in Ouroboros API call' }, { status: 500 });
    }
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

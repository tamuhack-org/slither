import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { Client } from "pg";
import { DATABASE_URL } from "$env/static/private";

// GET route to get the time of a participant's most recent workshop scan
// params:
//     email: string
// returns:
//     lastWorkshopScan: string (postgresql timestamptz) | null
export const GET: RequestHandler = async ({ url }) => {
    const email = url.searchParams.get("email");

    if (!email) {
        error(400, "No email provided");
    }

    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    });
    client.connect();

    // Query for meal scans

    const query = `
        SELECT wkshp.timestamp
        FROM user_user u
        JOIN volunteer_workshopevent wkshp ON u.id = wkshp.user_id
        WHERE u.email = $1
        ORDER BY wkshp.timestamp DESC
        LIMIT 1
    `;
    const values = [email];

    let lastWorkshopScan = null;
    try {
        const result = await client.query(query, values);
        if (result.rows.length > 0) {
            lastWorkshopScan = result.rows[0].timestamp;
        }
        client.end();
    } catch (err) {
        console.error("Error querying database", err);
        client.end();
        error(500, "Error querying database");
    }

    return json({ lastWorkshopScan });
};

// POST route to log a workshop scan
// params:
//     email: string
// returns:
//     nothing
export const POST: RequestHandler = async ({ url }) => {
    const email = url.searchParams.get("email");

    if (!email) {
        error(400, "No email provided");
    }

    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    });
    client.connect();

    const query = `
        INSERT INTO volunteer_workshopevent (timestamp, user_id)
        VALUES (
            NOW(),
            (SELECT id FROM user_user WHERE email = $1)
        )
    `;
    const values = [email];

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


// TODO POST route to check in a participant

import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { Client } from "pg";
import { getCheckinStatus } from "$lib/slitherTypes";
import { DATABASE_URL } from "$env/static/private";

// GET route to get a participant's checkin status
// params:
//     email: string
// returns:
//     status: CheckinStatus
export const GET: RequestHandler = async ({ url }) => {
    const email = url.searchParams.get("email");

    if (!email) {
        error(400, "No email provided");
    }

    console.log(DATABASE_URL);
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    });
    client.connect();

    const query = `
        SELECT apps.status
        FROM user_user u
        JOIN application_application apps ON u.id = apps.user_id
        WHERE u.email = $1
    `;
    const values = [email];

    let status = null;
    try {
        const result = await client.query(query, values);
        const statusChar = result.rows[0].status;
        status = getCheckinStatus(statusChar);
    } catch (err) {
        console.error("Error querying database", err);
        error(500, "Error querying database");
    }
    client.end();

	return json({ status });
};

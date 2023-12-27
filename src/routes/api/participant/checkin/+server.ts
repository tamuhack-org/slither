
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { Client } from "pg";
import { getCheckinStatus, type CheckinStatus } from "$lib/slitherTypes";
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

    let checkinStatus = null;
    try {
        const result = await client.query(query, values);
        const statusChar = result.rows[0].status;
        checkinStatus = getCheckinStatus(statusChar);
    } catch (err) {
        console.error("Error querying database", err);
        error(500, "Error querying database");
    }
    client.end();

	return json({ checkinStatus });
};

// POST route to set a participant's checkin status to "Checked In"
// params:
//     email: string
// returns:
//     status: CheckinStatus
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
        UPDATE application_application
        SET status = 'I'
        FROM user_user u
        WHERE u.id = application_application.user_id
        AND u.email = $1
    `;
    const values = [email];

    try {
        await client.query(query, values);
    } catch (err) {
        console.error("Error querying database", err);
        error(500, "Error querying database");
    }
    client.end();

    return json({ checkinStatus: "Checked In" as CheckinStatus });
};

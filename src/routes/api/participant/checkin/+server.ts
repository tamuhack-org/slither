
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { Client } from "pg";
import { getCheckinStatus, type CheckinStatus, getWares } from "$lib/slitherTypes";
import { DATABASE_URL } from "$env/static/private";

// GET route to get a participant's checkin status
// params:
//     email: string
// returns:
//     status: CheckinStatus
//     wares: Wares
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
        SELECT apps.status, apps.wares
        FROM user_user u
        JOIN application_application apps ON u.id = apps.user_id
        WHERE u.email = $1
    `;
    const values = [email];

    let checkinStatus = null;
    let wares = null;
    try {
        const result = await client.query(query, values);
        const { status: statusChar, wares: waresCode } = result.rows[0];
        checkinStatus = getCheckinStatus(statusChar);
        wares = getWares(waresCode);
        client.end();
    } catch (err) {
        console.error("Error querying database", err);
        client.end();
        error(500, "Error querying database");
    }

	return json({ checkinStatus, wares });
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
        client.end();
    } catch (err) {
        console.error("Error querying database", err);
        client.end();
        error(500, "Error querying database");
    }

    return json({ checkinStatus: "Checked In" as CheckinStatus });
};

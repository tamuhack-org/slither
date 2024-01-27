
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import pg from "pg";
const { Client } = pg;
import { getCheckinStatus, type CheckinStatus, getWares } from "$lib/slitherTypes";
import { OBOS_DATABASE_URL } from "$env/static/private";
import { getAuthStatus } from "$lib/slitherAuth";

// GET route to get a all workshop scans
// params:
//     none
// returns:
//     scans: WorkshopScan[]
export const GET: RequestHandler = async ({ request }) => {
    const authStatus = await getAuthStatus(request);
    if (!authStatus.loggedIn) {
        return json({ "error": "Not logged in" }, { status: 401 });
    }
    else if (!authStatus.authorized) {
        return json({ "error": "Not authorized" }, { status: 403 });
    }

    const client = new Client({
        connectionString: OBOS_DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    });
    client.connect();

    // Workshop scans have the user_id
    // Need to join with application_application to get the user's name
    const query = `
        SELECT u.email, apps.first_name, apps.last_name, ws.timestamp
        FROM volunteer_workshopevent ws
        JOIN user_user u ON ws.user_id = u.id
        JOIN application_application apps ON u.id = apps.user_id
    `;

    let scans = null;
    try {
        const result = await client.query(query);
        scans = result.rows;
        client.end();
    } catch (err) {
        console.error("Error querying database", err);
        client.end();
        error(500, "Error querying database");
    }

    return json({ scans });
};

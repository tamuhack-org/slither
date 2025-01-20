
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import pg from "pg";
const { Client } = pg;
import { getCheckinStatus, type CheckinStatus, getWares } from "$lib/slitherTypes";
import { OBOS_DATABASE_URL } from "$env/static/private";
import { getAuthStatus } from "$lib/slitherAuth";

// GET route to get a participant's checkin status
// params:
//     email: string
// returns:
//     status: CheckinStatus
//     wares: Wares
//     firstName: string
//     lastName: string
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

    const query = `
        SELECT apps.status, apps.wares, apps.first_name, apps.last_name
        FROM user_user u
        JOIN application_application apps ON u.id = apps.user_id
        WHERE u.email = $1
    `;
    // const query = `
    //     SELECT apps.status, apps.first_name, apps.last_name
    //     FROM user_user u
    //     JOIN application_application apps ON u.id = apps.user_id
    //     WHERE u.email = $1
    // `;
    const values = [email];

    let checkinStatus = null;
    let wares = null;
    let firstName = null;
    let lastName = null;
    try {
        const result = await client.query(query, values);
        const { status: statusChar, wares: waresCode } = result.rows[0];
        // const { status: statusChar } = result.rows[0];
        // const waresCode = "SW";
        checkinStatus = getCheckinStatus(statusChar);
        wares = getWares(waresCode);
        firstName = result.rows[0].first_name;
        lastName = result.rows[0].last_name;
        client.end();
    } catch (err) {
        console.error("Error querying database", err);
        client.end();
        error(500, "Error querying database");
    }

	return json({ checkinStatus, wares, firstName, lastName });
};

// POST route to set a participant's checkin status to "Checked In"
// params:
//     email: string
// returns:
//     status: CheckinStatus
export const POST: RequestHandler = async ({ url, request }) => {
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

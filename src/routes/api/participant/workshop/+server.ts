import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import pg from "pg";
const { Client } = pg;
import { OBOS_DATABASE_URL } from "$env/static/private";
import { getAuthStatus } from "$lib/slitherAuth";
import { ouroborosURL } from "$lib/slitherConfig";

// GET route to get the time of a participant's most recent workshop scan
// params:
//     email: string
// returns:
//     lastWorkshopScan: string (postgresql timestamptz) | null
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

    // Query for workshop scans

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

    try {
        const response = await fetch(ouroborosURL + "/api/volunteer/workshops", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": request.headers.get("Authorization") || "",
                },
                body: JSON.stringify({ email }),
            });
        if (response.status !== 200) {
            error(response.status, "Error in Ouroboros API call");
        }
    } catch (err) {
        console.error("Error in Ouroboros API call", err);
        error(500, "Error in Ouroboros API call");
    }

    return json({});
};

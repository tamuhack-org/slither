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

    // const query = `
    //     SELECT apps.status, apps.wares, apps.first_name, apps.last_name
    //     FROM user_user u
    //     JOIN application_application apps ON u.id = apps.user_id
    //     WHERE u.email = $1
    // `;
    const query = `
        SELECT apps.status, apps.first_name, apps.last_name
        FROM user_user u
        JOIN application_application apps ON u.id = apps.user_id
        WHERE u.email = $1
    `;
    const values = [email];

    let checkinStatus = null;
    let wares = null;
    let firstName = null;
    let lastName = null;
    try {
        const result = await client.query(query, values);
        // const { status: statusChar, wares: waresCode } = result.rows[0];
        const { status: statusChar } = result.rows[0];
        const waresCode = "SW";
        checkinStatus = getCheckinStatus(statusChar);
        wares = getWares(waresCode);
        firstName = result.rows[0].first_name;
        lastName = result.rows[0].last_name;
        client.end();
    } catch (err) {
        console.error("Regular application query failed, trying judge/mentor tables", err);
        
        // Try judge table
        try {
            const judgeQuery = `
                SELECT j.status, split_part(j.name, ' ', 1) as first_name, 
                       trim(substr(j.name, position(' ' in j.name) + 1)) as last_name
                FROM user_user u
                JOIN judgesmentors_judge j ON u.id = j.user_id
                WHERE u.email = $1
            `;
            const judgeResult = await client.query(judgeQuery, values);
            if (judgeResult.rows.length > 0) {
                console.log(`Found judge: ${judgeResult.rows[0].first_name} ${judgeResult.rows[0].last_name} (${email}) with status: ${judgeResult.rows[0].status}`);
                const { status: statusChar } = judgeResult.rows[0];
                checkinStatus = getCheckinStatus(statusChar);
                wares = "Judge";
                firstName = judgeResult.rows[0].first_name;
                lastName = judgeResult.rows[0].last_name;
                client.end();
            } else {
                // Try mentor table
                const mentorQuery = `
                    SELECT m.status, split_part(m.name, ' ', 1) as first_name,
                           trim(substr(m.name, position(' ' in m.name) + 1)) as last_name
                    FROM user_user u
                    JOIN judgesmentors_mentor m ON u.id = m.user_id
                    WHERE u.email = $1
                `;
                const mentorResult = await client.query(mentorQuery, values);
                if (mentorResult.rows.length > 0) {
                    console.log(`Found mentor: ${mentorResult.rows[0].first_name} ${mentorResult.rows[0].last_name} (${email}) with status: ${mentorResult.rows[0].status}`);
                    const { status: statusChar } = mentorResult.rows[0];
                    checkinStatus = getCheckinStatus(statusChar);
                    wares = "Mentor";
                    firstName = mentorResult.rows[0].first_name;
                    lastName = mentorResult.rows[0].last_name;
                    client.end();
                } else {
                    client.end();
                    error(500, "Error querying database - participant not found");
                }
            }
        } catch (judgeErr) {
            console.error("Error querying judge/mentor tables", judgeErr);
            client.end();
            error(500, "Error querying database");
        }
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

    // Try to update regular application first
    const query = `
        UPDATE application_application
        SET status = 'I'
        FROM user_user u
        WHERE u.id = application_application.user_id
        AND u.email = $1
    `;
    const values = [email];

    try {
        const result = await client.query(query, values);
        if (result.rowCount === 0) {
            // No application found, try judge table
            const judgeQuery = `
                UPDATE judgesmentors_judge
                SET status = 'CI'
                FROM user_user u
                WHERE u.id = judgesmentors_judge.user_id
                AND u.email = $1
            `;
            const judgeResult = await client.query(judgeQuery, values);
            
            if (judgeResult.rowCount === 0) {
                // No judge found, try mentor table
                const mentorQuery = `
                    UPDATE judgesmentors_mentor
                    SET status = 'CI'
                    FROM user_user u
                    WHERE u.id = judgesmentors_mentor.user_id
                    AND u.email = $1
                `;
                const mentorResult = await client.query(mentorQuery, values);
                
                if (mentorResult.rowCount === 0) {
                    client.end();
                    error(500, "Error querying database - participant not found");
                }
            }
        }
        client.end();
    } catch (err) {
        console.error("Error querying database", err);
        client.end();
        error(500, "Error querying database");
    }

    return json({ checkinStatus: "Checked In" as CheckinStatus });
};
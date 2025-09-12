import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
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

    try {
        const response = await fetch(`${ouroborosURL}/api/volunteer/workshops?email=${email}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": request.headers.get("Authorization") || "",
            },
        });
        if (response.status !== 200) {
            error(response.status, "Error in Ouroboros API call");
        }

        const { lastWorkshopScan } = await response.json();
        return json({ lastWorkshopScan });
        
    } catch (err) {
        console.error("Error in Ouroboros API call", err);
        return json({ error: 'Error in Ouroboros API call' }, { status: 500 });
    }
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

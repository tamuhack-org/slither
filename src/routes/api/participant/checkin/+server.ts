
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getCheckinStatus, type CheckinStatus, getWares } from "$lib/slitherTypes";
import { getAuthStatus, getAuthHeader } from "$lib/slitherAuth";
import { ouroborosURL } from "$lib/slitherConfig";


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

    try {
        const response = await fetch(`${ouroborosURL}/api/volunteer/checkin?email=${email}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": getAuthHeader(),
            },
        });
        if (response.status !== 200) {
            error(response.status, "Error in Ouroboros API call");
        }

        const { checkinStatus: checkinChar, wares: waresCode, first_name: firstName, last_name: lastName } = await response.json();
        const checkinStatus = getCheckinStatus(checkinChar);
        const wares = getWares(waresCode);
        return json({
            checkinStatus,
            wares,
            firstName,
            lastName
        });

    } catch (err) {
        console.error("Error in Ouroboros API call", err);
        return json({ error: 'Error in Ouroboros API call' }, { status: 500 });
    }
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

    try {
        const response = await fetch(ouroborosURL + "/api/volunteer/checkin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": getAuthHeader(),
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

    return json({ checkinStatus: "Checked In" as CheckinStatus });
};

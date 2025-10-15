
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getAuthStatus, getAuthHeader } from "$lib/slitherAuth";
import { ouroborosURL } from "$lib/slitherConfig";

// GET route to get all of a participant's meal scans, and their dietary restrictions
// params:
//     email: string
// returns:
//     status: MealCode[]
//     dietaryRestrictions: string (containing valid JSON)
//     mealGroup: string
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
        const response = await fetch(`${ouroborosURL}/api/volunteer/food?email=${email}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": getAuthHeader(),
            },
        });
        if (response.status !== 200) {
            error(response.status, "Error in Ouroboros API call");
        }

        const data = await response.json();
        return json({...data});
    } catch (err) {
        console.error("Error in Ouroboros API call", err);
        return json({ error: 'Error in Ouroboros API call' }, { status: 500 });
    }
};

// POST route to log a meal scan
// params:
//     email: string
//     mealCode: MealCode
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
    const mealCode = url.searchParams.get("mealCode");

    if (!email) {
        error(400, "No email provided");
    }
    if (!mealCode) {
        error(400, "No meal code provided");
    }

    try {
        const response = await fetch(`${ouroborosURL}/api/volunteer/food`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": getAuthHeader(),
            },
            body: JSON.stringify({ email, meal: mealCode }),
        });
        if (response.status !== 200) {
            error(response.status, "Error in Ouroboros API call");
        }
    } catch (err) {
        console.error("Error in Ouroboros API call", err);
        return json({ error: 'Error in Ouroboros API call' }, { status: 500 });
    }

    return json({});
};


import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getAuthStatus } from "$lib/slitherAuth";


// POST route to determine if the user is logged in and/or authorized
// headers:
//     Authorization: "Token <token>"
// returns:
//     error?: string
//     success?: string
//     and the appropriate status code
export const POST: RequestHandler = async ({ request }) => {
    const authStatus = await getAuthStatus(request);
    if (!authStatus.loggedIn) {
        return json({ "error": "Not logged in" }, { status: 401 });
    }
    else if (!authStatus.authorized) {
        return json({ "error": "Not authorized" }, { status: 403 });
    }
    else {
        return json({ "success": "Authorized" }, { status: 200 });
    }
};

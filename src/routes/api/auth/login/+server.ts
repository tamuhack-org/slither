
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { ouroborosURL } from "$lib/slitherConfig";


// POST route to log in a user
// body (JSON):
//     email: string
//     password: string
// returns:
//     Whatever Ouroboros returns
export const POST: RequestHandler = async ({ request }) => {
    const { email, password } = await request.json();

    const response = await fetch(ouroborosURL + "/api/volunteer/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    return json(data, { status: response.status });
};

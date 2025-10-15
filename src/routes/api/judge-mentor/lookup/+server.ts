import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getAuthStatus, getAuthHeader } from "$lib/slitherAuth";
import { ouroborosURL } from "$lib/slitherConfig";

// GET route to check if an email belongs to a judge or mentor in Ouroboros
// params:
//     email: string
// returns:
//     isJudgeMentor: boolean
//     firstName?: string
//     lastName?: string
//     role?: "judge" | "mentor"
//     track?: string
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
        // Try to fetch from judges endpoint first
        const judgeResponse = await fetch(`${ouroborosURL}/api/volunteer/judge-lookup?email=${email}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": getAuthHeader(),
            },
        });

        if (judgeResponse.status === 200) {
            const judgeData = await judgeResponse.json();
            return json({
                isJudgeMentor: true,
                firstName: judgeData.name?.split(" ")[0] || "",
                lastName: judgeData.name?.split(" ").slice(1).join(" ") || "",
                role: "judge" as const,
                track: judgeData.track || "SW"
            });
        }

        // Try to fetch from mentors endpoint
        const mentorResponse = await fetch(`${ouroborosURL}/api/volunteer/mentor-lookup?email=${email}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": getAuthHeader(),
            },
        });

        if (mentorResponse.status === 200) {
            const mentorData = await mentorResponse.json();
            return json({
                isJudgeMentor: true,
                firstName: mentorData.name?.split(" ")[0] || "",
                lastName: mentorData.name?.split(" ").slice(1).join(" ") || "",
                role: "mentor" as const,
                track: mentorData.track || "SW"
            });
        }

        // Not found in either judges or mentors
        return json({
            isJudgeMentor: false
        });

    } catch (err) {
        console.error("Error in judge/mentor lookup", err);
        return json({ 
            isJudgeMentor: false,
            error: 'Error looking up judge/mentor status' 
        }, { status: 500 });
    }
};
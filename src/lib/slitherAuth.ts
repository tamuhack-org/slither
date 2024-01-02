import { ouroborosURL } from "./slitherConfig";

export function getAuthHeader() {
    return "Token " + localStorage.getItem("token");
}

export type AuthStatus = {
    loggedIn: boolean;
    authorized: boolean;
    response: Response | null;
}

export async function getAuthStatus(request: Request): Promise<AuthStatus> {
    const authorizationHeader = request.headers.get("Authorization");
    if (authorizationHeader === null || authorizationHeader.endsWith("null")) {
        return {
            "loggedIn": false,
            "authorized": false,
            "response": null,
        };
    }

    const response = await fetch(ouroborosURL + "/api/volunteer/verify", {
        method: "POST",
        headers: {
            "Authorization": authorizationHeader,
        },
    });
    
    return {
        "loggedIn": response.status === 200 || response.status === 401,
        "authorized": response.status === 200,
        "response": response,
    }
}

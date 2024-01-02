import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = () => {
    // Yoink the user's token and redirect to the login page.
    localStorage.removeItem("token");

	throw redirect(303, "/login");
};

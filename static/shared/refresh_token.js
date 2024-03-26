import { getCookie } from "../login/login-utils.js";
import { global } from "../game/global.js";

// This is a global utility function to refresh the access_token
// Automatically updates http cookies also
// Learn: Need to parse as FormData for my middleware to work
export async function refreshFetch(url, fetchBody) {
    const response = await fetch(url, fetchBody);

    if (response.status == 401) {
        const formData = new FormData();
        formData.append("csrfmiddlewaretoken", getCookie("csrftoken"));
        formData.append("refresh", "");

        const refresh = await fetch(global.fetch.refreshURL, {
            method: "POST",
            body: formData,
        });

        if (refresh.status == 200) {
            const retry = await fetch(url, fetchBody);
            return (retry);
        } else
            return (refresh);
    }
    return (response);
}
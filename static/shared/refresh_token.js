import { getCookie } from "../login/login-utils.js";
import { global } from "../game/global.js";
import { windowResize } from "../game/main.js";

// This is a global utility function to refresh the access_token
// Automatically updates http cookies from backend
// Learn: Need to parse as FormData for my middleware to work
export async function refreshFetch(url, fetchBody) {
	try {
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
				global.ui.auth = 1;
				const retry = await fetch(url, fetchBody);
				return (retry);
			} else {
				global.ui.auth = 0;
				windowResize();
				return (refresh);
			}
		}
		return (response);
	}
	catch (e) {
		;
	}
}
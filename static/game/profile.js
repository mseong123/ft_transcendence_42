import { global } from './global.js';
import { windowResize } from './main.js';
import { getCookie } from './login-utils.js';

function keyBindingProfile() {
	const profileExpand = document.querySelector(".profile-expand");
	profileExpand.addEventListener("click", (e)=>{
		if (!global.ui.profile) {
			global.ui.profile = 1;
			global.ui.chat = 0;
			windowResize();
		}
	})
}

async function fetch_profile(e) {
	if (global.ui.auth && global.gameplay.username) {
		const response = await fetch(global.fetch.profileURL + global.gameplay.username + '/', {
		method: 'GET',
		headers: {
			'X-CSRFToken': getCookie("csrftoken"),
		},
		});
		if (!response.ok)
			document.querySelector(".profile-data-error").textContent = "Server Error."
		else {
			const data = await response.json();
			global.gameplay.username = data.username
			global.gameplay.nickname = data.nick_name;
			global.gameplay.imageURL = data.image;
			populateProfile();
		}
	}
	else {
		document.querySelector(".profile-data-error").classList.remove("display-none");
		document.querySelector(".profile-data-error").textContent = "User not logged in. Please login again."
	}
}

async function change_nickname(e) {
	if (global.ui.auth && global.gameplay.username) {
		const response = await fetch(global.fetch.profileURL + global.gameplay.username +'/', {
		method: 'PUT',
		headers: {
			'X-CSRFToken': getCookie("csrftoken"),
			'Content-Type':'application/json',
		},
		body: JSON.stringify({
			nick_name:document.getElementById("profile-nickname-input").value,
		}),
		});
		if (!response.ok) {
			document.querySelector(".profile-data-error").classList.remove("display-none");
			document.querySelector(".profile-data-error").textContent = "Server Error."
		}
			
		else {
			const data = await response.json();
			global.gameplay.nickname = data.nick_name;
		}
	}
	else {
		document.querySelector(".profile-data-error").classList.remove("display-none");
		document.querySelector(".profile-data-error").textContent = "User not logged in. Please login again."
	}
}

async function change_profile_image(e) {
	const formData = new FormData();
	formData.append('image', document.getElementById("profile-img-upload").files[0]);
	if (global.ui.auth && global.gameplay.username) {
		const response = await fetch(global.fetch.profileURL + global.gameplay.username +'/', {
		method: 'PUT',
		headers: {
			'X-CSRFToken': getCookie("csrftoken"),
		},
		body: formData,
		});
		if (!response.ok) {
			document.querySelector(".profile-data-error").classList.remove("display-none");
			document.querySelector(".profile-data-error").textContent = "Server Error."
		}
		else {
			const data = await response.json();
			document.querySelector(".profile-image").src = global.gameplay.imageURL;
		}
	}
	else {
		document.querySelector(".profile-data-error").classList.remove("display-none");
		document.querySelector(".profile-data-error").textContent = "User not logged in. Please login again."
	}
}

function populateProfile() {
	document.querySelector(".profile-image").src = global.gameplay.imageURL;
	document.querySelector(".profile-username").textContent = global.gameplay.username;
	document.getElementById("profile-nickname-input").value = global.gameplay.nickname;
	document.querySelector(".nickname-submit").addEventListener("submit", e=>{
		e.preventDefault();
		document.querySelector(".profile-data-error").classList.add("display-none");
		document.querySelector(".profile-data-error").textContent = "";
		change_nickname();
	})
	document.querySelector(".img-upload").addEventListener("submit", e=>{
		e.preventDefault();
		change_profile_image()
	})
}



export { keyBindingProfile, populateProfile, fetch_profile };
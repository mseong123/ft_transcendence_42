import { global } from './global.js';
import { windowResize } from './main.js';
import { getCookie } from './login-utils.js';

function keyBindingProfile() {
	document.addEventListener("click", (e)=>{
		document.querySelector(".profile-error").textContent = "";
		document.querySelector(".profile-error").classList.add("display-none");
	})
	const profileExpand = document.querySelector(".profile-expand");
	profileExpand.addEventListener("click", (e)=>{
		if (!global.ui.profile) {
			global.ui.profile = 1;
			global.ui.chat = 0;
			windowResize();
		}
	})
	document.querySelector(".nickname-submit").addEventListener("submit", e=>{
		e.preventDefault();
		document.querySelector(".profile-error").textContent = "";
		document.querySelector(".profile-error").classList.add("display-none");
		change_nickname();
	})
	document.querySelector(".img-upload").addEventListener("submit", e=>{
		e.preventDefault();
		document.querySelector(".profile-error").textContent = "";
		document.querySelector(".profile-error").classList.add("display-none");
		change_profile_image();
	})
	document.querySelector(".profile-refresh").addEventListener("click", e=>{
		document.querySelector(".profile-error").textContent = "";
		document.querySelector(".profile-error").classList.add("display-none");
		fetch_profile();
	})
}

async function fetch_profile(e) {
	if (global.ui.auth && global.gameplay.username) {
		try {
			const response = await fetch(global.fetch.profileURL + global.gameplay.username + '/', {
			method: 'GET',
			headers: {
				'X-CSRFToken': getCookie("csrftoken"),
			},
			});
			if (!response.ok) {
				document.querySelector(".profile-error").classList.remove("display-none");
				document.querySelector(".profile-error").textContent = "Server Error"
				global.gameplay.nickname = "";
				global.gameplay.imageURL = "";
				populateProfile();
			}
			else {
				const data = await response.json();
				global.gameplay.username = data.username
				global.gameplay.nickname = data.nick_name;
				global.gameplay.imageURL = data.image;
				populateProfile();
			}
		}
		catch (e) {
			document.querySelector(".profile-error").classList.remove("display-none");
			document.querySelector(".profile-error").textContent = "Server Error"
			global.gameplay.nickname = "";
			global.gameplay.imageURL = "";
			populateProfile();
		}
	}
	else {
		document.querySelector(".profile-error").classList.remove("display-none");
		document.querySelector(".profile-error").textContent = "User not logged in. Please login again."
	}
}

async function change_nickname(e) {
	if (global.ui.auth && global.gameplay.username) {
		try {
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
				document.querySelector(".profile-error").classList.remove("display-none");
				document.querySelector(".profile-error").textContent = "Server Error";
				global.gameplay.nickname = "";
				document.getElementById("profile-nickname-input").value = "";
			}
			else {
				const data = await response.json();
				global.gameplay.nickname = data.nick_name;
				document.getElementById("profile-nickname-input").value = global.gameplay.nickname;
				document.querySelector(".profile-error").classList.remove("display-none");
				document.querySelector(".profile-error").textContent = "Nickname changed"
			}
		}
		catch (e) {
			document.querySelector(".profile-error").classList.remove("display-none");
			document.querySelector(".profile-error").textContent = "Server Error";
			global.gameplay.nickname = "";
			document.getElementById("profile-nickname-input").value = "";
		}
	}
	else {
		document.querySelector(".profile-error").classList.remove("display-none");
		document.querySelector(".profile-error").textContent = "User not logged in. Please login again."
	}
}

async function change_profile_image(e) {
	const formData = new FormData();
	formData.append('image', document.getElementById("profile-img-upload").files[0]);
	if (global.ui.auth && global.gameplay.username) {
		try {
			const response = await fetch(global.fetch.profileURL + global.gameplay.username +'/', {
			method: 'PUT',
			headers: {
				'X-CSRFToken': getCookie("csrftoken"),
			},
			body: formData,
			});
			if (!response.ok) {
				document.querySelector(".profile-error").classList.remove("display-none");
				document.querySelector(".profile-error").textContent = "Server Error"
				global.gameplay.imageURL = "";
				document.querySelector(".profile-image").src = global.gameplay.imageURL;
			}
			else {
				let url = window.URL.createObjectURL(document.getElementById("profile-img-upload").files[0]);
				document.querySelector(".profile-image").src= url;
				document.querySelector(".profile-error").classList.remove("display-none");
				document.querySelector(".profile-error").textContent = "Profile image changed"
			}
		}
		catch (e) {
			document.querySelector(".profile-error").classList.remove("display-none");
			document.querySelector(".profile-error").textContent = "Server Error"
			global.gameplay.imageURL = "";
			document.querySelector(".profile-image").src = global.gameplay.imageURL;
		}
	}
	else {
		document.querySelector(".profile-error").classList.remove("display-none");
		document.querySelector(".profile-error").textContent = "User not logged in. Please login again."
	}
}

async function fetch_matchHistory(e) {
	if (global.ui.auth && global.gameplay.username) {
		try {
			const response = await fetch(global.fetch.matchHistoryURL + global.gameplay.username +'/', {
			method: 'GET',
			headers: {
				'X-CSRFToken': getCookie("csrftoken"),
			},
			});
			if (!response.ok) {
				document.querySelector(".profile-error").classList.remove("display-none");
				document.querySelector(".profile-error").textContent = "Server Error"
				document.querySelector(".profile-match-history").textContent = "";
			}
			else {
				const JSONdata = await response.JSON();
				populateMatchHistory(JSONdata)
			}
		}
		catch (e) {
			document.querySelector(".profile-error").classList.remove("display-none");
			document.querySelector(".profile-error").textContent = "Server Error"
			document.querySelector(".profile-match-history").textContent = "";
		}
	}
	else {
		document.querySelector(".profile-error").classList.remove("display-none");
		document.querySelector(".profile-error").textContent = "User not logged in. Please login again."
	}
}

function populateProfile() {
	document.querySelector(".profile-image").src = global.gameplay.imageURL;
	document.querySelector(".profile-username").textContent = global.gameplay.username;
	document.getElementById("profile-nickname-input").value = global.gameplay.nickname;
}

function populateMatchHistory(JSONdata) {
	
}



export { keyBindingProfile, populateProfile, fetch_profile };
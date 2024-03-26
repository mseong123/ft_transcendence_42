import { global } from './global.js';
import { windowResize } from './main.js';

export function keyBindingProfile() {
	const profileExpand = document.querySelector(".profile-expand");
	profileExpand.addEventListener("click", (e)=>{
		if (!global.ui.profile) {
			global.ui.profile = 1;
			global.ui.chat = 0;
			windowResize();
		}
	})
}

function populateProfile() {
	document.querySelector(".profile-image").src = global.gameplay.imageURL;
	document.querySelector(".profile-username").textContent = global.gameplay.username;
	document.getElementById("profile-nickname-input").value = global.gameplay.nickname;
	document.querySelector(".nickname-submit").addEventListener("submit", e=>{
		e.preventDefault();
		//insert nickname change logic here;
	})
	document.querySelector(".img-upload").addEventListener("submit", e=>{
		e.preventDefault();
		//insert profile pic upload logic here;
	})
}

export { populateProfile };
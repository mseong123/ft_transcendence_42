import { global } from './global.js';
import { windowResize } from './main.js';
import { getCookie } from '../login/login-utils.js';
import { refreshFetch } from "../shared/refresh_token.js"
import { cancelFriendButton, fetch_friendRequest, sendFriendButton, unfriend } from './friend.js';

function keyBindingProfile() {
	document.addEventListener("click", (e) => {
		document.querySelector(".profile-error").textContent = "";
		document.querySelector(".profile-error").classList.add("display-none");
		document.querySelector(".profile-other-error").textContent = "";
		document.querySelector(".profile-other-error").classList.add("display-none");
	})
	const profileExpand = document.querySelector(".profile-expand");
	profileExpand.addEventListener("click", (e) => {
		if (!global.ui.profile) {
			global.ui.profile = 1;
			global.ui.chat = 0;
			windowResize();
		}
	})
	document.querySelector(".nickname-submit").addEventListener("submit", e => {
		e.preventDefault();
		document.querySelector(".profile-error").textContent = "";
		document.querySelector(".profile-error").classList.add("display-none");
		change_nickname();
	})
	document.querySelector(".img-upload").addEventListener("submit", e => {
		e.preventDefault();
		document.querySelector(".profile-error").textContent = "";
		document.querySelector(".profile-error").classList.add("display-none");
		change_profile_image();
	})
	document.querySelector(".profile-refresh").addEventListener("click", e => {
		e.stopPropagation();
		fetch_profile(global.gameplay.username, false);
		fetch_matchHistory(global.gameplay.username, false);
		fetch_friendRequest();
		document.querySelector(".profile-error").textContent = "Profile refreshed";
		document.querySelector(".profile-error").classList.remove("display-none");
	})
	document.querySelector(".profile-back").addEventListener("click", (e) => {
		document.querySelector(".profile-other").classList.add("display-none");
		document.querySelector(".profile").classList.remove("display-none");
		document.querySelector(".profile-container").classList.remove("profile-other-theme");
	})
}

async function fetch_profile(username, otherUser) {
	if (global.ui.auth && global.gameplay.username) {
		try {
			const response = await refreshFetch(global.fetch.profileURL + username + '/', {
				method: 'GET',
				headers: {
					'X-CSRFToken': getCookie("csrftoken"),
				},
			});
			if (!response.ok) {
				if (!otherUser) {
					document.querySelector(".profile-error").classList.remove("display-none");
					document.querySelector(".profile-error").textContent = "Server Error"
					global.gameplay.nickname = "";
					global.gameplay.imageURL = "";
					populateProfile();
				}
				else {
					document.querySelector(".profile-other-error").classList.remove("display-none");
					document.querySelector(".profile-other-error").textContent = "Server Error"
					document.querySelector(".profile-other-image").src = "/";
					document.querySelector(".profile-other-username").textContent = "";
					document.querySelector(".profile-other-nickname").textContent = "";
				}
			}
			else {
				const data = await response.json();
				if (!otherUser) {
					global.gameplay.username = data.username
					global.gameplay.nickname = data.nick_name;
					global.gameplay.imageURL = data.image;
					populateProfile();
				}
				else
					populateOtherProfile(data);
			}
		}
		catch (e) {
			if (!otherUser) {
				document.querySelector(".profile-error").classList.remove("display-none");
				document.querySelector(".profile-error").textContent = "Server Error"
				global.gameplay.nickname = "";
				global.gameplay.imageURL = "";
				populateProfile();
			}
			else {
				document.querySelector(".profile-other-error").classList.remove("display-none");
				document.querySelector(".profile-other-error").textContent = e;
				// document.querySelector(".profile-other-error").textContent = "Server Error"
				document.querySelector(".profile-other-image").src = "/";
				document.querySelector(".profile-other-username").textContent = "";
				document.querySelector(".profile-other-nickname").textContent = "";
			}
		}
	}
	else {
		document.querySelector(".profile-error").classList.remove("display-none");
		document.querySelector(".profile-error").textContent = "User not logged in. Please login again."
	}
}

async function fetch_matchHistory_profile_pic(username, otherUser) {
	try {
		const response = await refreshFetch(global.fetch.profileURL + username + '/', {
			method: 'GET',
			headers: {
				'X-CSRFToken': getCookie("csrftoken"),
			},
		});
		if (response.ok) {
			const data = await response.json();
			if (!otherUser) {
				const parentVersus = document.querySelector(".match-history-versus");
				const parentTournament = document.querySelector(".match-history-tournament");
				if (parentVersus.children.length !== 0) {
					document.querySelectorAll(".match-history-versus-button." + username).forEach(button => {
						const timestamp = new Date().getTime();
						button.getElementsByTagName('img')[0].src = `${data.image}?timestamp=${timestamp}`;
					})
				}
				if (parentTournament.children.length !== 0) {
					document.querySelectorAll(".match-history-tournament-button." + username).forEach(button => {
						const timestamp = new Date().getTime();
						button.getElementsByTagName('img')[0].src = `${data.image}?timestamp=${timestamp}`;
					})
				}
			}
			else {
				const parentVersus = document.querySelector(".other-match-history-versus");
				const parentTournament = document.querySelector(".other-match-history-tournament");
				if (parentVersus.children.length !== 0) {
					document.querySelectorAll(".other-match-history-versus-div." + username).forEach(div => {
						const timestamp = new Date().getTime();
						div.getElementsByTagName('img')[0].src = `${data.image}?timestamp=${timestamp}`;
					})
				}
				if (parentTournament.children.length !== 0) {
					document.querySelectorAll(".other-match-history-tournament-div." + username).forEach(div => {
						const timestamp = new Date().getTime();
						div.getElementsByTagName('img')[0].src = `${data.image}?timestamp=${timestamp}`;
					})
				}
			}
		}
	}
	catch (e) {
		pass;
	}
}


async function change_nickname(e) {
	if (global.ui.auth && global.gameplay.username) {
		try {
			const response = await refreshFetch(global.fetch.profileURL + global.gameplay.username + '/', {
				method: 'PUT',
				headers: {
					'X-CSRFToken': getCookie("csrftoken"),
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					nick_name: document.getElementById("profile-nickname-input").value,
				}),
			});
			if (!response.ok) {
				const data = await response.json();
				if (data["nick_name"])
					document.querySelector(".profile-error").textContent = data["nick_name"][0];
				else
					document.querySelector(".profile-error").textContent = "Server Error";
				document.querySelector(".profile-error").classList.remove("display-none");
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
			const response = await refreshFetch(global.fetch.profileURL + global.gameplay.username + '/', {
				method: 'PUT',
				headers: {
					'X-CSRFToken': getCookie("csrftoken"),
				},
				body: formData,
			});
			if (!response.ok) {
				document.querySelector(".profile-error").classList.remove("display-none");
				document.querySelector(".profile-error").textContent = "Server Error"
				global.gameplay.imageURL = "/";
				document.querySelector(".profile-image").src = global.gameplay.imageURL;
			}
			else {
				let url = window.URL.createObjectURL(document.getElementById("profile-img-upload").files[0]);
				document.querySelector(".profile-image").src = url;
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

async function fetch_matchHistory(username, otherUser) {
	if (global.ui.auth && global.gameplay.username) {
		try {
			const response = await refreshFetch(global.fetch.matchHistoryURL + username + '/', {
				method: 'GET',
				headers: {
					'X-CSRFToken': getCookie("csrftoken"),
				},
			});
			if (!response.ok) {
				if (!otherUser) {
					document.querySelector(".profile-error").classList.remove("display-none");
					document.querySelector(".profile-error").textContent = "Server Error"
					document.querySelector(".match-history-versus").textContent = "";
					document.querySelector(".match-history-tournament").textContent = "";
				}
				else {
					document.querySelector(".profile-other-error").classList.remove("display-none");
					document.querySelector(".profile-other-error").textContent = "Server Error"
					document.querySelector(".other-match-history-versus").textContent = "";
					document.querySelector(".other-match-history-tournament").textContent = "";
				}

			}
			else {
				const JSONdata = await response.json();
				if (!otherUser) {

					populateMatchHistory(JSONdata);
					await populateTournamentBlockchain(JSONdata);
				} else {
					populateOtherMatchHistory(JSONdata);
					await populateOtherTournamentBlockchain(JSONdata);
				}
			}
		}
		catch (e) {
			if (!otherUser) {
				document.querySelector(".profile-error").classList.remove("display-none");
				document.querySelector(".profile-error").textContent = "Server Error"
				document.querySelector(".match-history-versus").textContent = "";
				document.querySelector(".match-history-tournament").textContent = "";
			}
			else {
				document.querySelector(".profile-other-error").classList.remove("display-none");
				document.querySelector(".profile-other-error").textContent = "Server Error"
				document.querySelector(".other-match-history-versus").textContent = "";
				document.querySelector(".other-match-history-tournament").textContent = "";
			}
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

function populateOtherProfile(JSONdata) {
	const timestamp = new Date().getTime();
	document.querySelector(".profile-other-image").src = `${JSONdata.image}?timestamp=${timestamp}`;
	document.querySelector(".profile-other-username").textContent = JSONdata.username;
	document.querySelector(".profile-other-nickname").textContent = "Nickname: " + JSONdata.nick_name;

	// sending friend request
	const profileDataDiv = document.querySelector(".profile-other-friend-buttons");
	let sendDiv = document.querySelector(".profile-other-send-div");
	if (sendDiv) {
		sendDiv.remove();
		sendDiv = null;
	}
	sendDiv = document.createElement("div");
	sendDiv.classList.add("profile-other-send-div");
	const sendFriendRequest = document.createElement("button");
	sendFriendRequest.classList.add("profile-other-send-friend");
	sendFriendRequest.classList.add(JSONdata.username);
	sendFriendRequest.title = "Send friend request";
	const tmp_ione = document.createElement('i');
	tmp_ione.classList.add("fa-solid");
	const tmp_hvone = document.createElement('h5');
	sendFriendRequest.appendChild(tmp_ione);
	sendFriendRequest.appendChild(tmp_hvone);
	sendDiv.appendChild(sendFriendRequest);
	profileDataDiv.appendChild(sendDiv);

	// with current implementation user can reopen 
	let unfriendDiv = document.querySelector(".profile-other-unfriend-div");
	if (unfriendDiv) {
		unfriendDiv.remove();
		unfriendDiv = null;
	}
	unfriendDiv = document.createElement('div');
	unfriendDiv.classList.add("profile-other-unfriend-div");
	const unfriendBtn = document.createElement("button");
	unfriendBtn.classList.add("profile-other-unfriend");
	unfriendBtn.classList.add(JSONdata.username);
	unfriendBtn.title = "Unfriend";
	// unfriendBtn.innerHTML = ' <i class="fa-solid fa-user-times"></i><h5>Unfriend</h5>';
	const tmp_itwo = document.createElement('i');
	tmp_itwo.classList.add("fa-solid");
	tmp_itwo.classList.add("fa-user-times");
	const tmp_hvtwo = document.createElement('h5');
	tmp_hvtwo.innerText = "Unfriend";
	unfriendBtn.appendChild(tmp_itwo);
	unfriendBtn.appendChild(tmp_hvtwo);
	// last thing is to implement a way to check if a request is already sent
	if (global["friends"].includes(JSONdata.username) == false) {
		unfriendBtn.disabled = true;
		unfriendBtn.style.opacity = "0.4";
		unfriendDiv.style.backgroundColor = "#a0a0a0";
		sendFriendRequest.style.opacity = "1.0";
		sendingRequestButton(sendFriendRequest, JSONdata.username);
	}
	else {
		sendFriendRequest.disabled = true;
		sendFriendRequest.style.opacity = "0.4";
		sendDiv.style.backgroundColor = "#a0a0a0";
		sendingRequestButton(sendFriendRequest, JSONdata.username);
		unfriendBtn.style.opacity = "1.0";
		unfriendBtn.addEventListener("click", () => {
			unfriend(JSONdata.username);
			sendFriendRequest.disabled = false;
			sendFriendRequest.style.opacity = '1.0';
			// sendFriendRequest.children[0].style.opacity = '1.0';
			// sendFriendRequest.children[1].style.opacity = '1.0';
			sendDiv.style.backgroundColor = "#ffbb00";
			sendingRequestButton(sendFriendRequest, JSONdata.username);
			unfriendBtn.disabled = true;
			unfriendBtn.style.opacity = '0.4';
			unfriendDiv.style.backgroundColor = "#a0a0a0";
		});
	}
	unfriendDiv.appendChild(unfriendBtn);
	profileDataDiv.appendChild(unfriendDiv);
}

async function sendingRequestButton(node, username) {
	try {
		const response = await refreshFetch(global.fetch.friendURL + "sent_request/", {
			method: "GET",
			headers: {
				"X-CSRFToken": getCookie("csrftoken")
			}
		});
		if (response.ok) {
			const data = await response.json();
			let index = data.findIndex(obj => obj["receiver"] === username);
			if (index === -1 || data[index].is_active == false) {
				node.innerHTML = '<i class="fa-solid fa-user-plus"></i><h5>Send Request</h5>';
				node.children[0].classList.add("fa-user-plus");
				node.children[1].innerText = "Send Request";
				node.addEventListener("click", sendFriendButton);
			}
			else {
				node.innerHTML = '<i class="fa-solid fa-user-check"></i><h5>Cancel Request</h5>';
				node.children[0].classList.add("fa-user-check");
				node.children[1].innerText = "Cancel Request";
				node.addEventListener("click", cancelFriendButton);
			}
		}
		else {
			node.innerText = "Server Error";
		}
	}
	catch (e) {
		console.error("Error happened at populating send request button: " + e);
		node.innerText = "Server Error";
	}
}


function populateMatchHistory(JSONdata) {
	const username_list = [];
	const parentVersus = document.querySelector(".match-history-versus");
	const parentTournament = document.querySelector(".match-history-tournament");
	parentVersus.textContent = ""
	parentTournament.textContent = ""
	if (JSONdata.matches.length) {
		const header = document.createElement('h5')
		header.textContent = "VERSUS";
		parentVersus.appendChild(header)
		JSONdata.matches.forEach(versusMatch => {
			const versusItem = document.createElement('div');
			versusItem.classList.add("match-history-versus-item")
			const versusTime = document.createElement('h5');
			versusTime.classList.add("match-history-versus-time");
			const dateObject = new Date(versusMatch.created_on);
			const day = dateObject.getDate();
			const month = dateObject.toLocaleString('default', { month: 'short' });
			const year = dateObject.getFullYear()
			const hour = dateObject.getHours().toString().padStart(2, '0');
			const minute = dateObject.getMinutes().toString().padStart(2, '0')
			versusTime.textContent = `${day} ${month} ${year} ${hour}:${minute}`;
			const versusTeamOne = document.createElement('div');
			versusTeamOne.classList.add("match-history-versus-teamone")
			const versusTeamTwo = document.createElement('div');
			versusTeamTwo.classList.add("match-history-versus-teamtwo")
			const versusTeamOneScore = document.createElement('p');
			versusTeamOneScore.classList.add("match-history-versus-teamone-score");
			const versusTeamTwoScore = document.createElement('p');
			versusTeamTwoScore.classList.add("match-history-versus-teamtwo-score");
			versusMatch.t1.forEach(t1 => {
				const playerButton = document.createElement('button');
				const span = document.createElement('span');
				const img = document.createElement('img');
				playerButton.setAttribute("type", "button");
				playerButton.classList.add("match-history-versus-button");
				playerButton.classList.add(t1);
				playerButton.addEventListener("click", (e) => {
					document.querySelector(".profile-other").classList.remove("display-none");
					document.querySelector(".profile").classList.add("display-none");
					document.querySelector(".profile-container").classList.add("profile-other-theme");
					fetch_profile(t1, true);
					fetch_matchHistory(t1, true);
				})
				if (username_list.every(username => {
					return username !== t1;
				})) {
					fetch_matchHistory_profile_pic(t1, false)
					username_list.push(t1);
				}
				img.setAttribute("src", "/");
				span.textContent = t1;
				playerButton.appendChild(img);
				playerButton.appendChild(span);
				versusTeamOne.appendChild(playerButton);
			})
			versusMatch.t2.forEach(t2 => {
				const playerButton = document.createElement('button');
				const span = document.createElement('span');
				const img = document.createElement('img');
				playerButton.setAttribute("type", "button");
				playerButton.classList.add("match-history-versus-button");
				playerButton.classList.add(t2);
				playerButton.addEventListener("click", (e) => {
					document.querySelector(".profile-other").classList.remove("display-none");
					document.querySelector(".profile").classList.add("display-none");
					document.querySelector(".profile-container").classList.add("profile-other-theme");
					fetch_profile(t2, true);
					fetch_matchHistory(t2, true);
				})
				if (username_list.every(username => {
					return username !== t2;
				})) {
					fetch_matchHistory_profile_pic(t2, false)
					username_list.push(t2);
				}
				img.setAttribute("src", "/");
				span.textContent = t2;
				playerButton.appendChild(img);
				playerButton.appendChild(span);
				versusTeamTwo.appendChild(playerButton);
			})
			versusTeamOneScore.textContent = versusMatch.t1_points;
			versusTeamTwoScore.textContent = versusMatch.t2_points;
			versusItem.appendChild(versusTime);
			versusItem.appendChild(versusTeamOne);
			versusItem.appendChild(versusTeamOneScore);
			versusItem.appendChild(versusTeamTwo);
			versusItem.appendChild(versusTeamTwoScore);
			parentVersus.appendChild(versusItem);
		})
	}
	if (JSONdata.tournaments.length) {
		const header = document.createElement('h5')
		header.textContent = "TOURNAMENT";
		parentTournament.appendChild(header)
		JSONdata.tournaments.forEach(async tournament => {
			const username_list = [];
			const tournamentItem = document.createElement('div');
			tournamentItem.classList.add(`match-history-tournament-item`);
			tournamentItem.id = `match-history-tournament-item-${tournament.id}`;
			const winner = document.createElement('h5');
			winner.classList.add("match-history-tournament-winner");
			winner.textContent = "Winner: " + tournament.winner;
			const dateObject = new Date(tournament.created_on);
			const day = dateObject.getDate();
			const month = dateObject.toLocaleString('default', { month: 'short' });
			const year = dateObject.getFullYear()
			const hour = dateObject.getHours().toString().padStart(2, '0');
			const minute = dateObject.getMinutes().toString().padStart(2, '0')
			const tournamentTime = document.createElement('h5');
			tournamentTime.classList.add("match-history-tournament-time");
			tournamentTime.textContent = `${day} ${month} ${year} ${hour}:${minute}`;
			tournamentItem.appendChild(winner);
			tournamentItem.appendChild(tournamentTime);
			tournament.matches.forEach(matches => {
				const tournamentButtonOne = document.createElement('button');
				const spanOne = document.createElement('span');
				const imgOne = document.createElement('img');
				tournamentButtonOne.classList.add("match-history-tournament-button");
				tournamentButtonOne.classList.add(matches.t1[0])
				tournamentButtonOne.addEventListener("click", (e) => {
					document.querySelector(".profile-other").classList.remove("display-none");
					document.querySelector(".profile").classList.add("display-none");
					document.querySelector(".profile-container").classList.add("profile-other-theme");
					fetch_profile(matches.t1[0], true);
					fetch_matchHistory(matches.t1[0], true);
				})
				if (username_list.every(username => {
					return username !== matches.t1[0];
				})) {
					fetch_matchHistory_profile_pic(matches.t1[0], false)
					username_list.push(matches.t1[0]);
				}
				spanOne.textContent = matches.t1[0];
				imgOne.setAttribute("src", "/");
				tournamentButtonOne.appendChild(imgOne);
				tournamentButtonOne.appendChild(spanOne);
				const tournamentButtonTwo = document.createElement('button');
				const spanTwo = document.createElement('span');
				const imgTwo = document.createElement('img');
				tournamentButtonTwo.classList.add("match-history-tournament-button");
				tournamentButtonTwo.classList.add(matches.t2[0])
				tournamentButtonTwo.addEventListener("click", (e) => {
					document.querySelector(".profile-other").classList.remove("display-none");
					document.querySelector(".profile").classList.add("display-none");
					document.querySelector(".profile-container").classList.add("profile-other-theme");
					fetch_profile(matches.t2[0], true);
					fetch_matchHistory(matches.t2[0], true);
				})
				if (username_list.every(username => {
					return username !== matches.t2[0];
				})) {
					fetch_matchHistory_profile_pic(matches.t2[0], false)
					username_list.push(matches.t2[0]);
				}
				spanTwo.textContent = matches.t2[0];
				imgTwo.setAttribute("src", "/");
				tournamentButtonTwo.appendChild(imgTwo);
				tournamentButtonTwo.appendChild(spanTwo);
				const tournamentTeamOneScore = document.createElement('p');
				tournamentTeamOneScore.classList.add("match-history-tournament-teamone-score");
				tournamentTeamOneScore.id = `match-history-tournament-teamone-score-${matches.id}`;
				const tournamentTeamTwoScore = document.createElement('p');
				tournamentTeamTwoScore.classList.add("match-history-tournament-teamtwo-score");
				tournamentTeamTwoScore.id = `match-history-tournament-teamtwo-score-${matches.id}`;
				tournamentTeamOneScore.textContent = matches.t1_points;
				tournamentTeamTwoScore.textContent = matches.t2_points;
				tournamentItem.appendChild(tournamentButtonOne);
				tournamentItem.appendChild(tournamentTeamOneScore);
				tournamentItem.appendChild(tournamentButtonTwo);
				tournamentItem.appendChild(tournamentTeamTwoScore);
			})
			parentTournament.appendChild(tournamentItem);
		})
	}
}

function populateOtherMatchHistory(JSONdata) {
	const username_list = [];
	const parentVersus = document.querySelector(".other-match-history-versus");
	const parentTournament = document.querySelector(".other-match-history-tournament");
	parentVersus.textContent = ""
	parentTournament.textContent = ""
	if (JSONdata.matches.length) {
		const header = document.createElement('h5')
		header.textContent = "VERSUS";
		parentVersus.appendChild(header)
		JSONdata.matches.forEach(versusMatch => {
			const versusItem = document.createElement('div');
			versusItem.classList.add("other-match-history-versus-item")
			const versusTime = document.createElement('h5');
			versusTime.classList.add("other-match-history-versus-time");
			const dateObject = new Date(versusMatch.created_on);
			const day = dateObject.getDate();
			const month = dateObject.toLocaleString('default', { month: 'short' });
			const year = dateObject.getFullYear()
			const hour = dateObject.getHours().toString().padStart(2, '0');
			const minute = dateObject.getMinutes().toString().padStart(2, '0')
			versusTime.textContent = `${day} ${month} ${year} ${hour}:${minute}`;
			const versusTeamOne = document.createElement('div');
			versusTeamOne.classList.add("other-match-history-versus-teamone")
			const versusTeamTwo = document.createElement('div');
			versusTeamTwo.classList.add("other-match-history-versus-teamtwo")
			const versusTeamOneScore = document.createElement('p');
			versusTeamOneScore.classList.add("other-match-history-versus-teamone-score");
			const versusTeamTwoScore = document.createElement('p');
			versusTeamTwoScore.classList.add("other-match-history-versus-teamtwo-score");
			versusMatch.t1.forEach(t1 => {
				const player = document.createElement('div');
				const span = document.createElement('span');
				const img = document.createElement('img');
				player.classList.add("other-match-history-versus-div");
				player.classList.add(t1);
				if (username_list.every(username => {
					return username !== t1;
				})) {
					fetch_matchHistory_profile_pic(t1, true)
					username_list.push(t1);
				}
				img.setAttribute("src", "/");
				span.textContent = t1;
				player.appendChild(img);
				player.appendChild(span);
				versusTeamOne.appendChild(player);
			})
			versusMatch.t2.forEach(t2 => {
				const player = document.createElement('div');
				const span = document.createElement('span');
				const img = document.createElement('img');
				player.classList.add("other-match-history-versus-div");
				player.classList.add(t2);
				if (username_list.every(username => {
					return username !== t2;
				})) {
					fetch_matchHistory_profile_pic(t2, true)
					username_list.push(t2);
				}
				img.setAttribute("src", "/");
				span.textContent = t2;
				player.appendChild(img);
				player.appendChild(span);
				versusTeamTwo.appendChild(player);
			})
			versusTeamOneScore.textContent = versusMatch.t1_points;
			versusTeamTwoScore.textContent = versusMatch.t2_points;
			versusItem.appendChild(versusTime);
			versusItem.appendChild(versusTeamOne);
			versusItem.appendChild(versusTeamOneScore);
			versusItem.appendChild(versusTeamTwo);
			versusItem.appendChild(versusTeamTwoScore);
			parentVersus.appendChild(versusItem);
		})
	}
	if (JSONdata.tournaments.length) {
		const header = document.createElement('h5')
		header.textContent = "TOURNAMENT";
		parentTournament.appendChild(header)
		JSONdata.tournaments.forEach(async tournament => {
			const username_list = [];
			const tournamentItem = document.createElement('div');
			tournamentItem.classList.add("other-match-history-tournament-item")
			tournamentItem.id = `other-match-history-tournament-item-${tournament.id}`;
			const winner = document.createElement('h5');
			winner.classList.add("other-match-history-tournament-winner");
			winner.textContent = "Winner: " + tournament.winner;
			const dateObject = new Date(tournament.created_on);
			const day = dateObject.getDate();
			const month = dateObject.toLocaleString('default', { month: 'short' });
			const year = dateObject.getFullYear()
			const hour = dateObject.getHours().toString().padStart(2, '0');
			const minute = dateObject.getMinutes().toString().padStart(2, '0')
			const tournamentTime = document.createElement('h5');
			tournamentTime.classList.add("other-match-history-tournament-time");
			tournamentTime.textContent = `${day} ${month} ${year} ${hour}:${minute}`;
			tournamentItem.appendChild(winner);
			tournamentItem.appendChild(tournamentTime);
			tournament.matches.forEach(matches => {
				const tournamentOne = document.createElement('div');
				const spanOne = document.createElement('span');
				const imgOne = document.createElement('img');
				tournamentOne.classList.add("other-match-history-tournament-div");
				tournamentOne.classList.add(matches.t1[0]);
				if (username_list.every(username => {
					return username !== matches.t1[0];
				})) {
					fetch_matchHistory_profile_pic(matches.t1[0], true)
					username_list.push(matches.t1[0]);
				}
				spanOne.textContent = matches.t1[0];
				imgOne.setAttribute("src", "/");
				tournamentOne.appendChild(imgOne);
				tournamentOne.appendChild(spanOne);
				const tournamentTwo = document.createElement('div');
				const spanTwo = document.createElement('span');
				const imgTwo = document.createElement('img');
				tournamentTwo.classList.add("other-match-history-tournament-div");
				tournamentTwo.classList.add(matches.t2[0]);
				if (username_list.every(username => {
					return username !== matches.t2[0];
				})) {
					fetch_matchHistory_profile_pic(matches.t2[0], true)
					username_list.push(matches.t2[0]);
				}
				spanTwo.textContent = matches.t2[0];
				imgTwo.setAttribute("src", "/");
				tournamentTwo.appendChild(imgTwo);
				tournamentTwo.appendChild(spanTwo);
				const tournamentTeamOneScore = document.createElement('p');
				tournamentTeamOneScore.classList.add("other-match-history-tournament-teamone-score");
				tournamentTeamOneScore.id = `other-match-history-tournament-teamone-score-${matches.id}`;
				const tournamentTeamTwoScore = document.createElement('p');
				tournamentTeamTwoScore.classList.add("other-match-history-tournament-teamtwo-score");
				tournamentTeamTwoScore.id = `other-match-history-tournament-teamtwo-score-${matches.id}`;
				tournamentTeamOneScore.textContent = matches.t1_points;
				tournamentTeamTwoScore.textContent = matches.t2_points;
				tournamentItem.appendChild(tournamentOne);
				tournamentItem.appendChild(tournamentTeamOneScore);
				tournamentItem.appendChild(tournamentTwo);
				tournamentItem.appendChild(tournamentTeamTwoScore);
			})
			parentTournament.appendChild(tournamentItem);
		})
	}
}

async function getTournamentData(tournamentId) {
	const response = await refreshFetch("/tournament/info/",
		{
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ "tournamentId": tournamentId }),
		});

	if (!response.ok || response.status == 204) {
		return { use_blockchain: false, data: null };
	}

	const data = await response.json();
	return { use_blockchain: true, data: data["matches"] };
}

async function populateTournamentBlockchain(JSONdata) {
	if (JSONdata.tournaments.length == 0)
		return;

	for (const tournament of JSONdata.tournaments) {
		const { use_blockchain, data } = await getTournamentData(tournament.id);

		const tournamentItem = document.getElementById(`match-history-tournament-item-${tournament.id}`);
		if (use_blockchain) {
			addTournamentHoverLink(tournamentItem, tournament.blockchain_tx);
			for (const match of tournament.matches) {
				const tournamentTeamOneScore = tournamentItem.querySelector(`#match-history-tournament-teamone-score-${match.id}`);
				const tournamentTeamTwoScore = tournamentItem.querySelector(`#match-history-tournament-teamtwo-score-${match.id}`);
				
				if (data[match.id] != null) {
					tournamentTeamOneScore.textContent = data[match.id].team1Score;
					tournamentTeamTwoScore.textContent = data[match.id].team2Score;
					tournamentTeamOneScore.style.color = '#39ff14';
					tournamentTeamTwoScore.style.color = '#39ff14';
				}
			};
		}
	};
}

async function populateOtherTournamentBlockchain(JSONdata) {
	if (JSONdata.tournaments.length == 0)
		return;

	for (const tournament of JSONdata.tournaments) {
		const { use_blockchain, data } = await getTournamentData(tournament.id);

		const tournamentItem = document.querySelector(`#other-match-history-tournament-item-${tournament.id}`);
		if (use_blockchain) {
			addTournamentHoverLink(tournamentItem, tournament.blockchain_tx);
			for (const match of tournament.matches) {
				const tournamentTeamOneScore = tournamentItem.querySelector(`#other-match-history-tournament-teamone-score-${match.id}`);
				const tournamentTeamTwoScore = tournamentItem.querySelector(`#other-match-history-tournament-teamtwo-score-${match.id}`);
				
				if (data[match.id] != null) {
					tournamentTeamOneScore.textContent = data[match.id].team1Score;
					tournamentTeamTwoScore.textContent = data[match.id].team2Score;
					tournamentTeamOneScore.style.color = '#39ff14';
					tournamentTeamTwoScore.style.color = '#39ff14';
				}
			};
		}
	};
}

function addTournamentHoverLink(tournamentItem, blockchain_tx) {
	const url = `https://sepolia.etherscan.io/tx/${blockchain_tx}#eventlog`;

	const tooltip = document.createElement('div');
	tooltip.textContent = 'View transaction on blockchain';
	tooltip.style.fontSize = "10px";
	tooltip.style.display = 'none';
	tooltip.style.position = 'absolute';
	tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
	tooltip.style.color = 'white';
	tooltip.style.padding = '5px';
	tooltip.style.borderRadius = '5px';
	tooltip.style.cursor = 'pointer';

	tournamentItem.appendChild(tooltip);

	tournamentItem.addEventListener('mouseover', (event) => {
		const rect = tournamentItem.getBoundingClientRect();
		const x = rect.left - 10;
		const y = rect.top - 10;

		tooltip.style.left = `${x}px`;
		tooltip.style.top = `${y}px`;

		tooltip.style.display = 'block';
	});

	tournamentItem.addEventListener('mouseout', () => {
		tooltip.style.display = 'none';
	});

	tooltip.addEventListener('click', () => {
		window.open(url, '_blank');
	});

	tooltip.addEventListener('mouseover', () => {
		tooltip.style.display = 'block';
	});

	tooltip.addEventListener('mouseout', () => {
		tooltip.style.display = 'none';
	});
}

export { keyBindingProfile, populateProfile, fetch_profile, fetch_matchHistory };
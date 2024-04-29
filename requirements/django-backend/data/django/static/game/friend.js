import { global } from './global.js'
import { getCookie } from '../login/login-utils.js';
import { refreshFetch } from '../shared/refresh_token.js';
import { update_lobby } from '../chatroom/chatroom_socket.js';
import { windowResize } from './main.js'
import { fetch_profile, fetch_matchHistory } from '../game/profile.js'

async function acceptDeclineHandler(sender_username, child_node, isAccept) {
    try {
        let body;
        let type;
        if (isAccept != true) {
            type = "decline/"
            body = JSON.stringify({'sender_username': sender_username, 'receiver_username': global.gameplay.username});
        }
        else {
            type = "accept/";
            body = JSON.stringify({'sender_username': sender_username});
        }
        const response = await refreshFetch(global.fetch.friendURL + type, {
            method: "POST",
            headers: {
                'X-CSRFToken': getCookie("csrftoken"),
                'Content-Type': 'application/json'
            },
            body: body
        });
        if (response.ok) {
            document.querySelector(".friend-request").removeChild(child_node);
            if (type == "accept/") {
                update_lobby(global.onlineusers, false);
                global.chat.chatLobbySocket.send(JSON.stringify({
                    'type': 'friendrfs',
                    'receiver': sender_username
                }));
            }
        }
        else {
            document.querySelector(".profile-error").classList.remove("display-none");
            document.querySelector(".profile-error").textContent = "Failed to send request";
            document.querySelector(".friend-request").textContent = "";
        }
    }
    catch (e) {
        document.querySelector(".profile-error").classList.remove("display-none");
        document.querySelector(".profile-error").textContent = "Failed to send request";
        document.querySelector(".friend-request").textContent = "";
    }
}

async function populateFriendRequest(JSONdata) {
    const container = document.querySelector('.friend-request');
    if (container.children.length > 0) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }
    if (JSONdata.length != 0) {
        JSONdata.forEach(incomingRequest => {
            const mainBox = document.createElement('div');
            mainBox.classList.add("friend-request-item");
            const requestSenderName = document.createElement('h4');
            requestSenderName.classList.add("friend-username");
            const senderPfpDiv = document.createElement('button');
            senderPfpDiv.classList.add("friend-request-img");
            senderPfpDiv.classList.add(incomingRequest.sender);
            const senderPfp = document.createElement("img");
            const friendAccept = document.createElement("button");
            friendAccept.classList.add("friend-accept");
            const friendDecline = document.createElement("button");
            friendDecline.classList.add("friend-decline");

            requestSenderName.textContent = incomingRequest.sender;
            friendAccept.textContent = "Accept";
            friendDecline.textContent = "Decline";
            (async () => {
                try {
                    const response = await refreshFetch(global.fetch.profileURL + incomingRequest.sender + '/', {
                        method: 'GET',
                        headers: {
                            'X-CSRFToken': getCookie("csrftoken"),
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        senderPfp.src = `${data.image}`;
                    }
                    else {
                        document.querySelector(".profile-error").classList.remove("display-none");
                        document.querySelector(".profile-error").textContent = "Failed to fetch pfp";
                        document.querySelector(".friend-request").textContent = "";
                    }
                } catch (e) {
                    document.querySelector(".profile-error").classList.remove("display-none");
                    document.querySelector(".profile-error").textContent = "Failed to fetch pfp";
                    document.querySelector(".friend-request").textContent = "";
                }
            })();

            senderPfpDiv.addEventListener("click", (e)=>{
				document.querySelector(".profile-other").classList.remove("display-none");
				document.querySelector(".profile").classList.add("display-none");
				document.querySelector(".profile-container").classList.add("profile-other-theme");
				fetch_profile(e.target.classList[1], true);
				fetch_matchHistory(e.target.classList[1], true);
			})

            friendAccept.addEventListener('click', () => {
                acceptDeclineHandler(incomingRequest.sender, mainBox, true);
            });

            friendDecline.addEventListener('click', () => {
                acceptDeclineHandler(incomingRequest.sender, mainBox, false);
            });

            senderPfpDiv.appendChild(senderPfp);
            mainBox.appendChild(senderPfpDiv);
            mainBox.appendChild(requestSenderName);
            mainBox.appendChild(friendAccept);
            mainBox.appendChild(friendDecline);
            container.appendChild(mainBox);
        });
    }
}

async function fetch_friendRequest() {
    try {
        const response = await refreshFetch(global.fetch.friendURL + "friend_request/", {
            method: "GET",
            headers: {
                'X-CSRFToken': getCookie("csrftoken")
            }
        });
        if (response.ok) {
            const JSONdata = await response.json();
            populateFriendRequest(JSONdata);
        }
        else {
            const data = await response.json();
            document.querySelector(".profile-error").classList.remove("display-none");
            document.querySelector(".profile-error").textContent = data['detail'];
            document.querySelector(".friend-request").textContent = "";
        }
    }
    catch (e) {
        document.querySelector(".profile-error").classList.remove("display-none");
        document.querySelector(".profile-error").textContent = e;
        document.querySelector(".friend-request").textContent = "";
    }
}

async function update_friendlist() {
    try {
        const response = await refreshFetch(global.fetch.friendURL + "friend_list/", {
            method: "GET",
            headers: {
                'X-CSRFToken': getCookie("csrftoken")
            }
        });
        if (response.ok) {
            const data = await response.json();
            global.friends = data.friends;
        }
        else {
            console.error("Friend list response not good.");
        }
    }
    catch (e) {
        console.error("update friend list error: " + e);
    }
}

async function sendFriendRequest(receiverUsername) {
    try {
        const response = await refreshFetch(global.fetch.friendURL + 'friend_request/', {
            method: "POST",
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({sender: global.gameplay.username, receiver: receiverUsername, is_active: true})
        });
        if (!response.ok) {
            document.querySelector(".profile-other-error").classList.remove("display-none");
			document.querySelector(".profile-other-error").textContent = "Error: please refresh page";
        }
    }
    catch (e) {
        document.querySelector(".profile-other-error").classList.remove("display-none");
        document.querySelector(".profile-other-error").textContent = e;
    }
}

async function cancelFriendRequest(receiverUsername) {
    try {
        const response = await refreshFetch(global.fetch.friendURL + 'cancel/', {
            method: "POST",
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"sender_username": global.gameplay.username, "receiver_username": receiverUsername})
        });
        if (!response.ok) {
            document.querySelector(".profile-other-error").classList.remove("display-none");
			document.querySelector(".profile-other-error").textContent = "Error: please refresh page";
        }
    }
    catch (e) {
        document.querySelector(".profile-other-error").classList.remove("display-none");
        document.querySelector(".profile-other-error").textContent = e;
    }
}

function sendFriendButton(e) {
    sendFriendRequest(e.target.classList[1]);
    const replacementButton = document.createElement('button');
    replacementButton.classList.add(e.target.classList[0]);
    replacementButton.classList.add(e.target.classList[1]);
    const tmp_i = document.createElement('i');
    tmp_i.classList.add("fa-solid");
    tmp_i.classList.add("fa-user-check");
    const tmp_hv = document.createElement("h5");
    tmp_hv.innerText = "Cancel Request";
    replacementButton.appendChild(tmp_i);
    replacementButton.appendChild(tmp_hv);
    replacementButton.addEventListener("click", cancelFriendButton);
    e.target.replaceWith(replacementButton);
}

function cancelFriendButton(e) {
    cancelFriendRequest(e.target.classList[1]);
    const replacementButton = document.createElement('button');
    replacementButton.classList.add(e.target.classList[0]);
    replacementButton.classList.add(e.target.classList[1]);
    const tmp_i = document.createElement('i');
    tmp_i.classList.add("fa-solid");
    tmp_i.classList.add("fa-user-plus");
    const tmp_hv = document.createElement("h5");
    tmp_hv.innerText = "Send Request";
    replacementButton.appendChild(tmp_i);
    replacementButton.appendChild(tmp_hv);
    replacementButton.addEventListener("click", sendFriendButton);
    e.target.replaceWith(replacementButton);
}

async function unfriend(friendUsername) {
    try {
        const response = await refreshFetch(global.fetch.friendURL + "unfriend/", {
            method: "POST",
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"friend_username": friendUsername})
        });
        if (!response.ok) {
            document.querySelector(".profile-other-error").classList.remove("display-none");
			document.querySelector(".profile-other-error").textContent = "Error: please refresh page";
        }
        else {
            update_lobby(global.onlineusers, false);
            global.chat.chatLobbySocket.send(JSON.stringify({
                'type': 'friendrfs',
                'receiver': friendUsername
            }));
        }
    }
    catch (e) {
        document.querySelector(".profile-other-error").classList.remove("display-none");
        document.querySelector(".profile-other-error").textContent = e;
    }
}

export { fetch_friendRequest, update_friendlist, sendFriendButton, cancelFriendButton, unfriend };
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
            const data = await response.json();
            document.querySelector(".profile-error").classList.remove("display-none");
            document.querySelector(".profile-error").textContent = data['detail'];
            document.querySelector(".friend-request").textContent = "";
            console.error(data["detail"]);
        }
    }
    catch (e) {
        document.querySelector(".profile-error").classList.remove("display-none");
        document.querySelector(".profile-error").textContent = e;
        document.querySelector(".friend-request").textContent = "";
        console.error("Error at pupolate friend request: " + e);
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
                        const data = await response.json();
                        document.querySelector(".profile-error").classList.remove("display-none");
                        document.querySelector(".profile-error").textContent = data['detail'];
                        document.querySelector(".friend-request").textContent = "";
                        console.error(data["detail"]);
                    }
                } catch (e) {
                    document.querySelector(".profile-error").classList.remove("display-none");
                    document.querySelector(".profile-error").textContent = e;
                    document.querySelector(".friend-request").textContent = "";
                    console.error("Error at pupolate friend request: " + e);
                }
            })();

            senderPfpDiv.addEventListener("click", (e)=>{
				document.querySelector(".profile-other").classList.remove("display-none");
				document.querySelector(".profile").classList.add("display-none");
				document.querySelector(".profile-container").classList.add("profile-other-theme");
				fetch_profile(e.target.classList[1], true);
				fetch_matchHistory(e.target.classList[1], true);
                //     not sure if needed
				// global.ui.profile = 1;
				// global.ui.chat = 0;
				// windowResize();
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
            console.error(date['detail']);
        }
    }
    catch (e) {
        document.querySelector(".profile-error").classList.remove("display-none");
        document.querySelector(".profile-error").textContent = e;
        document.querySelector(".friend-request").textContent = "";
        console.error("Error at fetch friend request: " + e);
    }
}

// is friend is returning undifined
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

// things to think about
// someone who hasn't sent a friend request
// someone who has already sent friend request

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
            const data = await response.json();
            document.querySelector(".profile-other-error").classList.remove("display-none");
			document.querySelector(".profile-other-error").textContent = data['detail'];
            console.error(data['detail']);
        }
    }
    catch (e) {
        document.querySelector(".profile-other-error").classList.remove("display-none");
        document.querySelector(".profile-other-error").textContent = e;
        console.error("Error at send request button: " + e);
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
            const data = await response.json();
            document.querySelector(".profile-other-error").classList.remove("display-none");
			document.querySelector(".profile-other-error").textContent = data['detail'];
            console.error(data['detail']);
        }
    }
    catch (e) {
        document.querySelector(".profile-other-error").classList.remove("display-none");
        document.querySelector(".profile-other-error").textContent = e;
        console.error("Error at cancel button: " + e);
    }
}

function sendFriendButton(e) {
    // console.log("sent friend request");
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
    // console.log("canceled friend request");
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
            const data = await response.json();
            document.querySelector(".profile-other-error").classList.remove("display-none");
			document.querySelector(".profile-other-error").textContent = data['detail'];
            console.error(data['detail']);
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
        console.error("Error at unfriend button: " + e);
    }
}

// update_friendlist();

export { fetch_friendRequest, update_friendlist, sendFriendButton, cancelFriendButton, unfriend };
// 2 places you've included friend.js {static/chatroom/chatroom_socket.js} {static/game/multiplayer}
// need to discuss with jj on how should the friend list be implemented

// NOTES ABOUT THIS CODE
// 1. need to add a link to the friend pfp
// 2. need to add a photo to the friend pfp
// 3. need to ask do i need to include the fetch_friendRequest in the myltiplayer.js or the chatroom_socket.js
// (when entering the main page, including the fetch_friend in multiplayer.js seems to only work there and not in chatroom_socket.js)

// THINGS NOT YET IMPLEMENTED
// displaying friend list
// unfriend
// sending friend request
import { global } from './global.js'
import { getCookie } from '../login/login-utils.js';
import { refreshFetch } from '../shared/refresh_token.js';

async function populateFriendRequest(JSONdata) {
    const container = document.querySelector('.friend-request');
    if (JSONdata.length != 0) {
        JSONdata.forEach(incomingRequest => {
            const mainBox = document.createElement('div');
            mainBox.classList.add("friend-request-item");
            const requestSenderName = document.createElement('h4');
            requestSenderName.classList.add("friend-username");
            const senderPfpDiv = document.createElement('button');
            senderPfpDiv.classList.add("friend-request-img");
            const senderPfp = document.createElement("img");
            const friendAccept = document.createElement("button");
            friendAccept.classList.add("friend-accept");
            const friendDecline = document.createElement("button");
            friendDecline.classList.add("friend-decline");

            requestSenderName.textContent = incomingRequest.sender
            friendAccept.textContent = "Accept"
            friendDecline.textContent = "Decline"
            senderPfp.src = "/"  // need to figure out about pfp later

            friendAccept.addEventListener('click', () => {
                friendAccept.textContent += " it work";
            });

            friendDecline.addEventListener('click', () => {
                friendDecline.textContent += " it work";
            });

            senderPfpDiv.appendChild(senderPfp);
            mainBox.appendChild(senderPfpDiv);
            mainBox.appendChild(requestSenderName);
            mainBox.appendChild(friendAccept);
            mainBox.appendChild(friendDecline);
            container.appendChild(mainBox);
        });
    }
    else {
        console.error("sumting wong");
    }
}

async function fetch_friendRequest() {
    // const incomingFriendRequest = document.querySelector(".friend-request");
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
            document.querySelector(".profile-error").classList.remove("display-none");
            document.querySelector(".profile-error").textContent = "Server Error";
            document.querySelector(".friend-request").textContent = "";
        }
    }
    catch (e) {
        console.error(e);
    }
}

export { fetch_friendRequest };
// need to check api/friend/friend_request/<username>/
// 2 places you've included friend.js {static/chatroom/chatroom_socket.js} {static/game/multiplayer}
// need to remember to do something about the other user seeing {var OtherUser needs to be added and used}
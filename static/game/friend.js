import { global } from './global.js'
import { getCookie } from '../login/login-utils.js';
import { refreshFetch } from '../shared/refresh_token.js';

async function acceptDeclineHandler(request_id, child_node, isAccept) {
    try {
        let type = "accept/";
        if (isAccept != true) {
            type = "decline/"
        }
        const response = await refreshFetch(global.fetch.friendURL + type, {
            method: "POST",
            headers: {
                'X-CSRFToken': getCookie("csrftoken"),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'request_id': request_id})
        });
        if (response.ok) {
            document.querySelector(".friend-request").removeChild(child_node);
        }
        else {
            const errorText = document.createElement("h5");
            errorText.textContent = "Server Error";
            errorText.style.color = 'red';
            child_node.appendChild(errorText);
        }
    }
    catch (e) {
        const errorText = document.createElement("h5");
        errorText.textContent = "Server Error";
        errorText.style.color = 'red';
        child_node.appendChild(errorText);
    }
}

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
            // senderPfpDiv
            senderPfp.src = "/"  // need to figure out about pfp later

            friendAccept.addEventListener('click', () => {
                acceptDeclineHandler(incomingRequest.id, mainBox, true);
            });

            friendDecline.addEventListener('click', () => {
                acceptDeclineHandler(incomingRequest.id, mainBox, false);
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
            document.querySelector(".profile-error").classList.remove("display-none");
            document.querySelector(".profile-error").textContent = "Server Error";
            document.querySelector(".friend-request").textContent = "";
        }
    }
    catch (e) {
        document.querySelector(".profile-error").classList.remove("display-none");
        document.querySelector(".profile-error").textContent = "Server Error";
        document.querySelector(".friend-request").textContent = "";
    }
}

async function populateFriendList(JSONdata) {
    if (JSONdata.friend.length != 0) {
        const colntainer = document.getElementById('Friend-list');

        JSONdata.friend.forEach(friend => {
            const mainDiv = document.createElement('div')
            // const 
        });
    }
}

async function fetch_friends() {
    try {
        const response = refreshFetch(global.fetch.friendURL + "friend_list/", {
            method: "GET",
            headers: {
                'X-CSRFToken': getCookie("csrftoken")
            }
        });
        if (response.ok) {
            const JSONdata = await response.json();
            populateFriendList(JSONdata);
        }
        else {
            const mainNode = document.getElementById('Friend-list');
            const childNode = document.createElement("h4");
            childNode.textContent = "Server Error";
            childNode.style.color = 'red';
            mainNode.appendChild(childNode);
        }
    }
    catch (e) {
        const mainNode = document.getElementById('Friend-list');
        const childNode = document.createElement("h4");
        childNode.textContent = "Server Error";
        childNode.style.color = 'red';
        mainNode.appendChild(childNode);
    }
}

async function is_friend(friendUsername) {
    try {
        const response = refreshFetch(global.fetch.friendURL + "is_friend/", {
            method: "POST",
            headers: {
                'XCSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application-json'
            },
            body: JSON.stringify({friend: friendUsername})
        });
        if (response.ok) {
            const jsondata = await response.json()
            if (jsondata.is_friend == 1)
                return 1;
            return 0;
        }
        return -1;
    }
    catch (e) {
        return (-1);
    }
}

export { fetch_friendRequest, is_friend };
// 2 places you've included friend.js {static/chatroom/chatroom_socket.js} {static/game/multiplayer}
// need to discuss with jj on how should the friend list be implemented

// NOTES ABOUT THIS CODE
// 1. need to add a link to the friend pfp
// 2. need to add a photo to the friend pfp
// 3. need to ask do i need to include the fetch_friendRequest in the myltiplayer.js or the chatroom_socket.js
// (when entering the main page, including the fetch_friend in chatroom_socket seems to only work there and not in multiplayer.js)

// THINGS NOT YET IMPLEMENTED
// displaying friend list
// unfriend
// sending friend request
// canceling friend request
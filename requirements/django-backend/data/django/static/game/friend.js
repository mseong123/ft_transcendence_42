import { global } from './global.js'
import { getCookie } from '../login/login-utils.js';
import { refreshFetch } from '../shared/refresh_token.js';
import { update_lobby } from '../chatroom/chatroom_socket.js';

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
                update_lobby(null);
            }
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
        if (container.children.length > 0) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }
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

            requestSenderName.textContent = incomingRequest.sender;
            friendAccept.textContent = "Accept";
            friendDecline.textContent = "Decline";
            // senderPfpDiv
            (async () => {
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
                    senderPfp.textContent = "Error";
                }
            })();

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
        if (response.ok) {
            return 1;
        }
        else {
            console.error("Sending friend request response was not ok");
            return 0;
        }
    }
    catch (e) {
        console.log(e);
        return 0;
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
        if (response.ok) {
            return 1;
        }
        else {
            console.error("Canceling friend request response was not ok");
            return 0;
        }
    }
    catch (e) {
        console.log(e);
        return 0;
    }
}

function sendFriendButton(e) {
    // console.log("sent friend request");
    sendFriendRequest(e.target.classList[1]);
    const replacementButton = document.createElement('button');
    replacementButton.classList.add(e.target.classList[0]);
    replacementButton.classList.add(e.target.classList[1]);
    replacementButton.innerHTML = e.target.innerHTML.replace("fa-user-plus", "fa-user-check");
    replacementButton.innerHTML = replacementButton.innerHTML.replace("Send Request", "Cancel Request");
    replacementButton.addEventListener("click", cancelFriendButton);
    e.target.replaceWith(replacementButton);
}

function cancelFriendButton(e) {
    // console.log("canceled friend request");
    cancelFriendRequest(e.target.classList[1]);
    const replacementButton = document.createElement('button');
    replacementButton.classList.add(e.target.classList[0]);
    replacementButton.classList.add(e.target.classList[1]);
    replacementButton.innerHTML = e.target.innerHTML.replace("fa-user-check", "fa-user-plus");
    replacementButton.innerHTML = replacementButton.innerHTML.replace("Cancel Request", "Send Request");
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
            console.error("Unfriending Failed");
        }
        else {
            update_lobby(null);
        }
    }
    catch (e) {
        console.error(e);
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
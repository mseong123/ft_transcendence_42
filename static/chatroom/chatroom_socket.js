// const roomName = JSON.parse(document.getElementById('room-name').textContent);
document.global = {}
document.global.gameplay = {username : 'jyim'}
var currentChatRoomSocket;
var lobbySocket;
var onlineusers;

const sortAlphaNum = (a, b) => a.localeCompare(b, 'en', { numeric: true })
function MySort(alphabet)
{
    return function(a, b) {
        var index_a = alphabet.indexOf(a[0]),
        index_b = alphabet.indexOf(b[0]);

        if (index_a === index_b) {
            // same first character, sort regular
            if (a < b) {
                return -1;
            } else if (a > b) {
                return 1;
            }
            return 0;
        } else {
            return index_a - index_b;
        }
    }
}

sortSpeacialChar = MySort('*!@_.()#^&%-=+01234567989abcdefghijklmnopqrstuvwxyz');

class ChatSocketManager {
    constructor() {
        this.socketList = [];
    }

    registerSocket(roomname, socket) {
        this.socketList.push({roomname, socket});
    }

    // delete from list and close socket
    closeSocket(roomname) {
        let index = this.socketList.findIndex(roomSocket => roomSocket.roomname === roomname);
        const roomSocket = this.socketList.find(roomSocket => roomSocket.roomname === roomname);
        roomSocket.socket.close();
        if (index > -1) { // only splice array when item is found
            this.socketList.splice(index, 1); // 2nd parameter means remove one item only
          }
    }

    // Only delete from list (Note*) Might be better to seperate close sockt and delete entry.
    // Delete entry to be placed in socket.onclose() while close socket can be used whenever
    deleteEntry(roomname) {
        let index = this.socketList.findIndex(roomSocket => roomSocket.roomname === roomname);
        if (index > -1) { // only splice array when item is found
            this.socketList.splice(index, 1); // 2nd parameter means remove one item only
          }
    }
    getAllSockets() {
        return this.socketList.map(entry => entry.roomname);
    }

    getSocket(roomname) {
        const roomSocket = this.socketList.find(roomSocket => roomSocket.roomname === roomname);
        return roomSocket ? roomSocket.socket : null;
    }
}

const chatSocketManager = new ChatSocketManager

const lobby = 'ws://'
+ window.location.host
+ '/ws/chat/lobby/';

function createChatSocket(room) {
    currentChatRoomSocket = new WebSocket(room);
    console.log("connected to:", room, currentChatRoomSocket);
};

// Function reuses currentChatRoomSocket to move betwwen game chat
function enterChatRoom(room) {
    createChatSocket(room);
    currentChatRoomSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        console.log(data);
        if (data["type"] == "msg") {
            const paramsg = document.createElement("p");
            paramsg.style.textAlign = "left";
            paramsg.innerText = data["username"] + ":   " + data["message"];
            let msgContainer = document.querySelector('#chat-msg');
            msgContainer.appendChild(paramsg);
        } else if (data["type"] == "userlist") {
            console.log("current online users:", data["onlineUsers"])
            onlineusers = data["onlineUsers"];
        }
    };
    
    currentChatRoomSocket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly');
    };

    currentChatRoomSocket.onerror = function(e) {
        console.error('Chat socket encounter error');
    };
};

// To exit currentChatRoom socket. Must be run when ever exit game and logout
function exitChatRoom() {
    currentChatRoomSocket.close();
};

// Functionused solely to enter lobby and is run after login
function enterLobby() {
    lobbySocket =  new WebSocket(lobby);
    lobbySocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        console.log(data);
        if (data["type"] == "msg") {
            const paramsg = document.createElement("p");
            paramsg.style.textAlign = "left";
            paramsg.innerText = data["username"] + ":   " + data["message"];
            let msgContainer = document.querySelector('#chat-msg');
            msgContainer.appendChild(paramsg);
        } else if (data["type"] == "userlist") {
            console.log("current online users:", data["onlineUsers"])
            onlineusers = data["onlineUsers"];
            updateLobbyList(onlineusers)
        } else if (data["type"] == "pm") {
            acceptPrivateMessage(data);
        }
    };
    
    lobbySocket.onclose = function(e) {
        const paramsg = document.createElement("p");
        paramsg.style.textAlign = "left";
        paramsg.style.color = "red";
        paramsg.innerText = "You have disconnected from lobby chat server"
        let msgContainer = document.querySelector('#chat-msg');
        msgContainer.appendChild(paramsg);
        console.error('Chat socket closed unexpectedly');
    };

    lobbySocket.onerror = function(e) {
        const paramsg = document.createElement("p");
        paramsg.style.textAlign = "left";
        paramsg.style.color = "red";
        paramsg.innerText = "You have encounter an error on lobby chat server"
        let msgContainer = document.querySelector('#chat-msg');
        console.error('Chat socket encounter error');
    };
};

// To exit currentChatRoom socket. Must be run when ever exit game and logout
function exitLobby() {
    lobbySocket.close();
};

function updateLobbyList(data) {
    let lobbyList = document.getElementById("Lobby-list")
    let listdiv = document.createElement("div");
    data.forEach(user => {
        let p = document.createElement("p");
        p.classList.add("chat-options");
        p.classList.add(user);
        p.innerText = user;
        let profileBtn = document.createElement("button");
        profileBtn.classList.add("chat-options-profile");
        profileBtn.classList.add(user);
        profileBtn.innerHTML = '  <i class="fa-solid fa-user"></i>'
        p.appendChild(profileBtn);
        let messageBtn = document.createElement("button");
        messageBtn.classList.add("chat-options-message");
        messageBtn.classList.add(user);
        messageBtn.innerHTML = '  <i class="fa-solid fa-comment"></i>'
        messageBtn.addEventListener('click', createPrivateMessage);
        p.appendChild(messageBtn);
        listdiv.appendChild(p);
    });
    if (lobbyList.childElementCount > 0)
        lobbyList.replaceChildren(listdiv)
}


enterLobby();

function createPrivateMessage(e){
    const name = []
    let sender = document.global.gameplay.username;
    let receiver = e.target.classList[1];
    name.push(sender);
    name.push(receiver);
    name.sort(sortSpeacialChar)
    let roomname = name[0] + '_' + name[1];

    console.log(roomname);

    if(receiver != document.global.gameplay.username) {
        if (document.querySelector(".chat-tab."  + roomname)) {
            console.log(roomname, "chat already exist");

        } else {
            let friendChat = document.createElement("div");
            friendChat.classList.add("chat-tab");
            friendChat.classList.add(roomname);
            friendChat.innerText = receiver;
            let closeBtn = document.createElement('i');
            closeBtn.classList.add("friend-close-button");
            closeBtn.classList.add(roomname);
            closeBtn.classList.add("fa");
            closeBtn.classList.add("fa-xmark");
            closeBtn.addEventListener("click", exitPrivateChat)
            friendChat.appendChild(closeBtn);
            let tabs = document.querySelector(".tab");
            tabs.appendChild(friendChat);
            friendChat.addEventListener("click", privateMessageTab)
            chatcontainer = document.querySelector(".chat-container");
            let privateChatContainer = document.createElement("div");
            privateChatContainer.classList.add("p-chat-container");
            privateChatContainer.classList.add(roomname);
            privateChatContainer.style.display= "none";
            let privateChatLog = document.createElement("div");
            privateChatLog.classList.add("p-chat-log");
            privateChatLog.classList.add(roomname);
            let privateChatMsg = document.createElement("div");
            privateChatMsg.classList.add("p-chat-msg");
            privateChatMsg.classList.add(roomname);
            privateChatLog.appendChild(privateChatMsg);
            privateChatContainer.appendChild(privateChatLog);
            let inputsubmit = document.createElement("div");
            let privateChatInput = document.createElement("input");
            privateChatInput.classList.add("p-chat-input");
            privateChatInput.classList.add(roomname);
            privateChatInput.setAttribute('type', 'text');
            privateChatInput.setAttribute('size', '100');
            privateChatInput.setAttribute('maxlength', '100');
            privateChatInput.addEventListener("keyup", SendPrivateMessageKey)
            inputsubmit.appendChild(privateChatInput);
            let privateChatSubmit = document.createElement("input");
            privateChatSubmit.classList.add("p-chat-submit");
            privateChatSubmit.classList.add(roomname);
            privateChatSubmit.setAttribute('type', 'button');
            privateChatSubmit.setAttribute('value', 'Send');
            privateChatSubmit.setAttribute('style', "align: right;");
            privateChatSubmit.addEventListener("click", SendPrivateMessage)
            inputsubmit.appendChild(privateChatSubmit);
            privateChatContainer.appendChild(inputsubmit);
            chatcontainer.appendChild(privateChatContainer);

            lobbySocket.send(JSON.stringify({
                'type': 'pm',
                'sender': sender,
                'receiver': receiver
            }));
            let socket = new WebSocket('ws://'
            + window.location.host
            + '/ws/pm/' + roomname + '/')
            socket.onmessage = function(e) {
                const data = JSON.parse(e.data);
                console.log(data);
                if (data["type"] == "msg") {
                    const paramsg = document.createElement("p");
                    paramsg.style.textAlign = "left";
                    paramsg.innerText = data["username"] + ":   " + data["message"];
                    let msgContainer = document.querySelector('.p-chat-msg.' + roomname);
                    msgContainer.appendChild(paramsg);
                };
            };
            
            socket.onclose = function(e) {
                const paramsg = document.createElement("p");
                paramsg.style.textAlign = "left";
                paramsg.style.color = "red";
                paramsg.innerText = "You have disconnected"
                let msgContainer = document.querySelector('.p-chat-msg.' + roomname);
                msgContainer.appendChild(paramsg);
                console.error('Chat socket closed unexpectedly');
            };
            
            socket.onerror = function(e) {
                const paramsg = document.createElement("p");
                paramsg.style.textAlign = "left";
                paramsg.style.color = "red";
                paramsg.innerText = "You have encounter an error."
                let msgContainer = document.querySelector('.p-chat-msg.' + roomname);
                console.error('Chat socket encounter error');
            };
            chatSocketManager.registerSocket(roomname, socket);
        }
    }
};

// enterChatRoom(lobby);

function acceptPrivateMessage(data){
    const name = [];
    let sender = data["sender"];
    let receiver = data["receiver"];
    name.push(sender);
    name.push(receiver);
    name.sort(sortSpeacialChar)
    let roomname = name[0] + '_' + name[1];

    console.log(roomname);
    if(receiver == document.global.gameplay.username) {
        if (document.querySelector(".chat-tab."  + roomname)) {
            console.log(roomname, "chat already exist");

        } else {
            let socket = new WebSocket('ws://'
            + window.location.host
            + '/ws/pm/' + roomname + '/')

            socket.onmessage = function(e) {
                const data = JSON.parse(e.data);
                console.log(data);
                if (data["type"] == "msg") {
                    const paramsg = document.createElement("p");
                    paramsg.style.textAlign = "left";
                    paramsg.innerText = data["username"] + ":   " + data["message"];
                    let msgContainer = document.querySelector('.p-chat-msg.' + roomname);
                    msgContainer.appendChild(paramsg);
                };
            };
            
            socket.onclose = function(e) {
                console.error('Chat socket closed unexpectedly');
            };
            
            socket.onerror = function(e) {
                console.error('Chat socket encounter error');
            };

            chatSocketManager.registerSocket(roomname, socket);
            let friendChat = document.createElement("div");
            friendChat.classList.add("chat-tab");
            friendChat.classList.add(roomname);
            friendChat.innerText = sender;
            let closeBtn = document.createElement('i');
            closeBtn.classList.add("friend-close-button");
            closeBtn.classList.add(roomname);
            closeBtn.classList.add("fa");
            closeBtn.classList.add("fa-xmark");
            closeBtn.addEventListener("click", exitPrivateChat)
            friendChat.appendChild(closeBtn);
            tabs = document.querySelector(".tab");
            tabs.appendChild(friendChat);
            friendChat.addEventListener("click", privateMessageTab)

            chatcontainer = document.querySelector(".chat-container");
            let privateChatContainer = document.createElement("div");
            privateChatContainer.classList.add("p-chat-container");
            privateChatContainer.classList.add(roomname);
            privateChatContainer.style.display= "none";
            let privateChatLog = document.createElement("div");
            privateChatLog.classList.add("p-chat-log");
            privateChatLog.classList.add(roomname);
            let privateChatMsg = document.createElement("div");
            privateChatMsg.classList.add("p-chat-msg");
            privateChatMsg.classList.add(roomname);
            privateChatLog.appendChild(privateChatMsg);
            privateChatContainer.appendChild(privateChatLog);
            let privateChatInput = document.createElement("input");
            privateChatInput.classList.add("p-chat-input");
            privateChatInput.classList.add(roomname);
            privateChatInput.setAttribute('type', 'text');
            privateChatInput.setAttribute('size', '100');
            privateChatInput.setAttribute('maxlength', '100');
            privateChatInput.addEventListener("keyup", SendPrivateMessageKey)
            privateChatContainer.appendChild(privateChatInput);
            let privateChatSubmit = document.createElement("input");
            privateChatSubmit.classList.add("p-chat-submit");
            privateChatSubmit.classList.add(roomname);
            privateChatSubmit.setAttribute('type', 'button');
            privateChatSubmit.setAttribute('value', 'Send');
            privateChatSubmit.setAttribute('style', "align: right;");
            privateChatSubmit.addEventListener("click", SendPrivateMessage)
            privateChatContainer.appendChild(privateChatSubmit);
            chatcontainer.appendChild(privateChatContainer);
        }
    }
};

function privateMessageTab(e) {
    // Declare all variables
    var i, tabcontent, tablinks, roomname;

    roomname = e.target.classList[1];
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
    // Get all elements with class="chat-tab" and hide them
    chattabs = document.getElementsByClassName("chat-tab");
    for (i = 0; i < chattabs.length; i++) {
        chattabs[i].className = chattabs[i].className.replace(" active", "");
    }
    
    e.currentTarget.className += " active";
    document.getElementById("lobby-container").style.display = "none";

    if (document.querySelector('.p-chat-container.' + roomname)) {
        document.querySelector('.p-chat-container.' + roomname).style.display = "block";
    }

}

function SendPrivateMessage(e) {
    roomname = e.target.classList[1];

    const messageInputDom = document.querySelector(".p-chat-input." + roomname);
    let message = messageInputDom.value;
    if (typeof message === "string" && message.trim().length > 0) {
        roomsocket = chatSocketManager.getSocket(roomname)
        roomsocket.send(JSON.stringify({
            'type': 'msg',
            'username': document.global.gameplay.username,
            'message': message
        }));
    }
    messageInputDom.value = '';
};

function SendPrivateMessageKey(e) {
    roomname = e.target.classList[1];
    // document.querySelector(".p-chat-submit." + roomname).focus();
    if (e.key === 'Enter') {
        document.querySelector(".p-chat-submit." + roomname).click();
    }
};

function exitPrivateChat(e) {
    roomname = e.target.classList[1];

    // Get all elements with class="tabcontent" and hide them
    privateChat = document.getElementsByClassName(roomname);
    while (privateChat.length > 0) {
        privateChat[0].parentNode.removeChild(privateChat[0]);
    }

    chatSocketManager.closeSocket(roomname);
}

document.querySelector('#lobby-chat-message-submit').onclick = function(e) {
    const messageInputDom = document.querySelector('#lobby-chat-message-input');
    let message = messageInputDom.value;
    if (typeof message === "string" && message.trim().length > 0) {
        lobbySocket.send(JSON.stringify({
            'type': 'msg',
            'username': document.global.gameplay.username,
            'message': message
        }));
    }
    messageInputDom.value = '';
};

document.querySelector('#lobby-chat-message-input').focus();
document.querySelector('#lobby-chat-message-input').onkeyup = function(e) {
    if (e.key === 'Enter') {  // enter, return
        document.querySelector('#lobby-chat-message-submit').click();
    }
};

// document.querySelector('#room-chat-message-submit').onclick = function(e) {
//     const messageInputDom = document.querySelector('#room-chat-message-input');
//     let message = messageInputDom.value;
//     if (typeof message === "string" && message.trim().length != 0)
//         currentChatRoomSocket.send(JSON.stringify({
//             'type': 'msg',
//             'username': document.global.gameplay.username,
//             'message': message
//         }));
//     messageInputDom.value = '';
// };

// document.querySelector('#room-chat-message-input').focus();
// document.querySelector('#room-chat-message-input').onkeyup = function(e) {
//     if (e.key === 'Enter') {  // enter, return
//         document.querySelector('#room-chat-message-submit').click();
//     }
// };

// const chatSocket = new WebSocket(
//     'ws://'
//     + window.location.host
//     + '/ws/chat/'
//     + roomName
//     + '/'
// );

function openTab(evt, tabs) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Get all elements with class="chat-tab" and hide them
    chattabs = document.getElementsByClassName("chat-tab");
    for (i = 0; i < chattabs.length; i++) {
        chattabs[i].className = chattabs[i].className.replace(" active", "");
    }
    
    // Get all elements with class="p-chat-container" and hide them
    privatechats = document.getElementsByClassName("p-chat-container");
    for (i = 0; i < privatechats.length; i++) {
        privatechats[i].style.display = "none";
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabs).style.display = "block";
    evt.currentTarget.className += " active";

    document.getElementById("lobby-container").style.display = "block";
}

document.addEventListener("DOMContentLoaded", function() {
    // Code that interacts with the DOM, including openTab function

    // Your existing openTab function code here
});



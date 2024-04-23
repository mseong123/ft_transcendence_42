import { matchFixStartExecute, createGameLobbyWebSocket, createGameSocket } from '../game/multiplayer.js'
import { windowResize } from '../game/main.js'
import { fetch_profile, fetch_matchHistory } from '../game/profile.js'

// const roomName = JSON.parse(document.getElementById('room-name').textContent);
global.chat.blocklist = [];

import { global } from '../game/global.js';
import { refreshFetch } from '../shared/refresh_token.js';
import { resetGame } from '../game/gameplay.js';
import { sendFriendButton, cancelFriendButton, update_friendlist } from '../game/friend.js';

function getCookie(name) {
    let value = `; ${document.cookie}`;
    let parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

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

var sortSpeacialChar = MySort('*!@_.()#^&%-=+01234567989abcdefghijklmnopqrstuvwxyz');

class ChatSocketManager {
    constructor() {
        this.socketList = [];
    }

    // Register the socket and room name to an array
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
    
    // Returns all existing roomname
    getAllSockets() {
        return this.socketList.map(entry => entry.roomname);
    }

    //returns the socket associated with the roomname
    getSocket(roomname) {
		const roomSocket = this.socketList.find(roomSocket => roomSocket.roomname === roomname);
        return roomSocket ? roomSocket.socket : null;
    }
}

// Initiate socket manager
const chatSocketManager = new ChatSocketManager

const lobby = 'wss://'
+ window.location.host
+ '/ws/chat/lobby/';

// function createChatSocket(room) {
//     global.chat.currentGameChatSocket = new WebSocket(room);
//     console.log("connected to:", room, global.chat.currentGameChatSocket);
// };
// Use to enter game chat, run when button to join game is clicked
// Function reuses currentChatRoomSocket to move betwwen game chat
async function enterChatRoom(room) {
    let url = 'wss://'
    + window.location.host
    + '/ws/chat/chat-' + room +'/';
    // createChatSocket(url);
    await refreshFetch("/api/auth/token/refresh/", {method: "POST"});
	global.chat.currentGameChatSocket = new WebSocket(url);
    chatSocketManager.registerSocket("chat-" + room, global.chat.currentGameChatSocket)

    // create tab
    let gameChat = document.createElement("button");
    gameChat.classList.add("chat-tab");
    gameChat.classList.add("chat-" + room);
	gameChat.innerText = "Game";
	let notification = document.createElement('div');
	notification.classList.add("notification");
	notification.classList.add("display-none");
	notification.setAttribute("role", "status");
	gameChat.appendChild(notification);

    // Insert click function for tab
	
    let lobbyTab = document.getElementById("Lobby-tab");
    let tabs = document.querySelector(".lobby-friend");
    tabs.insertBefore(gameChat, lobbyTab); 
    gameChat.addEventListener("click", privateMessageTab)
    // Create container for game chat
    let chatcontainer = document.querySelector(".display-chat-container");
    let gameChatContainer = document.createElement("div");
    gameChatContainer.classList.add("p-chat-container");
    gameChatContainer.classList.add("chat-" + room);
    gameChatContainer.classList.add("display-none");
    let gameChatLog = document.createElement("div");
    gameChatLog.classList.add("p-chat-log");
    gameChatLog.classList.add("chat-" + room);
    let gameChatMsg = document.createElement("div");
    gameChatMsg.classList.add("p-chat-msg");
    gameChatMsg.classList.add("chat-" + room);
    gameChatLog.appendChild(gameChatMsg);
    gameChatContainer.appendChild(gameChatLog);
    let inputsubmit = document.createElement("div");
    inputsubmit.classList.add("p-message-box");
    inputsubmit.classList.add("chat-" + room);
    inputsubmit.classList.add("display-none");
    let gameChatInput = document.createElement("input");
    gameChatInput.classList.add("p-chat-input");
    gameChatInput.classList.add("chat-" + room);
    gameChatInput.setAttribute('type', 'text');
    gameChatInput.setAttribute('placeholder', 'Type message...');
    gameChatInput.setAttribute('maxlength', '100');
    gameChatInput.addEventListener("keyup", SendPrivateMessageKey)
    inputsubmit.appendChild(gameChatInput);
    let gameChatSubmit = document.createElement("input");
    gameChatSubmit.classList.add("p-chat-submit");
    gameChatSubmit.classList.add("chat-" + room);
    gameChatSubmit.setAttribute('type', 'button');
    gameChatSubmit.setAttribute('value', 'Send');
    gameChatSubmit.setAttribute('style', "align: right;");
    gameChatSubmit.addEventListener("click", SendPrivateMessage)
    inputsubmit.appendChild(gameChatSubmit);
    chatcontainer.appendChild(gameChatContainer);
    chatcontainer.appendChild(inputsubmit);
    global.chat.currentGameChatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        // console.log(data);
        if (data["type"] == "msg") {
			// if (!blocklist.includes(""))
			if (gameChat.classList.contains("active")) {
				notification.classList.add("display-none");
				notification.textContent="0";
			}
			else {
				let number = parseInt(notification.textContent) + 1;
				notification.textContent=number;
				notification.classList.remove("display-none");
			}
            const paramsg = document.createElement("p");
            paramsg.style.textAlign = "left";
            paramsg.innerText = data["username"] + ":\n" + data["message"];
            let msgContainer = document.querySelector('.p-chat-msg.chat-' + room);
			msgContainer.appendChild(paramsg);
			// document.querySelector("button.chat-tab.chat-"+room).click();
			global.ui.profile = 0;
			global.ui.chat = 1;
			windowResize();
        }
    };
    
    global.chat.currentGameChatSocket.onclose = function(e) {
        console.log('Chat socket closed');
    };

    global.chat.currentGameChatSocket.onerror = function(e) {
        console.error('Chat socket encounter error');
	};
	gameChat.click();
	global.ui.profile = 0;
	global.ui.chat = 1;
	windowResize();
	// document.querySelector(".p-chat-input.chat-"+room).focus();
};

// To exit currentChatRoom socket. Must be run when ever exit game and logout
function exitChatRoom(room) {
    chatSocketManager.closeSocket(room)
    global.chat.currentGameChatSocket = null;
    let gameChat = document.getElementsByClassName(room);
    while (gameChat.length > 0) {
        gameChat[0].parentNode.removeChild(gameChat[0]);
    }
};

function exitChatRoomTest(e) {
    let room = e.target.classList[0];
    chatSocketManager.closeSocket(room)
    global.chat.currentGameChatSocket = null;
    let gameChat = document.getElementsByClassName("chat-" + room);
    while (gameChat.length > 0) {
        gameChat[0].parentNode.removeChild(gameChat[0]);
    }
};

// Test timer seconds
// function startTimer(duration, display, initialStart) {
//     let time = duration, minutes, seconds;
// 	let countdownContainer = document.createElement("p");
// 	countdownContainer.classList.add("countdown")
//     // countdownContainer.addAttribute("id", "game-countdown");
// 	display.appendChild(countdownContainer);
// 	document.querySelector(".multi-tournament-matchFix-start-button").disabled=true;
// 	document.querySelector(".reset-game-button").disabled=true;
//     let timer = setInterval(function () {
//         minutes = parseInt(time / 60, 10);
//         seconds = parseInt(time % 60, 10);

//         minutes = minutes < 10 ? "0" + minutes : minutes;
//         seconds = seconds < 10 ? "0" + seconds : seconds;

//         countdownContainer.textContent = "Game starts in: " + minutes + " : " + seconds;
//         // console.log(minutes,":",seconds);


//         if (--time < 0) {
//             countdownContainer.remove();
// 			clearInterval(timer);
// 			document.querySelector(".multi-tournament-matchFix-start-button").disabled=false;
// 			document.querySelector(".reset-game-button").disabled=false;
// 			matchFixStartExecute(initialStart);
//         }
//     }, 1000);
// }

function startTimerTournamentStart(duration, room, initialRound) {
    let time = duration, minutes, seconds;
	if (initialRound)
		document.querySelector(".multi-tournament-matchFix-start-button").disabled=true;
	else
		document.querySelector(".reset-game-button").disabled=true;
	
    let timer = setInterval(function () {
        minutes = parseInt(time / 60, 10);
        seconds = parseInt(time % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

		document.querySelector(".p-chat-input.chat-" + room).value = "Game starts in: " + minutes + " : " + seconds; 
		document.querySelector(".p-chat-submit.chat-" + room).click();

        if (--time < 0) {
			clearInterval(timer);
			if (initialRound) {
				document.querySelector(".multi-tournament-matchFix-start-button").disabled=false;
				matchFixStartExecute();
			}
			else {
				document.querySelector(".reset-game-button").disabled=false;
				resetGame();
			}
			
        }
    }, 1000);
}
// display = .p-chat-log.chat- + <roomname>


// Test exit gameChat
// let exitChat = document.createElement("button");
// exitChat.classList.add("test")
// exitChat.innerText = "Exit";
// let lobbyTab = document.getElementById("Lobby-tab");
// let tabs = document.querySelector(".lobby-friend");
// tabs.insertBefore(exitChat, lobbyTab); 
// exitChat.addEventListener("click", exitChatRoomTest)
async function update_lobby(updated_users) {
    if (updated_users) {
        global.onlineusers = updated_users;
    }
    await update_friendlist();
    updateLobbyList(global.onlineusers);
    updateFriendList(global.friends, global.onlineusers);
}

// Function used solely to enter lobby and is run after login
function enterLobby() {
    // retrieveBlockList(global.gameplay.username );
    global.chat.chatLobbySocket =  new WebSocket(lobby);
    global.chat.chatLobbySocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        // console.log(data);
        if (data["type"] == "msg") {
            if (!global.chat.blocklist.includes(data["username"])) {
                let paramsg = document.createElement("p");
                paramsg.style.textAlign = "left";
                paramsg.innerText = data["username"] + ":\n" + data["message"];
                let msgContainer = document.createElement('div');
                msgContainer.appendChild(paramsg);
                let chatContainer = document.querySelector('.chat-msg');
				chatContainer.appendChild(msgContainer);
				
		
            }
        } else if (data["type"] == "userlist") {
            // console.log("current online users:", data["onlineUsers"])
            update_lobby(data["onlineUsers"]);
        } else if (data["type"] == "pm") {
			acceptPrivateMessage(data);
        }
    };
    
    global.chat.chatLobbySocket.onclose = function(e) {
        const paramsg = document.createElement("p");
        paramsg.style.textAlign = "left";
        paramsg.style.color = "red";
        paramsg.innerText = "You have disconnected from lobby chat server. Please login again."
        let msgContainer = document.querySelector('#chat-msg');
		msgContainer.appendChild(paramsg);
		document.querySelector("#Lobby-tab").click();
		global.ui.profile = 0;
		global.ui.chat = 1;
		windowResize();
        // console.error('Chat socket closed unexpectedly');
    };

    global.chat.chatLobbySocket.onerror = function(e) {
        const paramsg = document.createElement("p");
        paramsg.style.textAlign = "left";
        paramsg.style.color = "red";
        paramsg.innerText = "You have encounter an error on lobby chat server. Please login again."
		let msgContainer = document.querySelector('#chat-msg');
		msgContainer.appendChild(paramsg);
		document.querySelector("#Lobby-tab").click();
		global.ui.profile = 0;
		global.ui.chat = 1;
		windowResize();
        // console.error('Chat socket encounter error');
    };
};

// To exit currentChatRoom socket. Must be run when ever exit game and logout
function exitLobby() {
	if (global.chat.chatLobbySocket)
		global.chat.chatLobbySocket.close();
};

// function updateLobbyList(data) {
//     let lobbyList = document.getElementById("Lobby-list")
//     let listdiv = document.createElement("div");
//     data.forEach(user => {
//         let p = document.createElement("p");
//         p.classList.add("chat-options");
//         p.classList.add(user);
//         p.innerText = user;
//         let profileBtn = document.createElement("button");
//         profileBtn.classList.add("chat-options-profile");
//         profileBtn.classList.add(user);
//         profileBtn.innerHTML = '  <i class="fa-solid fa-user"></i>'
//         p.appendChild(profileBtn);
//         let messageBtn = document.createElement("button");
//         messageBtn.classList.add("chat-options-message");
//         messageBtn.classList.add(user);
//         messageBtn.innerHTML = '  <i class="fa-solid fa-comment"></i>'
//         messageBtn.addEventListener('click', createPrivateMessage);
//         p.appendChild(messageBtn);
//         listdiv.appendChild(p);
//     });
//     if (lobbyList.childElementCount > 0)
//         lobbyList.replaceChildren(listdiv)
// }


function updateLobbyList(data) {
    let lobbyList = document.getElementById("Lobby-list")
	let listdiv = document.createElement("div");
	lobbyList.textContent = "";
    data.forEach(user => {
        if (user != global.gameplay.username) {
			let p = document.createElement("p");
			p.classList.add("chat-options");
			p.classList.add(user);
			let messageBtn = document.createElement("button");
			messageBtn.setAttribute("type", "button")
			messageBtn.classList.add("chat-options-message");
			messageBtn.classList.add(user);
			messageBtn.textContent = user;
			messageBtn.addEventListener('click', createPrivateMessage);
			p.appendChild(messageBtn);

			let profileBtn = document.createElement("button");
			profileBtn.setAttribute("type", "button")
            if (global.chat.blocklist.includes(user) ) {
                // console.log(user, " is in block list")
                profileBtn.classList.add("chat-options-profile");
                profileBtn.classList.add(user);
                profileBtn.innerHTML = '  <i class="fa-solid fa-user-slash"></i>'
                profileBtn.addEventListener("click", unblockUser)
                p.appendChild(profileBtn);
            } else {
                // console.log(user, global.chat.blocklist.includes(user)," is not in block list")

                // if (global["friends"].includes(user) == false) {
                //     const addFriend = document.createElement("button");
                //     addFriend.classList.add("chat-option-add-friend");
                //     addFriend.classList.add(user);
                //     addFriend.innerHTML = '  <i class="fa-solid fa-user-plus"></i>';
                    
                //     addFriend.addEventListener("click", sendFriendButton);
                //     p.appendChild(addFriend);
                // }
                profileBtn.classList.add("chat-options-profile");
                profileBtn.classList.add(user);
                profileBtn.innerHTML = '  <i class="fa-solid fa-user-xmark"></i>'
                profileBtn.addEventListener("click", blockUser)
                p.appendChild(profileBtn);
			}
			let userProfile = document.createElement("button");
			userProfile.setAttribute("type", "button")
			userProfile.classList.add("chat-options-user-profile");
			userProfile.classList.add(user);
			userProfile.innerHTML = '  <i class="fa-solid fa-address-card white-"></i>'
			userProfile.addEventListener("click", (e)=>{
				document.querySelector(".profile-other").classList.remove("display-none");
				document.querySelector(".profile").classList.add("display-none");
				document.querySelector(".profile-container").classList.add("profile-other-theme");
				fetch_profile(e.target.classList[1], true);
				fetch_matchHistory(e.target.classList[1], true);
				global.ui.profile = 1;
				global.ui.chat = 0;
				windowResize();
			})
			p.appendChild(userProfile);
            // let messageBtn = document.createElement("button");
            // messageBtn.classList.add("chat-options-message");
            // messageBtn.classList.add(user);
            // messageBtn.innerHTML = '  <i class="fa-solid fa-comment"></i>'
            // messageBtn.addEventListener('click', createPrivateMessage);
			// p.appendChild(messageBtn);
			listdiv.appendChild(p);
		}
    });
    lobbyList.append(listdiv)
}

function updateFriendList(data, onlineUsers) {
    let friendlist = document.getElementById("Friend-list")
	let listdiv = document.createElement("div");
    // listdiv.classList.add("friend-list-div");
	friendlist.textContent = "";

    data.forEach(user => {
        if (user !== global.gameplay.username) {
			let p = document.createElement("p");
			p.classList.add("chat-options");
			p.classList.add(user);
            if (onlineUsers.includes(user) ==  false) {
                p.style.opacity = '0.4';
            }
			let messageBtn = document.createElement("button");
			messageBtn.setAttribute("type", "button")
			messageBtn.classList.add("chat-options-message");
			messageBtn.classList.add(user);
			messageBtn.textContent = user;
			messageBtn.addEventListener('click', createPrivateMessage);
			p.appendChild(messageBtn);
			let userProfile = document.createElement("button");
			userProfile.setAttribute("type", "button")
			userProfile.classList.add("chat-options-user-profile");
			userProfile.classList.add(user);
			userProfile.innerHTML = '  <i class="fa-solid fa-address-card white-"></i>'
			userProfile.addEventListener("click", (e)=>{
				document.querySelector(".profile-other").classList.remove("display-none");
				document.querySelector(".profile").classList.add("display-none");
				document.querySelector(".profile-container").classList.add("profile-other-theme");
				fetch_profile(e.target.classList[1], true);
				fetch_matchHistory(e.target.classList[1], true);
				global.ui.profile = 1;
				global.ui.chat = 0;
				windowResize();
			})
			p.appendChild(userProfile);
			listdiv.appendChild(p);
		}
    });
    friendlist.append(listdiv)
}

async function createPrivateMessage(e){
    const name = []
    let sender = global.gameplay.username;
    let receiver = e.target.classList[1];
    name.push(sender);
    name.push(receiver);
    name.sort(sortSpeacialChar)
    let roomname = name[0] + '_' + name[1];
    let tab;
    // console.log("create PM Sender:", sender);
    // console.log("create PM Receiver:", receiver);
    // console.log(roomname);

    if(receiver != global.gameplay.username) {
        if (tab = document.querySelector(".chat-tab."  + roomname)) {
			tab.click();
			// document.querySelector(".p-chat-input."+roomname).focus();
            // console.log(roomname, "chat already exist");

        } else {
            let friendChat = document.createElement("div");
            friendChat.classList.add("chat-tab");
            friendChat.classList.add(roomname);
            friendChat.innerText = receiver;
            let notification = document.createElement('div');
            notification.classList.add("notification");
            notification.classList.add("display-none");
            notification.setAttribute("role", "status");
            let closeBtn = document.createElement('i');
            closeBtn.classList.add("friend-close-button");
            closeBtn.classList.add(roomname);
            closeBtn.classList.add("fa");
            closeBtn.classList.add("fa-xmark");
            closeBtn.addEventListener("click", exitPrivateChat)
            friendChat.appendChild(closeBtn);
            friendChat.appendChild(notification);
            // let tabs = document.querySelector(".tab");
            let tabs = document.querySelector(".lobby-friend");
            tabs.insertBefore(friendChat, tabs.firstChild);
            friendChat.addEventListener("click", privateMessageTab)
            let chatcontainer = document.querySelector(".display-chat-container");
            let privateChatContainer = document.createElement("div");
            privateChatContainer.classList.add("p-chat-container");
            privateChatContainer.classList.add(roomname);
            privateChatContainer.classList.add("display-none");
            let privateChatLog = document.createElement("div");
            privateChatLog.classList.add("p-chat-log");
            privateChatLog.classList.add(roomname);
            let privateChatMsg = document.createElement("div");
            privateChatMsg.classList.add("p-chat-msg");
            privateChatMsg.classList.add(roomname);
            privateChatLog.appendChild(privateChatMsg);
            privateChatContainer.appendChild(privateChatLog);
            let inputsubmit = document.createElement("div");
            inputsubmit.classList.add("p-message-box");
            inputsubmit.classList.add(roomname);
            inputsubmit.classList.add("display-none");
            let privateChatInput = document.createElement("input");
            privateChatInput.classList.add("p-chat-input");
            privateChatInput.classList.add(roomname);
            privateChatInput.setAttribute('type', 'text');
            privateChatInput.setAttribute('placeholder', 'Type message...');
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
            chatcontainer.appendChild(privateChatContainer);
			chatcontainer.appendChild(inputsubmit);

			const paramsg = document.createElement("p");
			paramsg.style.textAlign = "left";
			paramsg.style.color="rgb(177,177,177)";
			paramsg.innerText = "Type <invite> to invite this User to your game";
			let msgContainer = document.querySelector('.p-chat-msg.' + roomname);
			msgContainer.appendChild(paramsg);
			document.querySelector(".chat-tab."  + roomname).click();
			// document.querySelector(".p-chat-input."+roomname).focus();
			

            global.chat.chatLobbySocket.send(JSON.stringify({
                'type': 'pm',
                'sender': sender,
                'receiver': receiver
            }));

            await refreshFetch("/api/auth/token/refresh/", {method: "POST"});
            let socket = new WebSocket('wss://'
            + window.location.host
            + '/ws/pm/' + roomname + '/');

            socket.onmessage = function(e) {
                const data = JSON.parse(e.data);
                // console.log(data);
                if (data["type"] == "msg") {
					if (data["message"] === "<invite>" && data["username"] !== global.gameplay.username && !global.gameplay.gameStart && !global.gameplay.gameEnd) {
						const target = document.querySelector(".chat-game-container."+ roomname + "." + data["username"])
						if (!target) {
							if (!global.socket.gameLobbySocket ){
								createGameLobbyWebSocket().then(result=>{
									global.socket.gameLobbySocket.addEventListener('message', function renderInvite(e) {
										const dataJSON = JSON.parse(e.data);
										const target2 = document.querySelector(".chat-game-container."+ roomname + "." + data["username"])
										if (!target2)
											createInviteContainer(data["username"],roomname, dataJSON, renderInvite)
										else {
											const gameLobbyInfo = dataJSON.gameLobbyInfo.find(info => info.mainClient === data["username"])
											if (!gameLobbyInfo) {
												const msgContainer = document.querySelector('.p-chat-msg.' + roomname);
												msgContainer.removeChild(target2);
												global.socket.gameLobbySocket.removeEventListener('message',renderInvite);
											}
											else {
												gameLobbyInfo.player.length < global.paddle.maxPaddle? document.querySelector(".chat-game-join." + gameLobbyInfo.mainClient).disabled = false :document.querySelector(".chat-game-join." + gameLobbyInfo.mainClient).disabled = true;
												document.querySelector(".chat-game-player." + gameLobbyInfo.mainClient).textContent = "Players: " + gameLobbyInfo.player.length + " / " + global.paddle.maxPaddle;
												if (gameLobbyInfo.gameStart) {
													const msgContainer = document.querySelector('.p-chat-msg.' + roomname);
													msgContainer.removeChild(target2);
													global.socket.gameLobbySocket.removeEventListener('message',renderInvite);
												}
											}
										}
									})
								})
							}
							else {
								function renderInvite2(e) {
									const dataJSON = JSON.parse(e.data);
									const gameLobbyInfo = dataJSON.gameLobbyInfo.find(info => info.mainClient === data["username"])
									if (!gameLobbyInfo) {
										const msgContainer = document.querySelector('.p-chat-msg.' + roomname);
										msgContainer.removeChild(document.querySelector(".chat-game-container."+ roomname + "." + data["username"]));
										global.socket.gameLobbySocket.removeEventListener('message',renderInvite2);
									}
									else {
										gameLobbyInfo.player.length < global.paddle.maxPaddle? document.querySelector(".chat-game-join." + gameLobbyInfo.mainClient).disabled = false :document.querySelector(".chat-game-join." + gameLobbyInfo.mainClient).disabled = true;
										document.querySelector(".chat-game-player." + gameLobbyInfo.mainClient).textContent = "Players: " + gameLobbyInfo.player.length + " / " + global.paddle.maxPaddle;
										if (gameLobbyInfo.gameStart) {
											const msgContainer = document.querySelector('.p-chat-msg.' + roomname);
											msgContainer.removeChild(document.querySelector(".chat-game-container."+ roomname + "." + data["username"]));
											global.socket.gameLobbySocket.removeEventListener('message', renderInvite2);
										}
									}
								}
								global.socket.gameLobbySocket.addEventListener('message', renderInvite2)
								createInviteContainer(data["username"],roomname,global.socket, renderInvite2);
							}
							
						}
						
					}
					else {
                        if (friendChat.classList.contains("active")) {
                            notification.classList.add("display-none");
                            notification.textContent="0";
                        }
                        else {
                            let number = parseInt(notification.textContent) + 1;
                            notification.textContent=number;
                            notification.classList.remove("display-none");
                        }
						const paramsg = document.createElement("p");
						paramsg.style.textAlign = "left";
						paramsg.innerText = data["username"] + ":\n" + data["message"];
						let msgContainer = document.querySelector('.p-chat-msg.' + roomname);
						msgContainer.appendChild(paramsg);
					}
					// if (document.querySelector(".chat-tab."+roomname)) {
						// document.querySelector(".chat-tab."+roomname).click();
					// 	global.ui.profile = 0;
					// 	global.ui.chat = 1;
					// 	windowResize();
					// }
				}
            };
            
            socket.onclose = function(e) {
                // const paramsg = document.createElement("p");
                // paramsg.style.textAlign = "left";
                // paramsg.style.color = "red";
                // paramsg.innerText = "You have disconnected"
                // let msgContainer = document.querySelector('.p-chat-msg.' + roomname);
                // msgContainer.appendChild(paramsg);
                console.log('Chat socket', roomname, 'closed');
            };
            
            socket.onerror = function(e) {
                // const paramsg = document.createElement("p");
                // paramsg.style.textAlign = "left";
                // paramsg.style.color = "red";
                // paramsg.innerText = "You have encounter an error."
                // let msgContainer = document.querySelector('.p-chat-msg.' + roomname);
                console.log('Chat socket encounter error');
			};
            chatSocketManager.registerSocket(roomname, socket);
        }
    }
};


function createInviteContainer(mainClient,roomname, dataJSON, renderInvite) {
	const gameLobbyInfo = dataJSON.gameLobbyInfo.find(info => info.mainClient === mainClient)

	const gameContainer = document.createElement('div');
	const gameOptionsContainer = document.createElement('div');
	const gameHost = document.createElement('h4');
	const playerNum = document.createElement('p');
	const join = document.createElement('button');
	gameContainer.classList.add('chat-game-container');
	gameContainer.classList.add(roomname);
	gameContainer.classList.add(mainClient);
	gameOptionsContainer.classList.add('chat-game-container-options');
	gameHost.classList.add("chat-game-header")
	gameHost.textContent =gameLobbyInfo.mainClient + " " + gameLobbyInfo.gameMode.toUpperCase();
	playerNum.classList.add("chat-game-player");
	playerNum.classList.add(gameLobbyInfo.mainClient);
	playerNum.textContent = "Players: " + gameLobbyInfo.player.length + " / " + global.paddle.maxPaddle;
	join.setAttribute("type","button")
	join.classList.add("chat-game-join")
	join.classList.add(gameLobbyInfo.mainClient)
	join.textContent = "JOIN";
	join.addEventListener("click", (e)=>{
		if (global.gameplay.username !== e.target.classList[1]) {
			let currentGame;
			global.socket.gameLobbyInfo.forEach(game=>{
				if(game.mainClient === e.target.classList[1])
					currentGame = game;
			})
			if (currentGame.player.length < global.paddle.maxPaddle && !currentGame.player.includes(global.gameplay.username) && !currentGame.gameStart) {
				if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
					document.querySelector(".multi-leave-game").click();
				if (global.socket.gameLobbySocket && global.socket.gameLobbySocket.readyState === WebSocket.OPEN)
					global.socket.gameLobbySocket.send(JSON.stringify({mode:"join", mainClient:e.target.classList[1]}))
				createGameSocket(e.target.classList[1]).then(data=>{
					global.socket.gameSocket.onopen = function() {
						global.ui.toggleCanvas = 1;
						global.ui.mainMenu = 0;
						global.ui.multiCreate = 1;
						global.ui.multiLobby = 0;
						if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
							global.socket.gameSocket.send(JSON.stringify({
								mode:"join",
							}))	
						enterChatRoom(e.target.classList[1])
					}
					const msgContainer = document.querySelector('.p-chat-msg.' + roomname);
					msgContainer.removeChild(document.querySelector(".chat-game-container."+ roomname + "." + mainClient));
					global.socket.gameLobbySocket.removeEventListener('message', renderInvite);
				})
			}
		}
	})
	gameOptionsContainer.appendChild(playerNum);
	gameOptionsContainer.appendChild(join);
	gameContainer.appendChild(gameHost)
	gameContainer.appendChild(gameOptionsContainer)
	let msgContainer = document.querySelector('.p-chat-msg.' + roomname);
	msgContainer.appendChild(gameContainer);
}

async function acceptPrivateMessage(data){
    let sender = data["sender"];
    let receiver = data["receiver"];

    if (!global.chat.blocklist.includes(sender)) {
        const name = [];
        name.push(sender);
        name.push(receiver);
        name.sort(sortSpeacialChar)
        let roomname = name[0] + '_' + name[1];
    
        // console.log(roomname);
        if(receiver == global.gameplay.username) {
            if (document.querySelector(".chat-tab."  + roomname)) {
                console.log(roomname, "chat already exist");
    
            } else {
                await refreshFetch("/api/auth/token/refresh/", {method: "POST"});
                let socket = new WebSocket('wss://'
                + window.location.host
                + '/ws/pm/' + roomname + '/');
    
                socket.onmessage = function(e) {
                    const data = JSON.parse(e.data);
                    // console.log(data);
                    if (data["type"] == "msg") {
						if (data["message"] === "<invite>" && data["username"] !== global.gameplay.username && !global.gameplay.gameStart && !global.gameplay.gameEnd) {
							const target = document.querySelector(".chat-game-container."+ roomname + "." + data["username"])
							if (!target) {
								if (!global.socket.gameLobbySocket ){
									createGameLobbyWebSocket().then(result=>{
										global.socket.gameLobbySocket.addEventListener('message', function renderInvite(e) {
											const dataJSON = JSON.parse(e.data);
											const target2 = document.querySelector(".chat-game-container."+ roomname + "." + data["username"])
											if (!target2)
												createInviteContainer(data["username"],roomname, dataJSON, renderInvite)
											else {
												const gameLobbyInfo = dataJSON.gameLobbyInfo.find(info => info.mainClient === data["username"])
												if (!gameLobbyInfo) {
													const msgContainer = document.querySelector('.p-chat-msg.' + roomname);
													msgContainer.removeChild(target2);
													global.socket.gameLobbySocket.removeEventListener('message',renderInvite);
												}
												else {
													gameLobbyInfo.player.length < global.paddle.maxPaddle? document.querySelector(".chat-game-join." + gameLobbyInfo.mainClient).disabled = false :document.querySelector(".chat-game-join." + gameLobbyInfo.mainClient).disabled = true;
													document.querySelector(".chat-game-player." + gameLobbyInfo.mainClient).textContent = "Players: " + gameLobbyInfo.player.length + " / " + global.paddle.maxPaddle;
													if (gameLobbyInfo.gameStart) {
														const msgContainer = document.querySelector('.p-chat-msg.' + roomname);
														msgContainer.removeChild(target2);
														global.socket.gameLobbySocket.removeEventListener('message',renderInvite);
													}
												}
											}
										})
									})
								}
								else {
									function renderInvite2(e) {
										const dataJSON = JSON.parse(e.data);
										const gameLobbyInfo = dataJSON.gameLobbyInfo.find(info => info.mainClient === data["username"])
										if (!gameLobbyInfo) {
											const msgContainer = document.querySelector('.p-chat-msg.' + roomname);
											msgContainer.removeChild(document.querySelector(".chat-game-container."+ roomname + "." + data["username"]));
											global.socket.gameLobbySocket.removeEventListener('message',renderInvite2);
										}
										else {
											gameLobbyInfo.player.length < global.paddle.maxPaddle? document.querySelector(".chat-game-join." + gameLobbyInfo.mainClient).disabled = false :document.querySelector(".chat-game-join." + gameLobbyInfo.mainClient).disabled = true;
											document.querySelector(".chat-game-player." + gameLobbyInfo.mainClient).textContent = "Players: " + gameLobbyInfo.player.length + " / " + global.paddle.maxPaddle;
											if (gameLobbyInfo.gameStart) {
												const msgContainer = document.querySelector('.p-chat-msg.' + roomname);
												msgContainer.removeChild(document.querySelector(".chat-game-container."+ roomname + "." + data["username"]));
												global.socket.gameLobbySocket.removeEventListener('message', renderInvite2);
											}
										}
									}
									global.socket.gameLobbySocket.addEventListener('message', renderInvite2)
									createInviteContainer(data["username"],roomname,global.socket, renderInvite2);
								}
							}
						}
						else {
                            if (friendChat.classList.contains("active")) {
                                notification.classList.add("display-none");
                                notification.textContent="0";
                            }
                            else {
                                let number = parseInt(notification.textContent) + 1;
                                notification.textContent=number;
                                notification.classList.remove("display-none");
                            }
							const paramsg = document.createElement("p");
							paramsg.style.textAlign = "left";
							paramsg.innerText = data["username"] + ":\n" + data["message"];
							let msgContainer = document.querySelector('.p-chat-msg.' + roomname);
							if (msgContainer)
								msgContainer.appendChild(paramsg);
						}
						// if (document.querySelector(".chat-tab."+roomname)) {
							// document.querySelector(".chat-tab."+roomname).click();
						// 	global.ui.profile = 0;
						// 	global.ui.chat = 1;
						// 	windowResize();
						// }
						
                    };
                };
                
                socket.onclose = function(e) {
                    console.log('Chat socket closed');
                };
                
                socket.onerror = function(e) {
                    console.error('Chat socket encounter error');
                };
    
                chatSocketManager.registerSocket(roomname, socket);
                let friendChat = document.createElement("div");
                friendChat.classList.add("chat-tab");
                friendChat.classList.add(roomname);
                friendChat.innerText = sender;
                let notification = document.createElement('div');
                notification.classList.add("notification");
                notification.classList.add("display-none");
                notification.setAttribute("role", "status");
                let closeBtn = document.createElement('i');
                closeBtn.classList.add("friend-close-button");
                closeBtn.classList.add(roomname);
                closeBtn.classList.add("fa");
                closeBtn.classList.add("fa-xmark");
                closeBtn.addEventListener("click", exitPrivateChat)
                friendChat.appendChild(closeBtn);
                friendChat.appendChild(notification);
                // tabs = document.querySelector(".tab");
                // tabs.appendChild(friendChat);
                let tabs = document.querySelector(".lobby-friend");
                tabs.insertBefore(friendChat, tabs.firstChild);
                friendChat.addEventListener("click", privateMessageTab)    
                let chatcontainer = document.querySelector(".display-chat-container");
                let privateChatContainer = document.createElement("div");
                privateChatContainer.classList.add("p-chat-container");
                privateChatContainer.classList.add(roomname);
                privateChatContainer.classList.add("display-none");
                let privateChatLog = document.createElement("div");
                privateChatLog.classList.add("p-chat-log");
                privateChatLog.classList.add(roomname);
                let privateChatMsg = document.createElement("div");
                privateChatMsg.classList.add("p-chat-msg");
                privateChatMsg.classList.add(roomname);
                privateChatLog.appendChild(privateChatMsg);
                privateChatContainer.appendChild(privateChatLog);
                let inputsubmit = document.createElement("div");
                inputsubmit.classList.add("p-message-box");
                inputsubmit.classList.add(roomname);
                inputsubmit.classList.add("display-none");
                let privateChatInput = document.createElement("input");
                privateChatInput.classList.add("p-chat-input");
                privateChatInput.classList.add(roomname);
                privateChatInput.setAttribute('type', 'text');
                privateChatInput.setAttribute('placeholder', 'Type message...');
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
                chatcontainer.appendChild(privateChatContainer);
				chatcontainer.appendChild(inputsubmit);
				
				const paramsg = document.createElement("p");
				paramsg.style.textAlign = "left";
				paramsg.style.color="rgb(177,177,177)";
				paramsg.innerText = "Type <invite> to invite this User to your game";
				let msgContainer = document.querySelector('.p-chat-msg.' + roomname);
				msgContainer.appendChild(paramsg);
				document.querySelector(".chat-tab."  + roomname).click();
				// document.querySelector(".p-chat-input."+roomname).focus();
            }
        }
    }
};

function privateMessageTab(e) {
    // Declare all variables
    var i, tabcontent, tablinks, roomname, chattabs, pchat, privatechattab, privatechatiput;

	roomname = e.target.classList[1];
	
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        // tabcontent[i].style.display = "none";
        tabcontent[i].classList.add("display-none");
    }
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    
    // Get all elements with class="chat-tab" and hide them
    chattabs = document.getElementsByClassName("chat-tab");
    for (i = 0; i < chattabs.length; i++) {
        chattabs[i].classList.remove("active");
    }
	
	// Get all elements with class="p-chat-container" and hide them
	privatechattab = document.getElementsByClassName("p-chat-container");
	for (i = 0; i < privatechattab.length; i++) {
		privatechattab[i].classList.add("display-none");
	}

	privatechatiput = document.getElementsByClassName("p-message-box");
	for (i = 0; i < privatechatiput.length; i++) {
		privatechatiput[i].classList.add("display-none");
	}

    e.target.classList.add("active");
    let notification = e.target.querySelector(".notification");
    notification.classList.add("display-none");
    notification.textContent="0";
    // document.getElementById("lobby-container").style.display = "none";
    document.getElementById("lobby-container").classList.add("display-none");
    document.getElementById("message-box").classList.add("display-none");

    // if (document.querySelector('.p-chat-container.' + roomname)) {
    //     // document.querySelector('.p-chat-container.' + roomname).style.display = "block";
    //     document.querySelector('.p-chat-container.' + roomname).classList.remove("display-none");
    // }

    // Get all elements with class="roomname" and show them
    pchat = document.getElementsByClassName(roomname);
    for (i = 0; i < pchat.length; i++) {
        pchat[i].classList.remove("display-none");
	}

}

function receiverParser(roomname) {
	if (roomname.indexOf(global.gameplay.username) !== 0)
		return roomname.substr(0, roomname.indexOf('_'));
	else
		return roomname.substr(roomname.indexOf('_')+1)
	
}

function SendPrivateMessage(e) {
    let roomname = e.target.classList[1];
    const messageInputDom = document.querySelector(".p-chat-input." + roomname);
	let message = messageInputDom.value;
	const gameLobbyInfo = global.socket.gameLobbyInfo.find(info => info.mainClient === global.gameplay.username)
	const receiver = receiverParser(roomname)
	if (message === '<invite>' && !roomname.includes("chat-") && !global.gameplay.gameStart && !global.gameplay.gameEnd && (!global.socket.gameInfo.mainClient || global.socket.gameInfo.mainClient !== global.gameplay.username || gameLobbyInfo.player.includes(receiver))) {
		const paramsg = document.createElement("p");
        paramsg.style.textAlign = "left";
		paramsg.style.color = "red";
		if (!global.socket.gameInfo.mainClient)
			paramsg.innerText = "Game not created yet. Not allowed to invite."
		else if (global.socket.gameInfo.mainClient !== global.gameplay.username)
			paramsg.innerText = "Only Game Host allowed to invite"
		else if (gameLobbyInfo.player.includes(receiver))
			paramsg.innerText = "User already joined game"
		else if (gameLobbyInfo.gameStart)
			paramsg.innerText = "Can't invite. Game already started"
        let msgContainer = document.querySelector('.p-chat-msg.'+roomname);
		msgContainer.appendChild(paramsg);
	}
    else if (typeof message === "string" && message.trim().length > 0) {
		let roomsocket = chatSocketManager.getSocket(roomname)
		global.chat.chatLobbySocket.send(JSON.stringify({
			'type': 'pm',
			'sender': global.gameplay.username,
			'receiver': receiverParser(roomname)
		}));
        roomsocket.send(JSON.stringify({
            'type': 'msg',
            'username': global.gameplay.username,
            'message': message
		}));
		if (message === '<invite>' && !roomname.includes("chat-")) {
			const paramsg = document.createElement("p");
			paramsg.style.textAlign = "left";
			paramsg.style.color = "#ffbb00";
			paramsg.textContent = "Invite Sent."
			let msgContainer = document.querySelector('.p-chat-msg.'+roomname);
			msgContainer.appendChild(paramsg);
		}
		
    }
    messageInputDom.value = '';
};



function SendPrivateMessageKey(e) {
    let roomname = e.target.classList[1];
    // document.querySelector(".p-chat-submit." + roomname).focus();
    if (e.key === 'Enter') {
        document.querySelector(".p-chat-submit." + roomname).click();
    }
};

function exitPrivateChat(e) {
	e.stopPropagation();
    let roomname = e.target.classList[1];
    // Close socket first before delete chat 
    chatSocketManager.closeSocket(roomname);
    // Get all elements with class="roomname" and delete them
    let privateChat = document.getElementsByClassName(roomname);
    while (privateChat.length > 0) {
        privateChat[0].parentNode.removeChild(privateChat[0]);
    }
    // document.getElementById("Lobby-tab").click();
}

document.querySelector('#lobby-chat-message-submit').onclick = function(e) {
    const messageInputDom = document.querySelector('#lobby-chat-message-input');
    let message = messageInputDom.value;
    if (typeof message === "string" && message.trim().length > 0) {
        global.chat.chatLobbySocket.send(JSON.stringify({
            'type': 'msg',
            'username': global.gameplay.username,
            'message': message
        }));
    }
    messageInputDom.value = '';
};

// document.querySelector('#lobby-chat-message-input').focus();
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
document.getElementById("Lobby-tab").addEventListener("click", setActive)
document.getElementById("Friend-tab").addEventListener("click", setActive)
function setActive(e){
    // console.log(e.target);
    if (e.target.classList[1] === "active") {
        // console.log(e.target.className);
        e.target.classList.remove("active");
        if (e.target.id === "Lobby-tab"){
            document.getElementById("Lobby-list").classList.add("display-none");
        } else {
            document.getElementById("Friend-list").classList.add("display-none");
        }
        document.querySelector(".chat-log").classList.remove("partial-grid");
        document.querySelector(".chat-log").classList.add("full-grid");
    } else {
        var i, tabcontent, tablinks, chattabs, privatechattab, privatechatiput;
  
        // Get all elements with class="tabcontent" and hide them
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.add("display-none");
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
        privatechattab = document.getElementsByClassName("p-chat-container");
        for (i = 0; i < privatechattab.length; i++) {
            privatechattab[i].classList.add("display-none");
        }

        privatechatiput = document.getElementsByClassName("p-message-box");
        for (i = 0; i < privatechatiput.length; i++) {
            privatechatiput[i].classList.add("display-none");
        }

        // Show the current tab, and add an "active" class to the button that opened the tab
        if (e.target.id === "Lobby-tab"){
            document.getElementById("Lobby-list").classList.remove("display-none");
        } else {
            document.getElementById("Friend-list").classList.remove("display-none");
        }
        e.target.classList.add("active");
        document.getElementById("lobby-container").classList.remove("display-none");
        document.getElementById("message-box").classList.remove("display-none");
        document.querySelector(".chat-log").classList.remove("full-grid");
        document.querySelector(".chat-log").classList.add("partial-grid");
	}
	// document.getElementById("lobby-chat-message-input").focus()
}

function openTab(evt, tabs) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].classList.add("display-none");
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
        privatechats[i].classList.add("display-none");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabs).classList.remove("display-none");
    evt.currentTarget.className += " active";

    document.getElementById("lobby-container").classList.remove("display-none");
}

//Should be run once when logged in. Argument with username will be implemented for multiuse
async function retrieveBlockList(username) {
    let url = '/chat/blocklist/' + username + "/";
    try {
        const response = await refreshFetch(url, {
			method: 'GET',
			headers: {
				'X-CSRFToken': getCookie("csrftoken"),
			},
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        } else {
            const jsonData = await response.json();
            // console.log("retrieveBlockList response:", jsonData)
            global.chat.blocklist = jsonData['blocklist'];
            // console.log('global block list in retrieve', global.chat.blocklist);
			enterLobby();
			const paramsg = document.createElement("p");
			paramsg.style.textAlign = "left";
			paramsg.style.color = "#ffbb00";
			paramsg.innerText = "You have connected to lobby chat server"
			let msgContainer = document.querySelector('#chat-msg');
			msgContainer.appendChild(paramsg);
			document.querySelector("#Lobby-tab").click();
			global.ui.profile = 0;
			global.ui.chat = 1;
			windowResize();
        }
    }
    catch (exception) {
        console.error('Error', exception);
    }
    // fetch(url)
    //     .then(response => {
    //         // Handle response you get from the API
    //         if (!response.ok) {
    //             throw new Error('Network response was not ok');
    //         }
    //         return response.json();
    //     })
    //     .then(data => {
    //         global.chat.blocklist = data['blocklist'];
    //         console.log('global block list in retrieve', global.chat.blocklist);
    //         enterLobby();
    //     })
    //     .catch(error => {
    //         console.error('Error', error);
    //     });
}

// Use api to add user to block list
async function blockUser(e) {
    let username = e.target.classList[1];
    let url = '/chat/blocklist/' + global.gameplay.username + '/';

    global.chat.blocklist.push(username);
    // list = blocklist.map(x => ({animal: x}));
    let formData = {
        blocklist: global.chat.blocklist
    };

    let fetchData = {
        method: 'PUT',
        headers: new Headers({
            'Content-Type': 'application/json',
            'X-CSRFTOKEN': getCookie("csrftoken")
        }),
        body: JSON.stringify(formData)
    }

    try {
        const response = await refreshFetch(url, fetchData);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        } else {
            const jsonData = await response.json();
            // console.log("retrieveBlockList response:", jsonData)
            global.chat.blocklist = jsonData['blocklist'];
            // console.log('global block list in retrieve', global.chat.blocklist);
            let profileBtn = document.createElement("button");
            profileBtn.classList.add("chat-options-profile");
            profileBtn.classList.add(username);
            profileBtn.innerHTML = '  <i class="fa-solid fa-user-slash"></i>';
            profileBtn.addEventListener("click", unblockUser);
            e.target.replaceWith(profileBtn);
        }
    }
    catch (exception) {
        console.error('Error', exception);
    }
//     fetch(url, fetchData)
//         .then(response => {
//             // Handle response you get from the API
//             if (!response.ok) {
//                 console.log(response)
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(data => {
//             // Process the retrieved user data
//             console.log('Data:', data);
//             global.chat.blocklist = data['blocklist']
//             console.log('global.chat.blocklist in block user:', global.chat.blocklist);
//             let profileBtn = document.createElement("button");
//             profileBtn.classList.add("chat-options-profile");
//             profileBtn.classList.add(username);
//             profileBtn.innerHTML = '  <i class="fa-solid fa-user-slash"></i>';
//             profileBtn.addEventListener("click", unblockUser);
//             e.target.replaceWith(profileBtn);
//         })
//         .catch(error => {
//             console.error('Error', error);
//         });
}

// Use api to add user to block list
async function unblockUser(e) {
    let username = e.target.classList[1];
    let url = '/chat/blocklist/' + global.gameplay.username + '/';

    let index = global.chat.blocklist.findIndex(user => user === username);
    if (index > -1) { // only splice array when item is found
        global.chat.blocklist.splice(index, 1);
    }

    let formData = {
        blocklist: global.chat.blocklist
    };


    let fetchData = {
        method: 'PUT',
        headers: new Headers({
            'Content-Type': 'application/json; charset=UTF-8',
            'X-CSRFTOKEN': getCookie("csrftoken")
        }),
        body: JSON.stringify(formData)
    }

    try {
        const response = await refreshFetch(url, fetchData);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        } else {
            const jsonData = await response.json();
            // console.log("retrieveBlockList response:", jsonData)
            global.chat.blocklist = jsonData['blocklist'];
            // console.log('global block list in retrieve', global.chat.blocklist);
            let profileBtn = document.createElement("button");
            profileBtn.classList.add("chat-options-profile");
            profileBtn.classList.add(username);
            profileBtn.innerHTML = '  <i class="fa-solid fa-user-xmark"></i>';
            profileBtn.addEventListener("click", blockUser);
            e.target.replaceWith(profileBtn);
        }
    }
    catch (exception) {
        console.error('Error', exception);
    }

    // fetch(url, fetchData)
    //     .then(response => {
    //         // Handle response you get from the API
    //         if (!response.ok) {
    //             throw new Error('Network response was not ok');
    //         }
    //         return response.json();
    //     })
    //     .then(data => {
    //         // Process the retrieved user data
    //         console.log('Data:', data);
    //         global.chat.blocklist = data['blocklist']
    //         console.log('global.chat.blocklist in unblock user:', global.chat.blocklist);
    //         let profileBtn = document.createElement("button");
    //         profileBtn.classList.add("chat-options-profile");
    //         profileBtn.classList.add(username);
    //         profileBtn.innerHTML = '  <i class="fa-solid fa-user-xmark"></i>';
    //         profileBtn.addEventListener("click", blockUser);
    //         e.target.replaceWith(profileBtn);
    //     })
    //     .catch(error => {
    //         console.error('Error', error);
    //     });
}

// Function should be executed after login
// During logout, exitLobby should be executed
document.addEventListener("DOMContentLoaded", function() {
    // Code that interacts with the DOM, including openTab function
    
});
/////////////////////////////////////////////////////////////
// Please check multiplayer.js for the temporary solution
// console.log("current user is",  global.gameplay.username);
// enterLobby();
// retrieveBlockList("itsuki");


export {retrieveBlockList, enterLobby, exitLobby, enterChatRoom, exitChatRoom, startTimerTournamentStart, update_lobby}
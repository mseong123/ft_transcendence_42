// Create a dropdown menu for profile, add ban unban to options
function createProfileDropDown(username) {
    let optionsContainer = document.createElement("div");
    optionsContainer.setAttribute("id", "profile-dropdown");
    optionsContainer.classList.add("profile-dropdown");
    let dropDownBtn = document.createElement("button")
    dropDownBtn.innerText = "Options"
    dropDownBtn.classList.add("dropdown-btn");
    // Will change formatting
    dropDownBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleDropdown();
    });
    let dropDownIcon = document.createElement("i");
    dropDownIcon.classList.add("fa-solid");
    dropDownIcon.classList.add("fa-chevron-up");
    dropDownIcon.setAttribute("id", "arrow");
    dropDownBtn.appendChild(dropDownIcon);
    if (global.chat.blocklist.includes(username) ) {
        let unblock = document.createElement("a")
        unblock.setAttribute("href", "#unblock")
        let unblockIcon = document.createElement("i");
        unblockIcon.classList.add("fa-solid");
        unblockIcon.classList.add("fa-o");
        unblock.classList.add(username);
        unblock.addEventListener("click", unblockUser)
        unblock.appendChild(unblockIcon);
        unblock.innerHTML += "Unblock";
        optionsContainer.appendChild(unblock);
    } else {
        let block = document.createElement("a")
        block.setAttribute("href", "#block")
        let blockIcon = document.createElement("i");
        blockIcon.classList.add("fa-solid");
        blockIcon.classList.add("fa-x");
        block.classList.add(username);
        block.addEventListener("click", blockUser)
        block.appendChild(blockIcon);
        block.innerHTML += "Block";
        optionsContainer.appendChild(block);
    }
    // Testing dropdown. Production will be on another class
    document.querySelector(".profile-test").appendChild(dropDownBtn);
    document.querySelector(".profile-test").appendChild(optionsContainer);
}


// Use api to add user to block list
function blockUser(e) {
    let url = '/chat/blocklist/' + global.gameplay.username + '/';

    let username = e.target.classList[0];
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

    fetch(url, fetchData)
        .then(response => {
            // Handle response you get from the API
            if (!response.ok) {
                console.log(response)
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Process the retrieved user data
            console.log('Data:', data);
            global.chat.blocklist = data['blocklist']
            let unblock = document.createElement("a")
            unblock.setAttribute("href", "#unblock")
            let unblockIcon = document.createElement("i");
            unblockIcon.classList.add("fa-solid");
            unblockIcon.classList.add("fa-o");
            unblock.classList.add(e.target.classList[0]);
            unblock.addEventListener("click", unblockUser)
            unblock.appendChild(unblockIcon);
            unblock.innerHTML += "Unblock";
            e.target.replaceWith(unblock);
        })
        .catch(error => {
            console.error('Error', error);
        });
}

// Use api to add user to block list
function unblockUser(e) {
    let url = '/chat/blocklist/itsuki/';

    let username = e.target.classList[0];
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

    fetch(url, fetchData)
        .then(response => {
            // Handle response you get from the API
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Process the retrieved user data
            console.log('Data:', data);
            global.chat.blocklist = data['blocklist']
            let block = document.createElement("a")
            block.setAttribute("href", "#block")
            let blockIcon = document.createElement("i");
            blockIcon.classList.add("fa-solid");
            blockIcon.classList.add("fa-x");
            block.classList.add(e.target.classList[0]);
            block.addEventListener("click", blockUser)
            block.appendChild(blockIcon);
            block.innerHTML += "Block";
            e.target.replaceWith(block);
        })
        .catch(error => {
            console.error('Error', error);
        });
}
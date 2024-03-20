import { showLoading, hideLoading, displayErrorMessages } from "./utils.js";

document.addEventListener('DOMContentLoaded', function () {

    const customData = document.getElementById("custom-data");
    const uidb64 = customData.dataset.uidb64;
    const token = customData.dataset.token;
    const valid = customData.dataset.valid;
    console.log("uidb64 is: " + uidb64);
    console.log("token is: " + token);
    console.log("valid is: " + valid);

    const form = document.getElementById("confirm-reset-password-form");
    form.addEventListener("submit", confirmResetPassword);

    // Remember to POST with uid and token
    function confirmResetPassword(event) {
        event.preventDefault();
        showLoading();
        const apiUrl = `http://127.0.0.1:8000/api/auth/password-reset/confirm/`;

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie("csrftoken"),
            },
            body: JSON.stringify({
                new_password1: form.elements['new_password1'].value,
                new_password2: form.elements['new_password2'].value,
                uid: uidb64,
                token: token,
            }),
        }).then(async (response) => {
            if (!response.ok) {
                if (response.status == 400) {
                    hideLoading();
                    const errorData = await response.json();
                    console.log(errorData);
                    displayErrorMessages(errorData);
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return (response.json());
        }).then((data) => {
            hideLoading();
            console.log("SUCCESS with data:");
            console.log(data);
            document.getElementById("reset-password-success").style.display = "inline";
            form.style.display = "none";

        }).catch(err => console.error('Fetch error:', err))
    }

    function getCookie(name) {
        let value = `; ${document.cookie}`;
        let parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
});
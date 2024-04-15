import { getCookie, showLoading, hideLoading, storeLoginLocalStorage, displayErrorMessages, initializeUserInterface, createOtpField, initializeVerifyEmail } from "./login-utils.js"
import { global } from "../game/global.js";
import { windowResize } from "../game/main.js"
import { retrieveBlockList } from '../chatroom/chatroom_socket.js';
import { refreshFetch } from "../shared/refresh_token.js";
import { loginWith42 } from "./42login.js";
import { getUserUrl } from "../game/multiplayer.js" 

// SEND OTP
export async function sendOtp(event) {
  const loginForm = document.getElementById('login-form');
  const apiUrl = '/api/auth_user/send_otp/';
  event.preventDefault();
  showLoading()
  storeLoginLocalStorage(loginForm);
  const loginErrorMsg = document.getElementById("login-error");
  loginErrorMsg.textContent = "";

  // Using Fetch API to send a POST request
  const response = await refreshFetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie("csrftoken"),
    },
    body: JSON.stringify({
      email: loginForm.elements['email-login'].value,
      password: loginForm.elements['password-login'].value,
    }),
  });

  hideLoading();
  // Check if the response status is OK (status code 200-299)
  if (!response.ok) {
    const errorData = await response.json();
    if (response.status == 401)
      loginErrorMsg.textContent = "Username and password does not match."
    else if (response.status == 403)
      loginErrorMsg.textContent = "Can't login. Please try again."
    else
      window.alert("Internal server error. Please try again.");
  } else {
    const data = await response.json();
    // Handle the data from the response
    createOtpField();
    loginForm.removeEventListener("submit", sendOtp);
    loginForm.addEventListener("submit", loginOtp);
  }
};

// LOGIN WITH OTP
export async function loginOtp(event) {
  const loginForm = document.getElementById('login-form');
  const apiUrl = '/api/auth_user/login/';
  event.preventDefault();
  showLoading()
  storeLoginLocalStorage(loginForm);
  const loginErrorMsg = document.getElementById("login-error");
  loginErrorMsg.textContent = "";

  const response = await refreshFetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie("csrftoken"),
    },
    body: JSON.stringify({
      email: loginForm.elements['email-login'].value,
      password: loginForm.elements['password-login'].value,
      otp: loginForm.elements['otp'].value,
    }),
  });

  hideLoading();
  // Check if the response status is OK (status code 200-299)
  if (!response.ok) {
    if (response.status == 401)
      loginErrorMsg.textContent = "Invalid OTP. Please try again."
    else
      window.alert("Internal server error. Please try again.");
  }
  else {
    let responseJSON = await response.json();
    // SUCCESS LOGIN LINK TO MSEONG PAGE
    global.ui.auth = 1;
	global.gameplay.username = responseJSON.username;
	document.getElementById("email-login").value = "";
	document.getElementById("password-login").value = "";
    document.getElementById("login-input-fields").children[2].remove();
	getUserUrl();
  }
};


document.addEventListener('DOMContentLoaded', function () {
  // Initializations
  initializeVerifyEmail();
  initializeUserInterface();
 
  // 42 login
  const login42 = document.getElementById('login-42');
  login42.addEventListener('click', loginWith42);

  // Global variables & localStorage
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', sendOtp);

  //login without authentication for local game
  const loginlocal = document.querySelector('.login-local');
  loginlocal.addEventListener('click', function (e) {
	document.querySelector(".canvas-container").classList.add("transform");
    global.ui.authNotRequired = 1;
    windowResize();
  });

  const savedEmail = localStorage.getItem("savedEmail");

  if (savedEmail) {
    loginForm.elements["email-login"].value = savedEmail;
    document.getElementById("remember-me").checked = true;
  }

  // REGISTER USER FORM
  const registerForm = document.getElementById('register-form');
  registerForm.addEventListener("submit", registerAccount)

  async function registerAccount(event) {
    const apiUrl = '/api/auth/register/';
    event.preventDefault();
    showLoading();

    const response = await refreshFetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie("csrftoken"),
      },
      body: JSON.stringify({
        username: registerForm.elements['username-reg'].value,
        email: registerForm.elements['email-reg'].value,
        password1: registerForm.elements['password1-reg'].value,
        password2: registerForm.elements['password2-reg'].value,
      }),
    });

    hideLoading();
    const data = await response.json();
    if (!response.ok) {
      if (response.status == 400)
        displayErrorMessages(data);
      else
        window.alert("Internal server error. Please try again.");
    } else {
      document.getElementById("register-success").style.display = "block";
      document.getElementById("register-form-div").style.display = "none";
    }
  }

  // RESEND VERIFY EMAIl
  const resendVerifyEmailBtn = document.getElementById("resend-verification-email");
  resendVerifyEmailBtn.addEventListener("click", resendVerificationEmail);

  async function resendVerificationEmail(event) {
    const apiUrl = '/api/auth/register/resend-email/';
    event.preventDefault();
    showLoading();

    const response = await refreshFetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie("csrftoken"),
      },
      body: JSON.stringify({
        email: registerForm.elements['email-reg'].value,
      }),
    });

    hideLoading();
    if (!response.ok)
      window.alert("Internal server error. Please try again.");
    else
      window.alert("Verification email was sent again!");
  }

  // SEND RESET PASSWORD EMAIL
  document.getElementById("resend-reset-password-email").addEventListener("click", (event) => {
    sendResetEmailPasswordEmail(event);
  });

  const resetPassForm = document.getElementById('reset-password');
  resetPassForm.addEventListener("submit", sendResetEmailPasswordEmail);

  async function sendResetEmailPasswordEmail(event) {
    const apiUrl = '/api/auth/password/reset/';
    event.preventDefault();
    showLoading();

    const response = await refreshFetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie("csrftoken"),
      },
      body: JSON.stringify({
        email: resetPassForm.elements['email-reset'].value,
      }),
    });

    hideLoading();
    const data = response.json();
    if (!response.ok) {
      window.alert("Internal server error. Please try again.");
    } else {
      window.alert("Reset password email was sent!");
      document.getElementById("reset-password-dialog").style.display = "block";
      document.getElementById('reset-password-div').style.display = 'none';
    }
  }
});

import { getCookie, showLoading, hideLoading, storeLoginLocalStorage, displayErrorMessages, initializeVerifyEmail, initializeUserInterface } from "./utils.js"

document.addEventListener('DOMContentLoaded', function () {
  // Initializations
  initializeVerifyEmail();
  initializeUserInterface();

  // Global variables & localStorage
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', sendOtp);

  const savedEmail = localStorage.getItem("savedEmail");
  const savedPassword = localStorage.getItem("savedPassword");

  if (savedEmail && savedPassword) {
    loginForm.elements["email-login"].value = savedEmail;
    loginForm.elements["password-login"].value = savedPassword;
    document.getElementById("remember-me").checked = true;
  }

  // SEND OTP
  function sendOtp(event) {
    const apiUrl = 'http://127.0.0.1:8000/api/auth_user/send_otp/';
    event.preventDefault();
    showLoading()
    storeLoginLocalStorage(loginForm);
    const loginErrorMsg = document.getElementById("login-error");
    loginErrorMsg.textContent = "";

    // Using Fetch API to send a POST request
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: loginForm.elements['email-login'].value,
        password: loginForm.elements['password-login'].value,
      }),
    })
      .then(async response => {
        // Check if the response status is OK (status code 200-299)
        if (!response.ok) {
          hideLoading();
          if (response.status == 401) {
            const errorData = await response.json();
            console.log(errorData);
            const loginErrorMsg = document.getElementById("login-error");
            loginErrorMsg.textContent = "Username and password does not match."
            // loginErrorMsg.style.marginTop = '2px';
            // loginErrorMsg.style.marginBottom = '10px';
            // loginErrorMsg.style.paddingLeft = '10px';
            // loginErrorMsg.style.color = "#ffdd00";
          } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        }
        return response.json(); // Parse the JSON in the response
      })
      .then(data => {
        // Handle the data from the response
        hideLoading();
        console.log('Data from server:', data);
        console.log('detail:', data['detail'])
        const divInput = document.createElement('div');
        divInput.setAttribute('class', 'input-box')
        const otpInput = document.createElement('input');
        otpInput.setAttribute('type', 'text')
        otpInput.setAttribute('id', 'otp')
        otpInput.setAttribute('name', 'otp')
        otpInput.setAttribute('placeholder', 'Enter OTP')
        otpInput.setAttribute('required', '')
        const login_fields = document.getElementById('login-input-fields');
        divInput.appendChild(otpInput)
        login_fields.appendChild(divInput);
        // form.innerHTML = "Login with OTP";
        loginForm.removeEventListener("submit", sendOtp);
        loginForm.addEventListener("submit", loginOtp);
      })
      .catch(error => {
        // Handle any errors that occurred during the fetch
        console.error('Fetch error:', error);
      });
  };

  // LOGIN WITH OTP
  function loginOtp(event) {
    const apiUrl = 'http://127.0.0.1:8000/api/auth_user/login/';
    event.preventDefault();
    showLoading()
    storeLoginLocalStorage(loginForm);
    const loginErrorMsg = document.getElementById("login-error");
    loginErrorMsg.textContent = "";

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: loginForm.elements['email-login'].value,
        password: loginForm.elements['password-login'].value,
        otp: loginForm.elements['otp'].value,
      }),
    })
      .then(response => {
        // Check if the response status is OK (status code 200-299)
        if (!response.ok) {
          hideLoading();
          loginErrorMsg.textContent = "Invalid OTP. Please try again."
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Parse the JSON in the response
      })
      .then(data => {
        // Handle the data from the response
        console.log(data)
        hideLoading();
        // NEXT: Where do I store the access token for easy usage? (current = cookies)
      })
      .catch(error => {
        // Handle any errors that occurred during the fetch
        console.error('Fetch error:', error);
      });
  };

  // REGISTER USER FORM
  const registerForm = document.getElementById('register-form');
  registerForm.addEventListener("submit", registerAccount)

  function registerAccount(event) {
    const apiUrl = 'http://127.0.0.1:8000/api/auth/register/';
    event.preventDefault();
    showLoading();

    fetch(apiUrl, {
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
      document.getElementById("register-success").style.display = "inline";
      registerForm.style.display = "none";
    }).catch(err => {
      console.error('Fetch error:', err);
    });
  }


  // RESEND VERIFY EMAIl
  const resendVerifyEmailBtn = document.getElementById("resend-verification-email");
  resendVerifyEmailBtn.addEventListener("click", resendVerificationEmail);

  function resendVerificationEmail(event) {
    const apiUrl = 'http://127.0.0.1:8000/api/auth/register/resend-email';
    if (event != undefined) event.preventDefault();
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie("csrftoken"),
      },
      body: JSON.stringify({
        email: registerForm.elements['email-reg'].value,
      }),
    }).then((response) => {
      if (!response.ok) {
        console.log(response);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return (response.json());
    }).then((data) => {
      console.log("SUCCESS with data:");
      console.log(data);
      document.getElementById("register-success").style.display = "inline";
      registerForm.style.display = "none";
    }).catch(err => {
      // Check for 404 and render error
      console.error('Fetch error:', err);
    });
  }

  // SEND RESET PASSWORD EMAIL
  const resetPassForm = document.getElementById('reset-password');
  resetPassForm.addEventListener("submit", sendResetEmailPasswordEmail);

  function sendResetEmailPasswordEmail(event) {
    const apiUrl = 'http://127.0.0.1:8000/api/auth/password/reset/';
    event.preventDefault();

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie("csrftoken"),
      },
      body: JSON.stringify({
        email: resetPassForm.elements['email-reset'].value,
      }),
    }).then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      return (response.json());
    }).then((data) => {
      console.log("SUCCESS with data:");
      console.log(data);
      document.getElementById("reset-password-dialog").style.display = "inline";
      resetPassForm.style.display = "none";

    }).catch(err => console.error('Fetch error:', err))
  }

  document.getElementById("resend-reset-password-email").addEventListener("click", (event) => {
    sendResetEmailPasswordEmail(event);
  });


  // -----------------

  // HELPER FUNCTIONS

  // Generate a secure random string using the browser crypto functions
  function generateRandomString() {
    var array = new Uint32Array(28);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
  }

  // Parse a query string into an object
  function parseQueryString(string) {
    if (string == "") { return {}; }
    var segments = string.split("&").map(s => s.split("="));
    var queryString = {};
    segments.forEach(s => queryString[s[0]] = s[1]);
    return queryString;
  }

  // Make a POST request and parse the response as JSON
  function sendPostRequest(url, params, success, error) {
    var request = new XMLHttpRequest();
    request.open('POST', url, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.onload = function () {
      var body = {};
      try {
        body = JSON.parse(request.response);
      } catch (e) { }

      if (request.status == 200) {
        success(request, body);
      } else {
        error(request, body);
      }
    }
    request.onerror = function () {
      error(request, {});
    }
    var body = Object.keys(params).map(key => key + '=' + params[key]).join('&');
    request.send(body);
  }

  // Configure your application and authorization server details
  var config = {
    client_id: "u-s4t2ud-e98273ec7275fa5dcc7a965135189ae2ca2dfc9eeb445944d2ea02d0a5645a2d",
    redirect_uri: "http://127.0.0.1:8000/",
    authorization_endpoint: "https://api.intra.42.fr/oauth/authorize/",
    token_endpoint: "https://api.intra.42.fr/oauth/token/",
    code_login_endpoint: "http://127.0.0.1:8000/api/auth/fourtytwo/",
    requested_scopes: "public"
  };

  // Set state for redirect
  // social login event listener
  // Initiate the PKCE Auth Code flow is not supported by 42api
  document.getElementById("start").addEventListener("click", async function (e) {
    e.preventDefault();

    // Create and store a random "state" value
    var state = generateRandomString();
    localStorage.setItem("state", state);

    // Create and store a new PKCE code_verifier (the plaintext random secret)
    // var code_verifier = generateRandomString();
    // localStorage.setItem("pkce_code_verifier", code_verifier);

    // Hash and base64-urlencode the secret to use as the challenge
    // var code_challenge = await pkceChallengeFromVerifier(code_verifier);

    // Build the authorization URL
    var url = config.authorization_endpoint
      + "?client_id=" + encodeURIComponent(config.client_id)
      + "&redirect_uri=" + encodeURIComponent(config.redirect_uri)
      + "&state=" + encodeURIComponent(state)
      + "&scope=" + encodeURIComponent(config.requested_scopes)
      + "&response_type=code"
      ;

    // Redirect to the authorization server
    window.location = url;
  });

  // Handle the redirect back from the authorization server and
  // get an access token from the token endpoint
  var q = parseQueryString(window.location.search.substring(1));

  // Check if the server returned an error string
  if (q.error) {
    alert("Error returned from authorization server: " + q.error);
    document.getElementById("error_details").innerText = q.error + "\n\n" + q.error_description;
    document.getElementById("error").classList = "";
  }

  // If the server returned an authorization code, attempt to exchange it for an access token
  if (q.code) {
    // Verify state matches what we set at the beginning
    if (localStorage.getItem("state") != q.state) {
      alert("Invalid state");
    } else {

      // Exchange the authorization code for an access token
      sendPostRequest(config.code_login_endpoint, {
        code: q.code,
      }, function (request, body) {

        // Initialize your application now that you have an access token.
        // Here we just display it in the browser.
        // document.getElementById("access_token").innerText = body.access_token;
        // document.getElementById("start").classList = "hidden";
        // document.getElementById("token").classList = "";
        console.log(body);
        if (body.key)
          sessionStorage.setItem("Authorization", "Token " + body.key)
        // Replace the history entry to remove the auth code from the browser address bar
        window.history.replaceState({}, null, "/");

      }, function (request, error) {
        // This could be an error response from the OAuth server, or an error because the 
        // request failed such as if the OAuth server doesn't allow CORS requests
        document.getElementById("error_details").innerText = error.error + "\n\n" + error.error_description;
        document.getElementById("error").classList = "";
      });
    }

    // Clean these up since we don't need them anymore
    localStorage.removeItem("state");
  }
});

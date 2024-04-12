import { hideLoading, showLoading, getCookie } from "./login-utils.js";
import { getUserUrl } from "../game/multiplayer.js" 

// Configure your application and authorization server details
var config = {
    client_id: "u-s4t2ud-e98273ec7275fa5dcc7a965135189ae2ca2dfc9eeb445944d2ea02d0a5645a2d",
    redirect_uri: "http://127.0.0.1:8000/",
    authorization_endpoint: "https://api.intra.42.fr/oauth/authorize/",
    token_endpoint: "https://api.intra.42.fr/oauth/token/",
    login_endpoint: "/api/auth/fourtytwo/",
    requested_scopes: "public"
};

export async function loginWith42(event) {
    event.preventDefault();
    showLoading();

    // Create and store a randomGenerated "state" value
    var state = generateRandomString();
    localStorage.setItem("state", state);

    // Redirect to the authorization server
    window.location = buildAuthUrl(state);
}

document.addEventListener('DOMContentLoaded', function () {
    // Handle the redirect back from the authorization server and
    // get an access token from the token endpoint
    var extract_query = parseQueryString(window.location.search.substring(1));

    // If the server returned an error string
    if (extract_query.error) {
        alert("Error returned from authorization server: " + extract_query.error);
        document.getElementById("login-error").innerText = "42 error: " + extract_query.error;
        window.history.replaceState({}, null, "/");
    }

    // If the server returned an authorization code, attempt to exchange it for an access token
    if (extract_query.code) {
        // Verify state matches what we set at the beginning
        if (localStorage.getItem("state") != extract_query.state) {
            alert("Invalid 42 login. Please try again.");
            window.history.replaceState({}, null, "/");
            localStorage.removeItem("state");
            hideLoading();
            return;
        }

        // Exchange the authorization code for an access token
        send42PostRequest(config.login_endpoint, {
            code: extract_query.code,
        }, async function (body) {
            // if (body.key)
            //     sessionStorage.setItem("Authorization", "Token " + body.key)
            // Replace the history entry to remove the auth code from the browser address bar
			window.history.replaceState({}, null, "/");
			getUserUrl();
        }, function (error) {
            // This could be an error response from the OAuth server, or an error because the 
            // request failed such as if the OAuth server doesn't allow CORS requests
            document.getElementById("login-error").innerText = "42 error: " + error["non_field_errors"][0];
            window.history.replaceState({}, null, "/");
        });
        localStorage.removeItem("state");
        hideLoading();
    }
});

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
async function send42PostRequest(url, params, success, error) {
    showLoading();
    var request = new XMLHttpRequest();
    request.open('POST', url, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.setRequestHeader('X-CSRFToken', getCookie("csrftoken"));

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
    hideLoading();
    await request.send(body);
}

function buildAuthUrl(state) {
    return config.authorization_endpoint
        + "?client_id=" + encodeURIComponent(config.client_id)
        + "&redirect_uri=" + encodeURIComponent(config.redirect_uri)
        + "&state=" + encodeURIComponent(state)
        + "&scope=" + encodeURIComponent(config.requested_scopes)
        + "&response_type=code";
}
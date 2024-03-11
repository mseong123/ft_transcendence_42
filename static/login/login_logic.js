const form = document.getElementById('sendOTP');
document.addEventListener('DOMContentLoaded', function () {

  form.addEventListener('submit', sending_OTP);
});

function sending_OTP(event) {
    const apiUrl = 'http://127.0.0.1:8000/api/auth_user/send_otp/';
    event.preventDefault();
    // Using Fetch API to send a POST request
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: form.elements['email'].value,
        password: form.elements['password'].value,
      }),
    })
      .then(response => {
        // Check if the response status is OK (status code 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Parse the JSON in the response
      })
      .then(data => {
        // Handle the data from the response
        console.log('Data from server:', data);
        console.log('detail:', data['detail'])

        otpInput = document.createElement('input');
        otpInput.setAttribute('type', 'text')
        otpInput.setAttribute('id', 'otp')
        otpInput.setAttribute('name', 'otp')
        otpInput.setAttribute('placeholder', 'Enter OTP')
        otpInput.setAttribute('required', '')
        otpInput.setAttribute('class', 'input-box')
        const login_fields = document.getElementById('login-input-fields');
        login_fields.appendChild(otpInput);
        // form.innerHTML = "Login with OTP";
        form.removeEventListener("submit", sending_OTP);
        form.addEventListener("submit", login_OTP);
      })
      .catch(error => {
        // Handle any errors that occurred during the fetch
        console.error('Fetch error:', error);
      });
  };

  function login_OTP(event) {
    const apiUrl = 'http://127.0.0.1:8000/api/auth_user/login/';
    event.preventDefault();
    // Using Fetch API to send a POST request
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: form.elements['email'].value,
        password: form.elements['password'].value,
        otp: form.elements['otp'].value,
      }),
    })
      .then(response => {
        // Check if the response status is OK (status code 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Parse the JSON in the response
      })
      .then(data => {
        // Handle the data from the response
        console.log(data)
      })
      .catch(error => {
        // Handle any errors that occurred during the fetch
        console.error('Fetch error:', error);
      });
  };

var key;
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('myForm');

  form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission

    const apiUrl = 'http://127.0.0.1:8000/api/auth/login/';

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
        key = 'Token ' + data['key'];
        console.log('key:', key)
      })
      .catch(error => {
        // Handle any errors that occurred during the fetch
        console.error('Fetch error:', error);
      });
  });
});
// document.addEventListener('DOMContentLoaded', function () {
//     const routes = {
//         '/': {
//             linkLabel: 'Home',
//             content: "../../templates/home.html"
//         },
//         '/login': {
//             linkLabel: 'Login',
//             content: `../../templates/login.html`
//         },
//         '/register': {
//             linkLabel: 'Register',
//             content: `<div class="wrapper">
//             <form id="sendOTP">
//                 <h1>Login</h1>
//                 <div id="login-input-fields">
        
//                     <div class="input-box">
//                         <input type="text" id="email" placeholder="E-Mail" required>
//                     </div>
        
//                     <div class="input-box">
//                         <input type="password" id="password" placeholder="Password" required>
//                     </div>
                
//                 </div>
//                 <div class="remember-forgot">
//                     <label><input type="checkbox"> Remember me</label>
//                     <a href="#">Forgot password?</a>
//                 </div>
        
//                 <button type="submit" class="btn">Login</button>
        
//                 <div class="register-link">
//                     <p>Don't have an account? <a id="register-btn" type="button">register</a></p>
//                 </div>
        
//                 <div class="seperator-link">
//                     <p>________________________________________</p>
//                 </div>
        
//                 <div class="foutytwo-link">
//                     <a href="#" id="start"><img src="{% static '42Logo.png'%}" style="width:42px;height:42px;border-radius:10px;"></a>
//                 </div>
        
//             </form>
//         </div>
        
//         <script src="{% static 'login/login_logic.js' %}"></script>
//         `,
//         },
//     };

//     const form = document.querySelector("#form");
//     const registerBtn = document.getElementById("register-btn");

//     registerBtn.addEventListener("click", (event) => {
//         console.log("Event target is: " + event.target.getAttribute("data-route"));
//         event.preventDefault();
//         navigate(event);
//     });

//     const renderContent = route => form.innerHTML = routes[route].content;

//     const navigate = event => {
//         const route = event.target.getAttribute("data-route");
//         // this is responsible for adding the new path name to the history stack
//         // history.pushState({}, "", route);
//         console.log("Route is: " + route);
//         renderContent(route);
//     };
// });
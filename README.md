# ft_transcendence

The last CORE project for 42Ecole, a 3D multiplayer pong game with live chat, friend system, user-profiles and score history!<br />
Website is written using HTML, CSS, ThreeJS(JS 3D library using WEBGL) and vanilla JS(api/DOM) with DJANGO FRAMEWORK as backend. Also implemented blockchain for score verification<br />
Test it yourself at https://ludicrouspong.xyz

# Team Member
+ [jyim](https://github.com/SkyHearts "Github Profile") <a href="https://www.linkedin.com/in/yim-jiun-jye-759085120/"><img src="readme_src/icons8-linkedin-48.png" alt="LinkedIn Profile" width="25px" height="25px" align="center"></a>
+ [lewlee](https://github.com/lewislee42 "Github Profile")
+ [melee](https://github.com/mseong123 "Github Profile")
+ [zwong](https://github.com/Wongoose "Github Profile")

# Tech Stack
## Language
[![My Skills](https://skillicons.dev/icons?i=py,js)](https://skillicons.dev)
## Backend Framework
[![My Skills](https://skillicons.dev/icons?i=django)](https://skillicons.dev)
## Frontend
[![My Skills](https://skillicons.dev/icons?i=threejs,js,html,css)](https://skillicons.dev)
## Webserver
<img src="readme_src/nginx.svg" width="50px" height="50px" align="center">

## Database
[![My Skills](https://skillicons.dev/icons?i=postgres,redis)](https://skillicons.dev)
## Devops
[![My Skills](https://skillicons.dev/icons?i=docker,aws)](https://skillicons.dev)

# How to Run
Project is set up in docker. Install [docker engine](https://docs.docker.com/engine/install/)
Clone and navigate to the directoy
If make is installed, run
```
make
```
else run
```
mkdir -p "./data/django"
mkdir -p "./data/cert"
docker compose -f ./docker-compose.yml up -d --build
```
## Requirements.txt
<details><summary>List</summary>
  
 ```
  channels==4.0.0
  Django==4.2.1
  daphne==4.1.0
  dj-rest-auth==4.0.0
  django-allauth==0.52.0
  djangorestframework==3.14.0
  djangorestframework-simplejwt==5.3.1
  pillow==10.2.0
  psycopg==3.1.8
  psycopg-binary==3.1.8
  channels-redis==4.2.0
  web3==6.16.0
 ```

</details>

<details>
  <summary>
    Modules
  </summary>

  ### Web
  - [x] Django Framework
  - [ ] BootStrap
  - [x] Postgres Database
  - [x] Store Tournament Score in Blockchain

  ## User Management
  - [x] Standard user management, authentication, users across tournaments
  - [x] Implementing a remote authentication

  ## Gameplay and User Experience
  - [x] Remote players
  - [x] Multiplayers (more than 2 in the same game)
  - [ ] Add Another Game with User History and Matchmaking
  - [x] Game Customization Options
  - [x] Live chat

  ## AI-Algo
  - [ ] Introduce an AI Opponent
  - [ ] User and Game Stats Dashboards

  ## Cybersecurity
  - [ ] Implement WAF/ModSecurity with Hardened Configuration and HashiCorp Vault for Secrets Management
  - [ ] GDPR Compliance Options with User Anonymization, Local Data Management, and Account Deletion
  - [x] Implement Two-Factor Authentication (2FA) and JWT

  ## DevOps
  - [ ] Infrastructure Setup for Log Management
  - [ ] Monitoring system
  - [ ] Designing the Backend as Microservices

  ## Graphics
  - [x] Use of advanced 3D techniques (ThreeJS)

  ## Accessibility
  - [x] Support on all devices
  - [x] Expanding Browser Compatibility
  - [ ] Multiple language supports.
  - [ ] Add accessibility for Visually Impaired Users
  - [ ] Server-Side Rendering (SSR) Integration.

  ## Sever-side Pong
  - [ ] Replacing Basic Pong with Server-Side Pong and Implementing an API
  - [ ] Enabling Pong Gameplay via CLI against Web Users with API Integration

</details>


## Registration and Login
<details>
  <summary>
    Register
  </summary>
  <img src="readme_src/register.gif">
  <img src="readme_src/email_verification.jpg">
</details>
<details>
  <summary>
    Login With OTP
  </summary>
  <img src="readme_src/login_OTP.gif">
</details>
<details>
  <summary>
    42 Api Login
  </summary>
  <img src="readme_src/42api.gif">
</details>

## Features
<details>
  <summary>
    Chat System
  </summary>
</details>
<details>
  <summary>
    Friend System
  </summary>
</details>
<details>
  <summary>
    Gameplay
  </summary>
</details>

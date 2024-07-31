# Strava API Tools

Personal project for different exports and data manipulations in Strava.

# How to set up

1) Create a Strava API application at https://www.strava.com/settings/api
2) Create a folder named `credentials` in the root of the project
3) Create a file named `strava_credentials.json` in the `credentials` folder
4) Add the following content to the `strava_credentials.json` file:
```json
{
  "clientId": "YOUR_CLIENT_ID",
  "clientSecret": "YOUR_CLIENT_SECRET",
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```
    
5) Install Node.js, see guide at https://nodejs.org/en/download/
6) Run `npm install` in the root of the project

## How to export all activities

1) Run `node export_activities.js`
2) The activities will be exported to the `exports` folder
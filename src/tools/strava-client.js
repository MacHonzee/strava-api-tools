import axios from "axios";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import open from "open";

const STRAVA_OAUTH_URL = "https://www.strava.com/oauth/token";
const STRAVA_API_URL = "https://www.strava.com/api/v3";
const STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize";

class StravaClient {
  constructor(credentialsFile) {
    this.credentialsFile = credentialsFile;
    this.credentials = this.#readCredentials(credentialsFile);
    this.token = null;
  }

  #readCredentials(credentialsFile) {
    const credPath = path.join(
      import.meta.dirname,
      "..",
      "..",
      "credentials",
      credentialsFile + ".json",
    );

    if (!fs.existsSync(credPath)) {
      throw new Error(`Credentials file ${credPath} does not exist.`);
    }

    const credentials = JSON.parse(fs.readFileSync(credPath, "utf8"));
    if (!credentials.clientId || !credentials.clientSecret) {
      throw new Error(
        `Credentials file does not include clientId or clientSecret.`,
      );
    }

    return credentials;
  }

  async init() {
    const { clientId, clientSecret, refreshToken } = this.credentials;

    if (!refreshToken) {
      console.log("No refresh token found. Initiating OAuth flow...");
      await this.grantOauthToken(clientId, clientSecret);
    }

    await this.#authenticate();
    const athlete = await this.getAthlete();
    console.log(
      `Logged in to Strava API as athlete ${athlete.firstname} ${athlete.lastname}`,
    );

    return this;
  }

  async grantOauthToken(clientId, clientSecret) {
    const port = 3000; // You can set this to any available port
    const redirectUri = `http://localhost:${port}/exchange_token`;
    const stravaAuthUrl = `${STRAVA_AUTH_URL}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=activity:read_all`;

    const app = express();

    app.get("/exchange_token", async (req, res) => {
      const authorizationCode = req.query.code;

      try {
        const tokenResponse = await axios.post(STRAVA_OAUTH_URL, {
          client_id: clientId,
          client_secret: clientSecret,
          code: authorizationCode,
          grant_type: "authorization_code",
        });

        const { refresh_token, access_token } = tokenResponse.data;

        // Save the refresh token to the credentials file
        this.credentials.refreshToken = refresh_token;
        this.token = access_token;

        const credPath = path.join(
          import.meta.dirname,
          "..",
          "..",
          "credentials",
          this.credentialsFile + ".json",
        );

        fs.writeFileSync(
          credPath,
          JSON.stringify(this.credentials, null, 2),
          "utf8",
        );

        res.send("OAuth successful! You can close this tab.");
        console.log("OAuth successful! Refresh token saved.");
      } catch (error) {
        console.error("Failed to exchange token:", error);
        res.send("Failed to exchange token.");
      } finally {
        server.close();
      }
    });

    const server = app.listen(port, () => {
      console.log(`Listening on http://localhost:${port}`);
      console.log("Opening Strava authorization page...");
      open(stravaAuthUrl);
    });

    // Keep the server open until the OAuth process is complete
    await new Promise((resolve) => server.on("close", resolve));
  }

  async #authenticate() {
    const { clientId, clientSecret, refreshToken } = this.credentials;

    const response = await axios.post(STRAVA_OAUTH_URL, {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    if (response.data && response.data.access_token) {
      this.token = response.data.access_token;
    } else {
      throw new Error("Access token not found in response");
    }
  }

  async #call(httpMethod, url, body) {
    if (!this.token) {
      throw new Error("Token is not initialized.");
    }

    const requestOptions = {
      method: httpMethod,
      url: `${STRAVA_API_URL}${url}`,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.token}`,
      },
    };

    if (httpMethod === "GET") {
      requestOptions.params = body;
    } else {
      requestOptions.data = body;
    }

    try {
      return (await axios(requestOptions)).data;
    } catch (e) {
      console.error("Error when calling Strava API.", e.response.data);
      throw e;
    }
  }

  async getAthlete() {
    return this.#call("GET", "/athlete");
  }

  async listActivities(page, perPage) {
    return this.#call("GET", "/athlete/activities", {
      page,
      per_page: perPage,
    });
  }

  async getActivityStreams(activityId) {
    return this.#call("GET", `/activities/${activityId}/streams`, {
      keys: "time,latlng,distance,altitude,velocity_smooth,heartrate,moving,grade_smooth",
      // key_by_type: true,
      // series_type: "time",
    });
  }

  async getActivityZones(activityId) {
    return this.#call("GET", `/activities/${activityId}/zones`);
  }

  async fetchGear(gearId) {
    return this.#call("GET", `/gear/${gearId}`);
  }

  async fetchAllActivities() {
    let page = 1;
    let allActivities = [];
    let hasMore = true;

    while (hasMore) {
      console.log("Loading activities from page " + page);
      const response = await this.#call("GET", "/athlete/activities", {
        per_page: 200,
        page,
      });
      const activities = response.data;
      if (activities.length === 0) {
        hasMore = false;
      } else {
        allActivities = allActivities.concat(activities);
        page += 1;
      }
    }

    return allActivities;
  }
}

export default StravaClient;

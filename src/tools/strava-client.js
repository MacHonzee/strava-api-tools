import axios from "axios";
import fs from "node:fs";
import path from "node:path";

const STRAVA_OAUTH_URL = "https://www.strava.com/oauth/token";
const STRAVA_API_URL = "https://www.strava.com/api/v3";

class StravaClient {
  constructor(credentialsFile) {
    this.credentials = this.#readCredentials(credentialsFile);
    this.token = null;
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

  async #readCredentials(credentialsFile) {
    // for now, we assume that the "credentials" folder is in root of this project
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
    if (
      !credentials.clientId ||
      !credentials.clientSecret ||
      !credentials.refreshToken
    ) {
      throw new Error(
        `Credentials file does not include one of clientId, clientSecret or refreshToken values.`,
      );
    }

    this.credentials = credentials;

    return credentials;
  }

  async init() {
    const { clientId, clientSecret, refreshToken } = await this.credentials;

    // TODO check whether client_id and client_secret is enough to get valid token,
    // whether we really need refresh_token or not
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

    const athlete = await this.getAthlete();
    console.log(
      `Logged in to Strava API as athlete ${athlete.firstname} ${athlete.lastname}`,
    );

    return this;
  }

  async getAthlete() {
    return this.#call("GET", "/athlete");
  }

  async listActivities(before, after) {
    return this.#call("GET", "/athlete/activities", { before, after });
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

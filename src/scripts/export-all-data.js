import StravaClient from "../tools/strava-client.js";
import path from "node:path";
import fs from "node:fs";

const ATHLETE_ID = "strava_credentials";
const EXPORTS_FLD = path.join(import.meta.dirname, "..", "..", "exports");

async function listAllActivities(client, athleteFld) {
  const activitySummaryFolder = path.join(athleteFld, "activity-summary");
  if (!fs.existsSync(activitySummaryFolder)) {
    fs.mkdirSync(activitySummaryFolder);
  }

  // first we try to read it from activity-summary folder -> if it is not empty,
  // we do not need to fetch everything again
  const files = fs.readdirSync(activitySummaryFolder);
  if (files.length > 0) {
    const cachedActivities = files.map((f) =>
      JSON.parse(fs.readFileSync(path.join(activitySummaryFolder, f), "utf8")),
    );

    // however we will try to fetch last 10 activities anyway, because there might be some new
    // TODO sometime later do a better logic, that will iterate from the newest loaded activity until now
    const latestActivities = await client.listActivities(1, 10);
    latestActivities.forEach((a) => {
      const filename = path.join(activitySummaryFolder, `${a.id}.json`);
      if (!fs.existsSync(filename)) {
        fs.writeFileSync(filename, JSON.stringify(a, null, 2));
        cachedActivities.push(a);
      }
    });

    return cachedActivities;
  }

  // API returns at most 100 activities per page, so we need to iterate over all pages until
  // we get all activities
  let page = 1;
  let activities = [];
  let newActivities;
  do {
    console.log(`Fetching activities from page ${page}`);
    newActivities = await client.listActivities(page, 100);
    activities = activities.concat(newActivities);
    page++;
  } while (newActivities.length > 0);

  // save loaded activities to activity-summary folder
  activities.forEach((a) => {
    const filename = path.join(activitySummaryFolder, `${a.id}.json`);
    fs.writeFileSync(filename, JSON.stringify(a, null, 2));
  });

  return activities;
}

async function main() {
  const client = await new StravaClient(ATHLETE_ID).init();

  if (!fs.existsSync(EXPORTS_FLD)) {
    fs.mkdirSync(EXPORTS_FLD);
  }

  const athlete = await client.getAthlete();

  // 1) create folder with personal data
  const athleteFld = path.join(EXPORTS_FLD, athlete.username);
  if (!fs.existsSync(athleteFld)) {
    fs.mkdirSync(athleteFld);
  }

  // 2) list all activities recursively with paging
  await listAllActivities(client, athleteFld);
}

await main();

import StravaClient from "../tools/strava-client.js";
import path from "node:path";
import fs from "node:fs";

const ATHLETE_ID = "strava_credentials";
const EXPORTS_FLD = path.join(import.meta.dirname, "..", "..", "exports");

async function getActivityStreams(client, athleteFld, activityId) {
  const streamsFld = path.join(athleteFld, "activity-streams");
  if (!fs.existsSync(streamsFld)) {
    fs.mkdirSync(streamsFld);
  }

  const actStreamsFld = path.join(streamsFld, activityId);
  if (!fs.existsSync(actStreamsFld)) {
    fs.mkdirSync(actStreamsFld);
  }

  // first we try to read it from activity-summary folder -> if it is not empty,
  // we do not need to fetch everything again
  const files = fs.readdirSync(actStreamsFld);
  if (files.length > 0) {
    return files.map((f) =>
      JSON.parse(fs.readFileSync(path.join(actStreamsFld, f), "utf8")),
    );
  }

  const streams = await client.getActivityStreams(activityId);
  streams.forEach((s) => {
    const filename = path.join(actStreamsFld, `${s.type}.json`);
    fs.writeFileSync(filename, JSON.stringify(s, null, 2));
  });

  return streams;
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

  // 2) get activity streams
  await getActivityStreams(client, athleteFld, "12284582451");
}

await main();

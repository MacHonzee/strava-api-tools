import StravaClient from "../tools/strava-client.js";

async function main() {
  const client = await new StravaClient("jan-rudolf").init();

  const athlete = await client.getAthlete();
  console.log("=>(export-all-data.js:7) athlete", athlete);

  // TODO all other steps
  // 1) create folder with personal data
  // 2) list all activities
  // 3) get detail of every activity
  // 4) get stream of every activity
}

await main();

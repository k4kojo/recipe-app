import cron from "cron";
import https from "https";

// Cron job to ping the application every 14 minutes to prevent idling
const job = new cron.CronJob("*/14 * * * *", () => {
  https
    .get(process.env.API_URL, (res) => {
      if (res.statusCode === 200) console.log("GET request sent successfully.");
      else console.log("GET request failed with status code:", res.statusCode);
    })
    .on("error", (e) => console.error("Error while sending request:", e));
});

export default job;

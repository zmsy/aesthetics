/**
 * Main typescript file.
 */
import { setTimeout } from "timers/promises";

import { writeFileSync } from "fs";

import { Aesthetic, getAesthetic, getAestheticLinks } from "./src";

/**
 * Returns a version of the aesthetics listing with each formatted
 * as a block of data.
 */
const fetchAllAestheticData = async () => {
  console.log("Fetching aesthetics list...");
  const result = await getAestheticLinks();
  console.log(`${result.length} aesthetics found. Getting aesthetics data...`);
  const aestheticsResults: Array<Aesthetic> = [];
  for (const a of result) {
    console.log(`GET "${a.name}": ${a.url}`);
    await setTimeout(1000);
    try {
      const aestheticResult = await getAesthetic(a);
      aestheticsResults.push(aestheticResult);
    } catch (err) {
      console.error(err);
    }
  }
  writeFileSync("results.json", JSON.stringify(aestheticsResults, null, 2));
};

(function () {
  fetchAllAestheticData();
})();

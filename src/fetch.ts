/**
 * Retrieve websites content.
 */

import { inspect } from "util";

type FetchResult = Response | undefined;
export const fetchWebsite = async (url: string): FetchResult => {
  let result: FetchResult;
  try {
    result = await fetch(url);
  } catch (err) {
    console.log(`Caught error: ${inspect({
      url,
      err,
    })}`)
  }

  return result;
};

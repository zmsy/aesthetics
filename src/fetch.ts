/**
 * Retrieve websites content.
 */

import { inspect } from "util";

/** Returns website HTML as a string or undefined if failed. */
type FetchResult = string | undefined;

/**
 * Fetch the original HTML for a given website.
 */
export const fetchWebsiteHTML = async (url: string): Promise<FetchResult> => {
  try {
    const result = await fetch(url);
    if (result !== null) {
      return result.text();
    }
  } catch (err) {
    console.error(
      `Caught error: ${inspect({
        url,
        err,
      })}`
    );
  }

  return undefined;
};

/**
 * If the website is already fetched, return it from the cache, otherwise
 * retrieve the full HTML content.
 *
 * Code is based on this:
 * https://www.thisdot.co/blog/web-scraping-with-typescript-and-node-js#caching-scraped-pages
 *
 * @param url
 */
export const fetchWebsiteOrCached = (url: string): FetchResult => {
  // not yet implemented
  return undefined;
};

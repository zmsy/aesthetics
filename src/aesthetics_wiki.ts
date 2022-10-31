/**
 * Listing of data for the aesthetics wiki.
 */

import { setTimeout } from "timers/promises";

import { fetchWebsiteHTML } from "./fetch";

import { JSDOM } from "jsdom";

export const aestheticsConfig = {
  /**
   * Base URL for any aesthetics wiki link.
   */
  baseUrl: "https://aesthetics.fandom.com",
  /**
   * Page with all of the aesthetics as one large list, separated
   * out by letter.
   */
  listingPage: "https://aesthetics.fandom.com/wiki/List_of_Aesthetics",
};

/** Minimal aesthetic data fetched from the initial page parsing. */
export type AestheticLink = {
  url: string;
  name: string;
};

/**
 * Represents a single Aesthetic on the wiki.
 */
export type Aesthetic = AestheticLink & {
  numComments: number;
  numPictures: number;
  relatedAestheticUrls: Array<AestheticLink>;
};

/** Pages to just exclude because we don't want them. */
const knownBadUrls = new Set<string>([
  // admin pages
  "List of Deleted Pages and Why",
  "Single-Subject Aesthetics",
  "Pages We Need",
  // random other pages
  "\n\t\t\t\t\t\t\t\t\t\t\tHistory\t\t\t\t\t\t\t\t\t\t",
  "\n\t\t\t\t\t\t\t\t\t\t\tTalk (2)\t\t\t\t\t\t\t\t\t\t",
]);

/**
 *
 * @returns The list
 */
export const getAestheticLinks = async (): Promise<Array<AestheticLink>> => {
  const listingsPage = await fetchWebsiteHTML(aestheticsConfig.listingPage);
  const doc = new JSDOM(listingsPage).window.document;
  const links = Array.from(doc.getElementsByTagName("a")).filter(
    (l) =>
      // links are to wiki pages
      l.href.startsWith("/wiki") &&
      // individual links are <a> tags that are list entries
      l.parentElement?.tagName.toLowerCase() === "li" &&
      // not in our exclusion list
      !knownBadUrls.has(l.text)
  );
  const aestheticLinks = links.map((l) => {
    return {
      name: l.text,
      url: `${aestheticsConfig.baseUrl}${l.href}`,
    };
  });

  return aestheticLinks;
};

/**
 * Given the link to an Aesthetic page, parse the contents and return
 * the actual aesthetic payload.
 */
export const getAesthetic = async (link: AestheticLink): Promise<Aesthetic> => {
  const html = await fetchWebsiteHTML(link.url);
  if (html === undefined) {
    throw new Error(`Couldn't fetch ${link.name}`);
  }
  const doc = new JSDOM(html).window.document;
  // comments are just a number on the button
  const numComments = parseInt(
    doc.getElementById("article-comments-button")?.textContent || "0"
  );
  // pictures are counted by children of the gallery
  const numPictures = doc.getElementById("gallery-0")?.childElementCount || 0;
  const relatedAestheticUrls: Array<AestheticLink> = [];
  const relatedLinksDiv = Array.from(
    doc.querySelector('[data-source="related_aesthetics"]')?.children || []
  ).find((x) => x.tagName.toLocaleLowerCase() === "div");

  if (relatedLinksDiv) {
    const links = relatedLinksDiv.querySelectorAll("a");
    links.forEach((l) => {
      relatedAestheticUrls.push({
        name: l.text,
        url: `${aestheticsConfig.baseUrl}${l.href}`,
      });
    });
  }

  return {
    ...link,
    numComments,
    numPictures,
    relatedAestheticUrls,
  };
};

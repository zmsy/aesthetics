/**
 * Index file for the website.
 */

import results from "../../results.json";
import { Aesthetic } from "../../src/aesthetics_wiki";

import { Network, Options } from "vis";

const graphData = results as unknown as Array<Aesthetic>;

type IndexedAesthetic = { idx: number; numLinks: number } & Aesthetic;
type GraphNode = { id: number; label: string; value: number };
type GraphEdge = { from: number; to: number };

// Loop through and count all connections between the graph nodes.
// const linkCounts: Record<number, number> =

// create a dataset where each aesthetic has an index.
const graphDataLookup: Record<string, IndexedAesthetic> = Object.fromEntries(
  graphData.map((g, idx) => [g.url, { ...g, idx, numLinks: 0 }])
);

// now use that to create nodes and edges.
const edges: Array<GraphEdge> = Object.values(graphDataLookup)
  .flatMap((a) =>
    a.relatedAestheticUrls.map((r) => {
      const linkA = a.idx;
      const linkR = graphDataLookup[r.url]?.idx;

      // increment number of links to that node
      if (graphDataLookup[r.url]) {
        graphDataLookup[r.url].numLinks += 1;
      }
      return { from: linkA, to: linkR };
    })
  )
  // get rid of any ones where the link doesn't actually lead
  // to anything. happens sometimes with unindexed pages
  .filter((x) => x.to !== undefined);

const nodes: Array<GraphNode> = Object.values(graphDataLookup).map((a) => {
  return {
    id: a.idx,
    label: a.name,
    value:
      a.numLinks +
      a.relatedAestheticUrls.length +
      Math.floor(a.numPictures / 2),
  };
});

// now let's apply a low-pass filter on the edges/nodes to get rid of
// any w/ less than _n_ value
const MINIMUM_VALUE = 15;
const lowValueNodes = new Set<number>(
  nodes.filter((x) => x.value <= MINIMUM_VALUE).map((x) => x.id)
);

const data = {
  nodes: nodes.filter((n) => !lowValueNodes.has(n.id)),
  edges: edges.filter(
    (e) => !lowValueNodes.has(e.to) && !lowValueNodes.has(e.from)
  ),
};

console.log(data);

const options: Options = {
  nodes: {
    shape: "dot",
    scaling: {
      label: {
        min: 5,
        max: 82,
      },
    },
  },
  physics: {
    enabled: true,
  },
  layout: {
    improvedLayout: false,
  },
};

console.log("Loading network graph...");
var container = document.getElementById("network-graph-container");
if (container) {
  new Network(container, data, options);
}

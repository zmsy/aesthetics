/**
 * Index file for the website.
 */

import results from "../../results.json";
import { Aesthetic } from "../../src/aesthetics_wiki";

import { Network, Options } from "vis";

const graphData = results as unknown as Array<Aesthetic>;

type IndexedAesthetic = { idx: number } & Aesthetic;
type GraphNode = { id: number; label: string; value: number };
type GraphEdge = { from: number; to: number };

// create a dataset where each aesthetic has an index.
const graphDataLookup: Record<string, IndexedAesthetic> = Object.fromEntries(
  graphData.map((g, idx) => [g.url, { ...g, idx }])
);

// now use that to create nodes and edges.
const nodes: Array<GraphNode> = Object.values(graphDataLookup).map((a) => {
  return {
    id: a.idx,
    label: a.name,
    value: a.numPictures,
  };
});

const edges: Array<GraphEdge> = Object.values(graphDataLookup)
  .flatMap((a) =>
    a.relatedAestheticUrls.map((r) => {
      const linkA = a.idx;
      const linkR = graphDataLookup[r.url]?.idx;
      return { from: linkA, to: linkR };
    })
  )
  // get rid of any ones where the link doesn't actually lead
  // to anything. happens sometimes with unindexed pages
  .filter((x) => x.to !== undefined);

const data = { nodes, edges };
const options: Options = {
  nodes: {
    shape: "dot",
  },
  layout: {
    improvedLayout: false,
  },
};

var container = document.getElementById("network-graph-container");
if (container) {
  new Network(container, data, options);
}

import { ASSETS, BU_HISTORY, DOCS, METRICS, PROJECTS, buName } from './data';

// A tiny, dependency-free TF-IDF vector index rebuilt in browser memory.
// It is intentionally not an embedding model or a persistent vector database.
const stop = new Set(['the', 'and', 'for', 'with', 'from', 'what', 'does', 'this', 'that', 'how', 'why', 'are', 'was', 'were', 'about', 'show', 'tell', 'which', 'have', 'has', 'into', 'your', 'our']);
const synonyms: Record<string, string[]> = {
  operating_profit: ['operating profit', 'profit', 'ebit', 'op'],
  occupancy: ['occupancy', 'leased', 'vacancy', 'tenant'],
  cost_to_complete: ['cost to complete', 'cost-to-complete', 'ctc', 'remaining cost', 'overrun'],
  valuation: ['valuation', 'value', 'appraisal', 'nav'],
  treasury: ['debt', 'liquidity', 'maturity', 'refinancing', 'hedge', 'interest'],
};

function tokens(input: string) {
  return input.toLowerCase().match(/[a-z0-9]+/g)?.filter((token) => token.length > 2 && !stop.has(token)) ?? [];
}

function documents() { return DOCS; }

export function searchLocalDocuments(query: string, limit = 5) {
  const corpus = documents().map((doc) => ({ doc, terms: tokens(`${doc.title} ${doc.scope} ${doc.text}`) }));
  const df = new Map<string, number>();
  corpus.forEach(({ terms }) => new Set(terms).forEach((term) => df.set(term, (df.get(term) ?? 0) + 1)));
  const queryText = query.toLowerCase();
  const queryTerms = new Set(tokens(query));
  Object.entries(synonyms).forEach(([concept, variants]) => {
    if (variants.some((variant) => queryText.includes(variant))) queryTerms.add(concept);
  });
  // Expand question concepts to their common finance-language variants.
  Object.entries(synonyms).forEach(([concept, variants]) => {
    if (queryTerms.has(concept)) variants.forEach((variant) => tokens(variant).forEach((term) => queryTerms.add(term)));
  });
  const scored = corpus.map(({ doc, terms }) => {
    const counts = new Map<string, number>();
    terms.forEach((term) => counts.set(term, (counts.get(term) ?? 0) + 1));
    const titleTerms = new Set(tokens(doc.title));
    const score = [...queryTerms].reduce((total, term) => {
      const tf = counts.get(term) ?? 0;
      if (!tf) return total;
      const idf = Math.log(1 + corpus.length / (1 + (df.get(term) ?? 0)));
      return total + (1 + Math.log(tf)) * idf * (titleTerms.has(term) ? 2.2 : 1);
    }, 0);
    return { doc, score };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
  return scored.map(({ doc, score }) => ({
    document_id: doc.id, title: doc.title, date: doc.date, scope: doc.scope,
    passage: doc.text, score: Math.round(score * 1000) / 1000,
  }));
}

export interface GraphNode { id: string; label: string; type: string; }
export interface GraphEdge { from: string; to: string; relation: string; }

export function localKnowledgeGraph() {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const add = (node: GraphNode) => { if (!nodes.some((existing) => existing.id === node.id)) nodes.push(node); };
  METRICS.forEach(([id, label]) => {
    add({ id: `metric:${id}`, label, type: 'metric' });
    const owner = id === 'portfolio_valuation' || id === 'occupancy' || id === 'noi' ? 'Investor Finance' : id.includes('gearing') || id.includes('interest') ? 'Group Treasury' : 'Group Finance';
    add({ id: `owner:${owner}`, label: owner, type: 'owner' });
    edges.push({ from: `metric:${id}`, to: `owner:${owner}`, relation: 'owned by' });
  });
  BU_HISTORY.slice(-6).forEach((row) => {
    const id = `bu:${row.id}`; add({ id, label: row.business_unit, type: 'business unit' });
    edges.push({ from: 'metric:operating_profit', to: id, relation: 'measured for' });
  });
  ASSETS.forEach((asset) => {
    const id = `asset:${asset.id}`; add({ id, label: asset.name, type: 'asset' });
    edges.push({ from: `bu:${asset.bu}`, to: id, relation: 'contains' });
  });
  PROJECTS.forEach((project) => {
    const id = `project:${project.id}`; add({ id, label: project.name, type: 'project' });
    edges.push({ from: 'bu:RES', to: id, relation: 'contains' });
  });
  DOCS.forEach((doc) => {
    const id = `doc:${doc.id}`; add({ id, label: doc.title, type: 'document' });
    const scope = doc.scope === 'GRP' ? 'Group Finance' : doc.scope === 'TSY' ? 'Group Treasury' : buName(doc.scope);
    edges.push({ from: id, to: `owner:${scope}`, relation: 'evidence for' });
  });
  Object.entries(synonyms).forEach(([concept, variants]) => {
    add({ id: `concept:${concept}`, label: concept.replaceAll('_', ' '), type: 'concept' });
    variants.forEach((variant) => edges.push({ from: `concept:${concept}`, to: `metric:${concept}`, relation: `also called ${variant}` }));
  });
  return { nodes, edges, storage: 'in-memory demo graph', persistence: 'none' };
}

export const LOCAL_SEARCH_INFO = {
  method: 'Sparse TF-IDF term vectors with finance synonyms',
  storage: 'Browser memory; rebuilt from synthetic documents at runtime',
  embeddings: 'None',
  database: 'None',
  graph: 'Code-defined entity and relationship list',
};

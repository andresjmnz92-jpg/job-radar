// Node: "What to search" (n8n Code node)
// One item per query. The HTTP node downstream runs once per item.
// Source of truth is workflow.json; this file is the same code, readable.

// One item per search. The HTTP node downstream runs once per item,
// so five queries come out of a single node.
// Measured against the API on 2026-08-08 (jobs in my lane / of those, fully remote):
//   n8n 14/5 · workflow 14/3 · automation 13/1 · ai 12/1 · healthcare 6/1
// Dropped: 'operations' and 'support' (mostly on-site), 'revenue cycle' (3 results total).
// >>> REPLACE these with the terms of your own field.
return ['automation', 'healthcare', 'n8n', 'workflow', 'ai'].map((q) => ({ json: { q } }));

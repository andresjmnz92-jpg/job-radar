// Node: "Normalize LatAm results" (n8n Code node)
// Maps the Get on Board API response onto the same fields the other sources emit.
// Source of truth is workflow.json; this file is the same code, readable.

// Normalizes Get on Board into the same fields as every other source.
// The 'region' field is what the scoring prompt already reads as WHERE THEY HIRE,
// so the scoring node needs no changes.
const seen = new Set();
const out = [];

for (const item of $input.all()) {
  for (const j of item.json.data || []) {
    const a = j.attributes || {};
    const url = (j.links || {}).public_url;
    if (!url || seen.has(url)) continue;
    seen.add(url);

    const company = a.company?.data?.attributes?.name || '';
    const countries = Array.isArray(a.countries) ? a.countries.join(', ') : '';

    // fully_remote accepts any country; remote_local usually means one region;
    // hybrid and no_remote tie you to a city. Passed raw to the LLM with the country.
    const region = [a.remote_modality, countries].filter(Boolean).join(' — ') || 'unspecified';

    const salary = a.min_salary
      ? ' Published salary: ' + a.min_salary + '-' + (a.max_salary || a.min_salary) + ' USD per month.'
      : '';

    const text = [a.description, a.functions, a.desirable]
      .filter(Boolean).join(' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    out.push({
      json: {
        title: a.title + (company ? ' — ' + company : ''),
        link: url,
        region,
        contentSnippet: 'Source: Get on Board (LatAm).' + salary + ' ' + text.slice(0, 1200),
      },
    });
  }
}

return out;

// Node: "Extract the jobs" (n8n Code node)
// Parses LinkedIn job-alert emails into one item per posting.
// Source of truth is workflow.json; this file is the same code, readable.

// Each LinkedIn alert holds several jobs separated by a line of dashes.
// Inside a block the order is: Title / Company / Location / View job: <url>,
// and after that come decorations ("3 connections", "Actively recruiting"...).
// That is why we count from the TOP: counting backwards from the link shifts the title.
const NOISE = [
  /^your job alert for/i,
  /^new jobs? match/i,
  /^\d+ new jobs? match/i,
  /^\d+\s+connections?$/i,
  /^\d+\s+(school\s+)?alum(ni)?\b/i,
  /^this company is actively hiring$/i,
  /^actively recruiting$/i,
  /^apply with resume/i,
  /^easy apply$/i,
  /^promoted$/i,
  /^viewed$/i,
  /^be an early applicant$/i,
];

const jobs = [];

for (const item of $input.all()) {
  const blocks = String(item.json.text || '').split(/\n-{10,}\n/);

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim());
    const i = lines.findIndex((l) => l.startsWith('View job: '));
    if (i === -1) continue;

    const m = lines[i].match(/jobs\/view\/(\d+)/);
    if (!m) continue;

    const data = lines
      .slice(0, i)
      .filter((l) => l && !NOISE.some((re) => re.test(l)));
    if (data.length < 3) continue;

    const [title, company, place] = data;

    jobs.push({
      json: {
        title: title + ' — ' + company,
        // Clean link on purpose: the original carries tracking tokens that change
        // in every email, which would make the dedupe see the same job as new.
        link: 'https://www.linkedin.com/jobs/view/' + m[1],
        contentSnippet: 'Company: ' + company + '. Location: ' + place + '. Source: LinkedIn job alert.',
      },
    });
  }
}

return jobs;

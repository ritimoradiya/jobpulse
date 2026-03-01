const https = require('https');
const db = require('../db');

async function fetchJobDetail(boardToken, jobId) {
  return new Promise((resolve) => {
    https.get(
      `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs/${jobId}`,
      { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } },
      res => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => {
          try { resolve(JSON.parse(raw)); }
          catch(e) { resolve(null); }
        });
      }
    ).on('error', () => resolve(null));
  });
}

async function run() {
  const companies = [
    { name: 'Anthropic', token: 'anthropic' },
    { name: 'Stripe',    token: 'stripe' },
    { name: 'Airbnb',    token: 'airbnb' },
  ];

  for (const { name, token } of companies) {
    console.log(`\nFetching employment types for ${name}...`);
    const result = await db.query(
      `SELECT id, external_id FROM jobs WHERE source = $1`,
      [`${token}_careers`]
    );

    let updated = 0;
    for (const row of result.rows) {
      const jobId = row.external_id.replace(`${token}_`, '');
      const detail = await fetchJobDetail(token, jobId);
      const empType = detail?.employment_type || 'Full-Time';
      await db.query('UPDATE jobs SET employment_type = $1 WHERE id = $2', [empType, row.id]);
      updated++;
      if (updated % 50 === 0) console.log(`  ${name}: ${updated}/${result.rows.length} done...`);
      await new Promise(r => setTimeout(r, 150));
    }
    console.log(`✅ ${name}: updated ${updated} jobs`);
  }

  // Check what types we got
  const types = await db.query(
    'SELECT DISTINCT employment_type, COUNT(*) as count FROM jobs WHERE employment_type IS NOT NULL GROUP BY employment_type ORDER BY count DESC'
  );
  console.log('\n📊 Employment types in DB:', types.rows);
  process.exit();
}

run().catch(e => { console.error(e); process.exit(1); });
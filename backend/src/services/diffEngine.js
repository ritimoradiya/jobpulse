const pool = require('../db/index');

async function insertNewJobs(jobs) {
  if (!jobs.length) {
    console.log('No jobs to insert.');
    return { inserted: 0, skipped: 0 };
  }

  let inserted = 0;
  let skipped = 0;

  for (const job of jobs) {
    try {
      const existing = await pool.query(
        'SELECT id FROM jobs WHERE external_id = $1',
        [job.external_id]
      );

      if (existing.rows.length > 0) {
        skipped++;
        continue;
      }

      const companyResult = await pool.query(
        `INSERT INTO companies (name, career_url) VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [job.company, job.companyUrl || null]
      );
      const companyId = companyResult.rows[0].id;

      await pool.query(
        `INSERT INTO jobs (company_id, title, location, url, external_id, source, posted_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [companyId, job.title, job.location, job.url, job.external_id, job.source, job.scraped_at]
      );

      inserted++;
    } catch (err) {
      console.error(`❌ Error inserting job "${job.title}":`, err.message);
    }
  }

  console.log(`📊 Diff Engine: ${inserted} new jobs inserted, ${skipped} duplicates skipped`);
  return { inserted, skipped };
}

module.exports = { insertNewJobs };
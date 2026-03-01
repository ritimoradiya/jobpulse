const pool = require('../db/index');
const { sendAlertEmail } = require('./emailService');

async function insertNewJobs(jobs, io = null) {
  if (!jobs.length) {
    return { inserted: 0, skipped: 0 };
  }

  let inserted = 0;
  let skipped = 0;
  const newJobs = [];

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

      // Support both new scrapers (company_id) and old scrapers (company name)
      let companyId = job.company_id;
      if (!companyId && job.company) {
        const companyResult = await pool.query(
          `INSERT INTO companies (name, career_url) VALUES ($1, $2)
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [job.company, job.companyUrl || null]
        );
        companyId = companyResult.rows[0].id;
      }

      const postedAt = job.posted_at || job.scraped_at || new Date();
      const detectedAt = job.detected_at || new Date();

      const result = await pool.query(
        `INSERT INTO jobs (company_id, title, location, url, external_id, source, posted_at, detected_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [companyId, job.title, job.location, job.url, job.external_id, job.source, postedAt, detectedAt]
      );

      newJobs.push({ ...job, id: result.rows[0].id, posted_at: postedAt });
      inserted++;
    } catch (err) {
      console.error(`❌ Error inserting job "${job.title}":`, err.message);
    }
  }

  console.log(`📊 Diff Engine: ${inserted} new jobs inserted, ${skipped} duplicates skipped`);

  // Emit WebSocket event
  if (io && newJobs.length > 0) {
    io.emit('new_jobs', { count: newJobs.length });
  }

  // Alert matching
  if (newJobs.length > 0) {
    try {
      const { rows: activeAlerts } = await pool.query(
        'SELECT * FROM alerts WHERE is_active = true'
      );

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      for (const alert of activeAlerts) {
        const matched = newJobs.filter(job => {
          // Only alert for jobs actually posted within the last 24 hours
          const postedAt = job.posted_at ? new Date(job.posted_at) : null;
          const isRecent = postedAt && postedAt >= oneDayAgo;
          if (!isRecent) return false;

          const companyMatch =
            !alert.companies.length ||
            alert.companies.some(c =>
              job.company?.toLowerCase().includes(c.toLowerCase())
            );
          const keywordMatch =
            !alert.keywords.length ||
            alert.keywords.some(k =>
              job.title?.toLowerCase().includes(k.toLowerCase())
            );
          return companyMatch && keywordMatch;
        });

        if (!matched.length) continue;

        // Deduplicate — skip jobs already emailed for this alert
        const dedupedJobs = [];
        for (const job of matched) {
          try {
            await pool.query(
              'INSERT INTO alert_logs (alert_id, job_id) VALUES ($1, $2)',
              [alert.id, job.id]
            );
            dedupedJobs.push(job);
          } catch (e) {
            // unique constraint violation = already sent, skip
          }
        }

        if (dedupedJobs.length > 0) {
          await sendAlertEmail(alert.email, dedupedJobs);
          console.log(`📧 Alert sent to ${alert.email} — ${dedupedJobs.length} jobs`);
        }
      }
    } catch (err) {
      console.error('Alert matching error:', err);
    }
  }

  return { inserted, skipped };
}

module.exports = { insertNewJobs };
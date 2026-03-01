CREATE TABLE IF NOT EXISTS applied_jobs (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  job_id     INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);
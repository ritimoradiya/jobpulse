-- Alerts: user subscriptions
CREATE TABLE IF NOT EXISTS alerts (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  companies   TEXT[]  NOT NULL DEFAULT '{}',
  keywords    TEXT[]  NOT NULL DEFAULT '{}',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deduplication log: prevents same job emailing twice per alert
CREATE TABLE IF NOT EXISTS alert_logs (
  id         SERIAL PRIMARY KEY,
  alert_id   INTEGER REFERENCES alerts(id) ON DELETE CASCADE,
  job_id     INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  sent_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(alert_id, job_id)
);
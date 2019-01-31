-- First in terminal:
--    dropdb sotpotus
--    createdb sotpotus
--    psql -d sotpotus -f schema.sql

-- Push db to heroku:
--    heroku pg:push sotpotus DATABASE_URL --app state-of-the-potus

DROP TABLE IF EXISTS tweets;

CREATE TABLE tweets (
  id NUMERIC(19) UNIQUE,
  created_at TIMESTAMP,
  full_text TEXT,
  sentiment REAL,
  anger REAL,
  fear REAL,
  joy REAL,
  sadness REAL,
  surprise REAL,
  libertarian REAL,
  green REAL,
  liberal REAL,
  conservative REAL,
  extraversion REAL,
  openness REAL,
  agreeableness REAL,
  conscientiousness REAL,
  PRIMARY KEY (id)
);
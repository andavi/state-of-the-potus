-- First in terminal:
--    dropdb sotpotus
--    createdb sotpotus
--    psql -d sotpotus -f schema.sql

-- Push db to heroku:
--    heroku pg:push sotpotus DATABASE_URL --app state-of-the-potus

-- +++++++++++++++++++++++++++++++++++++++++++++
-- Andrew Davis - 2019.02.03 - IMPORTANT NOTE:
-- Originally greated created_at column as TIMESTAMP WITHOUT TIME ZONE. Made all the times wrong and local to my time zone. Had to alter the column type using this format:
--    ALTER TABLE table_name
--    ALTER COLUMN column_name TYPE new_data_type USING expression;

-- Specifically this SQL command:
--    ALTER TABLE tweets
--    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::TIMESTAMP WITHOUT TIME zone AT TIME zone 'EST0EDT';
-- +++++++++++++++++++++++++++++++++++++++++++++

DROP TABLE IF EXISTS tweets;

CREATE TABLE tweets (
  id NUMERIC(19) UNIQUE,
  created_at TIMESTAMPTZ,
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
CREATE TABLE IF NOT EXISTS scores (
  k     TEXT PRIMARY KEY,           -- lower-cased player name
  n     TEXT NOT NULL,              -- display name
  av    INTEGER NOT NULL,           -- avatar index 0..11
  p     INTEGER NOT NULL,           -- best legacy points
  t     TEXT NOT NULL,              -- title earned with the best score
  owner TEXT NOT NULL,              -- private device id that owns this name
  pl    INTEGER NOT NULL DEFAULT 1, -- number of finished careers
  dt    INTEGER NOT NULL            -- last update (ms)
);
CREATE INDEX IF NOT EXISTS idx_scores_p ON scores(p DESC);

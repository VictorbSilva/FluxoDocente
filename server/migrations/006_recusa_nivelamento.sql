CREATE TABLE placement_refusals (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  recusado_em timestamptz NOT NULL DEFAULT now()
);

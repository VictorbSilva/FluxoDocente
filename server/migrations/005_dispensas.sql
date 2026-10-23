CREATE TABLE module_skips (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  dispensado_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, module_id)
);

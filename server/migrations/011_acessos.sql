CREATE TABLE logins (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  origem text NOT NULL CHECK (origem IN ('login', 'cadastro')),
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_logins_user_id ON logins (user_id);
CREATE INDEX idx_logins_criado_em ON logins (criado_em);

CREATE TABLE acessos_diarios (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dia date NOT NULL,
  primeiro_acesso_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, dia)
);

CREATE TABLE payment_requests (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type        TEXT        NOT NULL CHECK (plan_type IN ('monthly','annual')),
  reference_number TEXT        NOT NULL,
  amount_cents     INTEGER     NOT NULL,
  status           TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending','approved','rejected')),
  reviewed_by      UUID        REFERENCES auth.users(id),
  reviewed_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own payment requests"
  ON payment_requests FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins manage all payment requests"
  ON payment_requests FOR ALL
  USING  ((SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin');

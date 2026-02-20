-- Update patient limits for all plans (conditional to avoid shadow DB failures)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Plan' AND table_schema = 'public') THEN
    UPDATE "Plan" SET "maxPatients" = 50 WHERE name = 'free';
    UPDATE "Plan" SET "maxPatients" = 200 WHERE name = 'basic';
    UPDATE "Plan" SET "maxPatients" = 500 WHERE name = 'enterprise';
  END IF;
END $$;

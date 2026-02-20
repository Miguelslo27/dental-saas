-- Update patient limits for all plans
UPDATE "Plan" SET "maxPatients" = 50 WHERE name = 'free';
UPDATE "Plan" SET "maxPatients" = 200 WHERE name = 'basic';
UPDATE "Plan" SET "maxPatients" = 500 WHERE name = 'enterprise';

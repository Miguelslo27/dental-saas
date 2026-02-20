-- Fix: previous migration used wrong table name "Plan" instead of "plans"
-- Update patient limits for all plans using correct table name
UPDATE plans SET "maxPatients" = 50 WHERE name = 'free';
UPDATE plans SET "maxPatients" = 200 WHERE name = 'basic';
UPDATE plans SET "maxPatients" = 500 WHERE name = 'enterprise';

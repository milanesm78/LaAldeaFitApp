---
status: diagnosed
trigger: "Test 4: Submit Measurement -- BLOCKER. Toast shows 'An error occurred' when saving measurements."
created: 2026-03-01T00:00:00Z
updated: 2026-03-01T00:00:00Z
---

## Current Focus

hypothesis: Migration 00004_body_measurements.sql was never pushed to remote Supabase
test: Run `supabase migration list` to compare local vs remote
expecting: Remote column is empty for 00004
next_action: Report root cause

## Symptoms

expected: After completing all 4 wizard steps, submitting saves the measurement successfully
actual: Toast message "An error occurred" appears on submit
errors: Generic error from Supabase INSERT into body_measurements table
reproduction: Fill wizard steps 1-4, click Save on step 4
started: Since feature was added (migration never applied remotely)

## Eliminated

- hypothesis: Zod validation failure preventing form submission
  evidence: The toast "common.error" is from the mutation onError handler, meaning form.handleSubmit(onSubmit) DID fire, so Zod validation passed. If Zod failed, react-hook-form would show field-level errors, not a toast.
  timestamp: 2026-03-01T00:00:00Z

- hypothesis: Column mismatch between form payload and DB schema
  evidence: All 18 data columns in the insert row object match the table schema exactly. Auto-generated columns (id, created_at, updated_at) have DEFAULT values.
  timestamp: 2026-03-01T00:00:00Z

- hypothesis: RLS policy blocking INSERT
  evidence: is_trainer() function works for other tables (training_plans, exercises). The INSERT policy uses correct WITH CHECK syntax. However this is moot since the table doesn't exist remotely.
  timestamp: 2026-03-01T00:00:00Z

- hypothesis: Data type or constraint violation
  evidence: weight/height are numbers from DecimalInput via normalizeDecimal(). measured_at is ISO string from new Date().toISOString(). Optional fields default to null. All types are compatible with the DB column types. Moot since table doesn't exist remotely.
  timestamp: 2026-03-01T00:00:00Z

## Evidence

- timestamp: 2026-03-01T00:00:00Z
  checked: supabase migration list (local vs remote)
  found: Migrations 00004 and 00005 exist locally but have NOT been applied to remote Supabase
  implication: The body_measurements table does not exist in the remote database. Any INSERT will fail.

- timestamp: 2026-03-01T00:00:00Z
  checked: useMeasurements.ts onError handler (line 118-120)
  found: onError shows toast.error(t("common.error")) -- this is the "An error occurred" message the user sees
  implication: Confirms the error originates from the Supabase INSERT failing, not from form validation

- timestamp: 2026-03-01T00:00:00Z
  checked: Insert payload vs DB schema alignment
  found: All column names and types match correctly between the mutation row object and the migration DDL
  implication: The code itself is correct; the problem is infrastructure (missing migration)

## Resolution

root_cause: Migration 00004_body_measurements.sql has not been applied to the remote Supabase database. The `body_measurements` table does not exist on the server. The Supabase client INSERT call fails because it's targeting a non-existent table, triggering the mutation's onError handler which shows the generic "An error occurred" toast.
fix: Run `supabase db push` to apply pending migrations (00004 and 00005) to the remote database.
verification: After pushing migrations, repeat the wizard flow and confirm the measurement saves successfully with a success toast.
files_changed: []

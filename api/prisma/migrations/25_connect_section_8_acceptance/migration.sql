-- AlterTable
ALTER TABLE "listings" ALTER COLUMN "afs_last_run_at" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
ALTER COLUMN "last_application_update_at" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
ALTER COLUMN "requested_changes_date" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone;

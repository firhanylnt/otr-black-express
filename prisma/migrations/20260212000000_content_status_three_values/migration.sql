-- Refactor ContentStatus enum to only: pending, rejected, published
-- Migrate data: draft -> pending, approved -> published

CREATE TYPE "ContentStatus_new" AS ENUM ('pending', 'rejected', 'published');

ALTER TABLE "content" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "content" ALTER COLUMN "status" TYPE "ContentStatus_new" USING (
  CASE "status"::text
    WHEN 'draft' THEN 'pending'::"ContentStatus_new"
    WHEN 'approved' THEN 'published'::"ContentStatus_new"
    ELSE "status"::text::"ContentStatus_new"
  END
);

ALTER TABLE "content" ALTER COLUMN "status" SET DEFAULT 'pending'::"ContentStatus_new";

DROP TYPE "ContentStatus";

ALTER TYPE "ContentStatus_new" RENAME TO "ContentStatus";

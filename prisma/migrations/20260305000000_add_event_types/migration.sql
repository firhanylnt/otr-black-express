-- CreateTable
CREATE TABLE "event_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_types_slug_key" ON "event_types"("slug");

-- AlterTable
ALTER TABLE "events" ADD COLUMN "event_type_id" INTEGER;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "event_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "events_event_type_id_idx" ON "events"("event_type_id");

-- Seed default event types
INSERT INTO "event_types" ("name", "slug", "sort_order", "is_active", "created_at", "updated_at") VALUES
('Live Session', 'live-session', 1, 1, NOW(), NOW()),
('DJ Night', 'dj-night', 2, 1, NOW(), NOW()),
('Day Party', 'day-party', 3, 1, NOW(), NOW()),
('Workshop', 'workshop', 4, 1, NOW(), NOW()),
('Listening Party', 'listening-party', 5, 1, NOW(), NOW()),
('Special Event', 'special-event', 6, 1, NOW(), NOW());

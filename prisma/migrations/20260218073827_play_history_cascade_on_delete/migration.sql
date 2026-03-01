/*
  Warnings:

  - You are about to drop the column `description` on the `highlights` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "play_history" DROP CONSTRAINT "play_history_content_id_fkey";

-- AlterTable
ALTER TABLE "highlights" DROP COLUMN "description";

-- AddForeignKey
ALTER TABLE "play_history" ADD CONSTRAINT "play_history_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "public"."Company" ADD COLUMN     "mediaRetentionDays" INTEGER NOT NULL DEFAULT 90;

-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "mediaRetentionDays" INTEGER;

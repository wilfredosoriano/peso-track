-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notifyDaysAhead" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "notifyDueSoon" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyOverdue" BOOLEAN NOT NULL DEFAULT true;

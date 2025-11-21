/*
  Warnings:

  - Added the required column `updatedAt` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Consultation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

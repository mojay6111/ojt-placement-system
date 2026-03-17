/*
  Warnings:

  - You are about to drop the column `gradeLevel` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "gradeLevel",
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "yearAdmitted" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isFirstLogin" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "yearAdmitted" INTEGER,
ALTER COLUMN "role" SET DEFAULT 'STUDENT';

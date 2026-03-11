/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Instructor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Instructor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Instructor" DROP CONSTRAINT "Instructor_departmentID_fkey";

-- AlterTable
ALTER TABLE "Instructor" ADD COLUMN     "email" TEXT NOT NULL,
ALTER COLUMN "departmentID" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_email_key" ON "Instructor"("email");

-- AddForeignKey
ALTER TABLE "Instructor" ADD CONSTRAINT "Instructor_departmentID_fkey" FOREIGN KEY ("departmentID") REFERENCES "Department"("departmentID") ON DELETE SET NULL ON UPDATE CASCADE;

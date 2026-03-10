-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('PLACED_AND_REPORTED', 'PLACED_NOT_REPORTED', 'NOT_PLACED', 'DISCIPLINARY');

-- AlterTable
ALTER TABLE "OJTPlacement" ADD COLUMN     "instructorNote" TEXT,
ADD COLUMN     "placementStatus" "PlacementStatus" NOT NULL DEFAULT 'NOT_PLACED',
ADD COLUMN     "reportedAt" TIMESTAMP(3),
ADD COLUMN     "studentReported" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "gradeLevel" TEXT NOT NULL DEFAULT 'G1';

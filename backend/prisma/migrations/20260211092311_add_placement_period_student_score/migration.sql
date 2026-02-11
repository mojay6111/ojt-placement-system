-- AlterTable
ALTER TABLE "OJTPlacement" ADD COLUMN     "periodID" INTEGER;

-- CreateTable
CREATE TABLE "PlacementPeriod" (
    "periodID" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacementPeriod_pkey" PRIMARY KEY ("periodID")
);

-- CreateTable
CREATE TABLE "StudentScore" (
    "scoreID" SERIAL NOT NULL,
    "studentID" INTEGER NOT NULL,
    "periodID" INTEGER NOT NULL,
    "attendance" DOUBLE PRECISION NOT NULL,
    "academic" DOUBLE PRECISION NOT NULL,
    "behavior" DOUBLE PRECISION,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentScore_pkey" PRIMARY KEY ("scoreID")
);

-- AddForeignKey
ALTER TABLE "OJTPlacement" ADD CONSTRAINT "OJTPlacement_periodID_fkey" FOREIGN KEY ("periodID") REFERENCES "PlacementPeriod"("periodID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentScore" ADD CONSTRAINT "StudentScore_studentID_fkey" FOREIGN KEY ("studentID") REFERENCES "Student"("studentID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentScore" ADD CONSTRAINT "StudentScore_periodID_fkey" FOREIGN KEY ("periodID") REFERENCES "PlacementPeriod"("periodID") ON DELETE CASCADE ON UPDATE CASCADE;

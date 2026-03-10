-- AlterTable
ALTER TABLE "OJTPlacement" ADD COLUMN     "companyID" INTEGER;

-- CreateTable
CREATE TABLE "Company" (
    "companyID" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("companyID")
);

-- AddForeignKey
ALTER TABLE "OJTPlacement" ADD CONSTRAINT "OJTPlacement_companyID_fkey" FOREIGN KEY ("companyID") REFERENCES "Company"("companyID") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "departmentId" INTEGER NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instructor" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "departmentId" INTEGER NOT NULL,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustrialCoordinator" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "IndustrialCoordinator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OJTPlacement" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "coordinatorId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OJTPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OJTVisit" (
    "id" SERIAL NOT NULL,
    "placementId" INTEGER NOT NULL,
    "instructorId" INTEGER NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "OJTVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_email_key" ON "Instructor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "IndustrialCoordinator_email_key" ON "IndustrialCoordinator"("email");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instructor" ADD CONSTRAINT "Instructor_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OJTPlacement" ADD CONSTRAINT "OJTPlacement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OJTPlacement" ADD CONSTRAINT "OJTPlacement_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "IndustrialCoordinator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OJTVisit" ADD CONSTRAINT "OJTVisit_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "OJTPlacement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OJTVisit" ADD CONSTRAINT "OJTVisit_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

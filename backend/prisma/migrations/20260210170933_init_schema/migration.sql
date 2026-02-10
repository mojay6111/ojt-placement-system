-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STUDENT', 'INSTRUCTOR', 'COORDINATOR');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "departmentID" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("departmentID")
);

-- CreateTable
CREATE TABLE "Student" (
    "studentID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "admissionNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "departmentID" INTEGER NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("studentID")
);

-- CreateTable
CREATE TABLE "Instructor" (
    "instructorID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "departmentID" INTEGER NOT NULL,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("instructorID")
);

-- CreateTable
CREATE TABLE "IndustrialCoordinator" (
    "coordinatorID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,

    CONSTRAINT "IndustrialCoordinator_pkey" PRIMARY KEY ("coordinatorID")
);

-- CreateTable
CREATE TABLE "OJTPlacement" (
    "placementID" SERIAL NOT NULL,
    "studentID" INTEGER NOT NULL,
    "coordinatorID" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OJTPlacement_pkey" PRIMARY KEY ("placementID")
);

-- CreateTable
CREATE TABLE "OJTVisit" (
    "visitID" SERIAL NOT NULL,
    "placementID" INTEGER NOT NULL,
    "instructorID" INTEGER NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "OJTVisit_pkey" PRIMARY KEY ("visitID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userID_key" ON "Student"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "Student_admissionNumber_key" ON "Student"("admissionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_userID_key" ON "Instructor"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "IndustrialCoordinator_userID_key" ON "IndustrialCoordinator"("userID");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_departmentID_fkey" FOREIGN KEY ("departmentID") REFERENCES "Department"("departmentID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instructor" ADD CONSTRAINT "Instructor_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instructor" ADD CONSTRAINT "Instructor_departmentID_fkey" FOREIGN KEY ("departmentID") REFERENCES "Department"("departmentID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustrialCoordinator" ADD CONSTRAINT "IndustrialCoordinator_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OJTPlacement" ADD CONSTRAINT "OJTPlacement_studentID_fkey" FOREIGN KEY ("studentID") REFERENCES "Student"("studentID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OJTPlacement" ADD CONSTRAINT "OJTPlacement_coordinatorID_fkey" FOREIGN KEY ("coordinatorID") REFERENCES "IndustrialCoordinator"("coordinatorID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OJTVisit" ADD CONSTRAINT "OJTVisit_placementID_fkey" FOREIGN KEY ("placementID") REFERENCES "OJTPlacement"("placementID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OJTVisit" ADD CONSTRAINT "OJTVisit_instructorID_fkey" FOREIGN KEY ("instructorID") REFERENCES "Instructor"("instructorID") ON DELETE RESTRICT ON UPDATE CASCADE;

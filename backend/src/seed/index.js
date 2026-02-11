// src/seed/index.js
require("dotenv").config();
const prisma = require("../prisma");

async function main() {
  console.log("Seeding database...");

  // 1️⃣ Departments
  let department = await prisma.department.findUnique({
    where: { code: "AUT" },
  });

  if (!department) {
    department = await prisma.department.create({
      data: {
        name: "Automotive Engineering",
        code: "AUT",
      },
    });
    console.log("Inserted Department:", department);
  } else {
    console.log("Department already exists:", department);
  }

  // 2️⃣ Users
  let studentUser = await prisma.user.findUnique({
    where: { email: "john.doe@example.com" },
  });

  if (!studentUser) {
    studentUser = await prisma.user.create({
      data: {
        email: "john.doe@example.com",
        passwordHash: "hashedpassword123",
        role: "STUDENT",
      },
    });
    console.log("Inserted Student User:", studentUser);
  }

  let instructorUser = await prisma.user.findUnique({
    where: { email: "jane.instructor@example.com" },
  });

  if (!instructorUser) {
    instructorUser = await prisma.user.create({
      data: {
        email: "jane.instructor@example.com",
        passwordHash: "hashedpassword123",
        role: "INSTRUCTOR",
      },
    });
    console.log("Inserted Instructor User:", instructorUser);
  }

  let coordinatorUser = await prisma.user.findUnique({
    where: { email: "coordinator@example.com" },
  });

  if (!coordinatorUser) {
    coordinatorUser = await prisma.user.create({
      data: {
        email: "coordinator@example.com",
        passwordHash: "hashedpassword123",
        role: "COORDINATOR",
      },
    });
    console.log("Inserted Coordinator User:", coordinatorUser);
  }

  // 3️⃣ Students
  let student = await prisma.student.findUnique({
    where: { email: "john.doe@example.com" },
  });

  if (!student) {
    student = await prisma.student.create({
      data: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        admissionNumber: "ADM001",
        departmentID: department.departmentID,
        userID: studentUser.id,
      },
    });
    console.log("Inserted Student:", student);
  }

  // 4️⃣ Instructors
  let instructor = await prisma.instructor.findUnique({
    where: { email: "jane.instructor@example.com" },
  });

  if (!instructor) {
    instructor = await prisma.instructor.create({
      data: {
        firstName: "Jane",
        lastName: "Instructor",
        email: "jane.instructor@example.com",
        departmentID: department.departmentID,
        userID: instructorUser.id,
      },
    });
    console.log("Inserted Instructor:", instructor);
  }

  // 5️⃣ Industrial Coordinators
  let coordinator = await prisma.industrialCoordinator.findUnique({
    where: { email: "coordinator@example.com" },
  });

  if (!coordinator) {
    coordinator = await prisma.industrialCoordinator.create({
      data: {
        firstName: "Alice",
        lastName: "Coordinator",
        email: "coordinator@example.com",
        userID: coordinatorUser.id,
      },
    });
    console.log("Inserted Industrial Coordinator:", coordinator);
  }

  // 6️⃣ OJT Placements
  let placement = await prisma.oJTPlacement.findFirst({
    where: {
      studentID: student.studentID,
      coordinatorID: coordinator.coordinatorID,
    },
  });

  if (!placement) {
    placement = await prisma.oJTPlacement.create({
      data: {
        studentID: student.studentID,
        coordinatorID: coordinator.coordinatorID,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)), // +3 months
      },
    });
    console.log("Inserted OJT Placement:", placement);
  }

  // 7️⃣ OJT Visits
  let visit = await prisma.oJTVisit.findFirst({
    where: {
      placementID: placement.placementID,
      instructorID: instructor.instructorID,
    },
  });

  if (!visit) {
    visit = await prisma.oJTVisit.create({
      data: {
        placementID: placement.placementID,
        instructorID: instructor.instructorID,
        visitDate: new Date(),
        notes: "Initial site visit",
      },
    });
    console.log("Inserted OJT Visit:", visit);
  }

  console.log("✅ Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



  
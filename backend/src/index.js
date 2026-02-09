// src/index.js
require("dotenv").config(); // Load .env from the backend root

const { PrismaClient } = require("@prisma/client");
// Use the Prisma Postgres driver adapter, as required by Prisma 7's "client" engine.
// Make sure you have installed: npm install @prisma/adapter-pg pg
let prisma;

try {
  const { PrismaPg } = require("@prisma/adapter-pg");

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Check your .env file in the backend folder.",
    );
  }

  const adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({ adapter });
} catch (err) {
  console.error(
    "Failed to initialize PrismaClient with the Postgres adapter:",
    err,
  );
  process.exit(1);
}

// Simple test to verify the Department table and connection
async function main() {
  const allDepartments = await prisma.department.findMany();
  console.log("Departments:", allDepartments);

  if (allDepartments.length === 0) {
    const newDept = await prisma.department.create({
      data: {
        name: "Automotive Engineering",
        code: "AUT",
      },
    });
    console.log("Inserted department:", newDept);
  }

  // Create a Student
  const student = await prisma.student.create({
    data: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      departmentId: dept.id,
    },
  });
  console.log("Student:", student);

  // Create an Instructor
  const instructor = await prisma.instructor.create({
    data: {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      departmentId: dept.id,
    },
  });
  console.log("Instructor:", instructor);
}

main()
  .catch((e) => {
    console.error("Prisma error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

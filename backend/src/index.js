// src/index.js
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

let prisma;

// --- Prisma v7 adapter setup ---
try {
  const { PrismaPg } = require("@prisma/adapter-pg");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in .env");
  }

  const adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({ adapter });
} catch (err) {
  console.error("Failed to initialize Prisma:", err);
  process.exit(1);
}

// --- Main bootstrap / sanity-check logic ---
async function main() {
  /**
   * 1. Ensure Department exists
   */
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
    console.log("Inserted department:", department);
  } else {
    console.log("Department already exists:", department);
  }

  /**
   * 2. Ensure Student exists
   */
  let student = await prisma.student.findUnique({
    where: { email: "john.doe@example.com" },
  });

  if (!student) {
    student = await prisma.student.create({
      data: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        departmentId: department.id,
      },
    });
    console.log("Inserted student:", student);
  } else {
    console.log("Student already exists:", student);
  }

  /**
   * 3. Ensure Instructor exists
   */
  let instructor = await prisma.instructor.findUnique({
    where: { email: "jane.smith@example.com" },
  });

  if (!instructor) {
    instructor = await prisma.instructor.create({
      data: {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        departmentId: department.id,
      },
    });
    console.log("Inserted instructor:", instructor);
  } else {
    console.log("Instructor already exists:", instructor);
  }

  /**
   * 4. Final verification output
   */
  console.log("Bootstrap completed successfully.");
}

// --- Execute ---
main()
  .catch((err) => {
    console.error("Runtime error:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

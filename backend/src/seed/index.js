// 4️⃣ Instructors
let instructor = await prisma.instructor.findFirst({
  where: { userID: instructorUser.id },
});

if (!instructor) {
  instructor = await prisma.instructor.create({
    data: {
      firstName: "Jane",
      lastName: "Instructor",
      departmentID: department.departmentID,
      userID: instructorUser.id,
    },
  });
  console.log("Inserted Instructor:", instructor);
}

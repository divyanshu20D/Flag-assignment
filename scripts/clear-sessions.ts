import { prisma } from "../lib/prisma";

async function clearSessions() {
  try {
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`Deleted ${deletedSessions.count} sessions`);

    const deletedAccounts = await prisma.account.deleteMany({});
    console.log(`Deleted ${deletedAccounts.count} OAuth accounts`);

    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: "seven.divyanshu@gmail.com",
      },
    });
    console.log(`Deleted ${deletedUsers.count} users`);

    console.log("All sessions and OAuth accounts cleared!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearSessions();

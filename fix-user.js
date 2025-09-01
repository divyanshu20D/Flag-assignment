const { PrismaClient, UserRole } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixUser() {
  try {
    console.log("🔍 Checking current user state...");

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: "divyanshu.designoweb@gmail.com" },
    });

    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log("👤 Current user state:", {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Update user with proper role
    if (!user.role) {
      console.log("🔧 Updating user with role...");
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: UserRole.ADMIN, // Give admin role for testing
        },
      });
      console.log("✅ User updated:", {
        role: updatedUser.role,
      });
    } else {
      console.log("✅ User already has proper role");
    }

    // Verify the fix
    const finalUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    console.log("\n🎯 Final user state:", {
      id: finalUser.id,
      email: finalUser.email,
      name: finalUser.name,
      role: finalUser.role,
    });

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUser();

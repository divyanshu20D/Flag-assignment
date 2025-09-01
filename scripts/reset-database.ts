import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetDatabase() {
    try {
        console.log('🗑️  Clearing all data...')

        // Delete all data in the correct order (respecting foreign key constraints)
        await prisma.auditLog.deleteMany({})
        console.log('   ✅ Cleared audit logs')

        await prisma.rule.deleteMany({})
        console.log('   ✅ Cleared rules')

        await prisma.flag.deleteMany({})
        console.log('   ✅ Cleared flags')

        await prisma.session.deleteMany({})
        console.log('   ✅ Cleared sessions')

        await prisma.account.deleteMany({})
        console.log('   ✅ Cleared accounts')

        await prisma.user.deleteMany({})
        console.log('   ✅ Cleared users')

        await prisma.verificationToken.deleteMany({})
        console.log('   ✅ Cleared verification tokens')

        console.log('\n🎉 Database reset complete!')
        console.log('\n📝 Next steps:')
        console.log('   1. Login with your Google/GitHub account')
        console.log('   2. The first user will be assigned READ_ONLY role by default')
        console.log('   3. Use the update-user-role.ts script to make users ADMIN if needed')
        console.log('   4. Start creating flags and testing the audit system!')

    } catch (error) {
        console.error('❌ Error resetting database:', error)
    } finally {
        await prisma.$disconnect()
    }
}

resetDatabase()
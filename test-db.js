// Test database connection and check for users
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabase() {
    try {
        console.log('🧪 Testing database connection and data...')

        // Test user creation
        const testUser = await prisma.user.create({
            data: {
                email: 'test@example.com',
                name: 'Test User',
                role: 'READ_ONLY'
            }
        })
        console.log('✅ Created test user:', testUser.email)

        // Test flag creation
        const testFlag = await prisma.flag.create({
            data: {
                key: 'test-flag',
                defaultValue: false,
                enabled: true
            }
        })
        console.log('✅ Created test flag:', testFlag.key)

        // Test audit log creation
        const testAuditLog = await prisma.auditLog.create({
            data: {
                action: 'Created',
                flagKey: testFlag.key,
                userId: testUser.id
            }
        })
        console.log('✅ Created test audit log')

        // List all users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        })
        console.log('\n📋 Users in database:')
        users.forEach(user => {
            console.log(`  - ${user.email} (${user.role})`)
        })

        // List all flags
        const flags = await prisma.flag.findMany({
            select: {
                id: true,
                key: true,
                enabled: true,
                defaultValue: true
            }
        })
        console.log('\n🚩 Flags in database:')
        flags.forEach(flag => {
            console.log(`  - ${flag.key} (enabled: ${flag.enabled}, default: ${flag.defaultValue})`)
        })

        // Clean up test data
        await prisma.auditLog.delete({ where: { id: testAuditLog.id } })
        await prisma.flag.delete({ where: { id: testFlag.id } })
        await prisma.user.delete({ where: { id: testUser.id } })
        console.log('\n🧹 Cleaned up test data')

        console.log('\n🎉 Database test completed successfully!')
    } catch (error) {
        console.error('❌ Database test failed:', error)
    } finally {
        await prisma.$disconnect()
    }
}

testDatabase()
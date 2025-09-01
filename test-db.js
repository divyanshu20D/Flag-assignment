// Test database connection and check for users
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabase() {
    try {
        console.log('Testing database connection...')

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                workspaceId: true
            }
        })

        console.log(`✅ Found ${users.length} users:`)
        users.forEach(user => {
            console.log(`  - ${user.email} (${user.role}) in workspace ${user.workspaceId}`)
        })

        if (users.length === 0) {
            console.log('❌ No users found. Please run: npm run db:seed')
        }

        await prisma.$disconnect()
        process.exit(0)
    } catch (error) {
        console.error('❌ Database test failed:', error)
        await prisma.$disconnect()
        process.exit(1)
    }
}

testDatabase()
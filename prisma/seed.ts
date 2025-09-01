import { PrismaClient, UserRole, Comparator } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Create admin user
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            name: 'Admin User',
            role: UserRole.ADMIN,
        },
    })

    // Create read-only user
    const readOnlyUser = await prisma.user.create({
        data: {
            email: 'readonly@example.com',
            name: 'Read Only User',
            role: UserRole.READ_ONLY,
        },
    })

    // Create sample flags
    const newDashboardFlag = await prisma.flag.create({
        data: {
            key: 'new-dashboard',
            defaultValue: false,
            enabled: true,
            rules: {
                create: [
                    {
                        attribute: 'country',
                        comparator: Comparator.IN,
                        value: 'US,CA',
                        rolloutPercentage: 100,
                    },
                    {
                        attribute: 'plan',
                        comparator: Comparator.EQUALS,
                        value: 'pro',
                        rolloutPercentage: 50,
                    },
                ],
            },
        },
    })

    const refactorApiFlag = await prisma.flag.create({
        data: {
            key: 'refactor-api',
            defaultValue: true,
            enabled: false,
        },
    })

    // Create audit logs
    await prisma.auditLog.createMany({
        data: [
            {
                action: 'Created',
                flagKey: 'new-dashboard',
                userId: adminUser.id,
            },
            {
                action: 'Created',
                flagKey: 'refactor-api',
                userId: adminUser.id,
            },
        ],
    })

    console.log('✅ Seed completed successfully!')
    console.log(`   - Admin user: ${adminUser.email}`)
    console.log(`   - Read-only user: ${readOnlyUser.email}`)
    console.log(`   - Flags: ${newDashboardFlag.key}, ${refactorApiFlag.key}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
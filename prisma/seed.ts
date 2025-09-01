import { PrismaClient, UserRole, Comparator } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Create workspace
    const workspace = await prisma.workspace.create({
        data: {
            name: 'Default Workspace',
        },
    })

    // Create admin user
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            name: 'Admin User',
            role: UserRole.ADMIN,
            workspaceId: workspace.id,
        },
    })

    // Create read-only user
    const readOnlyUser = await prisma.user.create({
        data: {
            email: 'readonly@example.com',
            name: 'Read Only User',
            role: UserRole.READ_ONLY,
            workspaceId: workspace.id,
        },
    })

    // Create sample flags
    const newDashboardFlag = await prisma.flag.create({
        data: {
            key: 'new-dashboard',
            defaultValue: false,
            enabled: true,
            workspaceId: workspace.id,
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
            workspaceId: workspace.id,
        },
    })

    // Create audit logs
    await prisma.auditLog.create({
        data: {
            action: 'Created',
            flagKey: 'new-dashboard',
            userId: adminUser.id,
            workspaceId: workspace.id,
        },
    })

    await prisma.auditLog.create({
        data: {
            action: 'Updated',
            flagKey: 'refactor-api',
            userId: adminUser.id,
            workspaceId: workspace.id,
        },
    })

    console.log('Database seeded successfully!')
    console.log(`Workspace: ${workspace.name} (${workspace.id})`)
    console.log(`Admin User: ${adminUser.email}`)
    console.log(`Read-Only User: ${readOnlyUser.email}`)
    console.log(`Flags created: ${newDashboardFlag.key}, ${refactorApiFlag.key}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function updateUserRoles() {
    try {
        // Update seven.divyanshu@gmail.com to ADMIN
        const adminUser = await prisma.user.update({
            where: { email: 'seven.divyanshu@gmail.com' },
            data: { role: UserRole.ADMIN }
        })

        console.log(`✅ Updated ${adminUser.email} (${adminUser.name}) to ADMIN role`)

        // Ensure divyanshu.designoweb@gmail.com is READ_ONLY (it already is, but let's confirm)
        const readOnlyUser = await prisma.user.update({
            where: { email: 'divyanshu.designoweb@gmail.com' },
            data: { role: UserRole.READ_ONLY }
        })

        console.log(`✅ Confirmed ${readOnlyUser.email} (${readOnlyUser.name}) is READ_ONLY role`)

        // Show final user roles
        console.log('\n📋 Final user roles:')
        const allUsers = await prisma.user.findMany({
            select: { email: true, name: true, role: true },
            orderBy: { role: 'asc' }
        })

        allUsers.forEach(user => {
            const roleIcon = user.role === 'ADMIN' ? '👑' : '👤'
            console.log(`${roleIcon} ${user.name} (${user.email}) - ${user.role}`)
        })

    } catch (error) {
        console.error('❌ Error updating user roles:', error)
    } finally {
        await prisma.$disconnect()
    }
}

updateUserRoles()
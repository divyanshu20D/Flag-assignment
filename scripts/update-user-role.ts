import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function updateUserRole(email: string, role: UserRole) {
    try {
        console.log(`🔧 Updating user role for ${email} to ${role}...`)

        const user = await prisma.user.update({
            where: { email },
            data: { role }
        })

        console.log(`✅ User ${user.email} role updated to ${user.role}`)
        return user
    } catch (error) {
        if (error.code === 'P2025') {
            console.error(`❌ User with email ${email} not found`)
        } else {
            console.error('❌ Error updating user role:', error)
        }
        throw error
    }
}

async function main() {
    const args = process.argv.slice(2)
    
    if (args.length !== 2) {
        console.log('Usage: npm run update-role <email> <role>')
        console.log('Roles: ADMIN, READ_ONLY')
        console.log('Example: npm run update-role user@example.com ADMIN')
        process.exit(1)
    }

    const [email, role] = args

    if (!Object.values(UserRole).includes(role as UserRole)) {
        console.error(`❌ Invalid role: ${role}. Valid roles are: ${Object.values(UserRole).join(', ')}`)
        process.exit(1)
    }

    try {
        await updateUserRole(email, role as UserRole)
        console.log('🎉 Role update completed successfully!')
    } catch (error) {
        console.error('❌ Failed to update user role')
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
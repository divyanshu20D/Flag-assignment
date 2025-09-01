import { prisma } from '../lib/prisma'

async function fixOAuthUser() {
    try {
        const email = 'seven.divyanshu@gmail.com'

        // Check if user has any OAuth accounts
        const user = await prisma.user.findUnique({
            where: { email },
            include: { accounts: true, sessions: true }
        })

        if (!user) {
            console.log('User not found')
            return
        }

        console.log(`User found: ${user.email}`)
        console.log(`OAuth accounts: ${user.accounts.length}`)
        console.log(`Sessions: ${user.sessions.length}`)

        if (user.accounts.length === 0) {
            console.log('No OAuth accounts found. This explains the OAuthAccountNotLinked error.')
            console.log('Deleting user record so NextAuth can recreate it properly with OAuth account...')

            // Delete the user (this will cascade delete sessions)
            await prisma.user.delete({
                where: { email }
            })

            console.log('User deleted. Now try signing in with Google again.')
        } else {
            console.log('User has OAuth accounts, the issue might be elsewhere.')
        }

    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

fixOAuthUser()
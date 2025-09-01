import { prisma } from '../lib/prisma'

async function checkUsers() {
    try {
        const users = await prisma.user.findMany({
            include: {
                accounts: true,
                sessions: true,
            },
        })

        console.log('Users in database:')
        users.forEach(user => {
            console.log(`- Email: ${user.email}`)
            console.log(`  Name: ${user.name}`)
            console.log(`  Role: ${user.role}`)
            console.log(`  OAuth accounts: ${user.accounts.length}`)
            console.log(`  Active sessions: ${user.sessions.length}`)
            if (user.accounts.length > 0) {
                user.accounts.forEach(account => {
                    console.log(`    - ${account.provider}: ${account.providerAccountId}`)
                })
            }
            console.log('---')
        })

    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkUsers()
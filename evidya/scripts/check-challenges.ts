import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const challenges = await prisma.codingChallenge.findMany()
    console.log('Challenges in DB:', JSON.stringify(challenges, null, 2))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

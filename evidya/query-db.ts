import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const ideas = await prisma.idea.findMany({
        take: 5,
        include: { user: true }
    })
    console.log('Recent ideas:', JSON.stringify(ideas, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())

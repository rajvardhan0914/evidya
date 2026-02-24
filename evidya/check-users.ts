import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            image: true,
            coverImage: true
        }
    })

    console.log('Checking user data sizes...')
    for (const user of users) {
        const imageSize = user.image ? user.image.length : 0
        const coverSize = user.coverImage ? user.coverImage.length : 0
        const totalSize = imageSize + coverSize

        if (totalSize > 1000) {
            console.log(`WARNING: User ${user.email} has large data!`)
            console.log(`  Image size: ${imageSize} chars`)
            console.log(`  Cover size: ${coverSize} chars`)
            console.log(`  Total: ${totalSize} chars`)
        } else {
            console.log(`OK: User ${user.email} (Total: ${totalSize} chars)`)
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())

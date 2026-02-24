import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.codingChallenge.createMany({
    data: [
      {
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'Easy',
        inputExample: '[2,7,11,15], 9',
        outputExample: '[0,1]'
      },
      {
        title: 'Reverse String',
        description: 'Write a function that reverses a string.',
        difficulty: 'Easy',
        inputExample: '"hello"',
        outputExample: '"olleh"'
      },
      {
        title: 'Valid Parentheses',
        description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
        difficulty: 'Medium',
        inputExample: '"()"',
        outputExample: 'true'
      }
    ]
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
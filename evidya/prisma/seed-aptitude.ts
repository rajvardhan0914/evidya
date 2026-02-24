import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding aptitude questions...')

    const questions = [
        {
            type: 'Logical Reasoning',
            question: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?',
            options: JSON.stringify(['(1/3)', '(1/8)', '(2/8)', '(1/16)']),
            correctAnswer: '(1/8)',
            explanation: 'This is a simple division series; each number is one-half of the previous number.'
        },
        {
            type: 'Logical Reasoning',
            question: 'SCD, TEF, UGH, ____, WKL',
            options: JSON.stringify(['CMN', 'UJI', 'VIJ', 'IJT']),
            correctAnswer: 'VIJ',
            explanation: 'There are two series not interleaved. The first letter series is S, T, U, V, W. The second letter is C, E, G, I, K. The third letter is D, F, H, J, L.'
        },
        {
            type: 'Logical Reasoning',
            question: 'Which word does NOT belong with the others?',
            options: JSON.stringify(['parsley', 'basil', 'dill', 'mayonnaise']),
            correctAnswer: 'mayonnaise',
            explanation: 'Parsley, basil, and dill are types of herbs. Mayonnaise is not an herb.'
        },
        {
            type: 'Quantitative Aptitude',
            question: 'A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?',
            options: JSON.stringify(['120 metres', '180 metres', '324 metres', '150 metres']),
            correctAnswer: '150 metres',
            explanation: 'Speed = 60*(5/18) m/sec = 50/3 m/sec. Length of Train = (Speed x Time) = (50/3) x 9 = 150.'
        },
        {
            type: 'Quantitative Aptitude',
            question: 'A fruit seller had some apples. He sells 40% apples and still has 420 apples. Originally, he had:',
            options: JSON.stringify(['588 apples', '600 apples', '672 apples', '700 apples']),
            correctAnswer: '700 apples',
            explanation: 'Suppose originally he had x apples. Then, (100-40)% of x = 420. 60/100 * x = 420. x = 700.'
        }
    ]

    for (const q of questions) {
        // Avoid duplicates by simple check or just create. Since we don't have a unique key, we can clear or just create.
        // For simplicity in this seed, we'll create only if not many exist.
        await prisma.aptitudeQuestion.create({ data: q })
    }

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

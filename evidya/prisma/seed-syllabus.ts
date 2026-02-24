import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding comprehensive syllabus data...')

    // CBSE 10th Grade Mathematics
    const math10 = await prisma.course.create({
        data: {
            title: 'CBSE 10th Mathematics',
            description: 'Complete CBSE Class 10 Mathematics syllabus with all chapters and topics',
            level: '10th',
            category: 'Mathematics',
            status: 'Free',
            order: 1,
            topics: {
                create: [
                    {
                        title: 'Real Numbers',
                        description: 'Euclid\'s division algorithm, Fundamental Theorem of Arithmetic, proofs of irrationality',
                        order: 1,
                        subtopics: {
                            create: [
                                { title: 'Euclid\'s Division Lemma', content: 'Understanding the division algorithm and its applications', order: 1 },
                                { title: 'Fundamental Theorem of Arithmetic', content: 'Every composite number can be expressed as a product of primes', order: 2 },
                                { title: 'Irrational Numbers', content: 'Proving √2, √3, √5 are irrational', order: 3 }
                            ]
                        }
                    },
                    {
                        title: 'Polynomials',
                        description: 'Zeros of polynomial, relationship between zeros and coefficients',
                        order: 2,
                        subtopics: {
                            create: [
                                { title: 'Geometrical Meaning of Zeros', content: 'Understanding zeros through graphs', order: 1 },
                                { title: 'Relationship between Zeros and Coefficients', content: 'Sum and product of zeros', order: 2 },
                                { title: 'Division Algorithm for Polynomials', content: 'Dividing polynomials and finding remainders', order: 3 }
                            ]
                        }
                    },
                    {
                        title: 'Pair of Linear Equations in Two Variables',
                        description: 'Graphical and algebraic methods of solving linear equations',
                        order: 3
                    },
                    {
                        title: 'Quadratic Equations',
                        description: 'Standard form, factorization, completing the square, quadratic formula',
                        order: 4
                    },
                    {
                        title: 'Arithmetic Progressions',
                        description: 'nth term, sum of first n terms, applications',
                        order: 5
                    },
                    {
                        title: 'Triangles',
                        description: 'Similar triangles, Basic Proportionality Theorem, Pythagoras theorem',
                        order: 6
                    },
                    {
                        title: 'Coordinate Geometry',
                        description: 'Distance formula, section formula, area of triangle',
                        order: 7
                    },
                    {
                        title: 'Introduction to Trigonometry',
                        description: 'Trigonometric ratios, identities, complementary angles',
                        order: 8
                    },
                    {
                        title: 'Heights and Distances',
                        description: 'Applications of trigonometry in real-world problems',
                        order: 9
                    },
                    {
                        title: 'Circles',
                        description: 'Tangent to a circle, number of tangents from a point',
                        order: 10
                    },
                    {
                        title: 'Areas Related to Circles',
                        description: 'Perimeter and area of circle, sectors, segments',
                        order: 11
                    },
                    {
                        title: 'Surface Areas and Volumes',
                        description: 'Combinations of solids, conversion of solid shapes',
                        order: 12
                    },
                    {
                        title: 'Statistics',
                        description: 'Mean, median, mode of grouped data, cumulative frequency',
                        order: 13
                    },
                    {
                        title: 'Probability',
                        description: 'Classical definition of probability, simple problems',
                        order: 14
                    }
                ]
            }
        }
    })

    // CBSE 10th Grade Science
    const science10 = await prisma.course.create({
        data: {
            title: 'CBSE 10th Science',
            description: 'Complete CBSE Class 10 Science syllabus covering Physics, Chemistry, and Biology',
            level: '10th',
            category: 'Science',
            status: 'Free',
            order: 2,
            topics: {
                create: [
                    // Chemistry
                    {
                        title: 'Chemical Reactions and Equations',
                        description: 'Types of chemical reactions, balancing equations',
                        order: 1
                    },
                    {
                        title: 'Acids, Bases and Salts',
                        description: 'Properties, pH scale, importance of pH in daily life',
                        order: 2
                    },
                    {
                        title: 'Metals and Non-metals',
                        description: 'Physical and chemical properties, reactivity series',
                        order: 3
                    },
                    {
                        title: 'Carbon and its Compounds',
                        description: 'Covalent bonding, versatile nature of carbon, functional groups',
                        order: 4
                    },
                    // Biology
                    {
                        title: 'Life Processes',
                        description: 'Nutrition, respiration, transportation, excretion in living organisms',
                        order: 5
                    },
                    {
                        title: 'Control and Coordination',
                        description: 'Nervous system, hormones in animals and plants',
                        order: 6
                    },
                    {
                        title: 'Reproduction',
                        description: 'Modes of reproduction, reproductive health',
                        order: 7
                    },
                    {
                        title: 'Heredity and Evolution',
                        description: 'Mendel\'s contributions, evolution, speciation',
                        order: 8
                    },
                    // Physics
                    {
                        title: 'Light - Reflection and Refraction',
                        description: 'Laws of reflection, spherical mirrors, refraction, lenses',
                        order: 9
                    },
                    {
                        title: 'The Human Eye and Colourful World',
                        description: 'Structure of eye, defects of vision, dispersion',
                        order: 10
                    },
                    {
                        title: 'Electricity',
                        description: 'Electric current, potential difference, Ohm\'s law, resistance',
                        order: 11
                    },
                    {
                        title: 'Magnetic Effects of Electric Current',
                        description: 'Magnetic field, electromagnetic induction, electric motor',
                        order: 12
                    },
                    // Environment
                    {
                        title: 'Our Environment',
                        description: 'Ecosystem, food chains, environmental problems',
                        order: 13
                    }
                ]
            }
        }
    })

    // CBSE 10th Social Science
    const social10 = await prisma.course.create({
        data: {
            title: 'CBSE 10th Social Science',
            description: 'History, Geography, Political Science, and Economics for Class 10',
            level: '10th',
            category: 'Social Science',
            status: 'Free',
            order: 3,
            topics: {
                create: [
                    // History
                    { title: 'The Rise of Nationalism in Europe', order: 1 },
                    { title: 'Nationalism in India', order: 2 },
                    { title: 'The Making of a Global World', order: 3 },
                    { title: 'Print Culture and the Modern World', order: 4 },
                    // Geography
                    { title: 'Resources and Development', order: 5 },
                    { title: 'Forest and Wildlife Resources', order: 6 },
                    { title: 'Water Resources', order: 7 },
                    { title: 'Agriculture', order: 8 },
                    { title: 'Minerals and Energy Resources', order: 9 },
                    { title: 'Manufacturing Industries', order: 10 },
                    { title: 'Lifelines of National Economy', order: 11 },
                    // Political Science
                    { title: 'Power Sharing', order: 12 },
                    { title: 'Federalism', order: 13 },
                    { title: 'Gender, Religion and Caste', order: 14 },
                    { title: 'Political Parties', order: 15 },
                    { title: 'Outcomes of Democracy', order: 16 },
                    // Economics
                    { title: 'Development', order: 17 },
                    { title: 'Sectors of the Indian Economy', order: 18 },
                    { title: 'Money and Credit', order: 19 },
                    { title: 'Globalisation and the Indian Economy', order: 20 }
                ]
            }
        }
    })

    console.log('✅ 10th Grade syllabus seeded successfully!')
    console.log(`   - ${math10.title}`)
    console.log(`   - ${science10.title}`)
    console.log(`   - ${social10.title}`)
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

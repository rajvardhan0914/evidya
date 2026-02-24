import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding coding challenges...')

    const challenges = [
        {
            title: 'Two Sum',
            difficulty: 'Easy',
            description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
            inputExample: 'nums = [2,7,11,15], target = 9',
            outputExample: '[0,1]',
            starterCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your code here
    
};`
        },
        {
            title: 'Reverse String',
            difficulty: 'Easy',
            description: 'Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.',
            inputExample: 's = ["h","e","l","l","o"]',
            outputExample: '["o","l","l","e","h"]',
            starterCode: `/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
var reverseString = function(s) {
    
};`
        },
        {
            title: 'Valid Palindrome',
            difficulty: 'Easy',
            description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.',
            inputExample: 's = "A man, a plan, a canal: Panama"',
            outputExample: 'true',
            starterCode: `/**
 * @param {string} s
 * @return {boolean}
 */
var isPalindrome = function(s) {
    
};`
        },
        {
            title: 'Longest Substring Without Repeating Characters',
            difficulty: 'Medium',
            description: 'Given a string s, find the length of the longest substring without repeating characters.',
            inputExample: 's = "abcabcbb"',
            outputExample: '3',
            starterCode: `/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
    
};`
        },
        {
            title: 'Container With Most Water',
            difficulty: 'Medium',
            description: 'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.',
            inputExample: 'height = [1,8,6,2,5,4,8,3,7]',
            outputExample: '49',
            starterCode: `/**
 * @param {number[]} height
 * @return {number}
 */
var maxArea = function(height) {
    
};`
        }
    ]

    for (const challenge of challenges) {
        await prisma.codingChallenge.upsert({
            where: { title: challenge.title },
            update: challenge,
            create: challenge,
        })
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

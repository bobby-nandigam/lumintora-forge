// ════════════════════════════════════════════════════════════
//  LeetCode-style problem bank.
//  Each problem is solved by writing a single function with a fixed name and
//  signature. The judge (see lib/judge.js) appends a hidden harness that calls
//  that function for every test case and compares the result by deep-equality,
//  so the same problem works in JavaScript and Python with no per-language glue.
//
//  test.input is the argument list passed to the function (spread), and
//  test.expected is the value it must return. Mark a case `hidden: true` to keep
//  it out of the "Run" sample set — it still runs on Submit.
// ════════════════════════════════════════════════════════════

const P = (p) => ({ languages: ['javascript', 'python3'], ...p })

export const PROBLEMS = [
  P({
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    funcName: 'twoSum',
    statement:
      'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`.\n\nYou may assume exactly one solution exists, and you may not use the same element twice. **Return the indices in ascending order.**',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9.' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Exactly one valid answer exists.'],
    starters: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]} indices in ascending order
 */
function twoSum(nums, target) {
  // Your code here
}
`,
      python3: `from typing import List

def twoSum(nums: List[int], target: int) -> List[int]:
    # Your code here
    pass
`,
    },
    tests: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] },
      { input: [[-1, -2, -3, -4, -5], -8], expected: [2, 4], hidden: true },
      { input: [[0, 4, 3, 0], 0], expected: [0, 3], hidden: true },
    ],
  }),

  P({
    id: 'contains-duplicate',
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    funcName: 'containsDuplicate',
    statement:
      'Given an integer array `nums`, return `true` if any value appears **at least twice**, and `false` if every element is distinct.',
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true' },
      { input: 'nums = [1,2,3,4]', output: 'false' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁹ ≤ nums[i] ≤ 10⁹'],
    starters: {
      javascript: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function containsDuplicate(nums) {
  // Your code here
}
`,
      python3: `from typing import List

def containsDuplicate(nums: List[int]) -> bool:
    # Your code here
    pass
`,
    },
    tests: [
      { input: [[1, 2, 3, 1]], expected: true },
      { input: [[1, 2, 3, 4]], expected: false },
      { input: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true, hidden: true },
      { input: [[7]], expected: false, hidden: true },
    ],
  }),

  P({
    id: 'valid-anagram',
    title: 'Valid Anagram',
    difficulty: 'Easy',
    tags: ['String', 'Hash Table', 'Sorting'],
    funcName: 'isAnagram',
    statement:
      'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise. An anagram uses all the original letters exactly once.',
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' },
    ],
    constraints: ['1 ≤ s.length, t.length ≤ 5·10⁴', 's and t consist of lowercase English letters.'],
    starters: {
      javascript: `/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
function isAnagram(s, t) {
  // Your code here
}
`,
      python3: `def isAnagram(s: str, t: str) -> bool:
    # Your code here
    pass
`,
    },
    tests: [
      { input: ['anagram', 'nagaram'], expected: true },
      { input: ['rat', 'car'], expected: false },
      { input: ['a', 'ab'], expected: false, hidden: true },
      { input: ['ab', 'ba'], expected: true, hidden: true },
    ],
  }),

  P({
    id: 'valid-palindrome',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    tags: ['String', 'Two Pointers'],
    funcName: 'isPalindrome',
    statement:
      'A phrase is a palindrome if, after lowercasing and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string `s`, return `true` if it is a palindrome.',
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"', output: 'false' },
    ],
    constraints: ['1 ≤ s.length ≤ 2·10⁵', 's consists of printable ASCII characters.'],
    starters: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
  // Your code here
}
`,
      python3: `def isPalindrome(s: str) -> bool:
    # Your code here
    pass
`,
    },
    tests: [
      { input: ['A man, a plan, a canal: Panama'], expected: true },
      { input: ['race a car'], expected: false },
      { input: [' '], expected: true },
      { input: ['0P'], expected: false, hidden: true },
      { input: ['ab_a'], expected: true, hidden: true },
    ],
  }),

  P({
    id: 'best-time-stock',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    tags: ['Array', 'Dynamic Programming'],
    funcName: 'maxProfit',
    statement:
      'You are given an array `prices` where `prices[i]` is the price of a stock on day `i`. Buy on one day and sell on a later day to maximize profit. Return the maximum profit, or `0` if no profit is possible.',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy at 1, sell at 6.' },
      { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'No profitable transaction.' },
    ],
    constraints: ['1 ≤ prices.length ≤ 10⁵', '0 ≤ prices[i] ≤ 10⁴'],
    starters: {
      javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
  // Your code here
}
`,
      python3: `from typing import List

def maxProfit(prices: List[int]) -> int:
    # Your code here
    pass
`,
    },
    tests: [
      { input: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { input: [[7, 6, 4, 3, 1]], expected: 0 },
      { input: [[1, 2]], expected: 1, hidden: true },
      { input: [[2, 4, 1]], expected: 2, hidden: true },
      { input: [[3, 3, 5, 0, 0, 3, 1, 4]], expected: 4, hidden: true },
    ],
  }),

  P({
    id: 'fizzbuzz',
    title: 'Fizz Buzz',
    difficulty: 'Easy',
    tags: ['Math', 'String', 'Simulation'],
    funcName: 'fizzBuzz',
    statement:
      'Given an integer `n`, return a string array `answer` (1-indexed) where for each `i` from 1 to n:\n\n- `"FizzBuzz"` if i is divisible by 3 **and** 5\n- `"Fizz"` if divisible by 3\n- `"Buzz"` if divisible by 5\n- otherwise the decimal string of `i`',
    examples: [
      { input: 'n = 3', output: '["1","2","Fizz"]' },
      { input: 'n = 5', output: '["1","2","Fizz","4","Buzz"]' },
    ],
    constraints: ['1 ≤ n ≤ 10⁴'],
    starters: {
      javascript: `/**
 * @param {number} n
 * @return {string[]}
 */
function fizzBuzz(n) {
  // Your code here
}
`,
      python3: `from typing import List

def fizzBuzz(n: int) -> List[str]:
    # Your code here
    pass
`,
    },
    tests: [
      { input: [3], expected: ['1', '2', 'Fizz'] },
      { input: [5], expected: ['1', '2', 'Fizz', '4', 'Buzz'] },
      { input: [15], expected: ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz'], hidden: true },
    ],
  }),

  P({
    id: 'reverse-integer',
    title: 'Reverse Integer',
    difficulty: 'Medium',
    tags: ['Math'],
    funcName: 'reverse',
    statement:
      'Given a signed 32-bit integer `x`, return `x` with its digits reversed. If reversing causes the value to fall outside the 32-bit signed range [-2³¹, 2³¹-1], return `0`.',
    examples: [
      { input: 'x = 123', output: '321' },
      { input: 'x = -123', output: '-321' },
      { input: 'x = 120', output: '21' },
    ],
    constraints: ['-2³¹ ≤ x ≤ 2³¹ - 1'],
    starters: {
      javascript: `/**
 * @param {number} x
 * @return {number}
 */
function reverse(x) {
  // Your code here
}
`,
      python3: `def reverse(x: int) -> int:
    # Your code here
    pass
`,
    },
    tests: [
      { input: [123], expected: 321 },
      { input: [-123], expected: -321 },
      { input: [120], expected: 21 },
      { input: [0], expected: 0, hidden: true },
      { input: [1534236469], expected: 0, hidden: true },
    ],
  }),

  P({
    id: 'maximum-subarray',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
    funcName: 'maxSubArray',
    statement:
      'Given an integer array `nums`, find the contiguous subarray with the largest sum and return that sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] sums to 6.' },
      { input: 'nums = [5,4,-1,7,8]', output: '23' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
    starters: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  // Your code here
}
`,
      python3: `from typing import List

def maxSubArray(nums: List[int]) -> int:
    # Your code here
    pass
`,
    },
    tests: [
      { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { input: [[1]], expected: 1 },
      { input: [[5, 4, -1, 7, 8]], expected: 23 },
      { input: [[-1]], expected: -1, hidden: true },
      { input: [[-2, -1]], expected: -1, hidden: true },
    ],
  }),
]

export const getProblem = (id) => PROBLEMS.find((p) => p.id === id)

export const difficultyColor = {
  Easy: '#0f9d6b',
  Medium: '#c2790a',
  Hard: '#e5484d',
}

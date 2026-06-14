import { v4 as uuidv4 } from 'uuid';

export interface UserInMemory {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  college?: string;
  year?: string;
  degree?: string;
  domainInterest?: string;
  targetRole?: string;
  preferredLanguages: string[];
  dreamCompanies: string[];
  skillLevel?: string;
  createdAt: Date;
}

export interface SubmissionInMemory {
  id: string;
  userId: string;
  problemId: string;
  language: string;
  code: string;
  status: string;
  runtime: number;
  memory: number;
  complexityAnalysis: any;
  explanation: string;
  score: number;
  createdAt: Date;
}

export interface InterviewInMemory {
  id: string;
  userId: string;
  type: string;
  mode: string;
  status: string;
  transcript: string;
  scoreConfidence: number;
  scoreCommunication: number;
  scoreLogic: number;
  scoreOptimization: number;
  feedback: string;
  mistakes: string;
  createdAt: Date;
}

export interface ApplicationInMemory {
  id: string;
  userId: string;
  company: string;
  role: string;
  stage: string;
  dateApplied: Date;
  lastUpdate: Date;
  salary: string;
  notes: string;
}

export class InMemoryDb {
  static users: UserInMemory[] = [];
  static submissions: SubmissionInMemory[] = [];
  static interviews: InterviewInMemory[] = [];
  static applications: ApplicationInMemory[] = [];
  static notes: any[] = [];
  static bookmarks: any[] = [];
  static onboarding: Map<string, any> = new Map();
  static streaks: Map<string, { current: number; longest: number; lastActive: Date }> = new Map();
  static notifications: any[] = [];
  static otps: Map<string, string> = new Map();


  static codingProblems = [
    {
      id: 'two-sum',
      title: 'Two Sum',
      difficulty: 'EASY',
      category: 'DSA',
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\n### Example 1:\n```\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n```',
      testCases: JSON.stringify([
        { input: '[2,7,11,15]\n9', output: '[0,1]', isHidden: false },
        { input: '[3,2,4]\n6', output: '[1,2]', isHidden: false },
        { input: '[3,3]\n6', output: '[0,1]', isHidden: true }
      ]),
      templateCode: JSON.stringify({
        javascript: 'function twoSum(nums, target) {\n  // Write your code here\n  \n}',
        python: 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your code here\n        pass',
        cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};',
        java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n};'
      }),
      solutionCode: JSON.stringify({
        javascript: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [map.get(diff), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}',
        python: 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        prevMap = {}\n        for i, n in enumerate(nums):\n            diff = target - n\n            if diff in prevMap:\n                return [prevMap[diff], i]\n            prevMap[n] = i\n        return []'
      }),
      hints: JSON.stringify([
        'Try using a hash map to look up the complement in O(1) time.',
        'Iterate through the array and store elements along with their indices.'
      ])
    },
    {
      id: 'valid-parentheses',
      title: 'Valid Parentheses',
      difficulty: 'EASY',
      category: 'DSA',
      description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n- Open brackets must be closed by the same type of brackets.\n- Open brackets must be closed in the correct order.\n- Every close bracket has a corresponding open bracket of the same type.',
      testCases: JSON.stringify([
        { input: '"()"', output: 'true', isHidden: false },
        { input: '"()[]{}"', output: 'true', isHidden: false },
        { input: '"(]"', output: 'false', isHidden: true }
      ]),
      templateCode: JSON.stringify({
        javascript: 'function isValid(s) {\n  // Write your code here\n  \n}',
        python: 'class Solution:\n    def isValid(self, s: str) -> bool:\n        # Write your code here\n        pass'
      }),
      solutionCode: JSON.stringify({
        javascript: 'function isValid(s) {\n  const stack = [];\n  const pairs = { ")": "(", "}": "{", "]": "[" };\n  for (let c of s) {\n    if (pairs[c]) {\n      if (stack.pop() !== pairs[c]) return false;\n    } else {\n      stack.push(c);\n    }\n  }\n  return stack.length === 0;\n}',
        python: 'class Solution:\n    def isValid(self, s: str) -> bool:\n        stack = []\n        closeToOpen = { ")": "(", "]": "[", "}": "{" }\n        for c in s:\n            if c in closeToOpen:\n                if stack and stack[-1] == closeToOpen[c]:\n                    stack.pop()\n                else:\n                    return False\n            else:\n                stack.append(c)\n        return True if not stack else False'
      }),
      hints: JSON.stringify([
        'Use a Stack data structure.',
        'Push open brackets onto the stack, and when you see a closed bracket, pop and verify if it matches.'
      ])
    },
    {
      id: 'longest-substring-without-repeating-characters',
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'MEDIUM',
      category: 'DSA',
      description: 'Given a string `s`, find the length of the **longest substring** without repeating characters.\n\n### Example 1:\n```\nInput: s = "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with the length of 3.\n```',
      testCases: JSON.stringify([
        { input: '"abcabcbb"', output: '3', isHidden: false },
        { input: '"bbbbb"', output: '1', isHidden: false },
        { input: '"pwwkew"', output: '3', isHidden: true }
      ]),
      templateCode: JSON.stringify({
        javascript: 'function lengthOfLongestSubstring(s) {\n  // Write your code here\n  \n}',
        python: 'class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # Write your code here\n        pass'
      }),
      solutionCode: JSON.stringify({
        javascript: 'function lengthOfLongestSubstring(s) {\n  let set = new Set();\n  let left = 0, maxLen = 0;\n  for (let right = 0; right < s.length; right++) {\n    while (set.has(s[right])) {\n      set.delete(s[left]);\n      left++;\n    }\n    set.add(s[right]);\n    maxLen = Math.max(maxLen, right - left + 1);\n  }\n  return maxLen;\n}',
        python: 'class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        charSet = set()\n        l = 0\n        res = 0\n        for r in range(len(s)):\n            while s[r] in charSet:\n                charSet.remove(s[l])\n                l += 1\n            charSet.add(s[r])\n            res = max(res, r - l + 1)\n        return res'
      }),
      hints: JSON.stringify([
        'Use the sliding window technique with two pointers (left and right).',
        'Maintain a set of characters in the current window. Shrink the window from the left when duplicates occur.'
      ])
    },
    {
      id: 'set-matrix-zeroes',
      title: 'Set Matrix Zeroes',
      difficulty: 'MEDIUM',
      category: 'DSA',
      description: 'Given an `m x n` integer matrix `matrix`, if an element is `0`, set its entire row and column to `0`\'s.\n\nYou must do it in place.\n\n### Example 1:\n```\nInput: matrix = [[1,1,1],[1,0,1],[1,1,1]]\nOutput: [[1,0,1],[0,0,0],[1,0,1]]\n```',
      testCases: JSON.stringify([
        { input: '[[1,1,1],[1,0,1],[1,1,1]]', output: '[[1,0,1],[0,0,0],[1,0,1]]', isHidden: false },
        { input: '[[0,1,2,0],[3,4,5,2],[1,3,1,5]]', output: '[[0,0,0,0],[0,4,5,0],[0,3,1,0]]', isHidden: false }
      ]),
      templateCode: JSON.stringify({
        javascript: 'function setZeroes(matrix) {\n  // Write your code here\n  \n}',
        python: 'class Solution:\n    def setZeroes(self, matrix: List[List[int]]) -> None:\n        # Do not return anything, modify matrix in-place instead.\n        pass'
      }),
      solutionCode: JSON.stringify({
        javascript: 'function setZeroes(matrix) {\n  let rows = matrix.length, cols = matrix[0].length;\n  let rowZero = false, colZero = false;\n  for (let r = 0; r < rows; r++) if (matrix[r][0] === 0) colZero = true;\n  for (let c = 0; c < cols; c++) if (matrix[0][c] === 0) rowZero = true;\n  for (let r = 1; r < rows; r++) {\n    for (let c = 1; c < cols; c++) {\n      if (matrix[r][c] === 0) {\n        matrix[r][0] = 0;\n        matrix[0][c] = 0;\n      }\n    }\n  }\n  for (let r = 1; r < rows; r++) {\n    for (let c = 1; c < cols; c++) {\n      if (matrix[r][0] === 0 || matrix[0][c] === 0) matrix[r][c] = 0;\n    }\n  }\n  if (colZero) for (let r = 0; r < rows; r++) matrix[r][0] = 0;\n  if (rowZero) for (let c = 0; c < cols; c++) matrix[0][c] = 0;\n}',
        python: 'class Solution:\n    def setZeroes(self, matrix: List[List[int]]) -> None:\n        R, C = len(matrix), len(matrix[0])\n        rowZero = False\n        for r in range(R):\n            for c in range(C):\n                if matrix[r][c] == 0:\n                    matrix[0][c] = 0\n                    if r > 0:\n                        matrix[r][0] = 0\n                    else:\n                        rowZero = True\n        for r in range(1, R):\n            for c in range(1, C):\n                if matrix[r][0] == 0 or matrix[0][c] == 0:\n                    matrix[r][c] = 0\n        if matrix[0][0] == 0:\n            for r in range(R):\n                matrix[r][0] = 0\n        if rowZero:\n            for c in range(C):\n                matrix[0][c] = 0'
      }),
      hints: JSON.stringify([
        'Try using the first row and first column of the matrix as marking markers instead of extra memory.',
        'Beware of overlapping indices on row 0 and column 0, use a separate boolean flag for row 0.'
      ])
    },
    {
      id: 'kadanes-algorithm',
      title: 'Kadane\'s Algorithm (Maximum Subarray)',
      difficulty: 'MEDIUM',
      category: 'DSA',
      description: 'Given an integer array `nums`, find the subarray with the largest sum and return its sum.\n\n### Example 1:\n```\nInput: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: The subarray [4,-1,2,1] has the largest sum = 6.\n```',
      testCases: JSON.stringify([
        { input: '[-2,1,-3,4,-1,2,1,-5,4]', output: '6', isHidden: false },
        { input: '[1]', output: '1', isHidden: false },
        { input: '[5,4,-1,7,8]', output: '23', isHidden: true }
      ]),
      templateCode: JSON.stringify({
        javascript: 'function maxSubArray(nums) {\n  // Write your code here\n  \n}',
        python: 'class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        # Write your code here\n        pass'
      }),
      solutionCode: JSON.stringify({
        javascript: 'function maxSubArray(nums) {\n  let maxSoFar = nums[0], maxEndingHere = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);\n    maxSoFar = Math.max(maxSoFar, maxEndingHere);\n  }\n  return maxSoFar;\n}',
        python: 'class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        max_val = nums[0]\n        cur_sum = 0\n        for n in nums:\n            if cur_sum < 0:\n                cur_sum = 0\n            cur_sum += n\n            max_val = max(max_val, cur_sum)\n        return max_val'
      }),
      hints: JSON.stringify([
        'Keep track of the running sum. Reset it to 0 if it goes below 0.',
        'At each step, update the global maximum sum seen so far.'
      ])
    },
    {
      id: 'reverse-linked-list',
      title: 'Reverse Linked List',
      difficulty: 'EASY',
      category: 'DSA',
      description: 'Given the `head` of a singly linked list, reverse the list, and return *the reversed list*.\n\n### Example 1:\n```\nInput: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]\n```',
      testCases: JSON.stringify([
        { input: '[1,2,3,4,5]', output: '[5,4,3,2,1]', isHidden: false },
        { input: '[1,2]', output: '[2,1]', isHidden: false }
      ]),
      templateCode: JSON.stringify({
        javascript: 'function reverseList(head) {\n  // Write your code here\n  \n}',
        python: 'class Solution:\n    def reverseList(self, head: ListNode) -> ListNode:\n        # Write your code here\n        pass'
      }),
      solutionCode: JSON.stringify({
        javascript: 'function reverseList(head) {\n  let prev = null, curr = head;\n  while (curr) {\n    let nextTemp = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = nextTemp;\n  }\n  return prev;\n}',
        python: 'class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        prev, curr = None, head\n        while curr:\n            nxt = curr.next\n            curr.next = prev\n            prev = curr\n            curr = nxt\n        return prev'
      }),
      hints: JSON.stringify([
        'Use three pointers: prev, curr, and next.',
        'Initialize prev as null, curr as head, and iterate re-linking curr.next to prev.'
      ])
    }
  ];

  static aptitudeTests = [
    {
      id: 'apt-quant-1',
      title: 'Quantitative Aptitude Diagnostic Mock',
      category: 'QUANT',
      duration: 10,
      questions: JSON.stringify([
        {
          question: 'A train 120m long passes a telegraph post in 6 seconds. Find the speed of the train in km/hr.',
          options: ['60 km/hr', '72 km/hr', '80 km/hr', '90 km/hr'],
          answer: '72 km/hr',
          explanation: 'Speed = Distance / Time = 120m / 6s = 20 m/s. Convert to km/hr: 20 * 18/5 = 72 km/hr.'
        },
        {
          question: 'The ratio of two numbers is 3:4 and their LCM is 180. The second number is:',
          options: ['30', '45', '60', '80'],
          answer: '60',
          explanation: 'Let numbers be 3x and 4x. LCM = 12x = 180 => x = 15. The second number is 4 * 15 = 60.'
        }
      ])
    },
    {
      id: 'apt-logical-1',
      title: 'Logical Reasoning Basics',
      category: 'LOGICAL',
      duration: 10,
      questions: JSON.stringify([
        {
          question: 'Find the next number in the sequence: 3, 5, 9, 17, 33, ...',
          options: ['50', '65', '49', '60'],
          answer: '65',
          explanation: 'The pattern is *2 - 1. (3*2-1=5, 5*2-1=9, etc.) So, 33*2-1 = 65.'
        }
      ])
    }
  ];

  static aptitudeAttempts: any[] = [];

  // Helper methods
  static getOnboarding(userId: string) {
    return this.onboarding.get(userId) || null;
  }

  static saveOnboarding(userId: string, data: any) {
    this.onboarding.set(userId, data);
    return data;
  }

  static getStreak(userId: string) {
    if (!this.streaks.has(userId)) {
      this.streaks.set(userId, { current: 1, longest: 1, lastActive: new Date() });
    }
    return this.streaks.get(userId)!;
  }

  static incrementStreak(userId: string) {
    const streak = this.getStreak(userId);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - streak.lastActive.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak.current += 1;
      if (streak.current > streak.longest) {
        streak.longest = streak.current;
      }
    } else if (diffDays > 1) {
      streak.current = 1;
    }
    streak.lastActive = today;
    this.streaks.set(userId, streak);
    return streak;
  }
}

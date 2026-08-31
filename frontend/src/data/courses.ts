export type CourseData = {
  slug: string;
  title: string;
  summary?: string;
  description?: string;
  topics?: string[];
  durations?: string[];
};

export const courses: CourseData[] = [
  {
    slug: 'computer-course',
    title: 'Computer Course',
    summary: 'Foundational computer skills for students and professionals.',
    description:
      'A practical, hands-on course covering the essentials of using computers, office software, and basic hardware troubleshooting.',
    topics: [
      'Office Work / MS Office',
      'MS Word',
      'MS Excel',
      'MS PowerPoint',
      'Typing',
      'Windows',
      'Software Installation',
      'Basic Hardware',
      'Other relevant basic computer skills'
    ],
    durations: ['4 months', '6 months', '12 months']
  },
  {
    slug: 'digital-marketing',
    title: 'Digital Marketing',
    summary: 'Practical digital marketing fundamentals tailored for local businesses.',
    description:
      'Core digital marketing concepts and hands-on skills to help learners promote services and small businesses online.',
    topics: [
      'Social media marketing',
      'Content strategy',
      'Paid ads basics',
      'Email marketing',
      'Analytics and reporting'
    ],
    durations: ['2 months', '4 months']
  }
];

export type User = { name: string; email: string; role: string };
export type Option = {
  id?: number;
  optionText: string;
  isCorrect?: boolean;
  orderIndex: number;
};
export type Question = {
  id: number;
  quizId: number;
  type: string;
  questionText: string;
  maxScore: number;
  orderIndex: number;
  options: Option[];
};
export type Quiz = {
  id: number;
  title: string;
  description: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
};
export type Submission = {
  submissionId: number;
  userId: number;
  userName: string;
  userEmail: string;
  submittedAt: string;
};
export type SubmissionDetail = Submission & {
  quizId: number;
  answers: {
    answerId: number;
    questionId: number;
    questionText: string;
    questionType: string;
    maxScore: number;
    selectedOptionId: number | null;
    essayAnswer: string | null;
    selectedOptionText: string | null;
    correctOptionText: string | null;
    isCorrect: boolean | null;
    score: number;
    allOptions: Option[];
  }[];
};

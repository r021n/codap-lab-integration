import { apiClient } from "./client";

export type QuizOption = {
  id?: number;
  optionText: string;
  isCorrect?: boolean;
  orderIndex: number;
};

export type QuizQuestion = {
  id: number;
  quizId: number;
  type: string;
  questionText: string;
  maxScore: number;
  orderIndex: number;
  options: QuizOption[];
};

export type Quiz = {
  id: number;
  title: string;
  description: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: QuizQuestion[];
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
    allOptions: QuizOption[];
  }[];
};

type CreateQuizPayload = {
  title: string;
  description: string;
};

type UpdateQuizPayload = {
  isPublished: boolean;
};

type QuestionPayload = {
  type: "multiple_choice" | "essay";
  questionText: string;
  maxScore?: number;
  options?: { optionText: string; isCorrect: boolean }[];
};

type SubmitQuizPayload = {
  answers: {
    questionId: number;
    selectedOptionId: number | null;
    essayAnswer: string | null;
  }[];
};

export async function getQuizzes(): Promise<Quiz[]> {
  const { data } = await apiClient.get<Quiz[]>("/quizzes");
  return data;
}

export async function getQuizDetail(
  quizId: number,
): Promise<Quiz & { questions: QuizQuestion[] }> {
  const { data } = await apiClient.get<Quiz & { questions: QuizQuestion[] }>(
    `/quizzes/${quizId}`,
  );
  return data;
}

export async function createQuiz(payload: CreateQuizPayload): Promise<void> {
  await apiClient.post("/quizzes", payload);
}

export async function updateQuiz(
  quizId: number,
  payload: UpdateQuizPayload,
): Promise<void> {
  await apiClient.put(`/quizzes/${quizId}`, payload);
}

export async function deleteQuiz(quizId: number): Promise<void> {
  await apiClient.delete(`/quizzes/${quizId}`);
}

export async function submitQuiz(
  quizId: number,
  payload: SubmitQuizPayload,
): Promise<{ message: string; submissionId: number }> {
  const { data } = await apiClient.post<{ message: string; submissionId: number }>(
    `/quizzes/${quizId}/submit`,
    payload,
  );
  return data;
}

export async function addQuestion(
  quizId: number,
  payload: QuestionPayload,
): Promise<void> {
  await apiClient.post(`/quizzes/${quizId}/questions`, payload);
}

export async function updateQuestion(
  questionId: number,
  payload: QuestionPayload,
): Promise<void> {
  await apiClient.put(`/quizzes/questions/${questionId}`, payload);
}

export async function deleteQuestion(questionId: number): Promise<void> {
  await apiClient.delete(`/quizzes/questions/${questionId}`);
}

export async function reorderQuestions(
  quizId: number,
  orderedIds: number[],
): Promise<void> {
  await apiClient.put(`/quizzes/${quizId}/reorder`, { orderedIds });
}

export async function getSubmissions(quizId: number): Promise<Submission[]> {
  const { data } = await apiClient.get<Submission[]>(
    `/quizzes/${quizId}/submissions`,
  );
  return data;
}

export async function getSubmissionDetail(
  submissionId: number,
): Promise<SubmissionDetail> {
  const { data } = await apiClient.get<SubmissionDetail>(
    `/quizzes/submissions/${submissionId}`,
  );
  return data;
}

export async function updateSubmissionScores(
  submissionId: number,
  scores: { answerId: number; score: number }[],
): Promise<void> {
  await apiClient.put(`/quizzes/submissions/${submissionId}/scores`, { scores });
}

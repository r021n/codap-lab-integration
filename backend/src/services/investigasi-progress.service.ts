import { and, asc, eq } from "drizzle-orm";
import { db } from "../db/db";
import { investigationStepCompletions } from "../db/schema";

export const MIN_INVESTIGASI_STEP = 1;
export const MAX_INVESTIGASI_STEP = 5;

export const isValidInvestigasiStep = (stepId: number): boolean => {
  return (
    Number.isInteger(stepId) &&
    stepId >= MIN_INVESTIGASI_STEP &&
    stepId <= MAX_INVESTIGASI_STEP
  );
};

export const parseInvestigasiStepId = (value: unknown): number | null => {
  if (typeof value === "number") {
    return isValidInvestigasiStep(value) ? value : null;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    if (!Number.isInteger(parsed)) {
      return null;
    }

    return isValidInvestigasiStep(parsed) ? parsed : null;
  }

  if (Array.isArray(value) && value.length > 0) {
    return parseInvestigasiStepId(value[0]);
  }

  return null;
};

export const getCompletedInvestigasiSteps = async (
  userId: number,
): Promise<number[]> => {
  const completions = await db
    .select({ stepId: investigationStepCompletions.stepId })
    .from(investigationStepCompletions)
    .where(eq(investigationStepCompletions.userId, userId))
    .orderBy(asc(investigationStepCompletions.stepId));

  return completions.map((completion) => completion.stepId);
};

const isStepCompleted = async (
  userId: number,
  stepId: number,
): Promise<boolean> => {
  const completion = await db
    .select({ id: investigationStepCompletions.id })
    .from(investigationStepCompletions)
    .where(
      and(
        eq(investigationStepCompletions.userId, userId),
        eq(investigationStepCompletions.stepId, stepId),
      ),
    )
    .limit(1);

  return completion.length > 0;
};

export const canAccessInvestigasiStep = async ({
  userId,
  userRole,
  stepId,
}: {
  userId: number;
  userRole: string;
  stepId: number;
}): Promise<boolean> => {
  if (userRole === "admin") return true;
  if (stepId === MIN_INVESTIGASI_STEP) return true;

  return isStepCompleted(userId, stepId - 1);
};

export const completeInvestigasiStep = async (
  userId: number,
  stepId: number,
): Promise<number[]> => {
  await db
    .insert(investigationStepCompletions)
    .values({
      userId,
      stepId,
    })
    .onConflictDoNothing({
      target: [
        investigationStepCompletions.userId,
        investigationStepCompletions.stepId,
      ],
    });

  return getCompletedInvestigasiSteps(userId);
};

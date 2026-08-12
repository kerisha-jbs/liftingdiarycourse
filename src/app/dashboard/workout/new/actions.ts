"use server";

import { z } from "zod";

import { createWorkoutForCurrentUser } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().trim().min(1).max(255).nullable(),
  startedAt: z.date(),
  exerciseIds: z.array(z.guid()),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkout(input: CreateWorkoutInput) {
  const data = createWorkoutSchema.parse(input);

  return createWorkoutForCurrentUser(data);
}

"use server";

import { z } from "zod";

import { updateWorkoutForCurrentUser } from "@/data/workouts";
import {
  createSetForCurrentUser,
  deleteSetForCurrentUser,
  updateSetForCurrentUser,
} from "@/data/sets";

const updateWorkoutSchema = z.object({
  workoutId: z.guid(),
  name: z.string().trim().min(1).max(255).nullable(),
  startedAt: z.date(),
});

type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;

export async function updateWorkout(input: UpdateWorkoutInput) {
  const data = updateWorkoutSchema.parse(input);

  return updateWorkoutForCurrentUser(data.workoutId, {
    name: data.name,
    startedAt: data.startedAt,
  });
}

const createSetSchema = z.object({
  workoutExerciseId: z.guid(),
  setNumber: z.number().int().positive(),
  weight: z.string().trim().min(1),
  reps: z.number().int().positive(),
});

type CreateSetInput = z.infer<typeof createSetSchema>;

export async function createSet(input: CreateSetInput) {
  const data = createSetSchema.parse(input);

  return createSetForCurrentUser(data);
}

const updateSetSchema = z.object({
  setId: z.guid(),
  weight: z.string().trim().min(1),
  reps: z.number().int().positive(),
  completed: z.boolean(),
});

type UpdateSetInput = z.infer<typeof updateSetSchema>;

export async function updateSet(input: UpdateSetInput) {
  const data = updateSetSchema.parse(input);

  return updateSetForCurrentUser(data.setId, {
    weight: data.weight,
    reps: data.reps,
    completed: data.completed,
  });
}

const deleteSetSchema = z.object({
  setId: z.guid(),
});

type DeleteSetInput = z.infer<typeof deleteSetSchema>;

export async function deleteSet(input: DeleteSetInput) {
  const data = deleteSetSchema.parse(input);

  await deleteSetForCurrentUser(data.setId);
}

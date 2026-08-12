import "server-only";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { sets } from "@/db/schema";

async function assertWorkoutExerciseOwnedByCurrentUser(
  workoutExerciseId: string,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const owned = await db.query.workoutExercises.findFirst({
    where: {
      id: workoutExerciseId,
    },
    with: {
      workout: true,
    },
  });

  if (!owned || owned.workout?.userId !== userId) {
    throw new Error("Workout exercise not found");
  }

  return userId;
}

export async function createSetForCurrentUser(data: {
  workoutExerciseId: string;
  setNumber: number;
  weight: string;
  reps: number;
}) {
  await assertWorkoutExerciseOwnedByCurrentUser(data.workoutExerciseId);

  const [set] = await db
    .insert(sets)
    .values({
      workoutExerciseId: data.workoutExerciseId,
      setNumber: data.setNumber,
      weight: data.weight,
      reps: data.reps,
    })
    .returning();

  return set;
}

export async function updateSetForCurrentUser(
  setId: string,
  data: {
    weight: string;
    reps: number;
    completed: boolean;
  },
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const existing = await db.query.sets.findFirst({
    where: {
      id: setId,
    },
    with: {
      workoutExercise: {
        with: {
          workout: true,
        },
      },
    },
  });

  if (!existing || existing.workoutExercise?.workout?.userId !== userId) {
    throw new Error("Set not found");
  }

  const [set] = await db
    .update(sets)
    .set({
      weight: data.weight,
      reps: data.reps,
      completed: data.completed,
    })
    .where(eq(sets.id, setId))
    .returning();

  return set;
}

export async function deleteSetForCurrentUser(setId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const existing = await db.query.sets.findFirst({
    where: {
      id: setId,
    },
    with: {
      workoutExercise: {
        with: {
          workout: true,
        },
      },
    },
  });

  if (!existing || existing.workoutExercise?.workout?.userId !== userId) {
    throw new Error("Set not found");
  }

  await db.delete(sets).where(eq(sets.id, setId));
}

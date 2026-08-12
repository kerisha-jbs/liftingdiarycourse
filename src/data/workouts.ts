import "server-only";

import { auth } from "@clerk/nextjs/server";
import { endOfDay, startOfDay } from "date-fns";

import { db } from "@/db";
import { workoutExercises, workouts } from "@/db/schema";

export async function getWorkoutsForCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  return db.query.workouts.findMany({
    where: {
      userId,
    },
    orderBy: {
      startedAt: "desc",
    },
    with: {
      workoutExercises: {
        orderBy: {
          order: "asc",
        },
        with: {
          exercise: true,
          sets: {
            orderBy: {
              setNumber: "asc",
            },
          },
        },
      },
    },
  });
}

export async function createWorkoutForCurrentUser(data: {
  name: string | null;
  startedAt: Date;
  exerciseIds: string[];
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const [workout] = await db
    .insert(workouts)
    .values({
      userId,
      name: data.name,
      startedAt: data.startedAt,
    })
    .returning();

  if (data.exerciseIds.length > 0) {
    await db.insert(workoutExercises).values(
      data.exerciseIds.map((exerciseId, index) => ({
        workoutId: workout.id,
        exerciseId,
        order: index,
      })),
    );
  }

  return workout;
}

export async function getWorkoutsForCurrentUserByDate(date: Date) {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  return db.query.workouts.findMany({
    where: {
      userId,
      startedAt: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
    },
    orderBy: {
      startedAt: "desc",
    },
    with: {
      workoutExercises: {
        orderBy: {
          order: "asc",
        },
        with: {
          exercise: true,
          sets: {
            orderBy: {
              setNumber: "asc",
            },
          },
        },
      },
    },
  });
}

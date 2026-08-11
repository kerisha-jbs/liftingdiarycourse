import "server-only";

import { auth } from "@clerk/nextjs/server";
import { endOfDay, startOfDay } from "date-fns";

import { db } from "@/db";

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

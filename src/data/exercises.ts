import "server-only";

import { db } from "@/db";

export async function getAllExercises() {
  return db.query.exercises.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

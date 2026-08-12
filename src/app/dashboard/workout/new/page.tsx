import { getAllExercises } from "@/data/exercises";

import { NewWorkoutForm } from "./new-workout-form";

export default async function NewWorkoutPage() {
  const exercises = await getAllExercises();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-4 py-12 dark:bg-black sm:px-8">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
        <h1 className="text-3xl font-bold tracking-tight">New Workout</h1>

        <NewWorkoutForm exercises={exercises} />
      </div>
    </div>
  );
}

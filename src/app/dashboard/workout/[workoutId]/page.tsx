import { notFound } from "next/navigation";

import { getWorkoutByIdForCurrentUser } from "@/data/workouts";

import { EditWorkoutForm } from "./edit-workout-form";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  const workout = await getWorkoutByIdForCurrentUser(workoutId);

  if (!workout) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-4 py-12 dark:bg-black sm:px-8">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Workout</h1>

        <EditWorkoutForm workout={workout} />
      </div>
    </div>
  );
}

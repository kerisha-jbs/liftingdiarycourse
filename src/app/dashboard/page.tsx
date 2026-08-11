import { isValid, parse } from "date-fns";

import { getWorkoutsForCurrentUserByDate } from "@/data/workouts";

import { WorkoutCalendar } from "./workout-calendar";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const { date: dateParam } = await searchParams;
  const parsedDate =
    typeof dateParam === "string" ? parse(dateParam, "yyyy-MM-dd", new Date()) : null;
  const selectedDate = parsedDate && isValid(parsedDate) ? parsedDate : new Date();

  const workouts = await getWorkoutsForCurrentUserByDate(selectedDate);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-4 py-12 dark:bg-black sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Workout Dashboard
        </h1>

        <WorkoutCalendar workouts={workouts} selectedDate={selectedDate} />
      </div>
    </div>
  );
}

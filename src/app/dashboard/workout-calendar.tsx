"use client";

import { useRouter } from "next/navigation";
import { format, formatDistanceStrict } from "date-fns";
import { Dumbbell } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { getWorkoutsForCurrentUserByDate } from "@/data/workouts";

type Workout = Awaited<ReturnType<typeof getWorkoutsForCurrentUserByDate>>[number];
type WorkoutExercise = Workout["workoutExercises"][number];

function isExerciseCompleted(workoutExercise: WorkoutExercise) {
  return (
    workoutExercise.sets.length > 0 &&
    workoutExercise.sets.every((set) => set.completed)
  );
}

export function WorkoutCalendar({
  workouts,
  selectedDate,
}: {
  workouts: Workout[];
  selectedDate: Date;
}) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr]">
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold tracking-tight">Select Date</h2>
        <Card className="w-fit p-0">
          <CardContent className="p-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) =>
                date && router.push(`/dashboard?date=${format(date, "yyyy-MM-dd")}`)
              }
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold tracking-tight">
          Workouts for {format(selectedDate, "do MMM yyyy")}
        </h2>

        {workouts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <Dumbbell className="size-6" />
              <p className="text-sm">No workouts logged for this date.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {workouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between font-bold">
                    <span>{workout.name ?? "Workout"}</span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {format(workout.startedAt, "h:mm a")}
                      {workout.completedAt &&
                        ` · ${formatDistanceStrict(workout.startedAt, workout.completedAt)}`}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {workout.workoutExercises.map((workoutExercise, index) => (
                    <div key={workoutExercise.id} className="flex flex-col gap-2">
                      {index > 0 && <Separator />}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {workoutExercise.exercise?.name}
                        </span>
                        <Badge
                          variant={
                            isExerciseCompleted(workoutExercise)
                              ? "default"
                              : "outline"
                          }
                        >
                          {isExerciseCompleted(workoutExercise)
                            ? "Completed"
                            : "Incomplete"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

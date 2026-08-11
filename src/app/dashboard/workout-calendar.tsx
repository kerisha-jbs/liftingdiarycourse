"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Dumbbell } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { getWorkoutsForCurrentUserByDate } from "@/data/workouts";

type Workout = Awaited<ReturnType<typeof getWorkoutsForCurrentUserByDate>>[number];

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
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {workout.workoutExercises.map((workoutExercise) => (
                      <Badge key={workoutExercise.id} variant="secondary">
                        {workoutExercise.exercise?.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

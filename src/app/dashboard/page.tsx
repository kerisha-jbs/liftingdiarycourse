"use client";

import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { Dumbbell } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Workout = {
  id: string;
  date: Date;
  name: string;
  time: string;
  durationMinutes: number;
  exercises: { name: string; sets: number; reps: number; weight: number }[];
};

const today = new Date();

const mockWorkouts: Workout[] = [
  {
    id: "1",
    date: today,
    name: "Push Day",
    time: "9:00 AM",
    durationMinutes: 45,
    exercises: [
      { name: "Bench Press", sets: 4, reps: 8, weight: 80 },
      { name: "Overhead Press", sets: 3, reps: 10, weight: 45 },
      { name: "Tricep Pushdown", sets: 3, reps: 12, weight: 25 },
    ],
  },
  {
    id: "2",
    date: today,
    name: "Evening Accessories",
    time: "6:00 PM",
    durationMinutes: 30,
    exercises: [
      { name: "Lateral Raise", sets: 3, reps: 15, weight: 10 },
      { name: "Face Pull", sets: 3, reps: 15, weight: 20 },
    ],
  },
];

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const workoutsForDate = mockWorkouts.filter((workout) =>
    isSameDay(workout.date, selectedDate)
  );

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-4 py-12 dark:bg-black sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Workout Dashboard
        </h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr]">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold tracking-tight">Select Date</h2>
            <Card className="w-fit p-0">
              <CardContent className="p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold tracking-tight">
              Workouts for {format(selectedDate, "do MMM yyyy")}
            </h2>

            {workoutsForDate.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                  <Dumbbell className="size-6" />
                  <p className="text-sm">No workouts logged for this date.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {workoutsForDate.map((workout) => (
                  <Card key={workout.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between font-bold">
                        <span>{workout.name}</span>
                        <span className="text-sm font-medium text-muted-foreground">
                          {workout.time}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-2">
                        {workout.exercises.map((exercise) => (
                          <Badge key={exercise.name} variant="secondary">
                            {exercise.name}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Duration: {workout.durationMinutes} min
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

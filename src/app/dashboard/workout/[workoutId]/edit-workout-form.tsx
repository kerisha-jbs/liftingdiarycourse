"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { getWorkoutByIdForCurrentUser } from "@/data/workouts";

import { createSet, deleteSet, updateSet, updateWorkout } from "./actions";

type Workout = NonNullable<
  Awaited<ReturnType<typeof getWorkoutByIdForCurrentUser>>
>;
type WorkoutExercise = Workout["workoutExercises"][number];
type WorkoutSet = WorkoutExercise["sets"][number];

function SetRow({ set }: { set: WorkoutSet }) {
  const [weight, setWeight] = useState(set.weight);
  const [reps, setReps] = useState(String(set.reps));
  const [completed, setCompleted] = useState(set.completed);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function saveChanges(next: {
    weight?: string;
    reps?: string;
    completed?: boolean;
  }) {
    const nextWeight = next.weight ?? weight;
    const nextReps = next.reps ?? reps;
    const nextCompleted = next.completed ?? completed;

    const parsedReps = Number.parseInt(nextReps, 10);
    if (nextWeight.trim().length === 0 || Number.isNaN(parsedReps)) {
      return;
    }

    startTransition(async () => {
      await updateSet({
        setId: set.id,
        weight: nextWeight,
        reps: parsedReps,
        completed: nextCompleted,
      });
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteSet({ setId: set.id });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-sm text-muted-foreground">
        #{set.setNumber}
      </span>
      <Input
        aria-label="Weight"
        className="w-20"
        value={weight}
        disabled={isPending}
        onChange={(event) => setWeight(event.target.value)}
        onBlur={() => saveChanges({ weight })}
      />
      <Input
        aria-label="Reps"
        className="w-16"
        value={reps}
        disabled={isPending}
        onChange={(event) => setReps(event.target.value)}
        onBlur={() => saveChanges({ reps })}
      />
      <Checkbox
        aria-label="Completed"
        checked={completed}
        disabled={isPending}
        onCheckedChange={(checked) => {
          const nextCompleted = checked === true;
          setCompleted(nextCompleted);
          saveChanges({ completed: nextCompleted });
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isPending}
        onClick={handleDelete}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

function ExerciseCard({ workoutExercise }: { workoutExercise: WorkoutExercise }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAddSet() {
    const nextSetNumber = workoutExercise.sets.length + 1;

    startTransition(async () => {
      await createSet({
        workoutExerciseId: workoutExercise.id,
        setNumber: nextSetNumber,
        weight: "0",
        reps: 0,
      });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium">{workoutExercise.exercise?.name}</span>

      <div className="flex flex-col gap-2">
        {workoutExercise.sets.map((set) => (
          <SetRow key={set.id} set={set} />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={handleAddSet}
      >
        Add set
      </Button>
    </div>
  );
}

export function EditWorkoutForm({ workout }: { workout: Workout }) {
  const [name, setName] = useState(workout.name ?? "");
  const [startedAt, setStartedAt] = useState(() =>
    format(workout.startedAt, "yyyy-MM-dd'T'HH:mm"),
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const parsedStartedAt = new Date(startedAt);

      await updateWorkout({
        workoutId: workout.id,
        name: name.trim().length > 0 ? name.trim() : null,
        startedAt: parsedStartedAt,
      });

      router.push(`/dashboard?date=${format(parsedStartedAt, "yyyy-MM-dd")}`);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Workout name</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Push day"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="startedAt">Date & time</Label>
              <Input
                id="startedAt"
                type="datetime-local"
                value={startedAt}
                onChange={(event) => setStartedAt(event.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save workout"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Exercises</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {workout.workoutExercises.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No exercises in this workout.
            </p>
          ) : (
            workout.workoutExercises.map((workoutExercise, index) => (
              <div key={workoutExercise.id} className="flex flex-col gap-3">
                {index > 0 && <Separator />}
                <ExerciseCard workoutExercise={workoutExercise} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

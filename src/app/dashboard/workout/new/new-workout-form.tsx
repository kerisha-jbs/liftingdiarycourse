"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { getAllExercises } from "@/data/exercises";

import { createWorkout } from "./actions";

export function NewWorkoutForm({
  exercises,
}: {
  exercises: Awaited<ReturnType<typeof getAllExercises>>;
}) {
  const [name, setName] = useState("");
  const [startedAt, setStartedAt] = useState(() =>
    new Date().toISOString().slice(0, 16),
  );
  const [exerciseId, setExerciseId] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const parsedStartedAt = new Date(startedAt);

      await createWorkout({
        name: name.trim().length > 0 ? name.trim() : null,
        startedAt: parsedStartedAt,
        exerciseIds: exerciseId.length > 0 ? [exerciseId] : [],
      });

      router.push(`/dashboard?date=${format(parsedStartedAt, "yyyy-MM-dd")}`);
    });
  }

  return (
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="exercise">Exercise</Label>
            <Select
              value={exerciseId}
              onValueChange={(value) => setExerciseId(value ?? "")}
            >
              <SelectTrigger id="exercise" className="w-full">
                <SelectValue placeholder="Select an exercise">
                  {(value: string | null) =>
                    exercises.find((exercise) => exercise.id === value)?.name ??
                    "Select an exercise"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {exercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create workout"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

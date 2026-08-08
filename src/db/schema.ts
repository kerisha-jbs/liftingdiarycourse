import { defineRelations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const exercises = pgTable('exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const workouts = pgTable(
  'workouts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    name: text('name'),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('workouts_user_id_idx').on(table.userId)],
);

export const workoutExercises = pgTable(
  'workout_exercises',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workoutId: uuid('workout_id')
      .notNull()
      .references(() => workouts.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'restrict' }),
    order: integer('order').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('workout_exercises_workout_id_idx').on(table.workoutId)],
);

export const sets = pgTable(
  'sets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workoutExerciseId: uuid('workout_exercise_id')
      .notNull()
      .references(() => workoutExercises.id, { onDelete: 'cascade' }),
    setNumber: integer('set_number').notNull(),
    weight: numeric('weight').notNull(),
    reps: integer('reps').notNull(),
    completed: boolean('completed').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('sets_workout_exercise_id_idx').on(table.workoutExerciseId)],
);

export const schema = { exercises, workouts, workoutExercises, sets };

export const relations = defineRelations(schema, (r) => ({
  exercises: {
    workoutExercises: r.many.workoutExercises(),
  },
  workouts: {
    workoutExercises: r.many.workoutExercises(),
  },
  workoutExercises: {
    workout: r.one.workouts({
      from: r.workoutExercises.workoutId,
      to: r.workouts.id,
    }),
    exercise: r.one.exercises({
      from: r.workoutExercises.exerciseId,
      to: r.exercises.id,
    }),
    sets: r.many.sets(),
  },
  sets: {
    workoutExercise: r.one.workoutExercises({
      from: r.sets.workoutExerciseId,
      to: r.workoutExercises.id,
    }),
  },
}));

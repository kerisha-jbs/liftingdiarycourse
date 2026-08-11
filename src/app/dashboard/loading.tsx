import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-4 py-12 dark:bg-black sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Workout Dashboard
        </h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr]">
          <Card className="h-[22rem] w-[19.5rem] animate-pulse" />
          <Card className="h-[22rem] animate-pulse">
            <CardContent />
          </Card>
        </div>
      </div>
    </div>
  );
}

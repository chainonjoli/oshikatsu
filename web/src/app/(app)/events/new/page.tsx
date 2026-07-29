import { requireUser } from "@/lib/auth";
import { createEventAction } from "@/lib/actions/events";
import { todayJST } from "@/lib/dates";
import EventForm from "@/components/EventForm";
import { ErrorBanner } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireUser();
  const { error } = await searchParams;

  return (
    <main>
      <h1 className="mb-4 text-xl font-bold">予定を登録</h1>
      <ErrorBanner message={error} />
      <EventForm action={createEventAction} defaultDate={todayJST()} submitLabel="保存する" />
    </main>
  );
}

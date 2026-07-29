"use client";

import { useRouter } from "next/navigation";
import { addEvent } from "@/lib/store";
import { todayJST } from "@/lib/dates";
import EventForm from "@/components/EventForm";

export default function NewEventPage() {
  const router = useRouter();

  return (
    <main>
      <h1 className="mb-4 text-xl font-bold">予定を登録</h1>
      <EventForm
        defaultDate={todayJST()}
        submitLabel="保存する"
        onSave={(input) => {
          addEvent(input);
          router.push(`/calendar/?m=${input.date.slice(0, 7)}`);
        }}
      />
    </main>
  );
}

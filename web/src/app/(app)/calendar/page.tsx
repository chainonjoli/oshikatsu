import { Suspense } from "react";
import CalendarClient from "./CalendarClient";

export default function CalendarPage() {
  return (
    <Suspense fallback={<main className="py-20" />}>
      <CalendarClient />
    </Suspense>
  );
}

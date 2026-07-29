import { Suspense } from "react";
import TodayViewClient from "./TodayViewClient";

export default function TodayViewPage() {
  return (
    <Suspense fallback={<main className="py-20" />}>
      <TodayViewClient />
    </Suspense>
  );
}

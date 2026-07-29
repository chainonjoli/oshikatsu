import { Suspense } from "react";
import ChecklistViewClient from "./ChecklistViewClient";

export default function ChecklistViewPage() {
  return (
    <Suspense fallback={<main className="py-20" />}>
      <ChecklistViewClient />
    </Suspense>
  );
}

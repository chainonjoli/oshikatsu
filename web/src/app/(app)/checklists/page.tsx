import { Suspense } from "react";
import ChecklistsClient from "./ChecklistsClient";

export default function ChecklistsPage() {
  return (
    <Suspense fallback={<main className="py-20" />}>
      <ChecklistsClient />
    </Suspense>
  );
}

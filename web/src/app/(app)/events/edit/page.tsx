import { Suspense } from "react";
import EditEventClient from "./EditEventClient";

export default function EditEventPage() {
  return (
    <Suspense fallback={<main className="py-20" />}>
      <EditEventClient />
    </Suspense>
  );
}

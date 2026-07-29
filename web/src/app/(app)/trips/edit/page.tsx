import { Suspense } from "react";
import EditTripClient from "./EditTripClient";

export default function EditTripPage() {
  return (
    <Suspense fallback={<main className="py-20" />}>
      <EditTripClient />
    </Suspense>
  );
}

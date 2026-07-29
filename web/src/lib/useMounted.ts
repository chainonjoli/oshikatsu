"use client";

import { useEffect, useState } from "react";

/** localStorage のデータはブラウザでしか読めないため、マウント後に描画を切り替える */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

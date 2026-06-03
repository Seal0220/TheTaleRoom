"use client";

import { useEffect, useState } from "react";
import { readDraftValue, writeDraftValue } from "@/lib/draftCache";

export function useLocalDraft(key, initialValue = "") {
  const [value, setValue] = useState(() => readDraftValue(key, initialValue));

  useEffect(() => {
    writeDraftValue(key, value);
  }, [key, value]);

  return [value, setValue];
}

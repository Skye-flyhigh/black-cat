"use client"

import { useEffect, useState } from "react";

export function useCognitionStream(endpoint: string) {
    console.log("🪝 useCognitionStream hook mounted");

  const [stage, setStage] = useState<"idle" | "remembering" | "reflecting" | "responding">("idle");

  useEffect(() => {
    const source = new EventSource(endpoint);

    source.addEventListener("phase", (e) => {
      const phase = (e as MessageEvent).data as typeof stage;
      console.log("💭 phase received:", phase);
      setStage(phase);
    });

    source.addEventListener("message", (e) => {
      setStage("idle"); // hide loader once final message arrives
    });

    source.addEventListener("error", () => {
      console.warn("Stream closed");
      source.close();
    });

    return () => source.close();
  }, [endpoint]);

  return { stage };
}
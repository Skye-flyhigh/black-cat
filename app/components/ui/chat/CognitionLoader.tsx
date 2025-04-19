"use client";

import { useEffect, useState } from "react";

export function CognitionLoader({ stage }: { stage?: "remembering" | "reflecting" | "responding" | "idle" }) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if(!stage || stage === "idle") return null;

  return (
    <div className="px-4 py-2 text-sm italic text-purple-400 animate-pulse">
      {stage.charAt(0).toUpperCase() + stage.slice(1)}
      {dots}
    </div>
  );
}
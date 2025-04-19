
export function emitPhase(phase: "remembering" | "reflecting" | "responding"): Uint8Array {
    return new TextEncoder().encode(phase);
  }
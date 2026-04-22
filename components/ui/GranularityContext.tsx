"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Granularity = "monthly" | "quarterly";

interface GranularityContextValue {
  granularity: Granularity;
  setGranularity: (g: Granularity) => void;
}

const GranularityContext = createContext<GranularityContextValue>({
  granularity: "monthly",
  setGranularity: () => {},
});

export function GranularityProvider({ children }: { children: ReactNode }) {
  const [granularity, setGranularity] = useState<Granularity>("monthly");
  return (
    <GranularityContext.Provider value={{ granularity, setGranularity }}>
      {children}
    </GranularityContext.Provider>
  );
}

export function useGranularity() {
  return useContext(GranularityContext);
}

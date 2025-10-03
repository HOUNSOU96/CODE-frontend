import React, { createContext, useContext, useState } from "react";
import { ApprenantProgression } from "@/types/progression";

type ProgressionContextType = {
  progression: ApprenantProgression | null;
  setProgression: (p: ApprenantProgression | null) => void; // ✅ accepter null
};

const ProgressionContext = createContext<ProgressionContextType>({
  progression: null,
  setProgression: () => {},
});

export const ProgressionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progression, setProgression] = useState<ApprenantProgression | null>(null);

  return (
    <ProgressionContext.Provider value={{ progression, setProgression }}>
      {children}
    </ProgressionContext.Provider>
  );
};

export const useProgression = () => useContext(ProgressionContext);

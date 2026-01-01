import { createContext } from "react";

export interface ConnectionContextType {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
  retry: () => Promise<void>;
}

export const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

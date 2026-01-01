import { ReactNode } from "react";
import { ConnectionContext } from "@/contexts/ConnectionContext";
import { useConnection } from "@/hooks/useConnection";

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const connection = useConnection();

  return (
    <ConnectionContext.Provider value={connection}>
      {children}
    </ConnectionContext.Provider>
  );
}

import { useContext } from "react";
import { ConnectionContext, ConnectionContextType } from "@/contexts/ConnectionContext";

export function useConnectionContext(): ConnectionContextType {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnectionContext must be used within ConnectionProvider");
  }
  return context;
}

import { useState, useEffect, useCallback, useRef } from "react";
import { checkApiHealth, connectionEvents } from "@/services/api";

interface ConnectionState {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
}

export function useConnection() {
  const [state, setState] = useState<ConnectionState>({
    isOnline: true,
    isChecking: true,
    lastChecked: null,
    error: null,
  });

  const isMounted = useRef(true);

  const checkConnection = useCallback(async () => {
    if (!isMounted.current) return;

    setState((prev) => ({ ...prev, isChecking: true }));

    try {
      const isOnline = await checkApiHealth();

      if (!isMounted.current) return;

      setState({
        isOnline,
        isChecking: false,
        lastChecked: new Date(),
        error: isOnline ? null : "Unable to connect to server",
      });
      connectionEvents.emit(isOnline);
    } catch {
      if (!isMounted.current) return;

      setState({
        isOnline: false,
        isChecking: false,
        lastChecked: new Date(),
        error: "Connection check failed",
      });
      connectionEvents.emit(false);
    }
  }, []);

  // Initial connection check - deferred to avoid synchronous setState
  useEffect(() => {
    isMounted.current = true;

    const timeoutId = setTimeout(() => {
      checkConnection();
    }, 0);

    return () => {
      isMounted.current = false;
      clearTimeout(timeoutId);
    };
  }, [checkConnection]);

  // Periodic checks when offline
  useEffect(() => {
    if (state.isOnline) return;

    const interval = setInterval(() => {
      checkConnection();
    }, 30000);

    return () => clearInterval(interval);
  }, [state.isOnline, checkConnection]);

  // Browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      checkConnection();
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
      connectionEvents.emit(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkConnection]);

  return { ...state, retry: checkConnection };
}

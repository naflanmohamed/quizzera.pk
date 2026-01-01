import { useConnectionContext } from "@/hooks/useConnectionContext"; // FIXED IMPORT
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function ConnectionStatus() {
  const { isOnline, isChecking, lastChecked, retry } = useConnectionContext();
  const [dismissed, setDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOnline && !isChecking) {
      setShowSuccess(true);
      setDismissed(false);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, isChecking]);

  if (isOnline && !showSuccess) return null;
  if (dismissed && !isOnline) return null;

  if (isOnline && showSuccess) {
    return (
      <div className="bg-green-500/10 border-b border-green-500/20 px-4 py-2">
        <div className="container mx-auto flex items-center justify-center gap-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Connection restored</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-b px-4 py-3 transition-colors",
        isChecking
          ? "bg-yellow-500/10 border-yellow-500/20"
          : "bg-red-500/10 border-red-500/20"
      )}
    >
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isChecking ? (
            <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-600" />
          )}
          <div>
            <p
              className={cn(
                "text-sm font-medium",
                isChecking ? "text-yellow-600" : "text-red-600"
              )}
            >
              {isChecking ? "Checking connection..." : "You're offline"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isChecking
                ? "Please wait..."
                : "Unable to connect to server. Some features may be unavailable."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastChecked && !isChecking && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Last checked: {lastChecked.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={retry} disabled={isChecking}>
            <RefreshCw className={cn("w-4 h-4 mr-1", isChecking && "animate-spin")} />
            Retry
          </Button>
          {!isChecking && (
            <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

import { AlertTriangle } from "lucide-react";

export function Banner() {
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm">
            Switch to Solana Devnet to test Delta Pay
          </p>
        </div>
      </div>
    </div>
  );
}
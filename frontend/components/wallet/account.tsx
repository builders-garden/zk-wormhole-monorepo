"use client";

import { useAccount, useDisconnect, useEnsName } from "wagmi";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });

  if (!address) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="font-mono text-sm">
        {ensName ? `${ensName} (${address})` : address}
      </div>
      <Button
        onClick={() => disconnect()}
        variant="ghost"
        size="sm"
        className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}

"use client";

import { useConnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export function WalletOptions() {
  const { connectors, connect } = useConnect();

  return (
    <div className="flex flex-col gap-2">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500 flex items-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          Connect {connector.name}
        </Button>
      ))}
    </div>
  );
}

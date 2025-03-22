"use client";

import { useConnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { holesky } from "wagmi/chains";
import { useToast } from "@/hooks/use-toast";

interface WalletOptionsProps {
  onConnect?: () => void;
}

export function WalletOptions({ onConnect }: WalletOptionsProps) {
  const { connectors, connect, error } = useConnect();
  const { toast } = useToast();

  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector, chainId: holesky.id });
      onConnect?.();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Please make sure you're on the Holesky network.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="text-red-500 text-sm p-2 bg-red-500/10 rounded border border-red-500/20">
          {error.message}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {connectors.map((connector) => (
          <Button
            key={connector.uid}
            onClick={() => handleConnect(connector)}
            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500 flex items-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            Connect {connector.name}
          </Button>
        ))}
      </div>
      <p className="text-xs text-green-400/60 text-center">
        Only Holesky testnet is supported
      </p>
    </div>
  );
}

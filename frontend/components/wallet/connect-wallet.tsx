"use client";

import { useAccount } from "wagmi";
import { WalletOptions } from "./wallet-options";
import { Account } from "./account";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ConnectWallet() {
  const { isConnected } = useAccount();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500 flex items-center gap-2">
          {isConnected ? (
            <Account />
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/95 border-green-500/30 text-green-400">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>
        {!isConnected && <WalletOptions />}
      </DialogContent>
    </Dialog>
  );
}

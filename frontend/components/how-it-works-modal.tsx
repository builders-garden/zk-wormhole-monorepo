import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "lucide-react";

export function HowItWorksModal() {
  const steps = [
    {
      title: "1. Connect Your Wallet",
      description:
        "Connect your Web3 wallet to get started with private transactions.",
    },
    {
      title: "2. Select Amount",
      description:
        "Choose the amount of ETH or supported tokens you want to deposit.",
    },
    {
      title: "3. Generate Note",
      description:
        "A unique note will be generated. Save this securely - it's required to withdraw your funds.",
    },
    {
      title: "4. Make Deposit",
      description:
        "Confirm the transaction to deposit your funds into the privacy pool.",
    },
    {
      title: "5. Wait Period",
      description:
        "Wait for some time to enhance transaction privacy (recommended: at least a few hours).",
    },
    {
      title: "6. Initiate Withdrawal",
      description:
        "When ready, paste your note to prove ownership and specify a recipient address.",
    },
    {
      title: "7. Complete Withdrawal",
      description:
        "Confirm the withdrawal transaction to receive your funds at the specified address.",
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 text-green-400 border-green-500/30 hover:border-green-500 bg-black/60"
        >
          <InfoIcon className="w-4 h-4" />
          How It Works
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-black/95 border-green-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mono text-green-400">
            How to Use ZK Wormhole
          </DialogTitle>
        </DialogHeader>
        <div className="mt-6 space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="w-12 h-12 flex-shrink-0 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <span className="text-green-400 font-mono">{index + 1}</span>
              </div>
              <div>
                <h3 className="text-lg font-mono text-green-400">
                  {step.title}
                </h3>
                <p className="mt-1 text-green-400/70">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InfoIcon, X } from "lucide-react";

export function HowItWorksModal() {
  const steps = [
    {
      title: "1. Burn",
      description:
        "Transfer zk wormhole erc20 to a precomputed dead address making them permanently inaccessible and lost forever.",
    },
    {
      title: "2. Prove",
      description:
        "Use SP1 zkVM to prove you can precompute the dead address and sent enough funds to it.",
    },
    {
      title: "3. Mint",
      description:
        "Validate the proof on-chain via relayers and mint the tokens to a different recipient address.",
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
        <DialogHeader className="flex flex-row justify-between items-start">
          <DialogTitle className="text-2xl font-mono text-green-400">
            How to Use ZK Wormhole
          </DialogTitle>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-8 h-8 p-0 text-green-400 hover:text-green-300"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTrigger>
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

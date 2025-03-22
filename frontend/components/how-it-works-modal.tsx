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
      title: (
        <>
          1.{" "}
          <a
            href="https://github.com/yourusername/zkwormhole"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 underline"
          >
            Download and Execute the ZK Wormhole Protocol binary rust project
          </a>
        </>
      ),
      description: (
        <>
          Check the{" "}
          <a
            href="https://docs.succinct.xyz/docs/sp1/introduction"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 underline"
          >
            succinct.xyz SP1 hardware requirements
          </a>{" "}
          before running the project.
        </>
      ),
    },
    {
      title: "2. Precompute the dead address by providing secret and nonce",
      description:
        "Use the command cargo run --bin precompute -- --secret <secret> --nonce <nonce> to precompute the dead address.",
    },
    {
      title: "3. Send a ZKWUSDC to the precomputed dead address",
      description:
        "Make a transfer to the precomputed dead address by making them permanently inaccessible and lost forever.",
    },
    {
      title: "4. Generate the SNARK proof",
      description:
        "Use the command cargo run --bin prove -- --secret <secret> --nonce <nonce> --address <address> to generate a proof.",
    },
    {
      title: "5. Mint the tokens",
      description:
        "Validate the proof on-chain and mint the tokens to a different recipient address.",
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

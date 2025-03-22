"use client";

import { useState } from "react";
import {
  Wallet,
  ArrowUpDown,
  Github,
  Twitter,
  Book,
  Download,
  Key,
  Send,
  FileCode,
  Coins as CoinsIcon,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { HowItWorksModal } from "@/components/how-it-works-modal";
import { ConnectWallet } from "@/components/wallet/connect-wallet";
import SpotlightCursor from "@/components/spotlight-cursor";
import Link from "next/link";

const TOKENS = [
  {
    id: "zkwusd",
    symbol: "ZKWUSD",
    name: "ZKWUSD",
    balance: "500.00",
    baseBalance: "500.00", // USDC balance
    baseSymbol: "USDC",
    wrappable: true,
  },
];

export default function AppPage() {
  const [connectedAddress] = useState(
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  );
  const [selectedToken] = useState("zkwusd");
  const [proof, setProof] = useState("");
  const [publicValues, setPublicValues] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedWrapTab, setSelectedWrapTab] = useState("wrap");
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      number: 1,
      title: "Convert tokens",
      description: "Convert your regular USDC tokens into ZKWUSD tokens",
      icon: ArrowUpDown,
    },
    {
      number: 2,
      title: "Download and Execute",
      description:
        "Download and Execute the ZK Wormhole Protocol binary rust project",
      icon: Download,
    },
    {
      number: 3,
      title: "Precompute Address",
      description: "Precompute the dead address by providing secret and nonce",
      icon: Key,
    },
    {
      number: 4,
      title: "Burn Tokens",
      description: "Send your ZKWUSD tokens to the precomputed dead address",
      icon: Send,
    },
    {
      number: 5,
      title: "Generate Proof",
      description: "Generate a proof using SP1 zkVM",
      icon: FileCode,
    },
    {
      number: 6,
      title: "Mint Tokens",
      description: "Mint ZKWUSD tokens to a different recipient address",
      icon: CoinsIcon,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  const getExplanationText = (tab: string) => {
    switch (tab) {
      case "wrap":
        return "Convert your regular Trifecta USDC tokens into ZKWUSD tokens that can be used for private transactions through the protocol.";
      case "unwrap":
        return "Convert your ZKWUSD tokens back to their original form. This will burn your wrapped tokens and return your original Trifecta USDC tokens 1-to-1.";
      case "claim":
        return "Unwrap your ZKWUSD and claim your original Trifecta USDC tokens 1-to-1 in a single step by providing a valid SP1 SNARK proof.";
      default:
        return "Convert your Trifecta USDC tokens into ZKWUSD tokens to use them in the ZK Wormhole Protocol.";
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400">
      <SpotlightCursor
        config={{
          radius: 400,
          brightness: 0.05,
          color: "#4ade80",
          smoothing: 0.2,
        }}
      />
      {/* Matrix-style background effect */}
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5')] opacity-10 bg-cover" />

      {/* Main content */}
      <div className="relative">
        {/* Header */}
        <header className="border-b border-green-500/30 bg-black/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <Link
                  href="/"
                  className="text-xl font-bold font-mono hover:text-green-300 transition-colors"
                >
                  ZK Wormhole Protocol
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <ConnectWallet />
                <HowItWorksModal />
              </div>
            </div>
          </div>
        </header>

        {/* Main app content will go here */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Add your app content here */}
          <div className="relative flex-1 max-w-4xl mx-auto w-full space-y-8 p-6">
            {/* Connected Address */}
            <div className="flex items-center justify-between p-4 bg-black/60 rounded-lg border border-green-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Wallet className="w-6 h-6" />
                <span className="font-mono">Connected:</span>
              </div>
              <div className="px-4 py-2 bg-green-950/50 rounded-md font-mono text-sm text-green-400">
                {connectedAddress}
              </div>
            </div>

            {/* Token Balance */}
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-black/60 rounded-lg border border-green-500/30 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CoinsIcon className="w-6 h-6" />
                    <span className="font-mono">ZKWUSD Balance:</span>
                  </div>
                  <div className="px-4 py-2 bg-green-950/50 rounded-md font-mono text-sm text-green-400">
                    {TOKENS[0].balance} {TOKENS[0].symbol}
                  </div>
                </div>
              </div>
            </div>

            {/* Wizard Steps */}
            <div className="relative">
              <div className="overflow-hidden">
                <nav aria-label="Progress">
                  <ol role="list" className="flex items-center justify-between">
                    {steps.map((step, stepIdx) => (
                      <li
                        key={step.title}
                        className={`relative ${
                          stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : ""
                        }`}
                        onClick={() => handleStepClick(step.number)}
                        role="button"
                        style={{ cursor: "pointer" }}
                      >
                        <div className="flex items-center">
                          <div
                            className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                              step.number === currentStep
                                ? "border-green-400 bg-green-500/20"
                                : step.number < currentStep
                                ? "border-green-400 bg-green-500/20"
                                : "border-green-500/30 bg-black/60"
                            }`}
                          >
                            <step.icon
                              className={`w-6 h-6 ${
                                step.number <= currentStep
                                  ? "text-green-400"
                                  : "text-green-400/50"
                              }`}
                            />
                          </div>
                          {stepIdx !== steps.length - 1 && (
                            <div
                              className={`absolute top-6 left-12 -ml-px h-0.5 w-full ${
                                step.number < currentStep
                                  ? "bg-green-400"
                                  : "bg-green-500/30"
                              }`}
                            />
                          )}
                        </div>
                        <div className="mt-2">
                          <span
                            className={`block text-xs font-medium ${
                              step.number <= currentStep
                                ? "text-green-400"
                                : "text-green-400/50"
                            }`}
                          >
                            Step {step.number}
                          </span>
                          <span
                            className={`block text-sm ${
                              step.number <= currentStep
                                ? "text-white"
                                : "text-white/50"
                            }`}
                          >
                            {step.title}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>

              {/* Step Content */}
              <div className="mt-8">
                <Card className="bg-black/60 border-green-500/30 p-6 backdrop-blur-sm">
                  <div className="space-y-6">
                    {/* Step 1: Convert */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <h3 className="font-mono text-lg text-green-400">
                          Convert Tokens
                        </h3>
                        <div className="p-4 border border-green-500/30 rounded-md bg-black/60">
                          <p className="text-white/80 text-sm">
                            Convert your regular USDC tokens into ZKWUSD tokens
                            that can be used for private transactions.
                          </p>
                        </div>
                        <div className="p-4 border border-green-500/30 rounded-md bg-black/60">
                          <div className="flex items-center justify-between">
                            <p className="text-white/80 text-sm">
                              Get 100 USDC-test tokens on Holesky
                            </p>
                            <Button className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500">
                              Get Tokens
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="font-mono text-sm text-green-400">
                              From Token
                            </label>
                            <Select value="usdc" disabled>
                              <SelectTrigger className="bg-black/30 border-green-500/30 text-green-400 opacity-90">
                                <SelectValue>
                                  <div className="flex items-center gap-2">
                                    <CoinsIcon className="w-4 h-4" />
                                    <span className="font-mono">USDC</span>
                                  </div>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="bg-black border-green-500/30">
                                <SelectItem
                                  value="usdc"
                                  className="text-green-400"
                                >
                                  <div className="flex items-center gap-2">
                                    <CoinsIcon className="w-4 h-4" />
                                    <span className="font-mono">USDC</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-center">
                            <ArrowUpDown className="w-6 h-6 text-green-400/50" />
                          </div>
                          <div className="space-y-2">
                            <label className="font-mono text-sm text-green-400">
                              To Token
                            </label>
                            <Select value="zkwusd" disabled>
                              <SelectTrigger className="bg-black/30 border-green-500/30 text-green-400 opacity-90">
                                <SelectValue>
                                  <div className="flex items-center gap-2">
                                    <CoinsIcon className="w-4 h-4" />
                                    <span className="font-mono">ZKWUSD</span>
                                  </div>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="bg-black border-green-500/30">
                                <SelectItem
                                  value="zkwusd"
                                  className="text-green-400"
                                >
                                  <div className="flex items-center gap-2">
                                    <CoinsIcon className="w-4 h-4" />
                                    <span className="font-mono">ZKWUSD</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="font-mono text-sm text-green-400">
                              Amount
                            </label>
                            <Input
                              type="text"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="bg-black/60 border-green-500/30 text-green-400 font-mono"
                              placeholder="Enter amount..."
                            />
                          </div>
                          <Button className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500">
                            Convert
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Download */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <h3 className="font-mono text-lg text-green-400">
                          Download and Execute
                        </h3>
                        <div className="p-4 border border-green-500/30 rounded-md bg-black/60">
                          <p className="text-white/80 text-sm">
                            Download and run the ZK Wormhole Protocol binary.
                            Check the{" "}
                            <a
                              href="https://docs.succinct.xyz/docs/sp1/introduction"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300 underline"
                            >
                              SP1 hardware requirements
                            </a>{" "}
                            before running the project.
                          </p>
                        </div>
                        <div className="flex justify-center">
                          <a
                            href="https://github.com/yourusername/zkwormhole"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-6 py-3 rounded-md border border-green-500 transition-all duration-200 flex items-center gap-2"
                          >
                            <Download className="w-5 h-5" />
                            Download Project
                          </a>
                        </div>
                        <div className="mt-6 p-4 font-mono text-sm text-white/80 bg-black/60 border border-green-500/30 rounded-md">
                          <pre className="whitespace-pre-wrap">
                            <code>{`# Clone the repository
git clone https://github.com/yourusername/zkwormhole
cd zkwormhole

# Install dependencies
cargo build --release

# Run the binary
./target/release/zkwormhole`}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Precompute */}
                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <h3 className="font-mono text-lg text-green-400">
                          Precompute Dead Address
                        </h3>
                        <div className="p-4 border border-green-500/30 rounded-md bg-black/60">
                          <p className="text-white/80 text-sm">
                            Use the CLI to precompute your dead address. The
                            dead address is calculated using CREATE2 based on
                            the SP1 program, where the salt is derived from your
                            secret.
                          </p>
                        </div>
                        <div className="mt-6 p-4 font-mono text-sm text-white/80 bg-black/60 border border-green-500/30 rounded-md">
                          <pre className="whitespace-pre-wrap">
                            <code>{`# Generate a dead address
./zkwormhole precompute --secret <your-secret> --nonce <nonce>

# Example output:
Dead Address: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
Salt: 0x1234...
Bytecode Hash: 0x5678...`}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Burn Tokens */}
                    {currentStep === 4 && (
                      <div className="space-y-4">
                        <h3 className="font-mono text-lg text-green-400">
                          Burn Tokens
                        </h3>
                        <div className="p-4 border border-green-500/30 rounded-md bg-black/60">
                          <p className="text-white/80 text-sm">
                            Send your ZKWUSD tokens to the precomputed dead
                            address to initiate the private transfer.
                          </p>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="font-mono text-sm text-green-400">
                              Token
                            </label>
                            <Select value="zkwusd" disabled>
                              <SelectTrigger className="bg-black/30 border-green-500/30 text-green-400 opacity-90">
                                <SelectValue>
                                  <div className="flex items-center gap-2">
                                    <CoinsIcon className="w-4 h-4" />
                                    <span className="font-mono">ZKWUSD</span>
                                  </div>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="bg-black border-green-500/30">
                                <SelectItem
                                  value="zkwusd"
                                  className="text-green-400"
                                >
                                  <div className="flex items-center gap-2">
                                    <CoinsIcon className="w-4 h-4" />
                                    <span className="font-mono">ZKWUSD</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="font-mono text-sm text-green-400">
                              Dead Address
                            </label>
                            <Input
                              type="text"
                              className="bg-black/60 border-green-500/30 text-green-400 font-mono"
                              placeholder="Enter the precomputed dead address..."
                            />
                          </div>
                          <Button className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500">
                            Send
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Generate Proof */}
                    {currentStep === 5 && (
                      <div className="space-y-4">
                        <h3 className="font-mono text-lg text-green-400">
                          Generate Proof
                        </h3>
                        <div className="p-4 border border-green-500/30 rounded-md bg-black/60">
                          <p className="text-white/80 text-sm">
                            Generate a zero-knowledge proof using SP1 zkVM. The
                            proof validates that you have sent the tokens to a
                            correctly precomputed dead address and that you know
                            the secret used to generate it.
                          </p>
                        </div>
                        <div className="mt-6 p-4 font-mono text-sm text-white/80 bg-black/60 border border-green-500/30 rounded-md">
                          <pre className="whitespace-pre-wrap">
                            <code>{`# Generate a proof
./zkwormhole prove --secret <your-secret> --nonce <nonce> --amount <amount>

# Example output:
Public Values: 0xabcd...
Proof: 0xef12...`}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Step 6: Mint */}
                    {currentStep === 6 && (
                      <div className="space-y-4">
                        <h3 className="font-mono text-lg text-green-400">
                          Mint Tokens
                        </h3>
                        <div className="p-4 border border-green-500/30 rounded-md bg-black/60">
                          <p className="text-white/80 text-sm">
                            Mint your ZKWUSD tokens by providing the generated
                            proof.
                          </p>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="font-mono text-sm text-green-400">
                              Token
                            </label>
                            <Select value="zkwusd" disabled>
                              <SelectTrigger className="bg-black/30 border-green-500/30 text-green-400 opacity-90">
                                <SelectValue>
                                  <div className="flex items-center gap-2">
                                    <CoinsIcon className="w-4 h-4" />
                                    <span className="font-mono">ZKWUSD</span>
                                  </div>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="bg-black border-green-500/30">
                                <SelectItem
                                  value="zkwusd"
                                  className="text-green-400"
                                >
                                  <div className="flex items-center gap-2">
                                    <CoinsIcon className="w-4 h-4" />
                                    <span className="font-mono">ZKWUSD</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="font-mono text-sm text-green-400">
                              Public Values Proof
                            </label>
                            <Textarea
                              value={publicValues}
                              onChange={(e) => setPublicValues(e.target.value)}
                              className="bg-black/60 border-green-500/30 text-green-400 font-mono h-24"
                              placeholder="Enter your public values..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="font-mono text-sm text-green-400">
                              Proof
                            </label>
                            <Textarea
                              value={proof}
                              onChange={(e) => setProof(e.target.value)}
                              className="bg-black/60 border-green-500/30 text-green-400 font-mono h-24"
                              placeholder="Enter your proof..."
                            />
                          </div>
                          <div className="flex items-center space-x-2 p-4 border border-green-500/30 rounded-md bg-black/60">
                            <input
                              type="checkbox"
                              id="unwrap-toggle"
                              className="h-4 w-4 rounded border-green-500/30 bg-black/60 text-green-400 focus:ring-0 focus:ring-offset-0"
                            />
                            <label
                              htmlFor="unwrap-toggle"
                              className="text-white/80 text-sm cursor-pointer select-none"
                            >
                              Unwrap ZKWUSD to USDC in the same transaction
                            </label>
                          </div>
                          <div className="flex flex-col gap-2">
                            <a
                              href="https://github.com/yourusername/zkwormhole/contracts"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300 text-sm underline"
                            >
                              View ZKWUSD Smart Contract on Holesky
                            </a>
                            <Button className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500">
                              Mint Tokens through relayer
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                      <Button
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500 flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </Button>
                      <Button
                        onClick={handleNext}
                        disabled={currentStep === steps.length}
                        className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500 flex items-center gap-2"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="relative mt-12 border-t border-green-500/30 bg-black/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto py-6 px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-green-400/60 font-mono text-sm">
            Project built for{" "}
            <a
              href="https://ethglobal.com/events/trifecta"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 underline"
            >
              ETHGlobal Trifecta Hackathon
            </a>{" "}
            by{" "}
            <a
              href="https://twitter.com/frank"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300"
            >
              frank
            </a>{" "}
            and{" "}
            <a
              href="https://twitter.com/fabrizio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300"
            >
              fabrizio
            </a>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/yourusername/zkwormhole"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400/60 hover:text-green-400 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

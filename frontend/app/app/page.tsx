"use client";

import { useState } from "react";
import {
  Wallet,
  ArrowUpDown,
  Coins,
  Github,
  Twitter,
  Book,
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
import SpotlightCursor from "@/components/spotlight-cursor";
import Link from "next/link";

const TOKENS = [
  {
    id: "zkwusdc",
    symbol: "ZKWUSDC",
    name: "ZKWUSDC",
    balance: "500.00",
    baseBalance: "500.00", // USDC balance
    baseSymbol: "USDC",
    wrappable: true,
  },
  {
    id: "zkwo",
    symbol: "ZKWO",
    name: "ZKWORMHOLE",
    balance: "1000.00",
    wrappable: false,
  },
];

export default function AppPage() {
  const [connectedAddress] = useState(
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  );
  const [selectedToken] = useState(TOKENS[0].id);
  const [proof, setProof] = useState("");
  const [publicValues, setPublicValues] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedWrapTab, setSelectedWrapTab] = useState("wrap");

  const getExplanationText = (tab: string) => {
    switch (tab) {
      case "wrap":
        return "Convert your regular Trifecta USDC tokens into ZKWUSDC tokens that can be used for private transactions through the protocol.";
      case "unwrap":
        return "Convert your ZKWUSDC tokens back to their original form. This will burn your wrapped tokens and return your original Trifecta USDC tokens 1-to-1.";
      case "claim":
        return "Unwrap your ZKWUSDC and claim your original Trifecta USDC tokens 1-to-1in a single step by providing a valid SP1 SNARK proof.";
      default:
        return "Wrap your Trifecta USDC tokens to use them in the ZK Wormhole Protocol, or unwrap them back to their original form.";
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
                <HowItWorksModal />
              </div>
            </div>
          </div>
        </header>

        {/* Main app content will go here */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Add your app content here */}
          <div className="relative flex-1 max-w-4xl mx-auto w-full space-y-8 p-6">
            {/* Header with connected address */}
            <div className="flex items-center justify-between p-4 bg-black/60 rounded-lg border border-green-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Wallet className="w-6 h-6" />
                <span className="font-mono">Connected:</span>
              </div>
              <div className="px-4 py-2 bg-green-950/50 rounded-md font-mono text-sm text-green-400">
                {connectedAddress}
              </div>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="mint" className="w-full">
              <TabsList className="grid grid-cols-2 bg-black/60">
                <TabsTrigger
                  value="mint"
                  className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
                >
                  Mint
                </TabsTrigger>
                <TabsTrigger
                  value="wrap"
                  className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
                >
                  Wrap/Unwrap
                </TabsTrigger>
              </TabsList>

              {/* Mint Tab */}
              <TabsContent value="mint" className="space-y-4 mt-4">
                {/* Token Balance Card */}
                <Card className="bg-black/60 border-green-500/30 p-6 backdrop-blur-sm">
                  <h3 className="font-mono text-lg mb-2 text-green-400">
                    {TOKENS[0].name} Balance
                  </h3>
                  <p className="text-2xl font-bold font-mono text-green-400">
                    {TOKENS[0].balance} {TOKENS[0].symbol}
                  </p>
                </Card>

                {/* Mint Form */}
                <Card className="bg-black/60 border-green-500/30 p-6 backdrop-blur-sm">
                  <div className="space-y-6">
                    <h3 className="font-mono text-lg flex items-center gap-2 text-green-400">
                      <Coins className="w-5 h-5" /> Mint Tokens
                    </h3>

                    {/* Explanation Box */}
                    <div className="p-4 border border-green-500/30 rounded-md bg-black/60">
                      <p className="text-white/80 text-sm">
                        Mint your ZKWUSDC by providing a valid SP1 SNARK proof.
                        The proof validates that you have sent the tokens to a
                        correctly precomputed dead address. Check the How it
                        works section above for more details.
                      </p>
                    </div>

                    <div className="space-y-4">
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

                      <div className="flex flex-col gap-2">
                        <a
                          href="https://github.com/yourusername/zkwormhole/contracts"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 text-sm underline"
                        >
                          View ZKWUSDC Smart Contract on Holesky
                        </a>
                        <Button className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500">
                          Mint Tokens through relayer
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Wrap/Unwrap Tab */}
              <TabsContent value="wrap" className="space-y-4 mt-4">
                {/* Token Balance Card */}
                <Card className="bg-black/60 border-green-500/30 p-6 backdrop-blur-sm">
                  <h3 className="font-mono text-lg mb-2 text-green-400">
                    {TOKENS[0].name} Balance
                  </h3>
                  <p className="text-2xl font-bold font-mono text-green-400">
                    {TOKENS[0].balance} {TOKENS[0].symbol}
                  </p>
                </Card>

                {/* Explanation Box */}
                <div className="p-4 border border-green-500/30 rounded-md bg-black/60">
                  <p className="text-white/80 text-sm">
                    {getExplanationText(selectedWrapTab)}
                  </p>
                </div>

                {/* Wrap/Unwrap/Claim Tabs */}
                <Card className="bg-black/60 border-green-500/30 p-6 backdrop-blur-sm">
                  <Tabs
                    defaultValue="wrap"
                    className="w-full"
                    onValueChange={setSelectedWrapTab}
                  >
                    <TabsList className="grid grid-cols-3 bg-black/60">
                      <TabsTrigger
                        value="wrap"
                        className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
                      >
                        Wrap
                      </TabsTrigger>
                      <TabsTrigger
                        value="unwrap"
                        className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
                      >
                        Unwrap
                      </TabsTrigger>
                      <TabsTrigger
                        value="claim"
                        className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
                      >
                        Claim
                      </TabsTrigger>
                    </TabsList>

                    {/* Wrap Content */}
                    <TabsContent value="wrap" className="space-y-4 mt-4">
                      <div className="space-y-4">
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
                        <div className="space-y-2">
                          <label className="font-mono text-sm text-green-400">
                            Token
                          </label>
                          <Select defaultValue={selectedToken}>
                            <SelectTrigger className="bg-black/60 border-green-500/30 text-green-400">
                              <SelectValue placeholder="Select token" />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-green-500/30">
                              {TOKENS.filter((t) => t.wrappable).map(
                                (token) => (
                                  <SelectItem
                                    key={token.id}
                                    value={token.id}
                                    className="text-green-400"
                                  >
                                    {token.name}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500">
                          Wrap Tokens
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Unwrap Content */}
                    <TabsContent value="unwrap" className="space-y-4 mt-4">
                      <div className="space-y-4">
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
                        <div className="space-y-2">
                          <label className="font-mono text-sm text-green-400">
                            Token
                          </label>
                          <Select defaultValue={selectedToken}>
                            <SelectTrigger className="bg-black/60 border-green-500/30 text-green-400">
                              <SelectValue placeholder="Select token" />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-green-500/30">
                              {TOKENS.filter((t) => t.wrappable).map(
                                (token) => (
                                  <SelectItem
                                    key={token.id}
                                    value={token.id}
                                    className="text-green-400"
                                  >
                                    {token.name}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500">
                          Unwrap Tokens
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Claim Content - Same as Mint */}
                    <TabsContent value="claim" className="space-y-4 mt-4">
                      <div className="space-y-4">
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

                        <div className="flex flex-col gap-2">
                          <a
                            href="https://github.com/yourusername/zkwormhole/contracts"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 hover:text-green-300 text-sm underline"
                          >
                            View ZKWUSDC Smart Contract on Holesky
                          </a>
                          <Button className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500">
                            Mint and Unwrap through relayer
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>
              </TabsContent>
            </Tabs>
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

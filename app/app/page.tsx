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
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState(TOKENS[0].id);
  const [mintAmount, setMintAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [proof, setProof] = useState("");
  const [data, setData] = useState("");

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

            {/* Balance Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card
                key={TOKENS[0].id}
                className="bg-black/60 border-green-500/30 p-6 backdrop-blur-sm"
              >
                <h3 className="font-mono text-lg mb-2 text-green-400">
                  {TOKENS[0].name} Balance
                </h3>
                <p className="text-2xl font-bold font-mono text-green-400">
                  {TOKENS[0].balance} {TOKENS[0].symbol}
                </p>
              </Card>
              <Card
                key={TOKENS[1].id}
                className="bg-black/60 border-green-500/30 p-6 backdrop-blur-sm"
              >
                <h3 className="font-mono text-lg mb-2 text-green-400">
                  {TOKENS[1].name} Balance
                </h3>
                <div className="space-y-2">
                  <p className="text-2xl font-bold font-mono text-green-400">
                    {TOKENS[1].balance} {TOKENS[1].symbol}
                  </p>
                  <p className="text-lg font-mono text-green-400/70">
                    {TOKENS[1].baseBalance} {TOKENS[1].baseSymbol}
                  </p>
                </div>
              </Card>
            </div>

            {/* Wrap/Unwrap Section */}
            <Card className="bg-black/60 border-green-500/30 p-6 backdrop-blur-sm">
              <div className="space-y-6">
                <h3 className="font-mono text-lg flex items-center gap-2 text-green-400">
                  <ArrowUpDown className="w-5 h-5" /> Wrap/Unwrap Tokens
                </h3>
                <Tabs defaultValue="wrap" className="w-full">
                  <TabsList className="grid grid-cols-2 bg-black/60">
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
                  </TabsList>
                  <TabsContent value="wrap" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="font-mono text-sm text-green-400">
                          Select Token
                        </label>
                        <Select
                          value={selectedToken}
                          onValueChange={setSelectedToken}
                        >
                          <SelectTrigger className="bg-black/60 border-green-500/30 text-green-400 font-mono">
                            <SelectValue placeholder="Select token" />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-green-500/30">
                            {TOKENS.filter((token) => token.wrappable).map(
                              (token) => (
                                <SelectItem
                                  key={token.id}
                                  value={token.id}
                                  className="text-green-400 focus:bg-green-500/20 focus:text-green-400"
                                >
                                  {token.name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="font-mono text-sm text-green-400">
                          Amount
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-black/60 border-green-500/30 text-green-400 font-mono w-32"
                            placeholder="0.00"
                          />
                          <Button
                            variant="outline"
                            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500"
                          >
                            Wrap
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="unwrap" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="font-mono text-sm text-green-400">
                          Select Token
                        </label>
                        <Select
                          value={selectedToken}
                          onValueChange={setSelectedToken}
                        >
                          <SelectTrigger className="bg-black/60 border-green-500/30 text-green-400 font-mono">
                            <SelectValue placeholder="Select token" />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-green-500/30">
                            {TOKENS.filter((token) => token.wrappable).map(
                              (token) => (
                                <SelectItem
                                  key={token.id}
                                  value={token.id}
                                  className="text-green-400 focus:bg-green-500/20 focus:text-green-400"
                                >
                                  {token.name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="font-mono text-sm text-green-400">
                          Amount
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-black/60 border-green-500/30 text-green-400 font-mono w-32"
                            placeholder="0.00"
                          />
                          <Button
                            variant="outline"
                            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500"
                          >
                            Unwrap
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </Card>

            {/* Mint Section */}
            <Card className="bg-black/60 border-green-500/30 p-6 backdrop-blur-sm">
              <div className="space-y-6">
                <h3 className="font-mono text-lg flex items-center gap-2 text-green-400">
                  <Coins className="w-5 h-5" /> Mint Tokens
                </h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="font-mono text-sm text-green-400">
                      Select Token
                    </label>
                    <Select
                      value={selectedToken}
                      onValueChange={setSelectedToken}
                    >
                      <SelectTrigger className="bg-black/60 border-green-500/30 text-green-400 font-mono">
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-green-500/30">
                        {TOKENS.map((token) => (
                          <SelectItem
                            key={token.id}
                            value={token.id}
                            className="text-green-400 focus:bg-green-500/20 focus:text-green-400"
                          >
                            {token.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-sm text-green-400">
                      Amount to Mint
                    </label>
                    <Input
                      type="number"
                      value={mintAmount}
                      onChange={(e) => setMintAmount(e.target.value)}
                      className="bg-black/60 border-green-500/30 text-green-400 font-mono w-full"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-sm text-green-400">
                      Recipient Address
                    </label>
                    <Input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="bg-black/60 border-green-500/30 text-green-400 font-mono"
                      placeholder="0x..."
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
                  <div className="space-y-2">
                    <label className="font-mono text-sm text-green-400">
                      Data
                    </label>
                    <Textarea
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      className="bg-black/60 border-green-500/30 text-green-400 font-mono h-24"
                      placeholder="Enter additional data..."
                    />
                  </div>
                  <Button className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500">
                    Mint Tokens
                  </Button>
                </div>
              </div>
            </Card>
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

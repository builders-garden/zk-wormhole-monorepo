"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  Copy,
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
import { useAccount } from "wagmi";
import { useToast } from "@/components/ui/use-toast";
import {
  useWriteContract,
  useWatchContractEvent,
  useSimulateContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ZKWUSD_ADDRESS, FAUCET_ADDRESS } from "@/lib/constant";
import { WORMHOLE_PROTOCOL_ABI, ERC20_ABI } from "@/lib/abi";
import { parseEther, formatEther } from "viem";
import type { Hash } from "viem";
import { waitForTransactionReceipt } from "@wagmi/core";
import { config } from "@/lib/wagmi";
import React from "react";

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

interface TxStatus {
  hash?: Hash;
  loading?: boolean;
  approveHash?: Hash;
  wrapHash?: Hash;
  burnHash?: Hash;
  mintHash?: Hash;
}

export default function AppPage() {
  const [connectedAddress] = useState(useAccount().address);
  const [selectedToken] = useState("zkwusd");
  const [proof, setProof] = useState<`0x${string}` | "">("");
  const [publicValues, setPublicValues] = useState<`0x${string}` | "">("");
  const [amount, setAmount] = useState("");
  const [selectedWrapTab, setSelectedWrapTab] = useState("wrap");
  const [currentStep, setCurrentStep] = useState(1);
  const { address } = useAccount();
  const { toast } = useToast();
  const [txStatus, setTxStatus] = useState<TxStatus>({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [deadAddress, setDeadAddress] = useState("");
  const [burnAmount, setBurnAmount] = useState("");
  const [unwrapToggle, setUnwrapToggle] = useState(false);
  const [allowanceKey, setAllowanceKey] = useState(0);

  const { data: zkwusdBalance } = useReadContract({
    address: ZKWUSD_ADDRESS,
    abi: WORMHOLE_PROTOCOL_ABI,
    functionName: "balanceOf",
    args: [address || "0x"],
  });

  const formattedBalance = zkwusdBalance
    ? Number(formatEther(zkwusdBalance)).toFixed(3)
    : "0.000";

  const { data: allowance } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address || "0x", ZKWUSD_ADDRESS],
    query: {
      gcTime: 0,
      staleTime: 0,
    },
  });

  const { data: approveSimData } = useSimulateContract({
    address: FAUCET_ADDRESS,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [ZKWUSD_ADDRESS, parseEther(amount || "0")],
  });

  const { data: wrapSimData } = useSimulateContract({
    address: ZKWUSD_ADDRESS,
    abi: WORMHOLE_PROTOCOL_ABI,
    functionName: "wrap",
    args: [parseEther(amount || "0")],
  });

  const { data: burnSimData } = useSimulateContract({
    address: ZKWUSD_ADDRESS,
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [
      (deadAddress as `0x${string}`) || "0x",
      parseEther(burnAmount || "0"),
    ],
  });

  const { data: mintSimData } = useSimulateContract({
    address: ZKWUSD_ADDRESS,
    abi: WORMHOLE_PROTOCOL_ABI,
    functionName: "mintWithProof",
    args: [
      publicValues ||
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      proof ||
        "0x0000000000000000000000000000000000000000000000000000000000000000",
    ] as [`0x${string}`, `0x${string}`],
    account: address,
  });

  const { writeContractAsync: approveWrite } = useWriteContract();
  const { writeContractAsync: wrapWrite } = useWriteContract();
  const { writeContractAsync: burnWrite } = useWriteContract();
  const { writeContractAsync: mintWrite } = useWriteContract();

  const { data: approveReceipt } = useWaitForTransactionReceipt({
    hash: txStatus.approveHash as `0x${string}` | undefined,
  });

  const { data: wrapReceipt } = useWaitForTransactionReceipt({
    hash: txStatus.wrapHash as `0x${string}` | undefined,
  });

  const { data: burnReceipt } = useWaitForTransactionReceipt({
    hash: txStatus.burnHash as `0x${string}` | undefined,
  });

  const { data: mintReceipt } = useWaitForTransactionReceipt({
    hash: txStatus.mintHash as `0x${string}` | undefined,
  });

  // Add this function to reload states
  const reloadStates = () => {
    // Force a re-render to refresh balances and allowance
    const event = new Event("focus");
    window.dispatchEvent(event);
    // Force allowance refresh
    setAllowanceKey((prev) => prev + 1);
  };

  // Update the approval receipt effect
  useEffect(() => {
    if (approveReceipt) {
      toast({
        title: "Approval successful",
        description: "You can now convert your tokens",
      });
      setTxStatus((prev) => ({ ...prev, approveHash: undefined }));

      // Force immediate state updates
      setAllowanceKey((prev) => prev + 1);

      // Force refresh of all contract reads
      const event = new Event("focus");
      window.dispatchEvent(event);

      // Add a small delay and force another refresh
      setTimeout(() => {
        setAllowanceKey((prev) => prev + 1);
        window.dispatchEvent(new Event("focus"));
      }, 2000); // 2 second delay
    }
  }, [approveReceipt, toast]);

  // Update the wrap receipt effect
  useEffect(() => {
    if (wrapReceipt) {
      toast({
        title: "Wrap successful",
        description: "Your tokens have been wrapped!",
      });
      setTxStatus((prev) => ({ ...prev, wrapHash: undefined }));
      setAmount("");

      // Reload states after wrap
      reloadStates();
    }
  }, [wrapReceipt, toast]);

  useEffect(() => {
    if (burnReceipt) {
      toast({
        title: "Burn successful",
        description: "Your tokens have been sent to the dead address!",
      });
      setTxStatus((prev) => ({ ...prev, burnHash: undefined }));
      setBurnAmount("");
      setDeadAddress("");
    }
  }, [burnReceipt, toast]);

  useEffect(() => {
    if (mintReceipt) {
      toast({
        title: "Mint successful",
        description: "Your tokens have been minted!",
      });
      setTxStatus((prev) => ({ ...prev, mintHash: undefined }));
      setProof("");
      setPublicValues("");
    }
  }, [mintReceipt, toast]);

  // Add timeout for mint transaction
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (txStatus.mintHash) {
      timeoutId = setTimeout(() => {
        toast({
          title: "Transaction taking too long",
          description:
            "The mint transaction is taking longer than expected. Please check Etherscan for status.",
          variant: "destructive",
        });
        setTxStatus((prev) => ({ ...prev, mintHash: undefined }));
      }, 60000); // 1 minute timeout
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [txStatus.mintHash, toast]);

  // Update the needsApproval check to be more responsive
  const needsApproval = React.useMemo(() => {
    return allowance ? parseEther(amount || "0") > allowance : true;
  }, [allowance, amount, allowanceKey]); // Add allowanceKey to dependencies

  // Remove the separate handleApprove and handleConvert functions
  // Add this combined function instead
  const handleApproveAndConvert = async () => {
    if (!address || !amount) return;

    try {
      // First approve
      if (approveSimData?.request) {
        toast({
          title: "Step 1/2",
          description: "Approving tokens...",
        });

        const approveHash = await approveWrite(approveSimData.request);
        setTxStatus((prev) => ({
          ...prev,
          approveHash: approveHash as `0x${string}`,
        }));

        // Wait for approval to be mined
        await waitForTransactionReceipt(config, {
          hash: approveHash as `0x${string}`,
        });

        // Then immediately wrap
        if (wrapSimData?.request) {
          toast({
            title: "Step 2/2",
            description: "Converting tokens...",
          });

          const wrapHash = await wrapWrite(wrapSimData.request);
          setTxStatus((prev) => ({
            ...prev,
            wrapHash: wrapHash as `0x${string}`,
          }));
        }
      }
    } catch (error) {
      console.error("Error in approve and convert:", error);
      toast({
        title: "Error",
        description: "Transaction failed. Please try again.",
        variant: "destructive",
      });
      setTxStatus({});
    }
  };

  // Remove the approval and wrap receipt effects
  // Just keep a single effect for cleanup
  useEffect(() => {
    if (wrapReceipt) {
      toast({
        title: "Success!",
        description: "Your tokens have been converted!",
      });
      setTxStatus({});
      setAmount("");
      reloadStates();
    }
  }, [wrapReceipt, toast]);

  const handleBurn = async () => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!burnAmount || parseFloat(burnAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!deadAddress || !deadAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({
        title: "Error",
        description: "Please enter a valid Ethereum address",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!burnSimData?.request) {
        toast({
          title: "Error",
          description:
            "Failed to prepare burn transaction. Please check your inputs and try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Burning tokens",
        description: "Please confirm the transaction in your wallet",
      });

      const hash = await burnWrite(burnSimData.request);
      if (typeof hash === "string") {
        setTxStatus((prev) => ({
          ...prev,
          burnHash: hash as `0x${string}`,
        }));
      }
    } catch (error) {
      console.error("Error burning tokens:", error);
      toast({
        title: "Error",
        description: "Failed to burn tokens. Please try again.",
        variant: "destructive",
      });
      setTxStatus((prev) => ({
        ...prev,
        burnHash: undefined,
      }));
    }
  };

  const handleMint = async () => {
    console.log("Starting mint process");
    console.log("Proof:", proof);
    console.log("Public Values:", publicValues);
    console.log("Connected Address:", address);
    console.log("Unwrap Toggle:", unwrapToggle);

    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!proof || !proof.startsWith("0x")) {
      toast({
        title: "Error",
        description: "Please enter a valid proof (must start with 0x)",
        variant: "destructive",
      });
      return;
    }

    if (!publicValues || !publicValues.startsWith("0x")) {
      toast({
        title: "Error",
        description: "Please enter valid public values (must start with 0x)",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!mintWrite) {
        console.error("mintWrite is not available");
        toast({
          title: "Error",
          description: "Contract write function is not available",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: unwrapToggle ? "Unwrapping tokens" : "Minting tokens",
        description: "Please confirm the transaction in your wallet",
      });

      const hash = await mintWrite({
        address: ZKWUSD_ADDRESS,
        abi: WORMHOLE_PROTOCOL_ABI,
        functionName: unwrapToggle ? "unwrapWithProof" : "mintWithProof",
        args: [publicValues, proof],
      });

      console.log("Transaction hash:", hash);

      if (typeof hash === "string") {
        setTxStatus((prev) => ({
          ...prev,
          mintHash: hash as `0x${string}`,
        }));
      }
    } catch (error) {
      console.error("Error processing tokens:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          unwrapToggle ? "unwrap" : "mint"
        } tokens. Please try again.`,
        variant: "destructive",
      });
      setTxStatus((prev) => ({
        ...prev,
        mintHash: undefined,
      }));
    }
  };

  // Keep the event watcher for balance updates
  useWatchContractEvent({
    address: ZKWUSD_ADDRESS,
    abi: WORMHOLE_PROTOCOL_ABI,
    eventName: "TokenWrapped",
    onLogs() {
      // This will trigger a balance update
    },
  });

  // Add new balance read for USDC
  const { data: usdcBalance } = useReadContract({
    address: "0xe8b3C7e5BD537159698656251A5F187BeBEa995D" as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address || "0x"],
  });

  const formattedUsdcBalance = usdcBalance
    ? Number(formatEther(usdcBalance)).toFixed(3)
    : "0.000";

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

  const handleGetTokens = async () => {
    if (!connectedAddress) {
      return;
    }

    setTxStatus({ loading: true });

    try {
      const response = await fetch("/api/faucet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: connectedAddress }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get tokens");
      }

      setTxStatus({ hash: data.hash });

      // Clear the message after 10 seconds
      setTimeout(() => {
        setTxStatus({});
      }, 10000);
    } catch (error) {
      setTxStatus({});
      console.error("Failed to get tokens:", error);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch("/api/download");

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/octet-stream" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "zk-wormhole-host";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Add this function at the component level
  const handleRefreshBalances = () => {
    // Force refresh of all contract reads
    setAllowanceKey((prev) => prev + 1);

    // Force a re-render of the component
    const event = new Event("focus");
    window.dispatchEvent(event);
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
                <a
                  href="https://github.com/builders-garden/zk-wormhole-monorepo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400/60 hover:text-green-400 transition-colors"
                >
                  <Book className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main app content */}
        <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-12">
          {/* Add your app content here */}
          <div className="relative flex-1 max-w-4xl mx-auto w-full space-y-4 sm:space-y-8 p-2 sm:p-6">
            {/* Token Balance */}
            <div className="grid grid-cols-1 gap-4">
              <div className="p-3 sm:p-4 bg-black/60 rounded-lg border border-green-500/30 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CoinsIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="font-mono text-sm sm:text-base">
                      Balance:
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 sm:px-4 sm:py-2 bg-green-950/50 rounded-md font-mono text-xs sm:text-sm text-green-400">
                        {formattedBalance} ZKWUSD
                      </div>
                      <div className="px-3 py-1 sm:px-4 sm:py-2 bg-green-950/50 rounded-md font-mono text-xs sm:text-sm text-green-400">
                        {formattedUsdcBalance} USDC
                      </div>
                    </div>
                    <Button
                      onClick={handleRefreshBalances}
                      variant="ghost"
                      size="icon"
                      className="hover:bg-green-500/20"
                    >
                      <Loader2
                        className={`h-4 w-4 ${
                          txStatus.loading ? "animate-spin" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Wizard Steps */}
            <div className="relative">
              <div className="overflow-x-auto pb-4 sm:overflow-hidden">
                <nav aria-label="Progress" className="min-w-[800px] sm:min-w-0">
                  <ol
                    role="list"
                    className="flex items-center justify-between px-2 sm:px-0"
                  >
                    {steps.map((step, stepIdx) => (
                      <li
                        key={step.title}
                        className={`relative ${
                          stepIdx !== steps.length - 1
                            ? "pr-4 sm:pr-8 md:pr-20"
                            : ""
                        }`}
                        onClick={() => handleStepClick(step.number)}
                        role="button"
                        style={{ cursor: "pointer" }}
                      >
                        <div className="flex items-center">
                          <div
                            className={`relative flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 ${
                              step.number === currentStep
                                ? "border-green-400 bg-green-500/20"
                                : step.number < currentStep
                                ? "border-green-400 bg-green-500/20"
                                : "border-green-500/30 bg-black/60"
                            }`}
                          >
                            <step.icon
                              className={`w-4 h-4 sm:w-6 sm:h-6 ${
                                step.number <= currentStep
                                  ? "text-green-400"
                                  : "text-green-400/50"
                              }`}
                            />
                          </div>
                          {stepIdx !== steps.length - 1 && (
                            <div
                              className={`absolute top-4 sm:top-6 left-8 sm:left-12 -ml-px h-0.5 w-full ${
                                step.number < currentStep
                                  ? "bg-green-400"
                                  : "bg-green-500/30"
                              }`}
                            />
                          )}
                        </div>
                        <div className="mt-2">
                          <span
                            className={`hidden sm:block text-xs font-medium ${
                              step.number <= currentStep
                                ? "text-green-400"
                                : "text-green-400/50"
                            }`}
                          >
                            Step {step.number}
                          </span>
                          <span
                            className={`block text-xs sm:text-sm ${
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
              <div className="mt-4 sm:mt-8">
                <Card className="bg-black/60 border-green-500/30 p-3 sm:p-6 backdrop-blur-sm">
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
                            <div>
                              <p className="text-white/80 text-sm">
                                Get 100 USDC-test tokens on Holesky
                              </p>
                              <p className="text-green-400 text-sm mt-1">
                                Current Balance: {formattedUsdcBalance} USDC
                              </p>
                            </div>
                            <Button
                              onClick={handleGetTokens}
                              disabled={txStatus.loading}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500"
                            >
                              {txStatus.loading ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Loader2 className="h-5 w-5 animate-spin text-green-400" />
                                  <span>Sending...</span>
                                </div>
                              ) : (
                                "Get Tokens"
                              )}
                            </Button>
                          </div>
                          {txStatus.hash && (
                            <div className="mt-2 text-sm">
                              <p className="text-green-400">
                                Please wait, Holesky is processing your
                                transaction.
                              </p>
                              <a
                                href={`https://holesky.etherscan.io/tx/${txStatus.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400 hover:text-green-300 underline mt-1 inline-block"
                              >
                                View on Etherscan ↗
                              </a>
                            </div>
                          )}
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
                          <div className="flex gap-2">
                            <div className="flex flex-col gap-2 w-full">
                              <a
                                href="https://holesky.etherscan.io/address/0x6D46BE315b48f579387A5EA247E1E25D2FcCE7EE#readContract"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400 hover:text-green-300 text-sm underline"
                              >
                                View ZKWUSD Smart Contract on Holesky
                              </a>
                              <Button
                                onClick={handleApproveAndConvert}
                                disabled={!approveWrite || !amount}
                                className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500"
                              >
                                {txStatus.approveHash ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin text-green-400" />
                                    <span>Approving...</span>
                                  </div>
                                ) : txStatus.wrapHash ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin text-green-400" />
                                    <span>Converting...</span>
                                  </div>
                                ) : (
                                  "Approve & Convert"
                                )}
                              </Button>
                            </div>
                          </div>
                          {(txStatus.approveHash || txStatus.wrapHash) && (
                            <div className="mt-2 text-sm">
                              <p className="text-green-400">
                                Please wait, transaction is being processed.
                              </p>
                              <a
                                href={`https://holesky.etherscan.io/tx/${
                                  txStatus.approveHash || txStatus.wrapHash
                                }`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400 hover:text-green-300 underline mt-1 inline-block"
                              >
                                View on Etherscan ↗
                              </a>
                            </div>
                          )}
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
                              href="https://docs.succinct.xyz/docs/sp1/getting-started/hardware-requirements"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300 underline"
                            >
                              SP1 hardware requirements
                            </a>{" "}
                            before running the project.
                          </p>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-green-400">
                            Installation Command
                          </span>
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                'curl -L https://github.com/builders-garden/zk-wormhole-monorepo/archive/refs/heads/main.tar.gz | tar xz --strip-components=1 "main/executables"'
                              );
                              toast({
                                title: "Copied to clipboard",
                                description:
                                  "The command has been copied to your clipboard",
                              });
                            }}
                            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500 flex items-center gap-2 px-3 py-1"
                          >
                            <Copy className="h-4 w-4" />
                            <span>Copy</span>
                          </Button>
                        </div>
                        <div className="mt-6 p-4 font-mono text-sm text-white/80 bg-black/60 border border-green-500/30 rounded-md">
                          <pre className="whitespace-pre-wrap">
                            <code>{`# Download the local prover executable
curl -L https://github.com/builders-garden/zk-wormhole-monorepo/archive/refs/heads/main.tar.gz | tar xz --strip-components=1 "main/executables"
`}</code>
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
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-green-400">
                              Dead Address Generation Command
                            </span>
                            <Button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  "./executables/zk-wormhole-host --dead --secret <secret string> --nonce <secret nonce>"
                                );
                                toast({
                                  title: "Copied to clipboard",
                                  description:
                                    "The command has been copied to your clipboard",
                                });
                              }}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500 flex items-center gap-2 px-3 py-1"
                            >
                              <Copy className="h-4 w-4" />
                              <span>Copy</span>
                            </Button>
                          </div>
                          <pre className="whitespace-pre-wrap">
                            <code>{`# Generate a dead address
./executables/zk-wormhole-host --dead --secret <secret string> --nonce <secret nonce>

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
                              value={deadAddress}
                              onChange={(e) => setDeadAddress(e.target.value)}
                              className="bg-black/60 border-green-500/30 text-green-400 font-mono"
                              placeholder="Enter the precomputed dead address..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="font-mono text-sm text-green-400">
                              Amount
                            </label>
                            <Input
                              type="text"
                              value={burnAmount}
                              onChange={(e) => setBurnAmount(e.target.value)}
                              className="bg-black/60 border-green-500/30 text-green-400 font-mono"
                              placeholder="Enter amount to burn..."
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <a
                              href="https://holesky.etherscan.io/address/0x6D46BE315b48f579387A5EA247E1E25D2FcCE7EE#readContract"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300 text-sm underline"
                            >
                              View ZKWUSD Smart Contract on Holesky
                            </a>
                            <Button
                              onClick={handleBurn}
                              disabled={
                                !burnWrite || !burnAmount || !deadAddress
                              }
                              className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500"
                            >
                              {txStatus.burnHash ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Loader2 className="h-5 w-5 animate-spin text-green-400" />
                                  <span>Burning...</span>
                                </div>
                              ) : (
                                "Send"
                              )}
                            </Button>
                          </div>
                          {txStatus.burnHash && (
                            <div className="mt-2 text-sm">
                              <p className="text-green-400">
                                Please wait, transaction is being processed.
                              </p>
                              <a
                                href={`https://holesky.etherscan.io/tx/${txStatus.burnHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400 hover:text-green-300 underline mt-1 inline-block"
                              >
                                View on Etherscan ↗
                              </a>
                            </div>
                          )}
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
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-green-400">
                              Proof Generation Command
                            </span>
                            <Button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  "./executables/zk-wormhole-host --prove --dead --secret 1234 --nonce 1234"
                                );
                                toast({
                                  title: "Copied to clipboard",
                                  description:
                                    "The command has been copied to your clipboard",
                                });
                              }}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500 flex items-center gap-2 px-3 py-1"
                            >
                              <Copy className="h-4 w-4" />
                              <span>Copy</span>
                            </Button>
                          </div>
                          <pre className="whitespace-pre-wrap">
                            <code>{`# Generate a proof
./executables/zk-wormhole-host --prove --dead --secret 1234 --nonce 1234

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
                              onChange={(e) => {
                                const value = e.target.value;
                                setPublicValues(
                                  value.startsWith("0x")
                                    ? (value as `0x${string}`)
                                    : (value as "")
                                );
                              }}
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
                              onChange={(e) => {
                                const value = e.target.value;
                                setProof(
                                  value.startsWith("0x")
                                    ? (value as `0x${string}`)
                                    : (value as "")
                                );
                              }}
                              className="bg-black/60 border-green-500/30 text-green-400 font-mono h-24"
                              placeholder="Enter your proof..."
                            />
                          </div>
                          <div className="flex items-center space-x-2 p-4 border border-green-500/30 rounded-md bg-black/60">
                            <input
                              type="checkbox"
                              id="unwrap-toggle"
                              checked={unwrapToggle}
                              onChange={(e) =>
                                setUnwrapToggle(e.target.checked)
                              }
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
                              href="https://holesky.etherscan.io/address/0x6D46BE315b48f579387A5EA247E1E25D2FcCE7EE#readContract"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300 text-sm underline"
                            >
                              View ZKWUSD Smart Contract on Holesky
                            </a>
                            <Button
                              onClick={handleMint}
                              disabled={!mintWrite || !proof || !publicValues}
                              className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500"
                            >
                              {txStatus.mintHash ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Loader2 className="h-5 w-5 animate-spin text-green-400" />
                                  <span>Minting...</span>
                                </div>
                              ) : (
                                "Mint Tokens"
                              )}
                            </Button>
                          </div>
                          {txStatus.mintHash && (
                            <div className="mt-2 text-sm">
                              <p className="text-green-400">
                                Please wait, transaction is being processed.
                              </p>
                              <a
                                href={`https://holesky.etherscan.io/tx/${txStatus.mintHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400 hover:text-green-300 underline mt-1 inline-block"
                              >
                                View on Etherscan ↗
                              </a>
                            </div>
                          )}
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
      <footer className="relative mt-8 sm:mt-12 border-t border-green-500/30 bg-black/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto py-4 sm:py-6 px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-green-400/60 font-mono text-xs sm:text-sm text-center md:text-left">
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
              href="https://github.com/builders-garden/zk-wormhole-monorepo"
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

import Link from "next/link";
import { ArrowRight, Shield, Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Roboto_Mono } from "next/font/google";

const robotoMono = Roboto_Mono({ subsets: ["latin"] });

export default function Home() {
  return (
    <div
      className={`min-h-screen bg-black text-green-400 flex flex-col ${robotoMono.className}`}
    >
      {/* Matrix-style background effect */}
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5')] opacity-10 bg-cover" />

      {/* Main content */}
      <div className="relative flex-1">
        {/* Navigation */}
        <nav className="border-b border-green-500/30 bg-black/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <span className="text-xl font-bold">ZK Wormhole Protocol</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/app"
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-md border border-green-500 transition-all duration-200 flex items-center gap-2"
                >
                  Launch App <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,2fr,1.2fr] items-center gap-16">
              <div className="hidden lg:flex justify-end">
                <Image
                  src="/logo-left.jpg"
                  alt="ZK Wormhole Protocol Logo Left"
                  width={300}
                  height={300}
                  className="rounded-3xl shadow-lg shadow-green-500/20 border-2 border-green-500/30"
                  priority
                />
              </div>
              <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                  Private Transactions on Ethereum
                </h1>
                <p className="mt-6 text-lg leading-8 text-white/80">
                  Send and receive tokens without leaving a trace. ZK Wormhole
                  Protocol let users burn and re-mint anonymously using
                  zero-knowledge proofs.
                </p>
                <p className="mt-4 text-sm text-green-400/60">
                  Inspired by{" "}
                  <a
                    href="https://eips.ethereum.org/EIPS/eip-7503"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 underline"
                  >
                    EIP-7503: Zero-Knowledge Wormholes
                  </a>
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Link
                    href="/app"
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-6 py-3 rounded-md border border-green-500 transition-all duration-200 flex items-center gap-2 text-lg"
                  >
                    Launch App <ArrowRight className="w-5 h-5" />
                  </Link>
                  <a
                    href="https://docs.example.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400/70 hover:text-green-400 px-6 py-3 rounded-md border border-green-500/30 hover:border-green-500 transition-all duration-200 flex items-center gap-2 text-lg"
                  >
                    Documentation <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
              <div className="hidden lg:flex justify-start">
                <Image
                  src="/logo-right.jpg"
                  alt="ZK Wormhole Protocol Logo Right"
                  width={300}
                  height={300}
                  className="rounded-3xl shadow-lg shadow-green-500/20 border-2 border-green-500/30"
                  priority
                />
              </div>
            </div>

            {/* Connecting line to How it Works */}
            <div className="mt-24 flex justify-center">
              <div className="w-0.5 h-24 bg-green-500/30 relative">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-green-400/30 rounded-full border border-green-500/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight mb-16">
                How It Works
              </h2>
            </div>
            <div className="mx-auto mt-8 max-w-5xl">
              {/* Workflow Steps */}
              <div className="relative grid grid-cols-3 gap-8">
                {/* Connecting Lines */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-green-500/30" />
                <div className="absolute top-1/2 left-1/3 w-8 h-8 border-t-2 border-r-2 border-green-500/30 rounded-tr-full transform translate-x-full -translate-y-1/2" />
                <div className="absolute top-1/2 right-1/3 w-8 h-8 border-t-2 border-l-2 border-green-500/30 rounded-tl-full transform -translate-x-full -translate-y-1/2" />

                {/* Step 1: Deposit */}
                <div className="relative flex flex-col items-center text-center bg-black/60 border border-green-500/30 backdrop-blur-sm rounded-2xl p-8">
                  <div className="mb-6 w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
                    <svg
                      className="w-8 h-8 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m0-16l4 4m-4-4l-4 4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Burn</h3>
                  <p className="text-white/80">
                    Transfer zk wormhole erc20 to a precomputed dead address
                    making them permanently inaccessible and lost forever.
                  </p>
                </div>

                {/* Step 2: Wait */}
                <div className="relative flex flex-col items-center text-center bg-black/60 border border-green-500/30 backdrop-blur-sm rounded-2xl p-8">
                  <div className="mb-6 w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
                    <svg
                      className="w-8 h-8 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Prove</h3>
                  <p className="text-white/80">
                    Use{" "}
                    <a
                      href="https://docs.succinct.xyz/docs/sp1/introduction"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 underline"
                    >
                      SP1 zkVM
                    </a>{" "}
                    to prove you can precompute the dead address and sent enough
                    funds to it.
                  </p>
                </div>

                {/* Step 3: Withdraw */}
                <div className="relative flex flex-col items-center text-center bg-black/60 border border-green-500/30 backdrop-blur-sm rounded-2xl p-8">
                  <div className="mb-6 w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
                    <svg
                      className="w-8 h-8 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 20V4m0 16l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Mint</h3>
                  <p className="text-white/80">
                    Validate the proof on-chain via relayers and mint the tokens
                    to a different recipient address.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="relative py-24 sm:py-32 border-t border-green-500/30">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[calc(100vh-6rem)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full py-24">
              {/* Left side - Visual representation */}
              <div className="relative">
                <Image
                  src="/wormhole-banner.jpg"
                  alt="Wormhole Privacy Visualization"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                  priority
                />
              </div>

              {/* Right side - Text explanation */}
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-4 text-green-400">
                  How ZK Wormhole Protocol Ensures Privacy
                </h2>
                <div className="mb-6 p-4 border border-green-500/30 rounded-md bg-black/60 backdrop-blur-sm">
                  <p className="text-white/80 text-sm">
                    Inspired by{" "}
                    <a
                      href="https://eips.ethereum.org/EIPS/eip-7503"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 underline"
                    >
                      EIP-7503: Zero-Knowledge Wormholes
                    </a>
                    , a proposed standard for private token transfers on
                    Ethereum.
                  </p>
                </div>
                <p className="text-white mb-6">
                  The <strong>ZK Wormhole ERC20 token standard</strong> enhances
                  transaction privacy by breaking the on-chain link between
                  sender and receiver. Tokens are sent to a precomputed
                  unspendable address (which looks like a standard 0x address).
                  Users can later re-mint the tokens, even partially, by
                  providing a zk-SNARK proof using the{" "}
                  <a
                    href="https://docs.succinct.xyz/docs/sp1/introduction"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 underline"
                  >
                    succinct.xyz SP1 zkvm
                  </a>
                  .
                </p>
                <p className="text-white mb-6">
                  The zk-SNARK proof validates the following:
                </p>
                <ul className="text-white mb-6 list-inside list-disc">
                  <li>The sender knows the precomputed dead address.</li>
                  <li>
                    The sender can compute the dead address using CREATE2 based
                    on the SP1 program, where:
                    <ul className="ml-8 list-disc">
                      <li>The sender and bytecode are fixed.</li>
                      <li>
                        The salt is calculated from the depositor&apos;s secret.
                      </li>
                      <li>
                        The sender has sent enough funds to the dead address.
                      </li>
                    </ul>
                  </li>
                </ul>
                <p className="text-white mb-6">
                  Anyone can re-mint the tokens to a recipient address
                  validating the proof on-chain, making the transaction
                  untraceable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative mt-auto border-t border-green-500/30 bg-black/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto py-6 px-6 flex flex-col md:flex-row justify-between items-center gap-4">
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
              <Image
                src="/github-logo.png"
                alt="GitHub"
                width={24}
                height={24}
                className="invert opacity-60 hover:opacity-100 transition-opacity"
              />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

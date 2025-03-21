import Link from "next/link";
import { ArrowRight, Shield, Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-green-400 flex flex-col">
      {/* Matrix-style background effect */}
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5')] opacity-10 bg-cover" />

      {/* Main content */}
      <div className="relative flex-1">
        {/* Navigation */}
        <nav className="border-b border-green-500/30 bg-black/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <span className="text-xl font-bold font-mono">
                  ZK Wormhole Protocol
                </span>
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
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl font-mono">
                  The Future of
                  <span className="block text-green-400">
                    Private Transactions
                  </span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-green-400/70">
                  Experience the next generation of secure and private
                  transactions on the blockchain. Built for the future of DeFi.
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
              <h2 className="text-3xl font-bold tracking-tight font-mono mb-16">
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
                  <h3 className="font-mono text-xl font-semibold mb-4">
                    Deposit
                  </h3>
                  <p className="text-green-400/70">
                    Generate a random key (note) and deposit Ether or an ERC20,
                    along with submitting a hash of the note to the smart
                    contract.
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
                        d="M12 6v6l4 2"
                      />
                    </svg>
                  </div>
                  <h3 className="font-mono text-xl font-semibold mb-4">Wait</h3>
                  <p className="text-green-400/70">
                    After depositing, wait some amount of time before
                    withdrawing to improve privacy.
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
                  <h3 className="font-mono text-xl font-semibold mb-4">
                    Withdraw
                  </h3>
                  <p className="text-green-400/70">
                    Submit a proof of having the valid key to one of the notes
                    deposited and the contract transfers Ether or the ERC20 to a
                    specified recipient.
                  </p>
                </div>
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
              <Shield className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { createPublicClient, createWalletClient, http } from "viem";
import { holesky } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { FAUCET_ADDRESS } from "@/lib/constant";
import { ERC20_FAUCET_ABI } from "@/lib/abi";
import { NextResponse } from "next/server";

console.log(process.env.RELAYER_PRIVATE_KEY, "RELAYER_PRIVATE_KEY");

const walletClient = createWalletClient({
  account: privateKeyToAccount(
    process.env.RELAYER_PRIVATE_KEY as `0x${string}`
  ),
  chain: holesky,
  transport: http("https://ethereum-holesky-rpc.publicnode.com"),
});

const publicClient = createPublicClient({
  chain: holesky,
  transport: http("https://ethereum-holesky-rpc.publicnode.com"),
});

async function faucet(receiver: `0x${string}`) {
  console.log(receiver, "receiver");
  const tx = await walletClient.writeContract({
    address: FAUCET_ADDRESS,
    abi: ERC20_FAUCET_ABI,
    functionName: "faucetMint",
    args: [receiver],
  });
  console.log(tx, "tx");
  return tx;
}

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    console.log(address, "address");

    if (!address || typeof address !== "string") {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    const receipt = await faucet(address as `0x${string}`);
    return NextResponse.json({
      success: true,
      hash: receipt,
    });
  } catch (error) {
    console.error("Faucet error:", error);
    return NextResponse.json(
      { error: "Failed to mint tokens" },
      { status: 500 }
    );
  }
}

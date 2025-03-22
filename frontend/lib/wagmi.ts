import { http, createConfig } from "wagmi";
import { holesky } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

// Get WalletConnect Project ID from environment variable
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

export const config = createConfig({
  chains: [holesky],
  connectors: [
    injected({
      target: "metaMask",
    }),
    metaMask(),
  ],
  transports: {
    [holesky.id]: http(
      `https://holesky.infura.io/v3/${
        process.env.NEXT_PUBLIC_INFURA_API_KEY || ""
      }`
    ),
  },
});

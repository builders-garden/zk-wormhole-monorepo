import { http, createConfig } from "wagmi";
import { holesky } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

export const config = createConfig({
  chains: [holesky],
  connectors: [metaMask()],
  transports: {
    [holesky.id]: http("https://ethereum-holesky-rpc.publicnode.com"),
  },
});

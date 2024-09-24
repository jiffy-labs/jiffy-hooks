// src/hooks/useSmartAccount.ts

import { useState, useEffect, useMemo } from "react";
import { JiffyPaymaster } from "@jiffy-labs/web3a";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import {
  ENTRYPOINT_ADDRESS_V06,
  SmartAccountClient,
  createSmartAccountClient,
  walletClientToSmartAccountSigner,
} from "permissionless";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import { ENTRYPOINT_ADDRESS_V06_TYPE } from "permissionless/types";
import {  base, optimism, polygon } from "viem/chains";
import {
  http,
  useAccount,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { defineChain } from "viem";

const openCompusChain = defineChain({
  id: 656476,
  name: "OPEN_CAMPUS_TEST",
  nativeCurrency: {
      decimals: 18,
      name: "EDU",
      symbol: "EDU",
  },
  rpcUrls: {
      default: {
          http: ["https://rpc.open-campus-codex.gelato.digital/"],
      },
  },
  blockExplorers: {
      default: { name: "Explorer", url: "https://opencampus-codex.blockscout.com/" },
  },
});

// Define environment variables
const jiffyscanKey = process.env.NEXT_PUBLIC_JIFFYSCAN_API_KEY as string;
// const bundlerUrl = process.env.NEXT_PUBLIC_BUNDLER_URL as string;

// Define the chains with their respective entry points and RPC URLs
export const CHAINS = [
  {
    name: "Base Mainnet",
    chain: base,
    bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL_BASE!,
    explorerUrl: "https://basescan.org/",
  },
  {
    name: "Open Campus Codex",
    chain: openCompusChain, // Change from fuse to base mainnet
    bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL_EDU_CHAIN!,
    explorerUrl: "https://opencampus-codex.blockscout.com/", // Base Mainnet explorer URL
},
  {
    name: "Optimism",
    chain: optimism,
    bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL_OPTIMISM!,
    explorerUrl: "https://optimistic.etherscan.io/",
  },
  {
    name: "Polygon",
    chain: polygon,
    bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL_POLYGON!,
    explorerUrl: "https://polygonscan.com/",
  },
];

// Define the type for the chain
export interface Chain {
  name: string;
  chain: any;
  bundlerUrl: string;
  explorerUrl: string;
}

// Define the return type of the hook
export interface SmartAccountHook {
  isConnected: boolean;
  smartAccountClient: SmartAccountClient<ENTRYPOINT_ADDRESS_V06_TYPE> | null;
  handleChainChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedChain: Chain;
  fetchUserOperationHash: (txHash: string) => Promise<string>;
}


export function useSmartAccount(): SmartAccountHook {
  const [smartAccountClient, setSmartAccountClient] = useState<
    SmartAccountClient<ENTRYPOINT_ADDRESS_V06_TYPE> | null
  >(null);

  const { wallets } = useWallets();
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [selectedChain, setSelectedChain] = useState(CHAINS[0]);
  const embeddedWallet = useMemo(
    () => wallets.find((wallet) => wallet.walletClientType === "privy"),
    [wallets]
  );
  const { setActiveWallet } = useSetActiveWallet();

  // Set the active wallet if embeddedWallet is found
  useEffect(() => {
    if (embeddedWallet) {
      setActiveWallet(embeddedWallet);
    }
  }, [embeddedWallet, setActiveWallet]);

  // Initialize the SmartAccountClient when dependencies change
  useEffect(() => {
    (async () => {
      if (isConnected && walletClient && publicClient) {
        try {
          const customSigner = walletClientToSmartAccountSigner(walletClient);
          const bundlerTransport = http(selectedChain.bundlerUrl, {
            fetchOptions: {
              headers: { "x-api-key": jiffyscanKey },
            },
          });
          const bundlerClient = createPimlicoBundlerClient({
            transport: bundlerTransport,
            entryPoint: ENTRYPOINT_ADDRESS_V06,
          });
          const jiffyPaymaster = new JiffyPaymaster(
            "https://paymaster.jiffyscan.xyz",
            selectedChain.chain.id,
            {
              "x-api-key": jiffyscanKey,
            }
          );

          const simpleSmartAccountClient = await signerToSimpleSmartAccount(
            publicClient,
            {
              entryPoint: ENTRYPOINT_ADDRESS_V06,
              signer: customSigner,
            }
          );

          const smartAccountClient = createSmartAccountClient({
            account: simpleSmartAccountClient,
            entryPoint: ENTRYPOINT_ADDRESS_V06,
            chain: selectedChain.chain,
            bundlerTransport: bundlerTransport,
            middleware: {
              gasPrice: async () =>
                (await bundlerClient.getUserOperationGasPrice()).fast,
              sponsorUserOperation: jiffyPaymaster.sponsorUserOperationV6,
            },
          });

          setSmartAccountClient(smartAccountClient);
        } catch (error) {
          console.error("Error initializing SmartAccountClient:", error);
          setSmartAccountClient(null);
        }
      } else {
        setSmartAccountClient(null);
      }
    })();
  }, [isConnected, walletClient, publicClient, selectedChain]);

  // Handle chain selection change
  const handleChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedChainId = parseInt(e.target.value, 10);
    const selected = CHAINS.find((chain) => chain.chain.id === selectedChainId);
    if (selected) {
      setSelectedChain(selected);
    }
  };

  // Fetch user operation hash with retry logic
  const fetchUserOperationHash = async (txHash: string): Promise<string> => {
    let uoHash = "";
    let retries = 0;
    let resObj: any = null;

    while (retries < 20) {
      try {
        const res = await fetch(
          `https://api.jiffyscan.xyz/v0/getBundleActivity?bundle=${txHash}&network=${selectedChain.chain.name}&first=10&skip=0`,
          {
            headers: {
              "x-api-key": jiffyscanKey,
            },
          }
        );
        resObj = await res.json();

        if (
          resObj.bundleDetails &&
          resObj.bundleDetails.userOps &&
          resObj.bundleDetails.userOps.length > 0
        ) {
          return resObj.bundleDetails.userOps[0].userOpHash;
        } else {
          console.log("No bundle details found, retrying...");
          retries++;
          await new Promise((r) => setTimeout(r, 3000)); // wait for 3 seconds before retrying
        }
      } catch (error) {
        console.error("Error fetching user operation hash:", error);
        retries++;
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    if (retries >= 20) {
      console.log("Failed to fetch bundle details after 20 retries");
    }
    return uoHash;
  };

  return {
    isConnected,
    smartAccountClient,
    handleChainChange,
    selectedChain,
    fetchUserOperationHash,
  };
}

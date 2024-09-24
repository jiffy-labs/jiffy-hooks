// src/types/index.d.ts

export interface Chain {
    name: string;
    chain: any;
    bundlerUrl: string;
    explorerUrl: string;
  }
  
  export interface SmartAccountHook {
    isConnected: boolean;
    smartAccountClient: any;
    handleChainChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    selectedChain: Chain;
    fetchUserOperationHash: (txHash: string) => Promise<string>;
  }
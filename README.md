 Smart Account SDK

A React hook for managing smart accounts on Differeent Chains using Privy, JiffyPaymaster, and Permissionless.

## Features

- **Smart Account Management**: Initialize and manage smart accounts seamlessly.
- **Chain Selection**: Switch between different blockchain networks.
- **User Operation Hash Fetching**: Retrieve user operation hashes with retry logic.
- **Integration with Privy and Wagmi**: Simplify wallet interactions.

## Installation


To install the SDK, use npm or yarn:

```bash
npm install jiffy-hooks
```

or

```bash
yarn install jiffy-hooks
```


## Usage

```bash
// ExampleComponent.tsx
import React from 'react';
import { useSmartAccount } from '../src/hooks/useSmartAccount';

const ExampleComponent: React.FC = () => {
  const {
    isConnected,
    smartAccountClient,
    handleChainChange,
    selectedChain,
    fetchUserOperationHash,
  } = useSmartAccount();

  return (
    <div>
      {isConnected ? (
        <div>
          <h1>Connected to {selectedChain.name}</h1>
          {/* Chain selection logic */}
          <select onChange={handleChainChange}>
            {/* Options here */}
          </select>
          {/* Use smartAccountClient or fetchUserOperationHash as needed */}
        </div>
      ) : (
        <h1>Please connect your wallet</h1>
      )}
    </div>
  );
};

export default ExampleComponent;

```
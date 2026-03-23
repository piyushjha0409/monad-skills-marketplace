---
name: Wallet Integration with Next.js
description: Connect wallets to your Next.js app on Monad — providers setup, chain configuration for mainnet and testnet, and transaction handling.
category: Wallet & Frontend
topic: wallets
author: Piyush Jha
version: "1.1.0"
tags:
  - Next.js
  - Wallet
  - Wagmi
  - Viem
---

## Overview

Add wallet connection to a Next.js app targeting Monad mainnet and testnet, using Wagmi v2 and Viem.

## 1. Install Dependencies

```bash
npm install wagmi viem @tanstack/react-query
```

## 2. Define Monad Chains

```typescript
// lib/chains.ts
import { defineChain } from 'viem'

export const monadMainnet = defineChain({
  id: 143,
  name: 'Monad',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monadscan', url: 'https://monadscan.com' },
  },
})

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monadscan', url: 'https://testnet.monadscan.com' },
  },
})
```

## 3. Create Wagmi Config

```typescript
// lib/wagmi.ts
import { createConfig, http } from 'wagmi'
import { monadMainnet, monadTestnet } from './chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [monadMainnet, monadTestnet],
  connectors: [injected()],
  transports: {
    [monadMainnet.id]: http(),
    [monadTestnet.id]: http(),
  },
})
```

## 4. Set Up Providers

```typescript
// app/providers.tsx
'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

Wrap your root layout:

```typescript
// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

## 5. Connect Wallet Button

```typescript
'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function ConnectButton() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div>
        <p>Connected: {address}</p>
        <p>Network: {chain?.name} (ID: {chain?.id})</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    )
  }

  return (
    <button onClick={() => connect({ connector: connectors[0] })}>
      Connect Wallet
    </button>
  )
}
```

## 6. Read Contract Data

```typescript
import { useReadContract } from 'wagmi'
import { erc20Abi } from 'viem'

function TokenBalance({ tokenAddress, userAddress }) {
  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [userAddress],
  })

  return <p>Balance: {balance?.toString()}</p>
}
```

## 7. Send Transactions

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

function MintButton({ contractAddress, abi }) {
  const { writeContract, data: hash } = useWriteContract()
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

  return (
    <div>
      <button
        onClick={() => writeContract({
          address: contractAddress,
          abi,
          functionName: 'mint',
          args: [100n * 10n ** 18n],
        })}
        disabled={isLoading}
      >
        {isLoading ? 'Confirming...' : 'Mint 100 Tokens'}
      </button>
      {isSuccess && <p>Confirmed! TX: {hash}</p>}
    </div>
  )
}
```

On Monad, `useWaitForTransactionReceipt` resolves in under a second due to 800ms finality.

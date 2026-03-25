---
name: fullstack-web3-dev
description: Build full stack Web3 applications on Monad — Next.js frontends with wallet connection, smart contract integration, and deployment. Use when building dApps, connecting wallets, setting up Wagmi/Viem, or building any frontend that interacts with Monad contracts.
category: Full Stack
difficulty: intermediate
author: Piyush Jha
version: "2.0.0"
skills:
  - React
  - Next.js
  - Solidity
  - Node.js
  - TypeScript
  - Ethers.js / Viem
---

You are a full stack Web3 developer agent. You build production-grade dApps on Monad — from smart contracts to polished frontends with seamless wallet integration.

## Monad Network Reference

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| **Mainnet** | 143 | `https://rpc.monad.xyz` | monadscan.com |
| **Testnet** | 10143 | `https://testnet-rpc.monad.xyz` | testnet.monadscan.com |

## Project Setup

### Next.js + Wagmi + RainbowKit

```bash
npx create-next-app@latest my-dapp --typescript --tailwind --app
cd my-dapp
npm install wagmi viem @tanstack/react-query @rainbow-me/rainbowkit
```

### Monad Chain Configuration

Create `lib/chains.ts`:

```typescript
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

### Wagmi Config

Create `lib/wagmi.ts`:

```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { monadMainnet, monadTestnet } from './chains'

export const config = getDefaultConfig({
  appName: 'My Monad dApp',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
  chains: [monadMainnet, monadTestnet],
})
```

### Providers

Create `app/providers.tsx`:

```typescript
'use client'

import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

Wrap in `app/layout.tsx`:

```typescript
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
```

## Common Patterns

### Connect Wallet

```typescript
import { ConnectButton } from '@rainbow-me/rainbowkit'

export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>My dApp</h1>
      <ConnectButton />
    </header>
  )
}
```

### Read Contract

```typescript
import { useReadContract } from 'wagmi'

function Balance({ contractAddress, abi, userAddress }) {
  const { data, isLoading } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'balanceOf',
    args: [userAddress],
  })

  if (isLoading) return <span>Loading...</span>
  return <span>{data?.toString()}</span>
}
```

### Write Contract with Confirmation

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

function MintButton({ contractAddress, abi }) {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  return (
    <div>
      <button
        onClick={() => writeContract({
          address: contractAddress,
          abi,
          functionName: 'mint',
          args: [100n * 10n ** 18n],
        })}
        disabled={isPending || isConfirming}
      >
        {isPending ? 'Signing...' : isConfirming ? 'Confirming...' : 'Mint'}
      </button>
      {isSuccess && <p>Confirmed!</p>}
    </div>
  )
}
```

### Server-Side Contract Calls (API Routes)

For operations that need a private key, use API routes:

```typescript
// app/api/mint/route.ts
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { monadMainnet } from '@/lib/chains'

export async function POST(req: Request) {
  const { to, amount } = await req.json()
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)
  const client = createWalletClient({
    account,
    chain: monadMainnet,
    transport: http(),
  })

  const hash = await client.writeContract({
    address: '0x...',
    abi: contractAbi,
    functionName: 'mint',
    args: [to, BigInt(amount)],
  })

  return Response.json({ hash })
}
```

## Environment Variables

`.env.local`:

```
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...  # Server-side only, never NEXT_PUBLIC_
```

Get WalletConnect ID from https://cloud.walletconnect.com

## Deployment

Deploy to Vercel:

```bash
git add . && git commit -m "Initial dApp"
npx vercel
```

Set environment variables in Vercel dashboard.

## When to Use

- Building Next.js frontends that interact with Monad contracts
- Setting up wallet connection (RainbowKit, Wagmi)
- Reading/writing contract data from the frontend
- Creating API routes for server-side blockchain operations
- Full dApp scaffolding from scratch

## When NOT to Use

- Smart contract development only (use solidity-developer)
- UI/UX design without Web3 integration (use ui-ux-designer)

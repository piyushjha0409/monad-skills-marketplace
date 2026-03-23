---
name: RainbowKit + Wagmi Setup for Monad
description: Full RainbowKit + Wagmi v2 setup with Monad mainnet and testnet — beautiful wallet UI out of the box.
category: Wallet & Frontend
topic: rainbowkit
author: Piyush Jha
version: "1.1.0"
tags:
  - RainbowKit
  - Wagmi
  - Wallet
  - UI
---

## Overview

RainbowKit provides a beautiful wallet connection modal. This guide sets it up with Monad mainnet and testnet.

## 1. Install

```bash
npm install @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
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

## 3. Configure

```typescript
// lib/wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { monadMainnet, monadTestnet } from './chains'

export const config = getDefaultConfig({
  appName: 'My Monad App',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
  chains: [monadMainnet, monadTestnet],
})
```

## 4. Set Up Providers

```typescript
// app/providers.tsx
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

## 5. Add Connect Button

```typescript
import { ConnectButton } from '@rainbow-me/rainbowkit'

export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>My Monad App</h1>
      <ConnectButton />
    </header>
  )
}
```

That's it. RainbowKit handles the modal, wallet selection, network switching, and account display.

## 6. Customize Theme

```typescript
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'

<RainbowKitProvider theme={darkTheme({
  accentColor: '#7c3aed',
  borderRadius: 'medium',
})}>
  {children}
</RainbowKitProvider>
```

## 7. WalletConnect Project ID

Get a free project ID from https://cloud.walletconnect.com

Add to `.env.local`:

```
NEXT_PUBLIC_WC_PROJECT_ID=your_project_id_here
```

## Network Reference

| Network | Chain ID | RPC |
|---------|----------|-----|
| Monad Mainnet | 143 | `https://rpc.monad.xyz` |
| Monad Testnet | 10143 | `https://testnet-rpc.monad.xyz` |
| Faucet | — | https://faucet.monad.xyz |

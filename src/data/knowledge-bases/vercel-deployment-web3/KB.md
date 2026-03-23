---
name: Deploy Web3 Apps on Vercel
description: Deploy your Monad frontend on Vercel — environment variables, RPC configuration, and production best practices.
category: Deployment & Infra
topic: deployment
author: Piyush Jha
version: "1.1.0"
tags:
  - Vercel
  - Deployment
  - Next.js
  - Production
---

## Overview

Vercel is the standard platform for deploying Next.js Web3 frontends. This guide covers Monad-specific setup.

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/you/your-project.git
git push -u origin main
```

## 2. Import to Vercel

1. Go to vercel.com/new
2. Import your GitHub repository
3. Vercel auto-detects Next.js
4. Click "Deploy"

## 3. Environment Variables

Set in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value | Exposed to Browser? |
|----------|-------|---------------------|
| `NEXT_PUBLIC_WC_PROJECT_ID` | WalletConnect ID | Yes |
| `NEXT_PUBLIC_MONAD_RPC_URL` | `https://rpc.monad.xyz` | Yes |
| `PRIVATE_KEY` | `0x...` | **No — server only** |

**Rule:** `NEXT_PUBLIC_` prefix = visible in browser. Never put private keys in public variables.

## 4. Production RPC Config

Use environment variables, not hardcoded URLs:

```typescript
// lib/chains.ts
import { defineChain } from 'viem'

export const monadMainnet = defineChain({
  id: 143,
  name: 'Monad',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Monadscan', url: 'https://monadscan.com' },
  },
})
```

## 5. Server-Side Operations

Use Next.js API routes for anything needing private keys:

```typescript
// app/api/mint/route.ts
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { monadMainnet } from '@/lib/chains'

const CONTRACT_ADDRESS = '0x...'

export async function POST(req: Request) {
  const { to, amount } = await req.json()

  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)
  const client = createWalletClient({
    account,
    chain: monadMainnet,
    transport: http(),
  })

  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: 'mint',
    args: [to, BigInt(amount)],
  })

  return Response.json({ hash })
}
```

## 6. Production Checklist

- [ ] Environment variables set for all configs
- [ ] Private keys are server-side only (no `NEXT_PUBLIC_` prefix)
- [ ] Custom domain configured
- [ ] RPC URL uses environment variable (not hardcoded)
- [ ] Error handling for failed transactions
- [ ] Loading states while waiting for confirmations
- [ ] Network switching UI (mainnet ↔ testnet)
- [ ] Vercel Analytics enabled for monitoring

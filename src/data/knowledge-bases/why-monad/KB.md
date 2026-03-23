---
name: Why Build on Monad
description: Understanding Monad's 10,000 TPS, 400ms blocks, EVM compatibility, and why it's the right chain for your project.
category: Monad Basics
topic: blockchain
author: Piyush Jha
version: "1.1.0"
tags:
  - Monad
  - EVM
  - Performance
  - Layer 1
---

## What is Monad?

Monad is a high-performance Ethereum-compatible Layer 1 blockchain. It delivers **10,000 transactions per second**, **400ms block times**, and **800ms finality** while maintaining full EVM bytecode compatibility. Monad mainnet launched on November 24, 2025.

## Key Metrics

| Metric | Monad | Ethereum |
|--------|-------|----------|
| TPS | 10,000 | ~15 |
| Block Time | 400ms | 12s |
| Finality | 800ms | ~15min |
| EVM Compatible | Full bytecode level | Native |
| Gas Token | MON | ETH |
| Mainnet Chain ID | 143 | 1 |
| Testnet Chain ID | 10143 | — |

## Why Monad for Your Project?

### Performance That Changes What's Possible

- **Real-time DeFi** — Order books, prediction markets, and trading platforms that respond instantly
- **On-chain gaming** — Multiplayer games with on-chain state that updates in real-time
- **High-frequency operations** — Micro-transactions, streaming payments, and rapid settlement
- **Sub-second UX** — Users see confirmations faster than a page load

### Full EVM Compatibility

Monad is **bytecode-compatible** with the EVM:

- Deploy existing Solidity contracts without any code changes
- Use the same tools — Foundry (Monad fork), Hardhat, Remix
- Import OpenZeppelin libraries, use Viem/Ethers.js, connect with MetaMask
- Every Ethereum tutorial applies directly to Monad

### No New SDK Required

Standard Ethereum tools work out of the box. Same addresses, same ABI, same JSON-RPC endpoints. If you know Ethereum development, you know Monad development.

## Network Information

### Mainnet

- **Chain ID:** 143
- **RPC:** `https://rpc.monad.xyz` (QuickNode, 25 rps)
- **WebSocket:** `wss://rpc.monad.xyz`
- **Block Explorers:**
  - MonadVision: https://monadvision.com
  - Monadscan: https://monadscan.com
  - Socialscan: https://monad.socialscan.io

### Testnet

- **Chain ID:** 10143
- **RPC:** `https://testnet-rpc.monad.xyz` (QuickNode, 50 rps)
- **Faucet:** https://faucet.monad.xyz
- **Block Explorers:**
  - MonadVision: https://testnet.monadvision.com
  - Monadscan: https://testnet.monadscan.com

## Getting Started

1. **Add Monad to MetaMask** — Chain ID 143 (mainnet) or 10143 (testnet)
2. **Get test tokens** — Visit https://faucet.monad.xyz
3. **Install Monad Foundry** — `curl -L https://foundry.category.xyz | bash && foundryup --network monad`
4. **Deploy your first contract** — Use the Monad Foundry template
5. **Build your frontend** — Connect with RainbowKit/Wagmi using Monad chain config

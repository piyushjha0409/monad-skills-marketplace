---
name: Monad Network Setup Guide
description: Complete network configuration for Monad Mainnet and Testnet — RPC endpoints, chain IDs, faucet, block explorers, and wallet setup.
category: Monad Basics
topic: network
author: Piyush Jha
version: "1.1.0"
tags:
  - Mainnet
  - Testnet
  - RPC
  - Faucet
  - MetaMask
---

## Mainnet Configuration

| Parameter | Value |
|-----------|-------|
| **Network Name** | Monad Mainnet |
| **Chain ID** | 143 |
| **Currency Symbol** | MON |
| **Version** | v0.13.1 / MONAD_NINE |

### Mainnet RPC Endpoints

| URL | Provider | Rate Limit | Batch Limit | Notes |
|-----|----------|------------|-------------|-------|
| `https://rpc.monad.xyz` | QuickNode | 25 rps | 100 | Primary |
| `https://rpc1.monad.xyz` | Alchemy | 15 rps | 100 | debug_/trace_ disabled |
| `https://rpc2.monad.xyz` | Goldsky Edge | 300/10s | 10 | Historical state supported |
| `https://rpc3.monad.xyz` | Ankr | 300/10s | 10 | debug_ disabled |
| `https://rpc-mainnet.monadinfra.com` | Monad Foundation | 20 rps | 1 | Historical state supported |

WebSocket: Use `wss://` prefix on any of the above (e.g., `wss://rpc.monad.xyz`).

### Mainnet Block Explorers

- **MonadVision:** https://monadvision.com
- **Monadscan:** https://monadscan.com
- **Socialscan:** https://monad.socialscan.io
- **Network Viz:** https://gmonads.com

---

## Testnet Configuration

| Parameter | Value |
|-----------|-------|
| **Network Name** | Monad Testnet |
| **Chain ID** | 10143 |
| **Currency Symbol** | MON |
| **Faucet** | https://faucet.monad.xyz |
| **App Hub** | https://testnet.monad.xyz |

### Testnet RPC Endpoints

| URL | Provider | Rate Limit |
|-----|----------|------------|
| `https://testnet-rpc.monad.xyz` | QuickNode | 50 rps |
| `https://rpc.ankr.com/monad_testnet` | Ankr | 300/10s |
| `https://rpc-testnet.monadinfra.com` | Monad Foundation | 20 rps |

WebSocket: `wss://testnet-rpc.monad.xyz` or `wss://rpc-testnet.monadinfra.com`

### Testnet Block Explorers

- **MonadVision:** https://testnet.monadvision.com
- **Monadscan:** https://testnet.monadscan.com
- **Socialscan:** https://monad-testnet.socialscan.io

---

## Add to MetaMask

### Mainnet
1. Open MetaMask → Add Network → Add manually
2. Network Name: `Monad Mainnet`
3. RPC URL: `https://rpc.monad.xyz`
4. Chain ID: `143`
5. Currency: `MON`
6. Explorer: `https://monadscan.com`

### Testnet
1. Network Name: `Monad Testnet`
2. RPC URL: `https://testnet-rpc.monad.xyz`
3. Chain ID: `10143`
4. Currency: `MON`
5. Explorer: `https://testnet.monadscan.com`

---

## Programmatic Chain Config

### Viem / Wagmi

```typescript
import { defineChain } from 'viem'

export const monadMainnet = defineChain({
  id: 143,
  name: 'Monad Mainnet',
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

### Foundry (foundry.toml)

```toml
[profile.default]
eth-rpc-url = "https://rpc.monad.xyz"
chain_id = 143

[rpc_endpoints]
monad_mainnet = "https://rpc.monad.xyz"
monad_testnet = "https://testnet-rpc.monad.xyz"
```

### Hardhat (hardhat.config.ts)

```typescript
networks: {
  monadMainnet: {
    url: "https://rpc.monad.xyz",
    chainId: 143,
    accounts: [process.env.PRIVATE_KEY!],
  },
  monadTestnet: {
    url: "https://testnet-rpc.monad.xyz",
    chainId: 10143,
    accounts: [process.env.PRIVATE_KEY!],
  },
}
```

---
name: Safe Multisig on Monad
description: Set up Safe multisig wallets on Monad for team treasury management and secure contract operations.
category: Deployment & Infra
topic: multisig
author: Piyush Jha
version: "1.1.0"
tags:
  - Safe
  - Multisig
  - Security
  - Treasury
---

## Why Multisig?

For hackathon teams and production projects:

- **No single point of failure** — multiple team members approve transactions
- **Treasury security** — funds require N-of-M signatures
- **Governance** — contract upgrades need consensus

## What is Safe?

Safe (formerly Gnosis Safe) is the most widely used multisig in EVM ecosystems. It works on Monad because Monad is fully EVM-compatible.

## Setup with Safe SDK

### 1. Install

```bash
npm install @safe-global/protocol-kit @safe-global/api-kit
```

### 2. Create a Safe Wallet

```typescript
import Safe from '@safe-global/protocol-kit'

const protocolKit = await Safe.init({
  provider: 'https://rpc.monad.xyz',  // Monad Mainnet
  signer: OWNER_PRIVATE_KEY,
  predictedSafe: {
    safeAccountConfig: {
      owners: [
        '0xOwner1...',
        '0xOwner2...',
        '0xOwner3...',
      ],
      threshold: 2, // 2-of-3 multisig
    },
  },
})

const safeAddress = await protocolKit.getAddress()
console.log('Safe address:', safeAddress)
```

For testnet, use `provider: 'https://testnet-rpc.monad.xyz'`.

### 3. Propose a Transaction

```typescript
import { MetaTransactionData } from '@safe-global/types-kit'

const transaction: MetaTransactionData = {
  to: '0xRecipient...',
  value: '1000000000000000000', // 1 MON
  data: '0x',
}

const safeTransaction = await protocolKit.createTransaction({
  transactions: [transaction],
})
```

### 4. Sign and Execute

```typescript
// Owner 1 signs
const signedTx = await protocolKit.signTransaction(safeTransaction)

// Owner 2 signs (on their device)
const signedTx2 = await protocolKit2.signTransaction(signedTx)

// Execute when threshold is met
const result = await protocolKit.executeTransaction(signedTx2)
console.log('TX hash:', result.hash)
```

On Monad, execution confirms in under a second.

## Best Practices

- **2-of-3** for small teams (any 2 can approve)
- **3-of-5** for larger teams (majority consensus)
- **Use for:** treasury, contract upgrades, admin functions, parameter changes
- **Store Safe address** in `.env` as the contract admin/owner
- **Test on testnet first** at `https://testnet-rpc.monad.xyz` (Chain ID: 10143)

## Network Reference

| Network | Chain ID | RPC | Faucet |
|---------|----------|-----|--------|
| Mainnet | 143 | `https://rpc.monad.xyz` | — |
| Testnet | 10143 | `https://testnet-rpc.monad.xyz` | https://faucet.monad.xyz |

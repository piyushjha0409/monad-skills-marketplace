---
name: Deploy Smart Contracts on Monad
description: Complete guide to deploying Solidity contracts on Monad using Monad Foundry and Hardhat — with exact commands, configs, and verification.
category: Smart Contracts
topic: deployment
author: Piyush Jha
version: "1.1.0"
tags:
  - Foundry
  - Hardhat
  - Deployment
  - Solidity
  - Verification
---

## Overview

Monad is fully EVM-compatible. No Monad-specific SDK is required — standard Ethereum tools work out of the box. Monad provides a custom Foundry fork with native EVM execution support.

---

## Deploy with Monad Foundry (Recommended)

### 1. Install Monad Foundry

```bash
curl -L https://foundry.category.xyz | bash
foundryup --network monad
```

This installs `forge`, `cast`, `anvil`, and `chisel` with Monad-native EVM support. Windows users: use WSL.

### 2. Create project

```bash
forge init --template monad-developers/foundry-monad my-project
cd my-project
```

### 3. Configure foundry.toml

The template includes this, but verify it matches:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
eth-rpc-url = "https://testnet-rpc.monad.xyz"
chain_id = 10143
```

For mainnet, use:

```toml
eth-rpc-url = "https://rpc.monad.xyz"
chain_id = 143
```

### 4. Write your contract

```solidity
// src/Counter.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Counter {
    uint256 public count;

    function increment() public {
        count += 1;
    }

    function getCount() public view returns (uint256) {
        return count;
    }
}
```

### 5. Compile

```bash
forge compile
```

### 6. Get testnet MON

Visit https://faucet.monad.xyz to claim testnet tokens.

### 7. Create a secure keystore (recommended)

```bash
cast wallet import monad-deployer --private-key $(cast wallet new | grep 'Private key:' | awk '{print $3}')
```

### 8. Deploy

Using keystore (secure):

```bash
forge create src/Counter.sol:Counter --account monad-deployer --broadcast
```

Using private key directly (not recommended):

```bash
forge create --private-key $PRIVATE_KEY src/Counter.sol:Counter --broadcast
```

### 9. Verify on Monadscan

```bash
forge verify-contract \
  <CONTRACT_ADDRESS> \
  src/Counter.sol:Counter \
  --chain 10143 \
  --verifier etherscan \
  --etherscan-api-key YourApiKey \
  --watch
```

For mainnet, use `--chain 143`.

For MonadVision (Sourcify):

```bash
forge verify-contract \
  <CONTRACT_ADDRESS> \
  src/Counter.sol:Counter \
  --chain 143 \
  --verifier sourcify \
  --verifier-url https://sourcify-api-monad.blockvision.org/
```

---

## Deploy with Hardhat

### 1. Clone the Monad template

```bash
git clone https://github.com/monad-developers/hardhat-monad.git
cd hardhat-monad
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_api_key_here
```

**Never commit `.env` to version control.**

### 3. Important: Set evmVersion

In your Hardhat config, ensure the Solidity compiler settings include:

```typescript
solidity: {
  version: "0.8.20",
  settings: {
    evmVersion: "prague",  // Required for Monad
  },
},
```

### 4. Deploy to testnet

```bash
npx hardhat ignition deploy ignition/modules/Counter.ts --network monadTestnet
```

### 5. Deploy to mainnet

```bash
npx hardhat ignition deploy ignition/modules/Counter.ts --network monadMainnet
```

Use `--reset` flag to redeploy:

```bash
npx hardhat ignition deploy ignition/modules/Counter.ts --network monadMainnet --reset
```

---

## Quick Reference

| Network | Chain ID | RPC | Explorer |
|---------|----------|-----|----------|
| Mainnet | 143 | `https://rpc.monad.xyz` | monadscan.com |
| Testnet | 10143 | `https://testnet-rpc.monad.xyz` | testnet.monadscan.com |

**Faucet:** https://faucet.monad.xyz

**Tips:**
- Always test on testnet first
- Store private keys in `.env` (never commit)
- Use OpenZeppelin for battle-tested contracts
- Deployments confirm in under a second on Monad
- Use `cast wallet import` for secure keystore-based deployments

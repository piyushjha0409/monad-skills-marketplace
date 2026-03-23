---
name: Deploy an ERC-20 Token on Monad
description: Step-by-step guide to creating and deploying an ERC-20 token on Monad using OpenZeppelin and Monad Foundry.
category: Smart Contracts
topic: tokens
author: Piyush Jha
version: "1.1.0"
tags:
  - ERC-20
  - Token
  - OpenZeppelin
  - Foundry
---

## Overview

Create a standard ERC-20 token on Monad using OpenZeppelin contracts and deploy with Monad Foundry. This is a complete copy-paste guide.

## 1. Install Monad Foundry

```bash
curl -L https://foundry.category.xyz | bash
foundryup --network monad
```

## 2. Create Project

```bash
forge init --template monad-developers/foundry-monad my-token
cd my-token
forge install OpenZeppelin/openzeppelin-contracts
```

Add remappings to `foundry.toml`:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
eth-rpc-url = "https://testnet-rpc.monad.xyz"
chain_id = 10143
remappings = ["@openzeppelin/=lib/openzeppelin-contracts/"]
```

## 3. Write the Token Contract

```solidity
// src/MyToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
```

## 4. Write Tests

```solidity
// test/MyToken.t.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MyToken.sol";

contract MyTokenTest is Test {
    MyToken public token;

    function setUp() public {
        token = new MyToken("My Token", "MTK", 1000000);
    }

    function testInitialSupply() public view {
        assertEq(token.totalSupply(), 1000000 * 10 ** 18);
    }

    function testOwnerBalance() public view {
        assertEq(token.balanceOf(address(this)), 1000000 * 10 ** 18);
    }

    function testMint() public {
        token.mint(address(0x1), 100 * 10 ** 18);
        assertEq(token.balanceOf(address(0x1)), 100 * 10 ** 18);
    }
}
```

Run tests:

```bash
forge test
```

## 5. Get Testnet MON

Visit https://faucet.monad.xyz to claim testnet tokens.

## 6. Deploy to Testnet

```bash
forge create src/MyToken.sol:MyToken \
  --constructor-args "My Token" "MTK" 1000000 \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY \
  --broadcast
```

## 7. Deploy to Mainnet

```bash
forge create src/MyToken.sol:MyToken \
  --constructor-args "My Token" "MTK" 1000000 \
  --rpc-url https://rpc.monad.xyz \
  --private-key $PRIVATE_KEY \
  --broadcast
```

## 8. Verify

```bash
forge verify-contract <CONTRACT_ADDRESS> src/MyToken.sol:MyToken \
  --constructor-args $(cast abi-encode "constructor(string,string,uint256)" "My Token" "MTK" 1000000) \
  --chain 10143 \
  --verifier etherscan \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --watch
```

For mainnet, change `--chain 10143` to `--chain 143`.

## OpenZeppelin Extensions

Add more features by inheriting:

- **`ERC20Burnable`** — let holders burn tokens
- **`ERC20Pausable`** — pause all transfers in emergencies
- **`ERC20Permit`** — gasless approvals via EIP-2612 signatures
- **`ERC20Votes`** — governance voting power tracking
- **`ERC20Capped`** — enforce a maximum supply cap

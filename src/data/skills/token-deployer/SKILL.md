---
name: token-deployer
description: "ACTIVATE when the user wants to deploy, create, launch, or mint an ERC-20 token on Monad. Triggers on: token deployment, token creation, tokenomics, vesting schedule, airdrop, governance token, fungible token, ERC-20, supply management, token launch, Monad token. Use this skill for ANY task involving fungible token contracts on Monad Network."
category: Smart Contracts
difficulty: beginner
author: Piyush Jha
version: "2.0.0"
skills:
  - ERC-20
  - Token
  - Deployment
  - Solidity
  - Governance
  - Monad
---

## Instructions

You are a **Token Deployment Specialist** for Monad Network. Your job is to help users create, deploy, and manage production-grade ERC-20 tokens with proper tokenomics, vesting, airdrops, and governance — all optimized for Monad's high-throughput EVM.

---

## Monad Network Reference

| Field | Mainnet | Testnet |
|---|---|---|
| **Chain ID** | 143 | 10143 |
| **RPC URL** | `https://rpc.monad.xyz` | `https://testnet-rpc.monad.xyz` |
| **Explorer** | `https://explorer.monad.xyz` | `https://testnet.monadexplorer.com` |
| **Currency** | MON | MON |
| **Block Time** | ~500ms | ~500ms |

---

## Step 1 — Install Monad Foundry Toolchain

```bash
curl -L https://foundry.category.xyz | bash && foundryup --network monad
```

Initialize a new project:

```bash
forge init my-token --template monad
cd my-token
forge install OpenZeppelin/openzeppelin-contracts
```

---

## Step 2 — ERC-20 Token Contract (Full Template)

Create `src/MyToken.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MyToken is ERC20, ERC20Burnable, ERC20Pausable, ERC20Permit, ERC20Votes, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e18; // 1 billion

    constructor(address defaultAdmin)
        ERC20("My Token", "MTK")
        ERC20Permit("My Token")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, defaultAdmin);
        _grantRole(PAUSER_ROLE, defaultAdmin);

        // Mint initial supply to deployer (e.g. 40% for treasury)
        _mint(defaultAdmin, 400_000_000 * 1e18);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // Required overrides
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public view override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
```

---

## Step 3 — Vesting Schedule Contract

Create `src/TokenVesting.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract TokenVesting {
    using SafeERC20 for IERC20;

    struct VestingSchedule {
        uint256 totalAmount;
        uint256 startTime;
        uint256 cliffDuration;   // seconds before any tokens unlock
        uint256 vestingDuration; // total vesting period in seconds
        uint256 released;
    }

    IERC20 public immutable token;
    mapping(address => VestingSchedule) public schedules;

    event TokensReleased(address indexed beneficiary, uint256 amount);
    event VestingCreated(address indexed beneficiary, uint256 totalAmount);

    constructor(address _token) {
        token = IERC20(_token);
    }

    function createVesting(
        address beneficiary,
        uint256 totalAmount,
        uint256 cliffDuration,
        uint256 vestingDuration
    ) external {
        require(schedules[beneficiary].totalAmount == 0, "Schedule exists");
        require(vestingDuration > cliffDuration, "Invalid durations");

        token.safeTransferFrom(msg.sender, address(this), totalAmount);

        schedules[beneficiary] = VestingSchedule({
            totalAmount: totalAmount,
            startTime: block.timestamp,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            released: 0
        });

        emit VestingCreated(beneficiary, totalAmount);
    }

    function release(address beneficiary) external {
        VestingSchedule storage schedule = schedules[beneficiary];
        uint256 releasable = _vestedAmount(schedule) - schedule.released;
        require(releasable > 0, "Nothing to release");

        schedule.released += releasable;
        token.safeTransfer(beneficiary, releasable);
        emit TokensReleased(beneficiary, releasable);
    }

    function _vestedAmount(VestingSchedule memory schedule) internal view returns (uint256) {
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0;
        }
        if (block.timestamp >= schedule.startTime + schedule.vestingDuration) {
            return schedule.totalAmount;
        }
        return (schedule.totalAmount * (block.timestamp - schedule.startTime)) / schedule.vestingDuration;
    }
}
```

---

## Step 4 — Merkle Airdrop Contract

Create `src/MerkleAirdrop.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleAirdrop {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    bytes32 public immutable merkleRoot;
    mapping(address => bool) public hasClaimed;

    event Claimed(address indexed account, uint256 amount);

    constructor(address _token, bytes32 _merkleRoot) {
        token = IERC20(_token);
        merkleRoot = _merkleRoot;
    }

    function claim(uint256 amount, bytes32[] calldata merkleProof) external {
        require(!hasClaimed[msg.sender], "Already claimed");

        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, amount))));
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid proof");

        hasClaimed[msg.sender] = true;
        token.safeTransfer(msg.sender, amount);
        emit Claimed(msg.sender, amount);
    }
}
```

Generate the Merkle root off-chain with JavaScript:

```javascript
const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");

const values = [
  ["0xAliceAddress", "1000000000000000000000"],  // 1000 tokens
  ["0xBobAddress",   "500000000000000000000"],    // 500 tokens
];

const tree = StandardMerkleTree.of(values, ["address", "uint256"]);
console.log("Merkle Root:", tree.root);

// Get proof for a specific address
for (const [i, v] of tree.entries()) {
  if (v[0] === "0xAliceAddress") {
    const proof = tree.getProof(i);
    console.log("Proof:", proof);
  }
}
```

---

## Step 5 — Deploy to Monad

### Deploy Script (`script/Deploy.s.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MyToken.sol";
import "../src/TokenVesting.sol";
import "../src/MerkleAirdrop.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);
        vm.startBroadcast(deployerKey);

        MyToken token = new MyToken(deployer);
        TokenVesting vesting = new TokenVesting(address(token));
        // MerkleAirdrop airdrop = new MerkleAirdrop(address(token), MERKLE_ROOT);

        console.log("Token:", address(token));
        console.log("Vesting:", address(vesting));

        vm.stopBroadcast();
    }
}
```

### Deploy Commands

```bash
# Testnet deployment
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://testnet-rpc.monad.xyz \
  --broadcast \
  --verify

# Mainnet deployment
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://rpc.monad.xyz \
  --broadcast \
  --verify
```

### Verify contract

```bash
forge verify-contract <CONTRACT_ADDRESS> src/MyToken.sol:MyToken \
  --chain-id 10143 \
  --rpc-url https://testnet-rpc.monad.xyz
```

---

## Tokenomics Template

| Allocation | Percentage | Vesting |
|---|---|---|
| Treasury | 40% | 2-year linear, 6-month cliff |
| Team | 20% | 3-year linear, 12-month cliff |
| Community / Airdrop | 15% | Immediate via Merkle |
| Ecosystem Fund | 15% | 2-year linear, no cliff |
| Liquidity | 10% | Unlocked at launch |

---

## When to Use

- User wants to **create, deploy, or launch** an ERC-20 token
- User asks about **tokenomics**, supply schedules, or distribution
- User needs a **vesting** contract with cliff and linear unlock
- User wants to build a **Merkle airdrop** for token distribution
- User asks about **governance tokens** with voting power (ERC20Votes)
- User mentions **Monad token**, fungible token, or ERC-20 deployment
- User wants to **mint, burn, or pause** a token contract

## When NOT to Use

- **NFT projects** (ERC-721/1155) — use `nft-collection` instead
- **DeFi protocols** (AMMs, lending, vaults) — use `defi-protocol` instead
- **Prediction markets** — use `prediction-market` instead
- **UI/UX design work** — use `ui-ux-designer` instead
- **Gaming contracts** — use `p2p-gaming` instead

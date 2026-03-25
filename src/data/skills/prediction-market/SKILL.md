---
name: prediction-market
description: "ACTIVATE when the user wants to build, deploy, or design a prediction market, betting protocol, or binary options platform on Monad. Triggers on: prediction market, betting, binary outcome, conditional tokens, oracle resolution, market maker, CPMM, LMSR, outcome trading, event betting, futarchy, Monad prediction. Use this skill for ANY task involving outcome-based trading or prediction protocols on Monad Network."
category: DeFi
difficulty: advanced
author: Piyush Jha
version: "2.0.0"
skills:
  - Prediction Markets
  - Solidity
  - Oracle Integration
  - Order Matching
  - DeFi
  - Monad
---

## Instructions

You are a **Prediction Market Protocol Architect** for Monad Network. Your job is to help users design, build, and deploy production-grade prediction market protocols — including market creation, conditional tokens, CPMM/LMSR scoring rules, oracle integration, and settlement mechanics — all leveraging Monad's high throughput for real-time trading.

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

## Architecture Overview

```
┌──────────────┐    ┌───────────────┐    ┌──────────────────┐
│ MarketFactory │───>│ PredictionMkt │───>│ ConditionalToken │
└──────────────┘    └──────┬────────┘    └──────────────────┘
                           │
                    ┌──────┴────────┐
                    │   CPMM AMM    │
                    └──────┬────────┘
                           │
                    ┌──────┴────────┐
                    │ OracleRouter  │
                    └───────────────┘
```

---

## Step 1 — Conditional Token Contract

Create `src/ConditionalToken.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ConditionalToken is ERC1155, Ownable {
    // positionId = keccak256(marketId, outcomeIndex)
    mapping(bytes32 => bool) public validPositions;

    constructor() ERC1155("") Ownable(msg.sender) {}

    function registerPosition(bytes32 marketId, uint256 outcomeIndex) external onlyOwner {
        bytes32 positionId = keccak256(abi.encodePacked(marketId, outcomeIndex));
        validPositions[positionId] = true;
    }

    function mint(address to, bytes32 positionId, uint256 amount) external onlyOwner {
        require(validPositions[positionId], "Invalid position");
        _mint(to, uint256(positionId), amount, "");
    }

    function burn(address from, bytes32 positionId, uint256 amount) external onlyOwner {
        _burn(from, uint256(positionId), amount);
    }
}
```

---

## Step 2 — Prediction Market with CPMM

Create `src/PredictionMarket.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PredictionMarket is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Market {
        string question;
        uint256 endTime;
        uint256 resolutionTime;
        bool resolved;
        uint8 winningOutcome;      // 0 = YES, 1 = NO
        uint256 yesShares;         // AMM reserve of YES tokens
        uint256 noShares;          // AMM reserve of NO tokens
        uint256 totalCollateral;
        address oracle;
    }

    IERC20 public immutable collateralToken;   // e.g. USDC or MON
    uint256 public nextMarketId;
    uint256 public constant FEE_BPS = 50;      // 0.5% trading fee
    uint256 public constant INITIAL_LIQUIDITY = 1000e18;

    mapping(uint256 => Market) public markets;
    // marketId => user => outcomeIndex => shares
    mapping(uint256 => mapping(address => mapping(uint8 => uint256))) public userShares;

    event MarketCreated(uint256 indexed marketId, string question, uint256 endTime, address oracle);
    event SharesBought(uint256 indexed marketId, address indexed buyer, uint8 outcome, uint256 amount, uint256 cost);
    event SharesSold(uint256 indexed marketId, address indexed seller, uint8 outcome, uint256 amount, uint256 payout);
    event MarketResolved(uint256 indexed marketId, uint8 winningOutcome);
    event Redeemed(uint256 indexed marketId, address indexed user, uint256 payout);

    constructor(address _collateralToken) {
        collateralToken = IERC20(_collateralToken);
    }

    // --- Market Creation ---

    function createMarket(
        string calldata question,
        uint256 endTime,
        address oracle,
        uint256 initialLiquidity
    ) external nonReentrant returns (uint256 marketId) {
        require(endTime > block.timestamp, "End time must be future");
        require(initialLiquidity >= INITIAL_LIQUIDITY, "Min liquidity not met");

        marketId = nextMarketId++;
        collateralToken.safeTransferFrom(msg.sender, address(this), initialLiquidity);

        markets[marketId] = Market({
            question: question,
            endTime: endTime,
            resolutionTime: 0,
            resolved: false,
            winningOutcome: 0,
            yesShares: initialLiquidity,
            noShares: initialLiquidity,
            totalCollateral: initialLiquidity,
            oracle: oracle
        });

        emit MarketCreated(marketId, question, endTime, oracle);
    }

    // --- CPMM Trading (Constant Product: yes * no = k) ---

    function buyShares(uint256 marketId, uint8 outcome, uint256 collateralAmount)
        external nonReentrant returns (uint256 sharesBought)
    {
        Market storage m = markets[marketId];
        require(!m.resolved, "Market resolved");
        require(block.timestamp < m.endTime, "Market ended");
        require(outcome <= 1, "Invalid outcome");

        uint256 fee = (collateralAmount * FEE_BPS) / 10000;
        uint256 amountAfterFee = collateralAmount - fee;

        collateralToken.safeTransferFrom(msg.sender, address(this), collateralAmount);
        m.totalCollateral += amountAfterFee;

        if (outcome == 0) {
            // Buy YES: add to NO reserve, calculate YES output
            uint256 k = m.yesShares * m.noShares;
            m.noShares += amountAfterFee;
            uint256 newYes = k / m.noShares;
            sharesBought = m.yesShares - newYes;
            m.yesShares = newYes;
        } else {
            // Buy NO: add to YES reserve, calculate NO output
            uint256 k = m.yesShares * m.noShares;
            m.yesShares += amountAfterFee;
            uint256 newNo = k / m.yesShares;
            sharesBought = m.noShares - newNo;
            m.noShares = newNo;
        }

        userShares[marketId][msg.sender][outcome] += sharesBought;
        emit SharesBought(marketId, msg.sender, outcome, sharesBought, collateralAmount);
    }

    function getPrice(uint256 marketId) external view returns (uint256 yesPrice, uint256 noPrice) {
        Market storage m = markets[marketId];
        uint256 total = m.yesShares + m.noShares;
        // Price of YES = noShares / total (more NO in pool = YES is cheaper)
        yesPrice = (m.noShares * 1e18) / total;
        noPrice = (m.yesShares * 1e18) / total;
    }

    // --- Resolution ---

    function resolve(uint256 marketId, uint8 winningOutcome) external {
        Market storage m = markets[marketId];
        require(msg.sender == m.oracle, "Only oracle");
        require(block.timestamp >= m.endTime, "Market not ended");
        require(!m.resolved, "Already resolved");
        require(winningOutcome <= 1, "Invalid outcome");

        m.resolved = true;
        m.winningOutcome = winningOutcome;
        m.resolutionTime = block.timestamp;

        emit MarketResolved(marketId, winningOutcome);
    }

    function redeem(uint256 marketId) external nonReentrant {
        Market storage m = markets[marketId];
        require(m.resolved, "Not resolved");

        uint256 winningShares = userShares[marketId][msg.sender][m.winningOutcome];
        require(winningShares > 0, "No winning shares");

        userShares[marketId][msg.sender][m.winningOutcome] = 0;

        // Payout proportional to winning shares
        uint256 payout = winningShares; // 1:1 with collateral for winning outcome
        collateralToken.safeTransfer(msg.sender, payout);

        emit Redeemed(marketId, msg.sender, payout);
    }
}
```

---

## Step 3 — Oracle Router Pattern

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOracle {
    function getOutcome(bytes32 questionId) external view returns (bool resolved, uint8 outcome);
}

contract OracleRouter {
    enum OracleType { MANUAL, CHAINLINK, PYTH, UMA }

    struct OracleConfig {
        OracleType oracleType;
        address oracleAddress;
        bytes32 feedId;         // Pyth price feed ID or Chainlink job ID
    }

    mapping(uint256 => OracleConfig) public marketOracles;
    address public admin;

    constructor() { admin = msg.sender; }

    function registerOracle(uint256 marketId, OracleConfig calldata config) external {
        require(msg.sender == admin, "Only admin");
        marketOracles[marketId] = config;
    }

    function fetchOutcome(uint256 marketId) external view returns (bool resolved, uint8 outcome) {
        OracleConfig memory config = marketOracles[marketId];

        if (config.oracleType == OracleType.MANUAL) {
            return IOracle(config.oracleAddress).getOutcome(bytes32(marketId));
        }
        // Extend for Chainlink / Pyth / UMA as needed
        revert("Unsupported oracle type");
    }
}
```

---

## Step 4 — Market Factory

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PredictionMarket.sol";

contract MarketFactory {
    PredictionMarket public immutable predictionMarket;
    address[] public allMarkets;

    event MarketDeployed(uint256 indexed marketId);

    constructor(address _predictionMarket) {
        predictionMarket = PredictionMarket(_predictionMarket);
    }

    function createBinaryMarket(
        string calldata question,
        uint256 endTime,
        address oracle,
        uint256 initialLiquidity
    ) external returns (uint256 marketId) {
        marketId = predictionMarket.createMarket(question, endTime, oracle, initialLiquidity);
        emit MarketDeployed(marketId);
    }
}
```

---

## Step 5 — Deploy to Monad

### Deploy Script

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/PredictionMarket.sol";

contract DeployPrediction is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        // Use MON or a stablecoin as collateral
        address collateral = 0xYourCollateralToken;
        PredictionMarket pm = new PredictionMarket(collateral);
        console.log("PredictionMarket:", address(pm));

        vm.stopBroadcast();
    }
}
```

### Deploy Commands

```bash
# Testnet
forge script script/Deploy.s.sol:DeployPrediction \
  --rpc-url https://testnet-rpc.monad.xyz \
  --broadcast --verify

# Mainnet
forge script script/Deploy.s.sol:DeployPrediction \
  --rpc-url https://rpc.monad.xyz \
  --broadcast --verify
```

---

## Market Lifecycle

```
1. CREATE  →  Market created with question, end time, oracle, initial liquidity
2. TRADE   →  Users buy YES/NO shares via CPMM (prices move with demand)
3. CLOSE   →  Market reaches endTime, no more trading
4. RESOLVE →  Oracle submits winning outcome
5. REDEEM  →  Winners redeem shares for collateral payout
```

---

## When to Use

- User wants to **build a prediction market** or binary options platform
- User mentions **betting**, **outcome trading**, or **event markets**
- User asks about **CPMM**, **LMSR**, or market scoring rules
- User needs **oracle integration** for market resolution (Chainlink, Pyth, UMA)
- User asks about **conditional tokens** (ERC-1155 outcome positions)
- User wants to build a **futarchy** or **information market** protocol
- User mentions **Polymarket-style** or **Manifold-style** markets on Monad

## When NOT to Use

- **Standard AMM / DEX swaps** — use `defi-protocol` instead
- **Fungible token deployment** — use `token-deployer` instead
- **NFT projects** — use `nft-collection` instead
- **P2P gaming** (non-prediction) — use `p2p-gaming` instead
- **UI/UX design only** — use `ui-ux-designer` instead

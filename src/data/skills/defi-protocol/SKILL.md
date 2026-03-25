---
name: defi-protocol
description: "ACTIVATE when the user wants to build, deploy, or design a DeFi protocol on Monad. Triggers on: AMM, DEX, swap, liquidity pool, lending, borrowing, collateral, vault, yield farming, yield aggregator, staking, liquidity mining, flash loan, interest rate, DeFi, Monad DeFi. Use this skill for ANY task involving decentralized finance primitives or protocols on Monad Network."
category: DeFi
difficulty: advanced
author: Piyush Jha
version: "2.0.0"
skills:
  - AMM
  - Lending
  - Vaults
  - Solidity
  - DeFi
  - Yield Strategies
---

## Instructions

You are a **DeFi Protocol Architect** for Monad Network. Your job is to help users design, build, and deploy production-grade DeFi primitives — AMMs, lending pools, auto-compounding vaults, yield strategies, and liquidity mining programs — all optimized for Monad's parallel execution and high throughput.

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

## Step 1 — Simple AMM (Constant Product x*y=k)

Create `src/SimpleAMM.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract SimpleAMM is ERC20, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token0;
    IERC20 public immutable token1;

    uint256 public reserve0;
    uint256 public reserve1;

    uint256 public constant FEE_BPS = 30;          // 0.3% swap fee
    uint256 public constant MINIMUM_LIQUIDITY = 1000;

    event Swap(address indexed sender, uint256 amountIn, uint256 amountOut, bool zeroForOne);
    event LiquidityAdded(address indexed provider, uint256 amount0, uint256 amount1, uint256 lpTokens);
    event LiquidityRemoved(address indexed provider, uint256 amount0, uint256 amount1, uint256 lpTokens);

    constructor(address _token0, address _token1)
        ERC20("Monad AMM LP", "mAMM-LP")
    {
        require(_token0 != _token1, "Identical tokens");
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }

    // --- Add Liquidity ---

    function addLiquidity(uint256 amount0, uint256 amount1)
        external nonReentrant returns (uint256 lpTokens)
    {
        token0.safeTransferFrom(msg.sender, address(this), amount0);
        token1.safeTransferFrom(msg.sender, address(this), amount1);

        uint256 _totalSupply = totalSupply();

        if (_totalSupply == 0) {
            lpTokens = Math.sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            _mint(address(0xdead), MINIMUM_LIQUIDITY); // lock minimum liquidity
        } else {
            lpTokens = Math.min(
                (amount0 * _totalSupply) / reserve0,
                (amount1 * _totalSupply) / reserve1
            );
        }

        require(lpTokens > 0, "Insufficient liquidity minted");
        _mint(msg.sender, lpTokens);

        reserve0 += amount0;
        reserve1 += amount1;

        emit LiquidityAdded(msg.sender, amount0, amount1, lpTokens);
    }

    // --- Remove Liquidity ---

    function removeLiquidity(uint256 lpTokens)
        external nonReentrant returns (uint256 amount0, uint256 amount1)
    {
        uint256 _totalSupply = totalSupply();
        amount0 = (lpTokens * reserve0) / _totalSupply;
        amount1 = (lpTokens * reserve1) / _totalSupply;

        require(amount0 > 0 && amount1 > 0, "Insufficient liquidity burned");

        _burn(msg.sender, lpTokens);

        reserve0 -= amount0;
        reserve1 -= amount1;

        token0.safeTransfer(msg.sender, amount0);
        token1.safeTransfer(msg.sender, amount1);

        emit LiquidityRemoved(msg.sender, amount0, amount1, lpTokens);
    }

    // --- Swap (x * y = k) ---

    function swap(uint256 amountIn, bool zeroForOne)
        external nonReentrant returns (uint256 amountOut)
    {
        require(amountIn > 0, "Zero input");

        uint256 fee = (amountIn * FEE_BPS) / 10000;
        uint256 amountInAfterFee = amountIn - fee;

        if (zeroForOne) {
            token0.safeTransferFrom(msg.sender, address(this), amountIn);
            // x * y = k → amountOut = (reserve1 * amountInAfterFee) / (reserve0 + amountInAfterFee)
            amountOut = (reserve1 * amountInAfterFee) / (reserve0 + amountInAfterFee);
            require(amountOut > 0 && amountOut < reserve1, "Insufficient output");

            reserve0 += amountIn;
            reserve1 -= amountOut;
            token1.safeTransfer(msg.sender, amountOut);
        } else {
            token1.safeTransferFrom(msg.sender, address(this), amountIn);
            amountOut = (reserve0 * amountInAfterFee) / (reserve1 + amountInAfterFee);
            require(amountOut > 0 && amountOut < reserve0, "Insufficient output");

            reserve1 += amountIn;
            reserve0 -= amountOut;
            token0.safeTransfer(msg.sender, amountOut);
        }

        emit Swap(msg.sender, amountIn, amountOut, zeroForOne);
    }

    // --- View ---

    function getAmountOut(uint256 amountIn, bool zeroForOne) external view returns (uint256) {
        uint256 amountInAfterFee = amountIn - (amountIn * FEE_BPS) / 10000;
        if (zeroForOne) {
            return (reserve1 * amountInAfterFee) / (reserve0 + amountInAfterFee);
        }
        return (reserve0 * amountInAfterFee) / (reserve1 + amountInAfterFee);
    }

    function getReserves() external view returns (uint256, uint256) {
        return (reserve0, reserve1);
    }
}
```

---

## Step 2 — Lending Pool Pattern

Create `src/LendingPool.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LendingPool is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable lendingToken;     // e.g. USDC
    IERC20 public immutable collateralToken;  // e.g. WMON

    uint256 public constant LTV_BPS = 7500;               // 75% loan-to-value
    uint256 public constant LIQUIDATION_THRESHOLD = 8500;  // 85% triggers liquidation
    uint256 public constant LIQUIDATION_BONUS_BPS = 500;   // 5% bonus to liquidator
    uint256 public constant BASE_RATE_BPS = 200;           // 2% base interest
    uint256 public constant SLOPE_BPS = 1000;              // 10% slope

    struct UserPosition {
        uint256 collateral;
        uint256 debt;
        uint256 lastUpdate;
    }

    uint256 public totalDeposits;
    uint256 public totalBorrowed;
    mapping(address => uint256) public deposits;       // lender deposits
    mapping(address => UserPosition) public positions; // borrower positions

    // Simplified price oracle (replace with Chainlink/Pyth in production)
    uint256 public collateralPrice = 2000e18; // 1 collateral = $2000

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount, uint256 collateral);
    event Repaid(address indexed user, uint256 amount);
    event Liquidated(address indexed user, address indexed liquidator, uint256 debt, uint256 collateral);

    constructor(address _lendingToken, address _collateralToken) {
        lendingToken = IERC20(_lendingToken);
        collateralToken = IERC20(_collateralToken);
    }

    // --- Lender Functions ---

    function deposit(uint256 amount) external nonReentrant {
        lendingToken.safeTransferFrom(msg.sender, address(this), amount);
        deposits[msg.sender] += amount;
        totalDeposits += amount;
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(deposits[msg.sender] >= amount, "Insufficient deposit");
        require(totalDeposits - totalBorrowed >= amount, "Insufficient liquidity");

        deposits[msg.sender] -= amount;
        totalDeposits -= amount;
        lendingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    // --- Borrower Functions ---

    function borrow(uint256 borrowAmount, uint256 collateralAmount) external nonReentrant {
        require(totalDeposits - totalBorrowed >= borrowAmount, "Insufficient liquidity");

        collateralToken.safeTransferFrom(msg.sender, address(this), collateralAmount);

        UserPosition storage pos = positions[msg.sender];
        _accrueInterest(pos);
        pos.collateral += collateralAmount;
        pos.debt += borrowAmount;

        // Check LTV
        uint256 collateralValue = (pos.collateral * collateralPrice) / 1e18;
        uint256 maxBorrow = (collateralValue * LTV_BPS) / 10000;
        require(pos.debt <= maxBorrow, "Exceeds LTV");

        totalBorrowed += borrowAmount;
        lendingToken.safeTransfer(msg.sender, borrowAmount);
        emit Borrowed(msg.sender, borrowAmount, collateralAmount);
    }

    function repay(uint256 amount) external nonReentrant {
        UserPosition storage pos = positions[msg.sender];
        _accrueInterest(pos);
        require(pos.debt >= amount, "Repay exceeds debt");

        lendingToken.safeTransferFrom(msg.sender, address(this), amount);
        pos.debt -= amount;
        totalBorrowed -= amount;
        emit Repaid(msg.sender, amount);
    }

    // --- Liquidation ---

    function liquidate(address borrower) external nonReentrant {
        UserPosition storage pos = positions[borrower];
        _accrueInterest(pos);

        uint256 collateralValue = (pos.collateral * collateralPrice) / 1e18;
        uint256 healthFactor = (collateralValue * 10000) / pos.debt;
        require(healthFactor < LIQUIDATION_THRESHOLD, "Position healthy");

        uint256 debt = pos.debt;
        uint256 collateralSeized = pos.collateral;
        uint256 bonus = (collateralSeized * LIQUIDATION_BONUS_BPS) / 10000;

        lendingToken.safeTransferFrom(msg.sender, address(this), debt);

        pos.debt = 0;
        pos.collateral = 0;
        totalBorrowed -= debt;

        collateralToken.safeTransfer(msg.sender, collateralSeized + bonus);
        emit Liquidated(borrower, msg.sender, debt, collateralSeized);
    }

    // --- Interest Accrual (simplified) ---

    function _accrueInterest(UserPosition storage pos) internal {
        if (pos.debt == 0 || pos.lastUpdate == 0) {
            pos.lastUpdate = block.timestamp;
            return;
        }
        uint256 elapsed = block.timestamp - pos.lastUpdate;
        uint256 utilization = (totalBorrowed * 10000) / (totalDeposits > 0 ? totalDeposits : 1);
        uint256 annualRate = BASE_RATE_BPS + (utilization * SLOPE_BPS) / 10000;
        uint256 interest = (pos.debt * annualRate * elapsed) / (10000 * 365 days);
        pos.debt += interest;
        pos.lastUpdate = block.timestamp;
    }

    function getHealthFactor(address user) external view returns (uint256) {
        UserPosition memory pos = positions[user];
        if (pos.debt == 0) return type(uint256).max;
        uint256 collateralValue = (pos.collateral * collateralPrice) / 1e18;
        return (collateralValue * 10000) / pos.debt;
    }
}
```

---

## Step 3 — Auto-Compounding Vault (ERC-4626)

Create `src/AutoVault.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IStrategy {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external returns (uint256);
    function harvest() external returns (uint256 profit);
    function totalAssets() external view returns (uint256);
}

contract AutoVault is ERC4626, Ownable {
    IStrategy public strategy;
    uint256 public lastHarvest;
    uint256 public constant HARVEST_INTERVAL = 1 hours;
    uint256 public performanceFeeBPS = 1000; // 10% of profits
    address public feeRecipient;

    event Harvested(uint256 profit, uint256 fee, uint256 timestamp);
    event StrategyUpdated(address newStrategy);

    constructor(
        IERC20 _asset,
        string memory _name,
        string memory _symbol,
        address _feeRecipient
    )
        ERC4626(_asset)
        ERC20(_name, _symbol)
        Ownable(msg.sender)
    {
        feeRecipient = _feeRecipient;
    }

    function setStrategy(address _strategy) external onlyOwner {
        strategy = IStrategy(_strategy);
        emit StrategyUpdated(_strategy);
    }

    function harvest() external {
        require(block.timestamp >= lastHarvest + HARVEST_INTERVAL, "Too soon");

        uint256 profit = strategy.harvest();
        if (profit > 0) {
            uint256 fee = (profit * performanceFeeBPS) / 10000;
            IERC20(asset()).transfer(feeRecipient, fee);
        }

        lastHarvest = block.timestamp;
        emit Harvested(profit, (profit * performanceFeeBPS) / 10000, block.timestamp);
    }

    function totalAssets() public view override returns (uint256) {
        uint256 idle = IERC20(asset()).balanceOf(address(this));
        uint256 deployed = address(strategy) != address(0) ? strategy.totalAssets() : 0;
        return idle + deployed;
    }
}
```

---

## Step 4 — Staking Rewards Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakingRewards is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardsToken;

    uint256 public rewardRate;       // tokens per second
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public totalStaked;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public balances;

    constructor(address _stakingToken, address _rewardsToken, uint256 _rewardRate) {
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
        rewardRate = _rewardRate;
        lastUpdateTime = block.timestamp;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) return rewardPerTokenStored;
        return rewardPerTokenStored +
            ((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / totalStaked;
    }

    function earned(address account) public view returns (uint256) {
        return (balances[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18
            + rewards[account];
    }

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        totalStaked += amount;
    }

    function withdraw(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0 && balances[msg.sender] >= amount, "Invalid amount");
        balances[msg.sender] -= amount;
        totalStaked -= amount;
        stakingToken.safeTransfer(msg.sender, amount);
    }

    function claimRewards() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardsToken.safeTransfer(msg.sender, reward);
        }
    }
}
```

---

## Step 5 — Deploy to Monad

```bash
# Install
curl -L https://foundry.category.xyz | bash && foundryup --network monad
forge init monad-defi --template monad && cd monad-defi
forge install OpenZeppelin/openzeppelin-contracts

# Deploy to testnet
forge script script/Deploy.s.sol:DeployDeFi \
  --rpc-url https://testnet-rpc.monad.xyz \
  --broadcast --verify

# Deploy to mainnet
forge script script/Deploy.s.sol:DeployDeFi \
  --rpc-url https://rpc.monad.xyz \
  --broadcast --verify
```

### Deploy Script

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SimpleAMM.sol";
import "../src/LendingPool.sol";
import "../src/AutoVault.sol";

contract DeployDeFi is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        // Deploy AMM (token0, token1 must be pre-deployed)
        SimpleAMM amm = new SimpleAMM(
            0xToken0Address,
            0xToken1Address
        );

        // Deploy Lending Pool
        LendingPool pool = new LendingPool(
            0xLendingTokenAddress,
            0xCollateralTokenAddress
        );

        console.log("AMM:", address(amm));
        console.log("LendingPool:", address(pool));

        vm.stopBroadcast();
    }
}
```

---

## When to Use

- User wants to **build an AMM**, DEX, or token swap protocol
- User mentions **liquidity pools**, **constant product**, or **x*y=k**
- User asks about **lending**, **borrowing**, **collateral**, or **liquidation**
- User needs **vaults**, **yield farming**, or **auto-compounding** strategies
- User wants **staking rewards** or **liquidity mining** programs
- User asks about **interest rate models**, **health factors**, or **LTV**
- User mentions **flash loans**, **oracle integration**, or **TWAP**
- User wants to build **DeFi on Monad**

## When NOT to Use

- **Token deployment** only (no DeFi logic) — use `token-deployer` instead
- **NFT projects** — use `nft-collection` instead
- **Prediction markets** — use `prediction-market` instead
- **Gaming contracts** — use `p2p-gaming` instead
- **UI/UX design only** — use `ui-ux-designer` instead

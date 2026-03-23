---
name: Gas Optimization on Monad
description: Monad-specific gas optimization patterns — leveraging parallel execution, storage efficiency, and high throughput for cheaper contracts.
category: Smart Contracts
topic: optimization
author: Piyush Jha
version: "1.1.0"
tags:
  - Gas
  - Optimization
  - Solidity
  - Performance
---

## Gas on Monad

Monad's 10,000 TPS and 400ms blocks mean less competition for block space and lower gas prices than Ethereum. But efficient contracts still matter — here are the patterns that work best on Monad.

## Storage Optimization

### Pack your storage variables

```solidity
// Bad — uses 3 storage slots (each slot is 32 bytes)
contract Unoptimized {
    uint256 a;    // slot 0 (32 bytes)
    bool b;       // slot 1 (wastes 31 bytes)
    uint256 c;    // slot 2 (32 bytes)
}

// Good — packs into 2 slots
contract Optimized {
    uint256 a;    // slot 0
    uint256 c;    // slot 1
    bool b;       // packed into slot 1 remainder
}
```

### Use mappings over arrays for lookups

```solidity
// Expensive — O(n) search
address[] public users;

// Cheap — O(1) lookup
mapping(address => bool) public isUser;
```

## Calldata vs Memory

Use `calldata` for read-only function parameters:

```solidity
// More expensive — copies to memory
function process(uint256[] memory data) external { }

// Cheaper — reads directly from calldata
function process(uint256[] calldata data) external { }
```

## Batch Operations

Monad's parallel execution makes batching especially effective:

```solidity
function batchTransfer(
    address[] calldata recipients,
    uint256[] calldata amounts
) external {
    for (uint i = 0; i < recipients.length; i++) {
        token.transfer(recipients[i], amounts[i]);
    }
}
```

Independent transfers within the batch may execute in parallel on Monad.

## Events Over Storage

Use events for data that doesn't need on-chain access:

```solidity
// Expensive — writes to storage
mapping(uint => string) public logs;
function log(uint id, string calldata data) external {
    logs[id] = data;
}

// Cheap — emits event (indexed off-chain)
event ActionLogged(uint indexed id, string data);
function log(uint id, string calldata data) external {
    emit ActionLogged(id, data);
}
```

## Unchecked Math

When overflow is impossible, skip the checks:

```solidity
// Default — has overflow checks (more gas)
for (uint i = 0; i < length; i++) { }

// Cheaper — skip overflow checks when safe
for (uint i = 0; i < length;) {
    // ... logic
    unchecked { i++; }
}
```

## Monad-Specific Advantages

- **Lower base gas prices** — 10K TPS means less block space competition
- **Parallel-friendly patterns** — independent state changes can execute simultaneously
- **Sub-second finality** — don't over-optimize at the expense of code clarity
- **Same EVM opcodes** — all Ethereum optimization patterns apply identically
- **Batch transactions** benefit more from parallel execution than on sequential chains

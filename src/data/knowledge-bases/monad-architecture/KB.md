---
name: Monad Architecture Deep Dive
description: How Monad achieves 10K TPS — MonadBFT consensus, optimistic parallel execution, asynchronous execution, and MonadDb.
category: Monad Basics
topic: architecture
author: Piyush Jha
version: "1.1.0"
tags:
  - MonadBFT
  - Parallel Execution
  - Architecture
  - Consensus
---

## How Monad Achieves 10,000 TPS

Monad's performance comes from four architectural innovations working together. Current version: v0.13.1 (MONAD_NINE).

## 1. MonadBFT Consensus

MonadBFT is derived from HotStuff BFT with key optimizations:

- **Two-phase confirmation** instead of HotStuff's three phases — faster finalization
- **Pipelined block production** — validators propose new blocks while previous ones finalize
- **Leader rotation** for fair block production
- **Result:** 400ms block times, 800ms finality

## 2. Asynchronous Execution

Traditional EVM chains execute transactions during consensus. Monad separates these:

- **Consensus first** — validators agree on transaction ordering
- **Execution after** — transactions processed against the agreed order
- Complex transactions don't slow block production
- Blocks produced every 400ms regardless of execution complexity

## 3. Optimistic Parallel Execution

Instead of sequential processing (like Ethereum), Monad executes transactions simultaneously:

- **Optimistic assumption** — transactions execute in parallel assuming no conflicts
- **Conflict detection** — merge phase checks if parallel transactions modified same state
- **Re-execution** — only conflicting transactions re-execute in linear order
- Most transactions don't conflict — massive throughput gains

## 4. MonadDb

Custom database optimized for blockchain state:

- **Reduced state access latency** — faster reads/writes for contract storage
- **SSD-optimized** — designed for modern storage hardware
- **Asynchronous I/O** — disk operations don't block execution

## What This Means for Developers

You don't need to think about these internals. Your Solidity code works identically. But you get:

- **Sub-second confirmations** — users see results in under a second
- **Lower gas costs** — higher throughput = less block space competition
- **New design patterns** — real-time on-chain applications become viable
- **Same tools** — Foundry (Monad fork), Hardhat, Viem all work unchanged
- **Parallel-friendly contracts** — independent operations can execute simultaneously

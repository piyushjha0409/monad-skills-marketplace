---
name: p2p-gaming
description: "ACTIVATE when the user wants to build, deploy, or design a peer-to-peer on-chain game on Monad. Triggers on: P2P game, on-chain game, wager, bet, matchmaking, commit-reveal, game escrow, multiplayer blockchain game, turn-based game, rock paper scissors, coin flip, chess on-chain, WebSocket game, Monad gaming. Use this skill for ANY task involving peer-to-peer gaming contracts or gaming dApps on Monad Network."
category: Gaming
difficulty: intermediate
author: Piyush Jha
version: "2.0.0"
skills:
  - On-chain Gaming
  - Solidity
  - WebSocket
  - Game Logic
  - P2P
  - Monad
---

## Instructions

You are a **P2P On-Chain Gaming Architect** for Monad Network. Your job is to help users build provably fair peer-to-peer games with commit-reveal mechanics, wager escrow, matchmaking, and real-time WebSocket integration — all exploiting Monad's ~500ms block time for near-instant game settlement.

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
┌─────────────┐  WebSocket  ┌──────────────┐  On-chain   ┌───────────────┐
│  Game Client │ <========> │  Game Server  │ <=========> │ Game Contract │
└─────────────┘             └──────────────┘             └───────┬───────┘
                                                                 │
                                                         ┌───────┴───────┐
                                                         │ Escrow/Wager  │
                                                         └───────────────┘
```

---

## Step 1 — Game Contract with Commit-Reveal (Rock-Paper-Scissors)

Create `src/RockPaperScissors.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RockPaperScissors is ReentrancyGuard {
    enum Move { NONE, ROCK, PAPER, SCISSORS }
    enum GameState { OPEN, COMMITTED, REVEALED, FINISHED, CANCELLED }

    struct Game {
        address player1;
        address player2;
        uint256 wager;
        GameState state;
        bytes32 commit1;      // keccak256(move, salt)
        bytes32 commit2;
        Move reveal1;
        Move reveal2;
        uint256 commitDeadline;
        uint256 revealDeadline;
        address winner;
    }

    uint256 public nextGameId;
    uint256 public constant COMMIT_TIMEOUT = 5 minutes;
    uint256 public constant REVEAL_TIMEOUT = 5 minutes;
    uint256 public constant FEE_BPS = 250;   // 2.5% platform fee
    address public feeCollector;

    mapping(uint256 => Game) public games;

    event GameCreated(uint256 indexed gameId, address indexed player1, uint256 wager);
    event GameJoined(uint256 indexed gameId, address indexed player2);
    event MoveCommitted(uint256 indexed gameId, address indexed player);
    event MoveRevealed(uint256 indexed gameId, address indexed player, Move move);
    event GameFinished(uint256 indexed gameId, address indexed winner, uint256 payout);
    event GameDraw(uint256 indexed gameId);

    constructor(address _feeCollector) {
        feeCollector = _feeCollector;
    }

    // --- Game Creation & Joining ---

    function createGame() external payable returns (uint256 gameId) {
        require(msg.value > 0, "Wager required");

        gameId = nextGameId++;
        games[gameId] = Game({
            player1: msg.sender,
            player2: address(0),
            wager: msg.value,
            state: GameState.OPEN,
            commit1: bytes32(0),
            commit2: bytes32(0),
            reveal1: Move.NONE,
            reveal2: Move.NONE,
            commitDeadline: 0,
            revealDeadline: 0,
            winner: address(0)
        });

        emit GameCreated(gameId, msg.sender, msg.value);
    }

    function joinGame(uint256 gameId) external payable {
        Game storage g = games[gameId];
        require(g.state == GameState.OPEN, "Game not open");
        require(msg.sender != g.player1, "Cannot join own game");
        require(msg.value == g.wager, "Wager mismatch");

        g.player2 = msg.sender;
        g.state = GameState.COMMITTED;
        g.commitDeadline = block.timestamp + COMMIT_TIMEOUT;

        emit GameJoined(gameId, msg.sender);
    }

    // --- Commit Phase ---

    function commitMove(uint256 gameId, bytes32 commitHash) external {
        Game storage g = games[gameId];
        require(g.state == GameState.COMMITTED, "Not in commit phase");
        require(block.timestamp <= g.commitDeadline, "Commit timeout");

        if (msg.sender == g.player1) {
            require(g.commit1 == bytes32(0), "Already committed");
            g.commit1 = commitHash;
        } else if (msg.sender == g.player2) {
            require(g.commit2 == bytes32(0), "Already committed");
            g.commit2 = commitHash;
        } else {
            revert("Not a player");
        }

        // If both committed, start reveal phase
        if (g.commit1 != bytes32(0) && g.commit2 != bytes32(0)) {
            g.state = GameState.REVEALED;
            g.revealDeadline = block.timestamp + REVEAL_TIMEOUT;
        }

        emit MoveCommitted(gameId, msg.sender);
    }

    /// @notice Generate commit hash off-chain: keccak256(abi.encodePacked(uint8(move), salt))
    function getCommitHash(Move move, bytes32 salt) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(uint8(move), salt));
    }

    // --- Reveal Phase ---

    function revealMove(uint256 gameId, Move move, bytes32 salt) external {
        Game storage g = games[gameId];
        require(g.state == GameState.REVEALED, "Not in reveal phase");
        require(block.timestamp <= g.revealDeadline, "Reveal timeout");
        require(move >= Move.ROCK && move <= Move.SCISSORS, "Invalid move");

        bytes32 commitHash = keccak256(abi.encodePacked(uint8(move), salt));

        if (msg.sender == g.player1) {
            require(commitHash == g.commit1, "Hash mismatch");
            g.reveal1 = move;
        } else if (msg.sender == g.player2) {
            require(commitHash == g.commit2, "Hash mismatch");
            g.reveal2 = move;
        } else {
            revert("Not a player");
        }

        emit MoveRevealed(gameId, msg.sender, move);

        // If both revealed, determine winner
        if (g.reveal1 != Move.NONE && g.reveal2 != Move.NONE) {
            _resolveGame(gameId);
        }
    }

    // --- Resolution ---

    function _resolveGame(uint256 gameId) internal nonReentrant {
        Game storage g = games[gameId];
        g.state = GameState.FINISHED;

        uint256 totalPot = g.wager * 2;
        uint256 fee = (totalPot * FEE_BPS) / 10000;
        uint256 payout = totalPot - fee;

        Move m1 = g.reveal1;
        Move m2 = g.reveal2;

        if (m1 == m2) {
            // Draw — return wagers minus half fee each
            uint256 halfReturn = (totalPot - fee) / 2;
            payable(g.player1).transfer(halfReturn);
            payable(g.player2).transfer(halfReturn);
            emit GameDraw(gameId);
        } else if (
            (m1 == Move.ROCK && m2 == Move.SCISSORS) ||
            (m1 == Move.PAPER && m2 == Move.ROCK) ||
            (m1 == Move.SCISSORS && m2 == Move.PAPER)
        ) {
            g.winner = g.player1;
            payable(g.player1).transfer(payout);
            emit GameFinished(gameId, g.player1, payout);
        } else {
            g.winner = g.player2;
            payable(g.player2).transfer(payout);
            emit GameFinished(gameId, g.player2, payout);
        }

        payable(feeCollector).transfer(fee);
    }

    // --- Timeout Claims ---

    function claimTimeout(uint256 gameId) external nonReentrant {
        Game storage g = games[gameId];

        if (g.state == GameState.OPEN) {
            // No one joined — refund creator
            require(msg.sender == g.player1, "Not player1");
            g.state = GameState.CANCELLED;
            payable(g.player1).transfer(g.wager);
        } else if (g.state == GameState.COMMITTED && block.timestamp > g.commitDeadline) {
            // Someone didn't commit — refund both
            g.state = GameState.CANCELLED;
            payable(g.player1).transfer(g.wager);
            payable(g.player2).transfer(g.wager);
        } else if (g.state == GameState.REVEALED && block.timestamp > g.revealDeadline) {
            // Someone didn't reveal — the one who revealed wins
            g.state = GameState.FINISHED;
            uint256 totalPot = g.wager * 2;

            if (g.reveal1 != Move.NONE && g.reveal2 == Move.NONE) {
                g.winner = g.player1;
                payable(g.player1).transfer(totalPot);
            } else if (g.reveal2 != Move.NONE && g.reveal1 == Move.NONE) {
                g.winner = g.player2;
                payable(g.player2).transfer(totalPot);
            } else {
                // Neither revealed — refund both
                payable(g.player1).transfer(g.wager);
                payable(g.player2).transfer(g.wager);
            }
        } else {
            revert("No timeout condition met");
        }
    }
}
```

---

## Step 2 — WebSocket Game Server (Node.js)

```typescript
import { WebSocketServer, WebSocket } from 'ws';
import { createPublicClient, createWalletClient, http } from 'viem';
import { monadTestnet } from './chains'; // custom chain config

const wss = new WebSocketServer({ port: 8080 });

interface Player {
  ws: WebSocket;
  address: string;
  gameId?: number;
}

const waitingQueue: Player[] = [];
const activeGames = new Map<number, [Player, Player]>();

wss.on('connection', (ws) => {
  let player: Player | null = null;

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());

    switch (msg.type) {
      case 'AUTH':
        // Verify signature to authenticate wallet
        player = { ws, address: msg.address };
        ws.send(JSON.stringify({ type: 'AUTH_OK' }));
        break;

      case 'FIND_MATCH':
        if (!player) return;
        if (waitingQueue.length > 0) {
          const opponent = waitingQueue.shift()!;
          // Notify both players of match
          const gameId = Date.now(); // use contract gameId in production
          activeGames.set(gameId, [player, opponent]);
          player.gameId = gameId;
          opponent.gameId = gameId;

          player.ws.send(JSON.stringify({
            type: 'MATCH_FOUND', gameId, opponent: opponent.address, role: 'player1'
          }));
          opponent.ws.send(JSON.stringify({
            type: 'MATCH_FOUND', gameId, opponent: player.address, role: 'player2'
          }));
        } else {
          waitingQueue.push(player);
          ws.send(JSON.stringify({ type: 'WAITING' }));
        }
        break;

      case 'MOVE_COMMITTED':
        // Relay commit confirmation to opponent
        if (player?.gameId) {
          const game = activeGames.get(player.gameId);
          if (game) {
            const opponent = game[0].address === player.address ? game[1] : game[0];
            opponent.ws.send(JSON.stringify({
              type: 'OPPONENT_COMMITTED', gameId: player.gameId
            }));
          }
        }
        break;

      case 'MOVE_REVEALED':
        // Relay reveal to opponent
        if (player?.gameId) {
          const game = activeGames.get(player.gameId);
          if (game) {
            const opponent = game[0].address === player.address ? game[1] : game[0];
            opponent.ws.send(JSON.stringify({
              type: 'OPPONENT_REVEALED', gameId: player.gameId, move: msg.move
            }));
          }
        }
        break;
    }
  });

  ws.on('close', () => {
    const idx = waitingQueue.findIndex(p => p === player);
    if (idx !== -1) waitingQueue.splice(idx, 1);
  });
});

console.log('Game server running on ws://localhost:8080');
```

---

## Step 3 — Client-Side Game Flow

```typescript
// Game flow using wagmi + WebSocket
import { useWriteContract } from 'wagmi';
import { encodePacked, keccak256, toBytes } from 'viem';

const RPS_ABI = [/* contract ABI */];
const RPS_ADDRESS = '0xYourContract';

// 1. Create game with wager
function useCreateGame() {
  const { writeContract } = useWriteContract();
  return (wagerInMON: string) => writeContract({
    address: RPS_ADDRESS,
    abi: RPS_ABI,
    functionName: 'createGame',
    value: parseEther(wagerInMON),
  });
}

// 2. Generate commit hash locally
function generateCommit(move: number): { commitHash: `0x${string}`; salt: `0x${string}` } {
  const salt = keccak256(toBytes(crypto.getRandomValues(new Uint8Array(32))));
  const commitHash = keccak256(encodePacked(['uint8', 'bytes32'], [move, salt]));
  return { commitHash, salt };
}

// 3. Commit move on-chain
function useCommitMove() {
  const { writeContract } = useWriteContract();
  return (gameId: number, commitHash: `0x${string}`) => writeContract({
    address: RPS_ADDRESS,
    abi: RPS_ABI,
    functionName: 'commitMove',
    args: [gameId, commitHash],
  });
}

// 4. Reveal move on-chain
function useRevealMove() {
  const { writeContract } = useWriteContract();
  return (gameId: number, move: number, salt: `0x${string}`) => writeContract({
    address: RPS_ADDRESS,
    abi: RPS_ABI,
    functionName: 'revealMove',
    args: [gameId, move, salt],
  });
}
```

---

## Step 4 — Deploy to Monad

```bash
# Install & init
curl -L https://foundry.category.xyz | bash && foundryup --network monad
forge init p2p-game --template monad && cd p2p-game

# Deploy to testnet
forge script script/Deploy.s.sol:DeployGame \
  --rpc-url https://testnet-rpc.monad.xyz \
  --broadcast --verify

# Deploy to mainnet
forge script script/Deploy.s.sol:DeployGame \
  --rpc-url https://rpc.monad.xyz \
  --broadcast --verify
```

---

## Game Lifecycle

```
1. CREATE    →  Player 1 creates game with wager (MON escrowed)
2. JOIN      →  Player 2 joins with matching wager
3. COMMIT    →  Both players submit hashed moves (commit phase)
4. REVEAL    →  Both players reveal moves + salt (reveal phase)
5. RESOLVE   →  Contract determines winner, pays out
6. TIMEOUT   →  If opponent doesn't act, claim timeout win/refund
```

---

## When to Use

- User wants to **build a P2P game** with on-chain settlement
- User mentions **wagers**, **betting**, or **escrow** for games
- User asks about **commit-reveal** patterns for fair play
- User needs **matchmaking** or lobby mechanics
- User wants **WebSocket** integration for real-time game state
- User mentions **rock-paper-scissors**, **coin flip**, **chess**, or any game on Monad
- User asks about **anti-cheat** or provably fair game mechanics
- User needs **timeout** and dispute resolution for games

## When NOT to Use

- **Prediction markets** (outcome-based trading) — use `prediction-market` instead
- **DeFi protocols** (AMMs, lending) — use `defi-protocol` instead
- **Token deployment** — use `token-deployer` instead
- **NFT projects** — use `nft-collection` instead
- **UI/UX design only** — use `ui-ux-designer` instead
- **Single-player games** with no blockchain component

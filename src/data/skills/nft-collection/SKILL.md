---
name: nft-collection
description: "ACTIVATE when the user wants to create, launch, deploy, or mint an NFT collection on Monad. Triggers on: NFT, ERC-721, ERC-1155, mint page, allowlist, whitelist, IPFS metadata, reveal mechanic, generative art, PFP collection, NFT drop, NFT marketplace, minting dApp, Monad NFT. Use this skill for ANY task involving non-fungible tokens on Monad Network."
category: Smart Contracts
difficulty: beginner
author: Piyush Jha
version: "2.0.0"
skills:
  - NFT
  - ERC-721
  - ERC-1155
  - IPFS
  - Metadata
  - Monad
---

## Instructions

You are an **NFT Collection Launch Specialist** for Monad Network. Your job is to help users design, deploy, and launch production-grade NFT collections with allowlist minting, IPFS metadata, reveal mechanics, royalties, and mint page frontends — all optimized for Monad's sub-second finality.

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

Initialize:

```bash
forge init my-nft-collection --template monad
cd my-nft-collection
forge install OpenZeppelin/openzeppelin-contracts
```

---

## Step 2 — ERC-721 Collection Contract (Full Template)

Create `src/MonadNFT.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MonadNFT is ERC721, ERC721Enumerable, ERC721Royalty, Ownable {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 10_000;
    uint256 public constant ALLOWLIST_PRICE = 0.05 ether;
    uint256 public constant PUBLIC_PRICE = 0.08 ether;
    uint256 public constant MAX_PER_WALLET = 3;

    enum SalePhase { CLOSED, ALLOWLIST, PUBLIC }
    SalePhase public salePhase;

    bytes32 public merkleRoot;
    string private _baseTokenURI;
    string private _preRevealURI;
    bool public revealed;

    uint256 private _nextTokenId;

    mapping(address => uint256) public mintCount;

    event Minted(address indexed to, uint256 indexed tokenId);
    event Revealed(string baseURI);

    constructor(
        bytes32 _merkleRoot,
        string memory preRevealURI,
        address royaltyReceiver
    ) ERC721("Monad NFT", "MNFT") Ownable(msg.sender) {
        merkleRoot = _merkleRoot;
        _preRevealURI = preRevealURI;
        // 5% royalty (500 basis points)
        _setDefaultRoyalty(royaltyReceiver, 500);
    }

    // --- Minting ---

    function allowlistMint(uint256 quantity, bytes32[] calldata proof) external payable {
        require(salePhase == SalePhase.ALLOWLIST, "Allowlist not active");
        require(msg.value >= ALLOWLIST_PRICE * quantity, "Insufficient payment");
        require(mintCount[msg.sender] + quantity <= MAX_PER_WALLET, "Exceeds wallet limit");

        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender))));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "Invalid proof");

        _mintBatch(msg.sender, quantity);
    }

    function publicMint(uint256 quantity) external payable {
        require(salePhase == SalePhase.PUBLIC, "Public mint not active");
        require(msg.value >= PUBLIC_PRICE * quantity, "Insufficient payment");
        require(mintCount[msg.sender] + quantity <= MAX_PER_WALLET, "Exceeds wallet limit");

        _mintBatch(msg.sender, quantity);
    }

    function _mintBatch(address to, uint256 quantity) internal {
        require(_nextTokenId + quantity <= MAX_SUPPLY, "Exceeds max supply");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(to, tokenId);
            emit Minted(to, tokenId);
        }
        mintCount[to] += quantity;
    }

    // --- Metadata ---

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        if (!revealed) {
            return _preRevealURI;
        }
        return string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"));
    }

    // --- Owner Functions ---

    function setSalePhase(SalePhase phase) external onlyOwner {
        salePhase = phase;
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function reveal(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        revealed = true;
        emit Revealed(baseURI);
    }

    function withdraw() external onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }

    // --- Required Overrides ---

    function _update(address to, address from, uint256 tokenId)
        internal override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, from, tokenId);
    }

    function _increaseBalance(address account, uint128 amount)
        internal override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, amount);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721Enumerable, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

---

## Step 3 — IPFS Metadata Setup

### Metadata JSON format (`0.json`, `1.json`, etc.)

```json
{
  "name": "Monad NFT #0",
  "description": "A unique collectible on the Monad Network.",
  "image": "ipfs://QmYourImageCID/0.png",
  "attributes": [
    { "trait_type": "Background", "value": "Purple" },
    { "trait_type": "Body", "value": "Gold" },
    { "trait_type": "Eyes", "value": "Laser" },
    { "trait_type": "Rarity Score", "display_type": "number", "value": 87 }
  ]
}
```

### Upload to IPFS with Pinata

```bash
npm install -g @pinata/sdk

# Upload images folder
npx pinata-cli upload ./images --name "monad-nft-images"
# Returns: QmImageFolderCID

# Upload metadata folder (update image CIDs first)
npx pinata-cli upload ./metadata --name "monad-nft-metadata"
# Returns: QmMetadataFolderCID
```

Use `ipfs://QmMetadataFolderCID/` as your `baseURI` when calling `reveal()`.

---

## Step 4 — Mint Page React Component

```tsx
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { useState } from 'react';

const NFT_ADDRESS = '0xYourContractAddress';
const ABI = [/* paste your contract ABI here */];

export function MintPage() {
  const { address, isConnected } = useAccount();
  const [quantity, setQuantity] = useState(1);

  const { data: salePhase } = useReadContract({
    address: NFT_ADDRESS,
    abi: ABI,
    functionName: 'salePhase',
  });

  const { data: totalSupply } = useReadContract({
    address: NFT_ADDRESS,
    abi: ABI,
    functionName: 'totalSupply',
  });

  const { writeContract, isPending, isSuccess } = useWriteContract();

  const price = salePhase === 1 ? 0.05 : 0.08; // ALLOWLIST vs PUBLIC

  const handleMint = () => {
    writeContract({
      address: NFT_ADDRESS,
      abi: ABI,
      functionName: salePhase === 1 ? 'allowlistMint' : 'publicMint',
      args: salePhase === 1 ? [quantity, /* merkle proof */] : [quantity],
      value: parseEther((price * quantity).toString()),
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h1 className="text-4xl font-bold">Monad NFT Mint</h1>
      <p className="text-lg text-gray-400">
        {totalSupply?.toString() ?? '...'} / 10,000 minted
      </p>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="w-10 h-10 rounded-full bg-purple-600 text-white"
        >-</button>
        <span className="text-2xl font-mono">{quantity}</span>
        <button
          onClick={() => setQuantity(Math.min(3, quantity + 1))}
          className="w-10 h-10 rounded-full bg-purple-600 text-white"
        >+</button>
      </div>

      <p className="text-lg">
        Total: {(price * quantity).toFixed(2)} MON
      </p>

      <button
        onClick={handleMint}
        disabled={!isConnected || isPending}
        className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl text-white font-semibold text-lg transition-colors"
      >
        {isPending ? 'Minting...' : isSuccess ? 'Minted!' : 'Mint Now'}
      </button>
    </div>
  );
}
```

---

## Step 5 — Deploy to Monad

### Deploy Script (`script/Deploy.s.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MonadNFT.sol";

contract DeployNFT is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);
        vm.startBroadcast(deployerKey);

        bytes32 merkleRoot = 0x0; // Replace with generated root
        string memory preRevealURI = "ipfs://QmPreRevealCID/hidden.json";

        MonadNFT nft = new MonadNFT(merkleRoot, preRevealURI, deployer);
        console.log("NFT Contract:", address(nft));

        vm.stopBroadcast();
    }
}
```

### Deploy Commands

```bash
# Testnet
forge script script/Deploy.s.sol:DeployNFT \
  --rpc-url https://testnet-rpc.monad.xyz \
  --broadcast --verify

# Mainnet
forge script script/Deploy.s.sol:DeployNFT \
  --rpc-url https://rpc.monad.xyz \
  --broadcast --verify
```

---

## Allowlist Merkle Tree Generation

```javascript
const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const fs = require("fs");

// Load allowlist addresses
const addresses = [
  ["0xAddress1"],
  ["0xAddress2"],
  ["0xAddress3"],
];

const tree = StandardMerkleTree.of(addresses, ["address"]);
console.log("Merkle Root:", tree.root);

// Save tree for proof generation later
fs.writeFileSync("tree.json", JSON.stringify(tree.dump()));

// Generate proof for a specific address
for (const [i, v] of tree.entries()) {
  if (v[0] === "0xAddress1") {
    console.log("Proof:", tree.getProof(i));
  }
}
```

---

## When to Use

- User wants to **create, deploy, or launch** an NFT collection
- User mentions **ERC-721**, **ERC-1155**, or **NFT minting**
- User needs an **allowlist / whitelist** mint with Merkle proof
- User asks about **IPFS metadata**, Pinata, or NFT.Storage
- User wants a **reveal mechanic** (pre-reveal placeholder)
- User needs a **mint page** or minting frontend
- User asks about **royalties** (ERC-2981)
- User mentions **generative art**, PFP, or NFT drop on Monad

## When NOT to Use

- **Fungible tokens** (ERC-20) — use `token-deployer` instead
- **DeFi protocols** (AMMs, lending) — use `defi-protocol` instead
- **Prediction markets** — use `prediction-market` instead
- **Gaming contracts** — use `p2p-gaming` instead
- **UI/UX design only** (no NFT logic) — use `ui-ux-designer` instead

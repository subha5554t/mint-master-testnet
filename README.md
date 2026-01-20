# NFT Minting DApp (Testnet)

A beginner-friendly decentralized application for minting ERC-721 NFTs on the Sepolia testnet.

## 📋 Project Overview

This project demonstrates how to build a complete NFT minting DApp from scratch, including:
- Solidity smart contract using OpenZeppelin standards
- React frontend with MetaMask integration
- Ethers.js for blockchain interactions

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| Solidity | Smart contract language |
| OpenZeppelin | Secure contract libraries |
| Remix IDE | Contract development & deployment |
| React + TypeScript | Frontend framework |
| Ethers.js v6 | Blockchain interactions |
| MetaMask | Wallet connection |
| Tailwind CSS | Styling |
| Sepolia | Testnet network |

## 📁 Project Structure

```
nft-minting-dapp/
├── contracts/
│   └── NFT.sol                 # Solidity smart contract
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Navigation header
│   │   ├── MintCard.tsx        # Main minting interface
│   │   ├── WalletButton.tsx    # Wallet connection button
│   │   ├── NetworkBadge.tsx    # Network status indicator
│   │   ├── Features.tsx        # Feature cards section
│   │   ├── HowItWorks.tsx      # Step-by-step guide
│   │   └── Footer.tsx          # Page footer
│   ├── hooks/
│   │   ├── useWallet.ts        # Wallet connection logic
│   │   └── useNFTContract.ts   # Contract interaction logic
│   └── pages/
│       └── Index.tsx           # Main page
└── README.md
```

---

## 📜 Smart Contract

The complete smart contract is in `contracts/NFT.sol`. Key features:

- **ERC-721 compliant** using OpenZeppelin standards
- **mintNFT()** function callable by anyone
- **tokenURI storage** for metadata
- **Event emission** for tracking mints

### Deployment Steps

1. Open [Remix IDE](https://remix.ethereum.org)
2. Create `contracts/NFT.sol` and paste the contract code
3. Compile with Solidity 0.8.20
4. Connect MetaMask (Sepolia network)
5. Deploy and copy the contract address
6. Update `src/hooks/useNFTContract.ts` with your address

---

## 🚀 How to Run

### Prerequisites
- Node.js 18+
- MetaMask browser extension
- Sepolia testnet ETH ([Get from faucet](https://sepoliafaucet.com))

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Configuration

After deploying the smart contract, update line 35 in `src/hooks/useNFTContract.ts`:

```typescript
const CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_CONTRACT_ADDRESS';
```

---

## 🔗 Important Links

- **Sepolia Faucet**: https://sepoliafaucet.com
- **Remix IDE**: https://remix.ethereum.org
- **Sepolia Etherscan**: https://sepolia.etherscan.io
- **MetaMask**: https://metamask.io

---

## 📝 Testnet Details

| Property | Value |
|----------|-------|
| Network Name | Sepolia |
| Chain ID | 11155111 |
| Currency | SepoliaETH |
| Block Explorer | https://sepolia.etherscan.io |

---

## ⚠️ Important Notes

1. **TESTNET ONLY** - Do not use real ETH
2. **Update contract address** after deployment
3. **Token URIs** should point to valid JSON metadata (IPFS recommended)

---

## 📄 Sample Token Metadata

```json
{
  "name": "My First NFT",
  "description": "Minted on Sepolia testnet!",
  "image": "ipfs://QmYourImageHash",
  "attributes": [
    { "trait_type": "Creator", "value": "Your Name" }
  ]
}
```

---

Built with ❤️ for Web3 Learning

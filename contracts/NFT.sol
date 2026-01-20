// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ============================================
// NFT Minting Smart Contract
// Deploy this contract using Remix IDE
// ============================================

// Import OpenZeppelin contracts
// In Remix, these imports work automatically
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyNFT
 * @dev A simple ERC-721 NFT contract for minting unique tokens
 * @notice This contract allows users to mint NFTs with custom metadata URIs
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open Remix IDE (https://remix.ethereum.org)
 * 2. Create new file: contracts/NFT.sol
 * 3. Paste this code
 * 4. Compile with Solidity 0.8.20
 * 5. Deploy to Sepolia testnet via MetaMask
 * 6. Copy the deployed contract address
 * 7. Update CONTRACT_ADDRESS in src/hooks/useNFTContract.ts
 */
contract MyNFT is ERC721, ERC721URIStorage, Ownable {
    // ============ State Variables ============
    
    // Token ID counter - starts at 0 and increments with each mint
    uint256 private _tokenIdCounter;

    // ============ Events ============
    
    // Event emitted when a new NFT is minted
    // Useful for tracking mints on Etherscan and in frontend
    event NFTMinted(
        address indexed minter,
        uint256 indexed tokenId,
        string tokenURI
    );

    // ============ Constructor ============
    
    /**
     * @dev Constructor sets the token name and symbol
     * @notice The deployer becomes the initial owner
     * 
     * Token Name: "MyNFT" - displayed on marketplaces
     * Token Symbol: "MNFT" - short identifier
     */
    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender) {
        // Initialize counter at 0
        // First minted token will have ID 0
        _tokenIdCounter = 0;
    }

    // ============ Main Functions ============
    
    /**
     * @dev Mints a new NFT to the caller's address
     * @param _tokenURI The metadata URI for the NFT (e.g., IPFS link)
     * @return The token ID of the newly minted NFT
     * 
     * @notice Anyone can call this function to mint an NFT
     * @notice Each call creates a new unique token
     * 
     * Example tokenURI formats:
     * - IPFS: "ipfs://QmYourHash/metadata.json"
     * - HTTP: "https://yourserver.com/api/token/1"
     */
    function mintNFT(string memory _tokenURI) public returns (uint256) {
        // Step 1: Get current token ID
        uint256 tokenId = _tokenIdCounter;
        
        // Step 2: Increment counter for next mint
        // This ensures each token has a unique ID
        _tokenIdCounter++;
        
        // Step 3: Mint the NFT to the caller (msg.sender)
        // _safeMint checks if recipient can receive ERC721 tokens
        _safeMint(msg.sender, tokenId);
        
        // Step 4: Set the token URI (metadata link)
        // This points to a JSON file with name, description, image, etc.
        _setTokenURI(tokenId, _tokenURI);
        
        // Step 5: Emit event for tracking
        // This appears in transaction logs on Etherscan
        emit NFTMinted(msg.sender, tokenId, _tokenURI);
        
        // Step 6: Return the token ID to the caller
        return tokenId;
    }

    /**
     * @dev Returns the current token counter value
     * @return The total number of NFTs minted
     * 
     * @notice Useful for displaying total supply on frontend
     */
    function getTokenCounter() public view returns (uint256) {
        return _tokenIdCounter;
    }

    // ============ Required Overrides ============
    // These are required because we inherit from multiple contracts
    // that define the same functions

    /**
     * @dev Returns the token URI for a given token ID
     * @param tokenId The ID of the token
     * @return The metadata URI string
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Checks if the contract supports a given interface
     * @param interfaceId The interface identifier (ERC-165)
     * @return True if the interface is supported
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

// ============================================
// SAMPLE TOKEN METADATA (store on IPFS)
// ============================================
/*
{
    "name": "My First NFT",
    "description": "This is my first NFT minted on Sepolia testnet!",
    "image": "ipfs://QmYourImageHash",
    "attributes": [
        {
            "trait_type": "Creator",
            "value": "Your Name"
        },
        {
            "trait_type": "Edition",
            "value": "1"
        },
        {
            "trait_type": "Rarity",
            "value": "Common"
        }
    ]
}
*/

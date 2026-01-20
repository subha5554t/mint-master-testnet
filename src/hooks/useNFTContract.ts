import { useState, useCallback, useEffect } from 'react';

// Your deployed contract address on Sepolia
const CONTRACT_ADDRESS = '0x358AA13c52544ECCEF6B0ADD0f801012ADAD5eE3';

// Extended Contract ABI including ERC721Enumerable standard methods
const CONTRACT_ABI = [
  // Mint functions
  {
    "inputs": [
      { "internalType": "string", "name": "_tokenURI", "type": "string" },
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_description", "type": "string" },
      { "internalType": "string", "name": "_imageUrl", "type": "string" }
    ],
    "name": "mintNFT",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Custom getter functions
  {
    "inputs": [],
    "name": "getTokenCounter",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getNFTMetadata",
    "outputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "string", "name": "imageUrl", "type": "string" },
      { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
      { "internalType": "address", "name": "creator", "type": "address" },
      { "internalType": "string", "name": "uri", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "getOwnedTokens",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "offset", "type": "uint256" },
      { "internalType": "uint256", "name": "limit", "type": "uint256" }
    ],
    "name": "getAllNFTs",
    "outputs": [
      { "internalType": "uint256[]", "name": "tokenIds", "type": "uint256[]" },
      { "internalType": "string[]", "name": "names", "type": "string[]" },
      { "internalType": "string[]", "name": "descriptions", "type": "string[]" },
      { "internalType": "string[]", "name": "imageUrls", "type": "string[]" },
      { "internalType": "address[]", "name": "creators", "type": "address[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // ERC721 Standard methods
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "ownerOf",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  // ERC721Enumerable methods (fallback)
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }],
    "name": "tokenByIndex",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "uint256", "name": "index", "type": "uint256" }
    ],
    "name": "tokenOfOwnerByIndex",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  // ERC721 metadata
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  // Metadata mapping (public)
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "nftMetadata",
    "outputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "string", "name": "imageUrl", "type": "string" },
      { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
      { "internalType": "address", "name": "creator", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export interface NFTData {
  tokenId: number;
  name: string;
  description: string;
  imageUrl: string;
  createdAt: number;
  creator: string;
  tokenURI: string;
  owner?: string;
}

interface MintState {
  isMinting: boolean;
  transactionHash: string | null;
  tokenId: number | null;
  error: string | null;
  success: boolean;
}

export function useNFTContract() {
  const [mintState, setMintState] = useState<MintState>({
    isMinting: false,
    transactionHash: null,
    tokenId: null,
    error: null,
    success: false,
  });
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [allNFTs, setAllNFTs] = useState<NFTData[]>([]);
  const [myNFTs, setMyNFTs] = useState<NFTData[]>([]);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);

  const isContractDeployed = CONTRACT_ADDRESS.length === 42 && CONTRACT_ADDRESS.startsWith('0x');

  // Mint NFT with custom metadata
  const mintNFT = useCallback(async (
    name: string,
    description: string,
    imageUrl: string,
    tokenURI: string = ''
  ) => {
    if (!window.ethereum) {
      setMintState(prev => ({ ...prev, error: 'MetaMask is not installed' }));
      return;
    }

    if (!isContractDeployed) {
      setMintState(prev => ({
        ...prev,
        error: 'Contract not deployed yet. Please follow the deployment guide.',
      }));
      return;
    }

    setMintState({
      isMinting: true,
      transactionHash: null,
      tokenId: null,
      error: null,
      success: false,
    });

    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Create a data URI for the tokenURI if not provided
      const finalTokenURI = tokenURI || `data:application/json;base64,${btoa(JSON.stringify({
        name,
        description,
        image: imageUrl,
        attributes: []
      }))}`;

      console.log('Minting NFT with params:', { finalTokenURI, name, description, imageUrl });
      const tx = await contract.mintNFT(finalTokenURI, name, description, imageUrl);
      
      setMintState(prev => ({ ...prev, transactionHash: tx.hash }));
      console.log('Transaction submitted:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Parse token ID from Transfer event (ERC721 standard)
      let tokenId: number | null = null;
      for (const log of receipt.logs) {
        try {
          // Transfer event topic for ERC721
          if (log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
            tokenId = parseInt(log.topics[3], 16);
            break;
          }
        } catch (e) {
          // Continue if this log doesn't match
        }
      }

      setMintState({
        isMinting: false,
        transactionHash: tx.hash,
        tokenId,
        error: null,
        success: true,
      });

      // Refresh NFT lists after successful mint
      setTimeout(() => {
        fetchAllNFTs();
        fetchMyNFTs();
      }, 2000);

    } catch (error: any) {
      console.error('Mint error:', error);
      let errorMessage = 'Failed to mint NFT';

      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction rejected by user';
      } else if (error.code === -32603) {
        errorMessage = 'Internal JSON-RPC error. Check if you have enough testnet ETH.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds. Get testnet ETH from a Sepolia faucet.';
      } else if (error.message) {
        errorMessage = error.message.slice(0, 100);
      }

      setMintState({
        isMinting: false,
        transactionHash: null,
        tokenId: null,
        error: errorMessage,
        success: false,
      });
    }
  }, [isContractDeployed]);

  // Fetch total supply using multiple fallback methods
  const fetchTotalSupply = useCallback(async () => {
    if (!window.ethereum || !isContractDeployed) return;

    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      // Try getTokenCounter first, then totalSupply as fallback
      let count = 0;
      try {
        count = Number(await contract.getTokenCounter());
      } catch {
        try {
          count = Number(await contract.totalSupply());
        } catch (e) {
          console.log('Could not fetch token count');
        }
      }
      setTotalSupply(count);
    } catch (error) {
      console.error('Error fetching total supply:', error);
    }
  }, [isContractDeployed]);

  // Fetch all NFTs with multiple fallback methods
  const fetchAllNFTs = useCallback(async () => {
    if (!window.ethereum || !isContractDeployed) return;

    setIsLoadingNFTs(true);
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      // Get total supply
      let total = 0;
      try {
        total = Number(await contract.getTokenCounter());
      } catch {
        try {
          total = Number(await contract.totalSupply());
        } catch {
          console.log('Could not get total supply');
        }
      }
      
      if (total === 0) {
        setAllNFTs([]);
        setTotalSupply(0);
        setIsLoadingNFTs(false);
        return;
      }

      setTotalSupply(total);
      const nfts: NFTData[] = [];

      // Try getAllNFTs first (batch method)
      try {
        const result = await contract.getAllNFTs(0, Math.min(total, 50));
        for (let i = 0; i < result.tokenIds.length; i++) {
          nfts.push({
            tokenId: Number(result.tokenIds[i]),
            name: result.names[i] || 'Untitled',
            description: result.descriptions[i] || '',
            imageUrl: result.imageUrls[i] || '',
            createdAt: 0,
            creator: result.creators[i],
            tokenURI: '',
          });
        }
      } catch {
        // Fallback: fetch individually using nftMetadata mapping or tokenURI
        console.log('Using fallback individual fetch method');
        for (let i = 0; i < Math.min(total, 50); i++) {
          try {
            // Try getNFTMetadata first
            let metadata;
            try {
              metadata = await contract.getNFTMetadata(i);
              nfts.push({
                tokenId: i,
                name: metadata.name || 'Untitled',
                description: metadata.description || '',
                imageUrl: metadata.imageUrl || '',
                createdAt: Number(metadata.createdAt || 0),
                creator: metadata.creator,
                tokenURI: metadata.uri || '',
              });
            } catch {
              // Try nftMetadata mapping
              try {
                metadata = await contract.nftMetadata(i);
                const owner = await contract.ownerOf(i);
                nfts.push({
                  tokenId: i,
                  name: metadata.name || 'Untitled',
                  description: metadata.description || '',
                  imageUrl: metadata.imageUrl || '',
                  createdAt: Number(metadata.createdAt || 0),
                  creator: metadata.creator || owner,
                  tokenURI: '',
                });
              } catch {
                // Last resort: just get owner and tokenURI
                try {
                  const owner = await contract.ownerOf(i);
                  const uri = await contract.tokenURI(i);
                  nfts.push({
                    tokenId: i,
                    name: `NFT #${i}`,
                    description: '',
                    imageUrl: '',
                    createdAt: 0,
                    creator: owner,
                    tokenURI: uri,
                  });
                } catch (e) {
                  console.log(`Token ${i} may not exist`);
                }
              }
            }
          } catch (e) {
            console.log(`Error fetching token ${i}:`, e);
          }
        }
      }

      setAllNFTs(nfts.reverse());
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setIsLoadingNFTs(false);
    }
  }, [isContractDeployed]);

  // Fetch user's NFTs with fallback methods
  const fetchMyNFTs = useCallback(async () => {
    if (!window.ethereum || !isContractDeployed) return;

    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const nfts: NFTData[] = [];

      // Try getOwnedTokens first
      try {
        const tokenIds = await contract.getOwnedTokens(address);
        for (const tokenId of tokenIds) {
          try {
            const metadata = await contract.getNFTMetadata(tokenId);
            nfts.push({
              tokenId: Number(tokenId),
              name: metadata.name || 'Untitled',
              description: metadata.description || '',
              imageUrl: metadata.imageUrl || '',
              createdAt: Number(metadata.createdAt),
              creator: metadata.creator,
              tokenURI: metadata.uri,
              owner: address,
            });
          } catch {
            // Fallback to nftMetadata
            try {
              const metadata = await contract.nftMetadata(tokenId);
              nfts.push({
                tokenId: Number(tokenId),
                name: metadata.name || 'Untitled',
                description: metadata.description || '',
                imageUrl: metadata.imageUrl || '',
                createdAt: Number(metadata.createdAt || 0),
                creator: metadata.creator,
                tokenURI: '',
                owner: address,
              });
            } catch (e) {
              console.error('Error fetching metadata for token', tokenId, e);
            }
          }
        }
      } catch {
        // Fallback: Use balanceOf and tokenOfOwnerByIndex (ERC721Enumerable)
        console.log('Using ERC721Enumerable fallback for my NFTs');
        try {
          const balance = Number(await contract.balanceOf(address));
          for (let i = 0; i < balance; i++) {
            try {
              const tokenId = await contract.tokenOfOwnerByIndex(address, i);
              try {
                const metadata = await contract.nftMetadata(tokenId);
                nfts.push({
                  tokenId: Number(tokenId),
                  name: metadata.name || 'Untitled',
                  description: metadata.description || '',
                  imageUrl: metadata.imageUrl || '',
                  createdAt: Number(metadata.createdAt || 0),
                  creator: metadata.creator,
                  tokenURI: '',
                  owner: address,
                });
              } catch {
                const uri = await contract.tokenURI(tokenId);
                nfts.push({
                  tokenId: Number(tokenId),
                  name: `NFT #${Number(tokenId)}`,
                  description: '',
                  imageUrl: '',
                  createdAt: 0,
                  creator: address,
                  tokenURI: uri,
                  owner: address,
                });
              }
            } catch (e) {
              console.error('Error fetching token at index', i, e);
            }
          }
        } catch (e) {
          console.error('ERC721Enumerable fallback failed:', e);
        }
      }

      setMyNFTs(nfts.reverse());
    } catch (error) {
      console.error('Error fetching my NFTs:', error);
    }
  }, [isContractDeployed]);

  // Add NFT to MetaMask wallet
  const addNFTToWallet = useCallback(async (tokenId: number, imageUrl?: string) => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Get contract info
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      let symbol = 'MNFT';
      try {
        symbol = await contract.symbol();
      } catch {
        // Use default
      }

      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC721',
          options: {
            address: CONTRACT_ADDRESS,
            tokenId: tokenId.toString(),
            symbol: symbol,
            image: imageUrl || undefined,
          },
        },
      });

      return wasAdded;
    } catch (error) {
      console.error('Error adding NFT to wallet:', error);
      throw error;
    }
  }, []);

  const resetMintState = useCallback(() => {
    setMintState({
      isMinting: false,
      transactionHash: null,
      tokenId: null,
      error: null,
      success: false,
    });
  }, []);

  // Initial load
  useEffect(() => {
    if (isContractDeployed) {
      fetchTotalSupply();
      fetchAllNFTs();
    }
  }, [isContractDeployed, fetchTotalSupply, fetchAllNFTs]);

  return {
    ...mintState,
    mintNFT,
    resetMintState,
    contractAddress: CONTRACT_ADDRESS,
    isContractDeployed,
    totalSupply,
    allNFTs,
    myNFTs,
    isLoadingNFTs,
    fetchAllNFTs,
    fetchMyNFTs,
    fetchTotalSupply,
    addNFTToWallet,
  };
}

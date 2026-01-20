import { useState, useCallback, useEffect } from 'react';

// Enhanced Contract ABI with all functions
const CONTRACT_ABI = [
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
  {
    "inputs": [{ "internalType": "string", "name": "_tokenURI", "type": "string" }],
    "name": "mintNFTSimple",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
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
  }
];

// IMPORTANT: Replace this with your deployed contract address
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

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

  const isContractDeployed = CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';

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
        error: 'Contract not deployed yet. Please follow the deployment guide in README.md',
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

      const tx = await contract.mintNFT(finalTokenURI, name, description, imageUrl);
      
      setMintState(prev => ({ ...prev, transactionHash: tx.hash }));

      const receipt = await tx.wait();
      const tokenId = receipt.logs[0]?.topics[3] 
        ? parseInt(receipt.logs[0].topics[3], 16) 
        : null;

      setMintState({
        isMinting: false,
        transactionHash: tx.hash,
        tokenId,
        error: null,
        success: true,
      });

      // Refresh NFT lists
      fetchAllNFTs();
      fetchMyNFTs();

    } catch (error: any) {
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

  // Fetch total supply
  const fetchTotalSupply = useCallback(async () => {
    if (!window.ethereum || !isContractDeployed) return;

    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const count = await contract.getTokenCounter();
      setTotalSupply(Number(count));
    } catch (error) {
      console.error('Error fetching total supply:', error);
    }
  }, [isContractDeployed]);

  // Fetch all NFTs
  const fetchAllNFTs = useCallback(async () => {
    if (!window.ethereum || !isContractDeployed) return;

    setIsLoadingNFTs(true);
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const count = await contract.getTokenCounter();
      const total = Number(count);
      
      if (total === 0) {
        setAllNFTs([]);
        setIsLoadingNFTs(false);
        return;
      }

      const result = await contract.getAllNFTs(0, Math.min(total, 50));
      const nfts: NFTData[] = [];
      
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

      setAllNFTs(nfts.reverse());
      setTotalSupply(total);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setIsLoadingNFTs(false);
    }
  }, [isContractDeployed]);

  // Fetch user's NFTs
  const fetchMyNFTs = useCallback(async () => {
    if (!window.ethereum || !isContractDeployed) return;

    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const tokenIds = await contract.getOwnedTokens(address);
      const nfts: NFTData[] = [];

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
        } catch (e) {
          console.error('Error fetching metadata for token', tokenId, e);
        }
      }

      setMyNFTs(nfts.reverse());
    } catch (error) {
      console.error('Error fetching my NFTs:', error);
    }
  }, [isContractDeployed]);

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
  };
}

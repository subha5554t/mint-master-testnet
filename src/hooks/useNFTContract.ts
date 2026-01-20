import { useState, useCallback } from 'react';

// Contract ABI - Only the functions we need
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "tokenURI",
        "type": "string"
      }
    ],
    "name": "mintNFT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTokenCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// IMPORTANT: Replace this with your deployed contract address after deployment
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

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

  const mintNFT = useCallback(async (tokenURI: string = 'https://gateway.pinata.cloud/ipfs/QmExample') => {
    if (!window.ethereum) {
      setMintState(prev => ({
        ...prev,
        error: 'MetaMask is not installed',
      }));
      return;
    }

    // Check if contract address is set
    if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
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
      // Dynamic import of ethers to avoid SSR issues
      const { ethers } = await import('ethers');
      
      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create contract instance
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Call mintNFT function
      const tx = await contract.mintNFT(tokenURI);
      
      setMintState(prev => ({
        ...prev,
        transactionHash: tx.hash,
      }));

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Get the token ID from the transaction logs
      // The Transfer event is emitted with (from, to, tokenId)
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

    } catch (error: any) {
      let errorMessage = 'Failed to mint NFT';

      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction rejected by user';
      } else if (error.code === -32603) {
        errorMessage = 'Internal JSON-RPC error. Check if you have enough testnet ETH.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds. Get testnet ETH from a Sepolia faucet.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMintState({
        isMinting: false,
        transactionHash: null,
        tokenId: null,
        error: errorMessage,
        success: false,
      });
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

  return {
    ...mintState,
    mintNFT,
    resetMintState,
    contractAddress: CONTRACT_ADDRESS,
  };
}

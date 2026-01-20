import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

// Sepolia testnet chain ID
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex
const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;

interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  isConnecting: boolean;
  error: string | null;
}

interface WalletContextType extends WalletState {
  isMetaMaskInstalled: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToSepolia: () => Promise<void>;
  formatAddress: (address: string) => string;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    isCorrectNetwork: false,
    isConnecting: false,
    error: null,
  });

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Check current connection status
  const checkConnection = useCallback(async () => {
    if (!isMetaMaskInstalled) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const chainIdDecimal = parseInt(chainId, 16);

      if (accounts.length > 0) {
        setState({
          isConnected: true,
          address: accounts[0],
          chainId: chainIdDecimal,
          isCorrectNetwork: chainIdDecimal === SEPOLIA_CHAIN_ID_DECIMAL,
          isConnecting: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  }, [isMetaMaskInstalled]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      setState(prev => ({
        ...prev,
        error: 'MetaMask is not installed. Please install MetaMask to continue.',
      }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const chainIdDecimal = parseInt(chainId, 16);

      setState({
        isConnected: true,
        address: accounts[0],
        chainId: chainIdDecimal,
        isCorrectNetwork: chainIdDecimal === SEPOLIA_CHAIN_ID_DECIMAL,
        isConnecting: false,
        error: null,
      });
    } catch (error: any) {
      let errorMessage = 'Failed to connect wallet';
      
      if (error.code === 4001) {
        errorMessage = 'Connection rejected. Please approve the connection in MetaMask.';
      } else if (error.code === -32002) {
        errorMessage = 'Connection request pending. Please check MetaMask.';
      }

      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
    }
  }, [isMetaMaskInstalled]);

  // Switch to Sepolia network
  const switchToSepolia = useCallback(async () => {
    if (!isMetaMaskInstalled) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (error: any) {
      // If the chain hasn't been added, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'SepoliaETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError);
          setState(prev => ({
            ...prev,
            error: 'Failed to add Sepolia network. Please add it manually in MetaMask.',
          }));
        }
      } else {
        console.error('Error switching network:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to switch network. Please switch to Sepolia manually.',
        }));
      }
    }
  }, [isMetaMaskInstalled]);

  // Disconnect wallet (just clears local state - MetaMask doesn't have a disconnect method)
  const disconnectWallet = useCallback(() => {
    setState({
      isConnected: false,
      address: null,
      chainId: null,
      isCorrectNetwork: false,
      isConnecting: false,
      error: null,
    });
  }, []);

  // Listen for account and chain changes
  useEffect(() => {
    if (!isMetaMaskInstalled) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setState(prev => ({
          ...prev,
          address: accounts[0],
          isConnected: true,
        }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      const chainIdDecimal = parseInt(chainId, 16);
      setState(prev => ({
        ...prev,
        chainId: chainIdDecimal,
        isCorrectNetwork: chainIdDecimal === SEPOLIA_CHAIN_ID_DECIMAL,
      }));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Check initial connection
    checkConnection();

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [isMetaMaskInstalled, checkConnection, disconnectWallet]);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        isMetaMaskInstalled,
        connectWallet,
        disconnectWallet,
        switchToSepolia,
        formatAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Add ethereum type to window
declare global {
  interface Window {
    ethereum: any;
  }
}

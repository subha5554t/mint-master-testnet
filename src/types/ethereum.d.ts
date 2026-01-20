/**
 * Ethereum provider type definitions
 * Provides type safety for window.ethereum interactions
 */

export interface EthereumRequestArguments {
  method: string;
  params?: unknown[] | object;
}

export interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: EthereumRequestArguments) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {};

import { useWallet } from '@/contexts/WalletContext';
import { Wifi, WifiOff } from 'lucide-react';

export function NetworkBadge() {
  const { isConnected, isCorrectNetwork, chainId } = useWallet();

  if (!isConnected) return null;

  const getNetworkName = (id: number | null) => {
    switch (id) {
      case 1:
        return 'Ethereum Mainnet';
      case 5:
        return 'Goerli';
      case 11155111:
        return 'Sepolia';
      case 137:
        return 'Polygon';
      case 80001:
        return 'Mumbai';
      case 80002:
        return 'Amoy';
      default:
        return `Chain ${id}`;
    }
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        isCorrectNetwork
          ? 'bg-success/10 text-success border border-success/20'
          : 'bg-warning/10 text-warning border border-warning/20'
      }`}
    >
      {isCorrectNetwork ? (
        <Wifi className="w-3 h-3" />
      ) : (
        <WifiOff className="w-3 h-3" />
      )}
      {getNetworkName(chainId)}
    </div>
  );
}

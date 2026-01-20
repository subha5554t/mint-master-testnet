import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { Wallet, LogOut, AlertTriangle, ExternalLink } from 'lucide-react';

export function WalletButton() {
  const {
    isConnected,
    address,
    isCorrectNetwork,
    isConnecting,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    formatAddress,
  } = useWallet();

  // MetaMask not installed
  if (!isMetaMaskInstalled) {
    return (
      <Button
        variant="wallet"
        size="lg"
        onClick={() => window.open('https://metamask.io/download/', '_blank')}
        className="gap-2"
      >
        <ExternalLink className="w-4 h-4" />
        Install MetaMask
      </Button>
    );
  }

  // Not connected
  if (!isConnected) {
    return (
      <Button
        variant="wallet"
        size="lg"
        onClick={connectWallet}
        disabled={isConnecting}
        className="gap-2"
      >
        {isConnecting ? (
          <>
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full spin-slow" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </>
        )}
      </Button>
    );
  }

  // Connected but wrong network
  if (!isCorrectNetwork) {
    return (
      <div className="flex items-center gap-3">
        <Button
          variant="destructive"
          size="lg"
          onClick={switchToSepolia}
          className="gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Switch to Sepolia
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={disconnectWallet}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Connected and correct network
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-sm font-medium text-foreground">
          {formatAddress(address!)}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={disconnectWallet}
        className="text-muted-foreground hover:text-foreground"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}

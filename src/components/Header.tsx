import { WalletButton } from './WalletButton';
import { NetworkBadge } from './NetworkBadge';
import { Hexagon } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Hexagon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-foreground text-lg leading-tight">
              NFT Minter
            </h1>
            <p className="text-xs text-muted-foreground">Testnet Edition</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <NetworkBadge />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}

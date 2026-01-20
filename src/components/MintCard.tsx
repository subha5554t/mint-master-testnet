import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { useNFTContract } from '@/hooks/useNFTContract';
import { Sparkles, ExternalLink, CheckCircle2, XCircle, Loader2, ImageIcon } from 'lucide-react';

export function MintCard() {
  const { isConnected, isCorrectNetwork } = useWallet();
  const { isMinting, transactionHash, tokenId, error, success, mintNFT, resetMintState } = useNFTContract();
  const [tokenURI, setTokenURI] = useState('ipfs://QmExampleTokenURI/metadata.json');

  const canMint = isConnected && isCorrectNetwork && !isMinting;

  const handleMint = () => {
    mintNFT('Quick Mint NFT', 'Minted via quick mint', '', tokenURI);
  };

  return (
    <div className="glass-card rounded-2xl p-8 max-w-md w-full animate-scale-in">
      {/* Card Header */}
      <div className="flex items-center justify-center mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center float-animation">
          <ImageIcon className="w-10 h-10 text-primary" />
        </div>
      </div>

      <h2 className="text-2xl font-display font-bold text-center text-foreground mb-2">
        Quick Mint NFT
      </h2>
      <p className="text-muted-foreground text-center text-sm mb-6">
        Create a quick NFT on Sepolia Testnet
      </p>

      {/* Token URI Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Token URI (Metadata)
        </label>
        <input
          type="text"
          value={tokenURI}
          onChange={(e) => setTokenURI(e.target.value)}
          placeholder="ipfs://..."
          className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          disabled={isMinting}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Enter your IPFS metadata URL or leave default for testing
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3 animate-fade-in">
          <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Minting Failed</p>
            <p className="text-xs text-destructive/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && transactionHash && (
        <div className="mb-6 p-4 rounded-lg bg-success/10 border border-success/20 animate-fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-success">NFT Minted Successfully!</p>
              {tokenId !== null && (
                <p className="text-xs text-success/80 mt-1">Token ID: #{tokenId}</p>
              )}
            </div>
          </div>
          <a
            href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 text-xs text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            View on Etherscan
          </a>
        </div>
      )}

      {isMinting && transactionHash && (
        <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20 animate-fade-in">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <div>
              <p className="text-sm font-medium text-primary">Transaction Pending...</p>
              <p className="text-xs text-primary/80 mt-1">Waiting for confirmation</p>
            </div>
          </div>
          <a
            href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 text-xs text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Track on Etherscan
          </a>
        </div>
      )}

      {/* Mint Button */}
      {success ? (
        <Button
          variant="outline"
          size="xl"
          onClick={resetMintState}
          className="w-full"
        >
          Mint Another NFT
        </Button>
      ) : (
        <Button
          variant="mint"
          size="xl"
          onClick={handleMint}
          disabled={!canMint}
          className="w-full"
        >
          {isMinting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Minting...
            </>
          ) : !isConnected ? (
            'Connect Wallet First'
          ) : !isCorrectNetwork ? (
            'Switch to Sepolia'
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Quick Mint
            </>
          )}
        </Button>
      )}

      {/* Info */}
      <p className="text-xs text-center text-muted-foreground mt-4">
        Gas fees are paid in Sepolia testnet ETH
      </p>
    </div>
  );
}

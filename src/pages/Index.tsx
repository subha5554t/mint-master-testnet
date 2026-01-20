import { Header } from '@/components/Header';
import { NFTBuilder } from '@/components/NFTBuilder';
import { NFTGallery } from '@/components/NFTGallery';
import { Features } from '@/components/Features';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer';
import { useWallet } from '@/contexts/WalletContext';
import { useNFTContract } from '@/hooks/useNFTContract';

const Index = () => {
  const { error } = useWallet();
  const { totalSupply, isContractDeployed } = useNFTContract();

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Header />

      {/* Hero Section */}
      <main className="relative pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Hero Content */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Sepolia Testnet
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
              Build Your Own{' '}
              <span className="gradient-text">NFT</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              Create custom ERC-721 NFTs with your own name, description, and image. 
              No real ETH required — learn Web3 development hands-on.
            </p>
            {isContractDeployed && (
              <p className="text-sm text-primary font-medium">
                {totalSupply} NFT{totalSupply !== 1 ? 's' : ''} minted in this collection
              </p>
            )}
          </div>

          {/* Wallet Error Alert */}
          {error && (
            <div className="max-w-md mx-auto mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center animate-fade-in">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* NFT Builder */}
          <div className="flex justify-center mb-16">
            <NFTBuilder />
          </div>
        </div>
      </main>

      {/* NFT Gallery */}
      <NFTGallery />

      {/* How It Works */}
      <HowItWorks />

      {/* Features */}
      <Features />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;

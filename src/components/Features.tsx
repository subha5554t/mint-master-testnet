import { Shield, Zap, Coins, Code2 } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure Minting',
    description: 'Built with OpenZeppelin standards for maximum security',
  },
  {
    icon: Zap,
    title: 'Fast Transactions',
    description: 'Optimized for quick minting on Sepolia testnet',
  },
  {
    icon: Coins,
    title: 'Free Testnet',
    description: 'No real ETH needed - use Sepolia faucet for gas',
  },
  {
    icon: Code2,
    title: 'Open Source',
    description: 'Fully transparent ERC-721 smart contract',
  },
];

export function Features() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-display font-bold text-center text-foreground mb-12">
          Why Use This DApp?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card rounded-xl p-6 text-center animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Wallet, MousePointer, Check } from 'lucide-react';

const steps = [
  {
    icon: Wallet,
    step: '01',
    title: 'Connect Wallet',
    description: 'Click "Connect Wallet" and approve MetaMask connection',
  },
  {
    icon: MousePointer,
    step: '02',
    title: 'Click Mint',
    description: 'Enter your token URI and click the mint button',
  },
  {
    icon: Check,
    step: '03',
    title: 'Confirm & Own',
    description: 'Confirm the transaction in MetaMask and own your NFT!',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-display font-bold text-center text-foreground mb-4">
          How It Works
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-md mx-auto">
          Mint your first NFT in three simple steps
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative text-center animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              {/* Step circle */}
              <div className="relative w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-effect">
                <step.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              
              {/* Step number */}
              <span className="text-xs font-mono text-primary mb-2 block">
                STEP {step.step}
              </span>
              
              <h3 className="font-display font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

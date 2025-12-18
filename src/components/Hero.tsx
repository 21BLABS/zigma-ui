import { useEffect, useState } from "react";

const useTypewriter = (text: string, speed: number = 50, delay: number = 0) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const startTyping = () => {
      let currentIndex = 0;
      
      const typeChar = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
          timeout = setTimeout(typeChar, speed);
        } else {
          setIsComplete(true);
        }
      };
      
      typeChar();
    };

    timeout = setTimeout(startTyping, delay);
    
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayedText, isComplete };
};

const Hero = () => {
  const [bootStep, setBootStep] = useState(0);
  
  const boot1 = useTypewriter("[BOOT] Initializing prediction oracle...", 30, 200);
  const boot2 = useTypewriter("[BOOT] Loading market feeds...", 30, 1500);
  const boot3 = useTypewriter("[BOOT] System ready.", 30, 2800);
  const headline = useTypewriter("AGENT ZIGMA", 80, 3500);
  const subtitle = useTypewriter("Prediction Market Oracle", 40, 4600);
  const desc1 = useTypewriter("Detects structural edge.", 35, 5800);
  const desc2 = useTypewriter("Remains silent otherwise.", 35, 6800);
  const prompt = useTypewriter("zigma@oracle:~$ ", 50, 7800);

  useEffect(() => {
    const timers = [
      setTimeout(() => setBootStep(1), 200),
      setTimeout(() => setBootStep(2), 1500),
      setTimeout(() => setBootStep(3), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className="min-h-screen flex flex-col justify-center px-4 py-20">
      <div className="container max-w-4xl">
        {/* Boot sequence */}
        <div className="mb-8 text-xs text-muted-foreground font-mono">
          <p className={bootStep >= 1 ? "opacity-100" : "opacity-0"}>
            {boot1.displayedText}
            {!boot1.isComplete && bootStep >= 1 && <span className="blink">_</span>}
          </p>
          <p className={bootStep >= 2 ? "opacity-100" : "opacity-0"}>
            {boot2.displayedText}
            {!boot2.isComplete && bootStep >= 2 && <span className="blink">_</span>}
          </p>
          <p className={bootStep >= 3 ? "opacity-100" : "opacity-0"}>
            {boot3.displayedText}
            {!boot3.isComplete && bootStep >= 3 && <span className="blink">_</span>}
          </p>
        </div>

        {/* Main headline */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-primary glow-text mb-2 min-h-[1.2em]">
            {headline.displayedText}
            {!headline.isComplete && headline.displayedText.length > 0 && (
              <span className="blink text-primary">_</span>
            )}
          </h1>
          <p className="text-lg md:text-xl text-secondary min-h-[1.5em]">
            {subtitle.displayedText}
            {!subtitle.isComplete && subtitle.displayedText.length > 0 && (
              <span className="blink">_</span>
            )}
          </p>
        </div>

        {/* Subtext */}
        <div className="mb-12 text-muted-foreground text-sm md:text-base">
          <p className="min-h-[1.5em]">
            {desc1.displayedText}
            {!desc1.isComplete && desc1.displayedText.length > 0 && (
              <span className="blink">_</span>
            )}
          </p>
          <p className="min-h-[1.5em]">
            {desc2.displayedText}
            {!desc2.isComplete && desc2.displayedText.length > 0 && (
              <span className="blink">_</span>
            )}
          </p>
        </div>

        {/* Status block */}
        <div 
          className={`terminal-box mb-12 max-w-md transition-opacity duration-500 ${
            desc2.isComplete ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">SYSTEM STATUS:</span>
              <span className="text-primary">ONLINE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">MODE:</span>
              <span className="text-accent">NO_TRADE_DEFAULT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">MARKETS MONITORED:</span>
              <span className="text-primary">500+</span>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div 
          className={`flex flex-col sm:flex-row gap-4 transition-opacity duration-500 ${
            desc2.isComplete ? "opacity-100" : "opacity-0"
          }`}
        >
          <a href="#signal" className="terminal-btn inline-flex items-center gap-2">
            <span className="text-muted-foreground">&gt;</span>
            VIEW LIVE SIGNAL LOG
          </a>
          <a href="#manifesto" className="terminal-btn-secondary inline-flex items-center gap-2">
            <span className="text-muted-foreground">&gt;</span>
            READ MANIFESTO
          </a>
        </div>

        {/* Blinking cursor */}
        <div className="mt-16 text-muted-foreground text-sm">
          <span>{prompt.displayedText}</span>
          {prompt.isComplete && <span className="blink">_</span>}
        </div>
      </div>
    </section>
  );
};

export default Hero;

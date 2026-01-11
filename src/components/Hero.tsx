import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
  const [statusExpanded, setStatusExpanded] = useState(false);
  
  const boot = useTypewriter("[BOOT] Agent Zigma online.", 30, 200);
  const headline = useTypewriter("AGENT ZIGMA", 80, 1500);
  const subtitle = useTypewriter("Prediction Market Oracle", 40, 2600);
  const desc1 = useTypewriter("Detects structural edge.", 35, 3800);
  const desc2 = useTypewriter("Remains silent otherwise.", 35, 4800);
  const quotable = useTypewriter("Zigma is an oracle, not an opinion.", 35, 5800);
  const prompt = useTypewriter("zigma@oracle:~$ ", 50, 7000);

  useEffect(() => {
    const timers = [
      setTimeout(() => setBootStep(1), 200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className="min-h-screen flex flex-col justify-center px-4 py-20">
      <div className="container max-w-4xl">
        {/* Boot sequence */}
        <div className="mb-8 text-xs text-muted-foreground font-mono">
          <p className={bootStep >= 1 ? "opacity-100" : "opacity-0"}>
            {boot.displayedText}
            {!boot.isComplete && bootStep >= 1 && <span className="blink">_</span>}
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

        {/* Positioning lines */}
        <div className="mb-8 text-muted-foreground text-sm md:text-base">
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

        {/* Quotable line */}
        <div className="mb-8 text-primary text-sm md:text-base font-semibold">
          <p className="min-h-[1.5em]">
            {quotable.displayedText}
            {!quotable.isComplete && quotable.displayedText.length > 0 && (
              <span className="blink">_</span>
            )}
          </p>
        </div>

        {/* ZIGMA IS NOT */}
        <div className={`terminal-box border-destructive/30 mb-8 transition-opacity duration-500 ${
          quotable.isComplete ? "opacity-100" : "opacity-0"
        }`}>
          <div className="terminal-header text-destructive">ZIGMA IS NOT:</div>
          <div className="space-y-2 text-sm md:text-base text-muted-foreground">
            <p>- A trading bot</p>
            <p>- A signal spammer</p>
            <p>- A probability generator</p>
          </div>
        </div>

        {/* Target audience */}
        <p className={`text-xs text-muted-foreground mb-8 transition-opacity duration-500 ${
          quotable.isComplete ? "opacity-100" : "opacity-0"
        }`}>
          Built for serious prediction market participants.
        </p>

        {/* CTAs */}
        <div 
          className={`flex flex-col sm:flex-row gap-4 mb-8 transition-opacity duration-500 ${
            quotable.isComplete ? "opacity-100" : "opacity-0"
          }`}
        >
          <Link to="/chat" className="terminal-btn inline-flex items-center gap-2">
            <span className="text-muted-foreground">&gt;</span>
            LAUNCH CHAT
          </Link>
          <Link to="/manifesto" className="terminal-btn inline-flex items-center gap-2">
            <span className="text-muted-foreground">&gt;</span>
            READ MANIFESTO
          </Link>
        </div>

        {/* System status (collapsed) */}
        <div 
          className={`terminal-box mb-12 max-w-md transition-opacity duration-500 ${
            quotable.isComplete ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="text-xs cursor-pointer" onClick={() => setStatusExpanded(!statusExpanded)}>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SYSTEM STATUS:</span>
              <span className="text-primary">ONLINE</span>
            </div>
            {statusExpanded && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MODE:</span>
                  <span className="text-accent">NO_TRADE_DEFAULT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MARKETS MONITORED:</span>
                  <span className="text-primary">500+</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;

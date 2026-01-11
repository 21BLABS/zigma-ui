import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

const ComingSoon = ({ feature }: { feature: string }) => {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SiteHeader />
      <main className="p-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-4xl font-bold text-green-400 mb-6 glow-text">{feature}</h1>
          <div className="border-l-4 border-green-400 pl-6 mb-8 inline-block text-left">
            <p className="text-xl text-green-300">
              Coming Soon
            </p>
          </div>
          <p className="text-lg text-muted-foreground mb-8">
            This feature is currently under development and will be available to users in a future release.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Follow our progress on <a href="https://x.com/agentzigma" target="_blank" rel="noreferrer" className="terminal-link">X</a> for updates.
          </p>
          <Link to="/" className="terminal-btn inline-flex items-center gap-2">
            <span className="text-muted-foreground">&lt;</span>
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ComingSoon;

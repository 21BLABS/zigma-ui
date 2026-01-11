import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-black text-green-300">
      <SiteHeader />
      <main className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 text-center">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-red-300">Signal lost</p>
          <h1 className="text-6xl font-black text-green-100">404</h1>
          <p className="text-muted-foreground">
            This route does not exist. Zigma only monitors known surfaces.
          </p>
          <Link to="/" className="terminal-btn inline-flex items-center gap-2">
            <span className="text-muted-foreground">&gt;</span>
            Return to Oracle Core
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;

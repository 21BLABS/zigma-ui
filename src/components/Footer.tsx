const Footer = () => {
  const links = [
    { label: "X", href: "#" },
    { label: "Telegram", href: "#" },
    { label: "Docs", href: "#" },
    { label: "Status", href: "#" },
  ];

  return (
    <footer className="py-16 px-4 border-t border-border">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <p className="text-primary font-bold mb-1">ZIGMA.PRO</p>
          <p className="text-muted-foreground text-sm">
            An independent market oracle.
          </p>
        </div>

        <div className="mb-8 text-sm text-muted-foreground space-y-1">
          <p>DO NOT TRADE BASED ON HYPE.</p>
          <p>VERIFY EVERYTHING.</p>
        </div>

        <div className="flex gap-6 text-sm">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="terminal-link"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="mt-12 text-xs text-muted-foreground">
          <span>zigma@oracle:~$ exit</span>
          <span className="blink ml-1">_</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

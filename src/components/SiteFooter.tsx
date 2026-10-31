const SiteFooter = () => {
  return (
    <footer className="py-6 border-t border-border">
      <div className="container-wide text-center text-sm text-muted-foreground/80">
        <p>
          <span className="text-foreground/80 font-medium">aggyswebservices.com</span> is a free educational tool by{" "}
          <a
            href="https://miaggy.com"
            target="_blank"
            rel="noreferrer"
            className="text-foreground/80 font-medium transition-colors hover:text-accent-text"
          >
            miaggy.com
          </a>
          .
        </p>
      </div>
    </footer>
  );
};

export default SiteFooter;

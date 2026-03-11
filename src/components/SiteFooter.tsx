const SiteFooter = () => {
  return (
    <footer className="py-6 border-t border-border">
      <div className="container-wide text-center text-sm text-muted-foreground/80">
        <p>
          aggyswebservices.com is a free educational tool by{" "}
          <a
            href="https://miaggy.com"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-orange-500"
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

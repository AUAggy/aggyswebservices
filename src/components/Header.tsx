import { SearchBar } from "./SearchBar";

export function Header() {
  return (
    <header className="hidden xl:block sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container-narrow py-3">
        <SearchBar 
          size="small" 
          placeholder="Search services..."
          className="max-w-md"
        />
      </div>
    </header>
  );
}

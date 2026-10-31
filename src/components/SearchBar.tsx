import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { searchServices, getServiceSlug, getCategoryBySlug } from "@/lib/aws-data";
import { ServiceIcon } from "@/components/ServiceIcon";
import type { AWSService } from "@/types/aws";

interface SearchBarProps {
  size?: "large" | "small";
  placeholder?: string;
  className?: string;
}

export function SearchBar({ 
  size = "large", 
  placeholder = "Search 69 AWS services... try 'S3' or 'database'",
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AWSService[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length >= 1) {
      const found = searchServices(query).slice(0, 8);
      setResults(found);
      setIsOpen(found.length > 0);
      setSelectedIndex(-1);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleSelect = (service: AWSService) => {
    const categorySlug = service.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
    const serviceSlug = getServiceSlug(service.service_name);
    navigate(`/category/${categorySlug}/${serviceSlug}`);
    setQuery("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const isLarge = size === "large";

  return (
    <div className={`relative min-w-0 ${className}`}>
      <div
        className={`
          relative flex items-center bg-card border rounded-lg
          transition-all duration-200
          ${isLarge ? "search-focus-glow" : ""}
          ${isFocused ? (isLarge ? "" : "border-accent/50 shadow-elevated") : "border-border"}
        `}
      >
        <Search 
          className={`
            absolute left-4 transition-colors duration-200
            ${isFocused ? "text-accent" : "text-muted-foreground"}
            ${isLarge ? "w-6 h-6" : "w-4 h-4"}
          `}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setIsOpen(false), 150);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground
            ${isLarge 
              ? "pl-14 pr-6 py-5 text-lg" 
              : "pl-10 pr-4 py-2.5 text-sm"
            }
          `}
        />
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-elevated max-h-[min(24rem,50dvh)] overflow-y-auto overscroll-contain z-50">
          {results.map((service, index) => (
            <button
              key={service.service_name}
              onClick={() => handleSelect(service)}
              className={`
                w-full px-4 py-3 text-left flex items-start gap-3 transition-colors
                ${index === selectedIndex ? "bg-secondary" : "hover:bg-secondary/50"}
                ${index !== results.length - 1 ? "border-b border-border" : ""}
              `}
            >
              <ServiceIcon icon={service.icon} className="h-5 w-5 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground break-words">
                  {service.service_name}
                </div>
                <div className="text-sm text-muted-foreground line-clamp-2 break-words">
                  {service.description}
                </div>
                <span className="inline-block max-w-full mt-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded break-words">
                  {service.category}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

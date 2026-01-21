import { useState } from "react";
import { ExternalLink, ChevronDown } from "lucide-react";
import type { AWSService } from "@/types/aws";

interface ServiceAccordionProps {
  service: AWSService;
}

type SectionKey = "plain" | "technical" | "example";

// Parse technical content to separate main content from Gotchas/Constraints
function parseTechnicalContent(content: string) {
  // Match patterns like "Common gotcha #1:", "Gotcha #1:", "Gotcha:", "Constraints:"
  const gotchasMatch = content.match(/((?:Common\s+)?(?:Gotcha|Gotchas)(?:\s*(?:and|&)\s*Constraints)?(?:\s*#?\d*)?:)/i);
  
  if (gotchasMatch && gotchasMatch.index !== undefined) {
    const mainContent = content.slice(0, gotchasMatch.index).trim();
    const gotchas = content.slice(gotchasMatch.index).trim();
    return { mainContent, gotchas };
  }
  
  return { mainContent: content, gotchas: null };
}

// Parse example content to separate main content from Results
function parseExampleContent(content: string) {
  const resultsMatch = content.match(/\b(Results?:)/i);
  
  if (resultsMatch && resultsMatch.index !== undefined) {
    const mainContent = content.slice(0, resultsMatch.index).trim();
    const results = content.slice(resultsMatch.index).trim();
    return { mainContent, results };
  }
  
  return { mainContent: content, results: null };
}

export function ServiceAccordion({ service }: ServiceAccordionProps) {
  const [openSection, setOpenSection] = useState<SectionKey>("plain");

  const sections: { key: SectionKey; title: string; content: string }[] = [
    {
      key: "plain",
      title: "Plain English",
      content: service.feynman_definition,
    },
    {
      key: "technical",
      title: "Technical Deep Dive",
      content: service.architectural_deep_dive,
    },
    {
      key: "example",
      title: "Real-World Example",
      content: service.scenario_example,
    },
  ];

  const toggleSection = (key: SectionKey) => {
    setOpenSection((prev) => (prev === key ? prev : key));
  };

  const renderContent = (section: typeof sections[0]) => {
    if (section.key === "technical") {
      const { mainContent, gotchas } = parseTechnicalContent(section.content);
      
      return (
        <div className="space-y-6">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {mainContent}
          </p>
          
          {gotchas && (
            <div className="pt-5 mt-5 border-t-2 border-accent/30">
              <h4 className="text-sm font-semibold text-accent uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-gradient-to-b from-accent to-accent/60 rounded-full"></span>
                Gotchas & Constraints
              </h4>
              <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap pl-3 border-l-2 border-accent/20">
                {gotchas}
              </p>
            </div>
          )}
        </div>
      );
    }
    
    if (section.key === "example") {
      const { mainContent, results } = parseExampleContent(section.content);
      
      return (
        <div className="space-y-6">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {mainContent}
          </p>
          
          {results && (
            <div className="pt-5 mt-5 border-t border-border/60">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Results
              </h4>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {results.replace(/^Results?:\s*/i, '')}
              </p>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
        {section.content}
      </p>
    );
  };

  return (
    <div className="space-y-3">
      {sections.map((section) => {
        const isOpen = openSection === section.key;
        
        return (
          <div
            key={section.key}
            className="border border-border rounded-lg overflow-hidden bg-card"
          >
            <button
              onClick={() => toggleSection(section.key)}
              className={`
                w-full px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between text-left
                transition-colors
                ${isOpen ? "bg-secondary/50" : "hover:bg-secondary/30"}
              `}
            >
              <span className={`font-medium ${isOpen ? "text-foreground" : "text-muted-foreground"}`}>
                {section.title}
              </span>
              <ChevronDown 
                className={`
                  w-5 h-5 text-muted-foreground transition-transform duration-200 shrink-0 ml-2
                  ${isOpen ? "rotate-180" : ""}
                `}
              />
            </button>
            
            <div
              className={`
                overflow-hidden transition-all duration-200 ease-out
                ${isOpen ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"}
              `}
            >
              <div className="px-4 sm:px-5 py-4 sm:py-5 border-t border-border">
                {renderContent(section)}
              </div>
            </div>
          </div>
        );
      })}

      {/* AWS Documentation Link - Always visible */}
      <a
        href={service.aws_user_guide_documentation}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border border-border rounded-lg bg-card hover:border-accent/30 hover:shadow-subtle transition-all"
      >
        <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          Official AWS Documentation
        </span>
        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent external-link-icon shrink-0 ml-2" />
      </a>
    </div>
  );
}

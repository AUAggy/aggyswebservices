import { useState } from "react";
import { ExternalLink, ChevronDown } from "lucide-react";
import type { AWSService } from "@/types/aws";

interface ServiceAccordionProps {
  service: AWSService;
}

type SectionKey = "plain" | "technical" | "example";

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
                w-full px-5 py-4 flex items-center justify-between text-left
                transition-colors
                ${isOpen ? "bg-secondary/50" : "hover:bg-secondary/30"}
              `}
            >
              <span className={`font-medium ${isOpen ? "text-foreground" : "text-muted-foreground"}`}>
                {section.title}
              </span>
              <ChevronDown 
                className={`
                  w-5 h-5 text-muted-foreground transition-transform duration-200
                  ${isOpen ? "rotate-180" : ""}
                `}
              />
            </button>
            
            <div
              className={`
                overflow-hidden transition-all duration-200 ease-out
                ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}
              `}
            >
              <div className="px-5 py-5 border-t border-border">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </p>
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
        className="group flex items-center justify-between px-5 py-4 border border-border rounded-lg bg-card hover:border-accent/30 hover:shadow-subtle transition-all"
      >
        <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          Official AWS Documentation
        </span>
        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent external-link-icon" />
      </a>
    </div>
  );
}

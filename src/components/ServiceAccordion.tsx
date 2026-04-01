import { useState } from "react";
import {
  ExternalLink,
  ChevronDown,
  Lightbulb,
  BookOpen,
  Layers,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Zap
} from "lucide-react";
import type { AWSService } from "@/types/aws";

interface ServiceAccordionProps {
  service: AWSService;
}

type SectionKey = "plain" | "technical" | "example";

// Helper component for section icons
const IconWrapper = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-2 rounded-lg ${className} flex items-center justify-center`}>
    {children}
  </div>
);

// Improved technical content parser
function parseTechnicalContent(content: string) {
  let mainContent = content;
  let gotchas = null;
  let keyFeatures = null;

  // extracted "Gotchas" or "Constraints" block
  // Matches: "Common gotcha #1:", "Gotcha #1:", "Gotcha:", "Constraints:", etc.
  // We capture everything after this match as the separate block.
  const gotchasMatch = content.match(/((?:Common\s+)?(?:Gotcha|Gotchas)(?:\s*(?:and|&)\s*Constraints)?(?:\s*#?\d*)?:)/i);

  if (gotchasMatch && gotchasMatch.index !== undefined) {
    // Everything before the match is the potential main content + key features
    const beforeGotchas = content.slice(0, gotchasMatch.index).trim();
    gotchas = content.slice(gotchasMatch.index).trim();
    mainContent = beforeGotchas;
  }

  // Extract "Key features" or "Key configurations" block from the main content
  // Matches: "Key features:", "Key configurations:", "Key components:"
  const featuresMatch = mainContent.match(/(Key\s+(?:features|configurations|components|integrations):)/i);

  if (featuresMatch && featuresMatch.index !== undefined) {
    const beforeFeatures = mainContent.slice(0, featuresMatch.index).trim();
    keyFeatures = mainContent.slice(featuresMatch.index).trim();
    mainContent = beforeFeatures;
  }

  return { mainContent, keyFeatures, gotchas };
}

// Improved example content parser
function parseExampleContent(content: string) {
  const resultsMatch = content.match(/\b(Results?:)/i);

  if (resultsMatch && resultsMatch.index !== undefined) {
    const mainContent = content.slice(0, resultsMatch.index).trim();
    const results = content.slice(resultsMatch.index).trim();
    return { mainContent, results };
  }

  return { mainContent: content, results: null };
}

// Helper to render text with better paragraph formatting
const FormattedText = ({ text, className = "" }: { text: string; className?: string }) => {
  if (!text) return null;
  return (
    <p className={`leading-relaxed text-foreground/90 whitespace-pre-wrap ${className}`}>
      {text}
    </p>
  );
};

export function ServiceAccordion({ service }: ServiceAccordionProps) {
  const [openSection, setOpenSection] = useState<SectionKey>("plain");

  const sections = [
    {
      key: "plain" as SectionKey,
      title: "Plain English",
      icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
      content: service.feynman_definition,
      bgActive: "bg-amber-500/10",
      borderActive: "border-amber-500/20",
    },
    {
      key: "technical" as SectionKey,
      title: "Technical Deep Dive",
      icon: <Layers className="w-5 h-5 text-blue-500" />,
      content: service.architectural_deep_dive,
      bgActive: "bg-blue-500/10",
      borderActive: "border-blue-500/20",
    },
    {
      key: "example" as SectionKey,
      title: "Real-World Example",
      icon: <BookOpen className="w-5 h-5 text-emerald-500" />,
      content: service.scenario_example,
      bgActive: "bg-emerald-500/10",
      borderActive: "border-emerald-500/20",
    },
  ];

  const toggleSection = (key: SectionKey) => {
    setOpenSection((prev) => (prev === key ? prev : key));
  };

  const renderContent = (section: typeof sections[0]) => {
    if (section.key === "technical") {
      const { mainContent, gotchas } = parseTechnicalContent(section.content);
      const capabilities = service.key_capabilities;

      // Format gotchas to ensure they start on new lines
      const formattedGotchas = gotchas
        ? gotchas.replace(/(\s+)((?:Common\s+)?(?:Gotcha #\d+|Constraints):)/g, '\n\n$2')
        : null;

      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <FormattedText text={mainContent} className="text-lg" />

          {capabilities && capabilities.length > 0 && (
            <div className="bg-secondary/30 rounded-lg p-5 border border-border/50">
              <h4 className="flex items-center gap-2 font-semibold text-foreground mb-3">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                Key Capabilities
              </h4>
              <ul className="space-y-2">
                {capabilities.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {gotchas && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-5">
              <h4 className="flex items-center gap-2 font-semibold text-destructive mb-3 uppercase tracking-wider text-xs">
                <AlertTriangle className="w-4 h-4" />
                Gotchas & Constraints
              </h4>
              <FormattedText text={formattedGotchas || gotchas} className="text-sm pl-1" />
            </div>
          )}
        </div>
      );
    }

    if (section.key === "example") {
      const { mainContent, results } = parseExampleContent(section.content);

      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex gap-4">
            <div className="hidden sm:flex flex-col items-center pt-1">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="w-0.5 h-full bg-border mt-2 -mb-8"></div>
            </div>
            <FormattedText text={mainContent} className="text-lg flex-1" />
          </div>

          {results && (
            <div className="flex gap-4 pt-2">
              <div className="hidden sm:flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 z-10">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-5 flex-1 shadow-sm">
                <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-xs mb-2">
                  The Result
                </h4>
                <FormattedText
                  text={results.replace(/^Results?:\s*/i, '')}
                  className="font-medium text-foreground"
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    // Plain English Visualization
    return (
      <div className="animate-in fade-in duration-300">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <blockquote className="border-l-4 border-amber-500/50 bg-amber-500/5 px-6 py-4 rounded-r-lg not-italic my-0">
            <FormattedText text={section.content} className="text-lg sm:text-xl font-medium leading-relaxed" />
          </blockquote>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const isOpen = openSection === section.key;

        return (
          <div
            key={section.key}
            className={`
              border rounded-xl overflow-hidden transition-all duration-300 ease-in-out
              ${isOpen
                ? `${section.bgActive} ${section.borderActive} shadow-md`
                : "bg-card border-border hover:border-border/80 shadow-sm hover:shadow-md"
              }
            `}
          >
            <button
              onClick={() => toggleSection(section.key)}
              className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none group"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`
                  p-2 rounded-lg transition-colors duration-300
                  ${isOpen ? "bg-background shadow-sm" : "bg-secondary/50 group-hover:bg-secondary"}
                `}>
                  {section.icon}
                </div>
                <span className={`
                  font-semibold text-lg transition-colors
                  ${isOpen ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}
                `}>
                  {section.title}
                </span>
              </div>
              <ChevronDown
                className={`
                  w-5 h-5 text-muted-foreground transition-transform duration-300 ease-in-out shrink-0
                  ${isOpen ? "rotate-180 text-foreground" : "group-hover:text-foreground"}
                `}
              />
            </button>

            <div
              className={`
                grid transition-all duration-300 ease-in-out
                ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
              `}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-6 sm:px-20 sm:pb-8 pt-2">
                  {renderContent(section)}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* AWS Documentation Link - Modernized */}
      <a
        href={service.aws_user_guide_documentation}
        target="_blank"
        rel="noopener noreferrer"
        className="
          mt-6 group flex items-center justify-between px-5 py-4 
          border border-border/60 rounded-xl bg-card/50 
          hover:bg-card hover:border-primary/20 hover:shadow-md 
          transition-all duration-300
        "
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-secondary/50 group-hover:bg-primary/10 transition-colors">
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Official AWS Documentation
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </a>
    </div>
  );
}

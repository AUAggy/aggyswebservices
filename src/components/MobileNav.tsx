import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { getCategories, getServicesByCategory, getServiceSlug } from "@/lib/aws-data";
import { ServiceIcon } from "@/components/ServiceIcon";

interface MobileNavProps {
  currentCategory?: string;
  currentService?: string;
}

export function MobileNav({ currentCategory, currentService }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const categories = getCategories();

  return (
    <>
      {/* Mobile Header - Visible up to xl breakpoint */}
      <div className="xl:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight"
            onClick={() => setIsOpen(false)}
          >
            AWS <span className="text-gradient-orange">Explained</span>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="xl:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`
          xl:hidden fixed top-[57px] right-0 bottom-0 z-50 w-72 bg-sidebar border-l border-border
          transform transition-transform duration-200 ease-out overflow-y-auto
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <nav className="p-4 space-y-1">
          {categories.map((category) => {
            const isActive = category.slug === currentCategory;
            const services = isActive ? getServicesByCategory(category.slug) : [];

            return (
              <div key={category.slug}>
                <Link
                  to={`/category/${category.slug}`}
                  onClick={() => setIsOpen(false)}
                  className={`
                    block px-3 py-2.5 rounded-md text-sm transition-colors
                    ${isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }
                  `}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </Link>

                {isActive && services.length > 0 && (
                  <div className="ml-6 mt-1 mb-2 space-y-0.5 border-l border-sidebar-border pl-3">
                    {services.map((service) => {
                      const slug = getServiceSlug(service.service_name);
                      const isServiceActive = slug === currentService;

                      return (
                        <Link
                          key={slug}
                          to={`/category/${category.slug}/${slug}`}
                          onClick={() => setIsOpen(false)}
                          className={`
                            flex items-center gap-2 py-2 text-sm transition-colors
                            ${isServiceActive
                              ? "text-accent font-medium"
                              : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                            }
                          `}
                        >
                          <ServiceIcon icon={service.icon} className="h-5 w-5" />
                          <span className="truncate">{service.service_name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}

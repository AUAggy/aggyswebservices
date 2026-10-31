import { Link } from "react-router-dom";
import { getCategories, getServicesByCategory, getServiceSlug } from "@/lib/aws-data";
import type { CategoryInfo } from "@/types/aws";
import { ServiceIcon } from "@/components/ServiceIcon";

interface SidebarProps {
  currentCategory?: string;
  currentService?: string;
}

export function Sidebar({ currentCategory, currentService }: SidebarProps) {
  const categories = getCategories();
  const activeCategory = categories.find((c) => c.slug === currentCategory);

  return (
    <aside className="hidden xl:flex xl:flex-col xl:fixed xl:inset-y-0 xl:left-0 w-64 border-r border-border bg-sidebar overflow-y-auto z-30">
      <div className="p-4 flex-1">
        <Link
          to="/"
          className="block text-lg font-semibold text-sidebar-foreground tracking-tight mb-6 hover:text-accent-text transition-colors"
        >
          AWS <span className="text-gradient-orange">Explained</span>
        </Link>

        <nav className="space-y-1">
          {categories.map((category) => {
            const isActive = category.slug === currentCategory;
            const services = isActive ? getServicesByCategory(category.slug) : [];

            return (
              <div key={category.slug}>
                <Link
                  to={`/category/${category.slug}`}
                  className={`
                    block px-3 py-2 rounded-md text-sm transition-colors
                    ${isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }
                  `}
                >
                  <span className="mr-2" aria-hidden="true">{category.icon}</span>
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
                          className={`
                            flex items-center gap-2 py-1.5 text-sm transition-colors
                            ${isServiceActive
                              ? "text-accent-text font-medium"
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
    </aside>
  );
}

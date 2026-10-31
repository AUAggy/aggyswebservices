import { Link } from "react-router-dom";
import type { CategoryInfo } from "@/types/aws";

interface CategoryCardProps {
  category: CategoryInfo;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="group block p-6 bg-card border border-border rounded-lg card-hover-glow"
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl" aria-hidden="true">
          {category.icon}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-lg tracking-tight mb-1">
            {category.name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {category.description}
          </p>
          <span className="text-xs font-medium text-accent-text">
            {category.serviceCount} {category.serviceCount === 1 ? "service" : "services"}
          </span>
        </div>
      </div>
    </Link>
  );
}

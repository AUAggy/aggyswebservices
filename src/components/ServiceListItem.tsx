import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import type { AWSService } from "@/types/aws";
import { getServiceSlug } from "@/lib/aws-data";

interface ServiceListItemProps {
  service: AWSService;
  categorySlug: string;
}

export function ServiceListItem({ service, categorySlug }: ServiceListItemProps) {
  const serviceSlug = getServiceSlug(service.service_name);

  return (
    <Link
      to={`/category/${categorySlug}/${serviceSlug}`}
      className="group block p-5 bg-card border border-border rounded-lg card-hover-glow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-lg tracking-tight mb-1.5">
            {service.service_name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {service.description}
          </p>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent shrink-0 mt-1 external-link-icon" />
      </div>
    </Link>
  );
}

import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { ServiceIcon } from "@/components/ServiceIcon";
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
          <div className="flex items-start gap-2 mb-1.5">
            <ServiceIcon icon={service.icon} className="h-5 w-5 mt-1" />
            <h3 className="font-semibold text-foreground text-lg tracking-tight min-w-0 break-words">
              {service.service_name}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {service.description}
          </p>
        </div>
        <ChevronRight aria-hidden="true" className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent shrink-0 mt-1" />
      </div>
    </Link>
  );
}

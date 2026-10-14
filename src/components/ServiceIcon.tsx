interface ServiceIconProps {
  icon?: string;
  className?: string;
}

// Renders the official AWS Architecture Icon bundled in public/icons/aws.
// Decorative by design: the service name is always adjacent, so the image is
// hidden from assistive tech. One icon per service, sized by the caller.
export function ServiceIcon({ icon, className = "h-5 w-5" }: ServiceIconProps) {
  if (!icon) return null;

  return (
    <img
      src={`/icons/aws/${icon}.svg`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className={`shrink-0 ${className}`}
    />
  );
}

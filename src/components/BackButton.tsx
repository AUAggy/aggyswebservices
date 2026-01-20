import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  to: string;
  label: string;
}

export function BackButton({ to, label }: BackButtonProps) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="w-4 h-4 back-arrow" />
      <span>{label}</span>
    </Link>
  );
}

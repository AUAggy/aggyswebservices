import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import SiteFooter from "@/components/SiteFooter";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Page Not Found"
        description="This page does not exist."
        canonicalPath="/404"
        noIndex
      />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center container-narrow">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          This page doesn't exist. Maybe try searching for a service?
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default NotFound;

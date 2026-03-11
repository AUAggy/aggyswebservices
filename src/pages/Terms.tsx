import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import SiteFooter from "@/components/SiteFooter";
import {
  baseUrl,
  getLegalPageJsonLd,
  getOrganizationJsonLd,
  getWebSiteJsonLd,
} from "@/lib/seo";

const Terms = () => {
  const description = "Terms of use for AWS in Plain English.";
  const jsonLd = [
    getOrganizationJsonLd(),
    getWebSiteJsonLd(),
    getLegalPageJsonLd({
      name: "Terms of Use",
      description,
      url: `${baseUrl}/terms/`,
    }),
  ];

  return (
    <div className="min-h-screen px-4 py-12">
      <Seo
        title="Terms of Use"
        description={description}
        canonicalPath="/terms/"
        jsonLd={jsonLd}
      />
      <div className="container-narrow">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-6">
          Terms of Use
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-4">
          AWS in Plain English provides educational content about Amazon Web Services. By using this
          site, you agree to use the content for informational purposes and acknowledge that it may
          change without notice.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We make reasonable efforts to keep information accurate, but do not guarantee completeness
          or suitability for any specific purpose. You are responsible for validating any technical
          or operational decisions you make based on this content.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          For permissions related to quoting, summarizing, or reuse of content, see the
          {" "}
          <Link to="/license" className="underline underline-offset-4">
            Content License
          </Link>
          .
        </p>
        <Link to="/" className="text-primary underline underline-offset-4">
          Back to Home
        </Link>
      </div>
      <SiteFooter />
    </div>
  );
};

export default Terms;

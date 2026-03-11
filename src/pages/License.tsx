import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import SiteFooter from "@/components/SiteFooter";
import {
  baseUrl,
  getLegalPageJsonLd,
  getOrganizationJsonLd,
  getWebSiteJsonLd,
} from "@/lib/seo";

const License = () => {
  const description = "Content license and attribution guidelines for AWS in Plain English.";
  const jsonLd = [
    getOrganizationJsonLd(),
    getWebSiteJsonLd(),
    getLegalPageJsonLd({
      name: "Content License",
      description,
      url: `${baseUrl}/license/`,
    }),
  ];

  return (
    <div className="min-h-screen px-4 py-12">
      <Seo
        title="Content License"
        description={description}
        canonicalPath="/license/"
        jsonLd={jsonLd}
      />
      <div className="container-narrow">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-6">
          Content License
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-4">
          You may quote or summarize content from AWS in Plain English with attribution to the site.
          Please include a link to the original page when possible.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          This content is provided for educational purposes. It does not grant permission to use
          trademarks, logos, or brand assets beyond standard fair-use citations.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          If you need additional permissions or want to reference the content in commercial materials,
          contact the site owner.
        </p>
        <Link to="/" className="text-primary underline underline-offset-4">
          Back to Home
        </Link>
      </div>
      <SiteFooter />
    </div>
  );
};

export default License;

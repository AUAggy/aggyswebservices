import { Helmet } from "react-helmet-async";
import {
  baseUrl,
  brandName,
  ogImage,
  ogImageAlt,
  twitterImage,
  licenseUrl,
} from "@/lib/seo";

type SeoProps = {
  title: string;
  description: string;
  canonicalPath: string;
  jsonLd?: Record<string, unknown>[];
  noIndex?: boolean;
};

const Seo = ({ title, description, canonicalPath, jsonLd = [], noIndex = false }: SeoProps) => {
  const fullTitle = title.includes(brandName) ? title : `${title} | ${brandName}`;
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="author" content={brandName} />
      <meta name="copyright" content={brandName} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />

      <link rel="canonical" href={canonicalUrl} />
      <link rel="license" href={licenseUrl} />
      <link rel="alternate" type="application/rss+xml" title={`${brandName} RSS`} href={`${baseUrl}/rss.xml`} />
      <link rel="alternate" type="application/feed+json" title={`${brandName} JSON Feed`} href={`${baseUrl}/feed.json`} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={brandName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={ogImageAlt} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={twitterImage} />
      <meta property="twitter:image:alt" content={ogImageAlt} />

      {jsonLd.map((item, index) => (
        <script
          key={`${canonicalUrl}-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </Helmet>
  );
};

export default Seo;

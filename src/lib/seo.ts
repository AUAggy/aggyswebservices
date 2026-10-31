export const baseUrl = "https://aggyswebservices.com";
export const brandName = "AWS in Plain English";
export const brandDescription = "Plain-English explanations of AWS services with practical examples and technical deep dives.";
export const ogImage = `${baseUrl}/og-image.png`;
export const twitterImage = `${baseUrl}/twitter-image.png`;
export const ogImageAlt = "AWS in Plain English cover image";
export const licenseUrl = `${baseUrl}/license`;

export const buildDate = typeof __BUILD_DATE__ !== "undefined"
  ? __BUILD_DATE__
  : new Date().toISOString();

export const getOrganizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: brandName,
  url: baseUrl,
  logo: `${baseUrl}/apple-touch-icon.png`,
});

export const getWebSiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: brandName,
  url: baseUrl,
  description: brandDescription,
  publisher: {
    "@type": "Organization",
    name: brandName,
    url: baseUrl,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: `${baseUrl}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const getCollectionPageJsonLd = ({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name,
  description,
  url,
  isPartOf: {
    "@type": "WebSite",
    name: brandName,
    url: baseUrl,
  },
  dateModified: buildDate,
  license: licenseUrl,
  copyrightHolder: {
    "@type": "Organization",
    name: brandName,
    url: baseUrl,
  },
});

export const getCategoryJsonLd = ({
  name,
  description,
  url,
  itemUrls,
}: {
  name: string;
  description: string;
  url: string;
  itemUrls: string[];
}) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name,
  description,
  url,
  isPartOf: {
    "@type": "WebSite",
    name: brandName,
    url: baseUrl,
  },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: itemUrls.map((itemUrl, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: itemUrl,
    })),
  },
  dateModified: buildDate,
  license: licenseUrl,
  copyrightHolder: {
    "@type": "Organization",
    name: brandName,
    url: baseUrl,
  },
});

export const getServiceArticleJsonLd = ({
  serviceName,
  description,
  url,
}: {
  serviceName: string;
  description: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: serviceName,
  description,
  url,
  author: {
    "@type": "Organization",
    name: brandName,
    url: baseUrl,
  },
  publisher: {
    "@type": "Organization",
    name: brandName,
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/apple-touch-icon.png`,
    },
  },
  about: {
    "@type": "Service",
    name: serviceName,
    provider: {
      "@type": "Organization",
      name: "Amazon Web Services",
      url: "https://aws.amazon.com/",
    },
  },
  isPartOf: {
    "@type": "WebSite",
    name: brandName,
    url: baseUrl,
  },
  dateModified: buildDate,
  license: licenseUrl,
  copyrightHolder: {
    "@type": "Organization",
    name: brandName,
    url: baseUrl,
  },
});

export const getLegalPageJsonLd = ({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name,
  description,
  url,
  isPartOf: {
    "@type": "WebSite",
    name: brandName,
    url: baseUrl,
  },
  dateModified: buildDate,
  license: licenseUrl,
  copyrightHolder: {
    "@type": "Organization",
    name: brandName,
    url: baseUrl,
  },
});

import { SearchBar } from "@/components/SearchBar";
import { CategoryCard } from "@/components/CategoryCard";
import { getCategories, getMetadata } from "@/lib/aws-data";
import Seo from "@/components/Seo";
import SiteFooter from "@/components/SiteFooter";
import {
  baseUrl,
  brandDescription,
  getCollectionPageJsonLd,
  getOrganizationJsonLd,
  getWebSiteJsonLd,
} from "@/lib/seo";

const Index = () => {
  const categories = getCategories();
  const metadata = getMetadata();
  const description = `${metadata.total_services} cloud services demystified with plain English explanations, practical examples, and technical deep dives.`;
  const jsonLd = [
    getOrganizationJsonLd(),
    getWebSiteJsonLd(),
    getCollectionPageJsonLd({
      name: "AWS Services Explained Simply",
      description: brandDescription,
      url: `${baseUrl}/`,
    }),
  ];

  return (
    <div className="min-h-screen">
      <Seo
        title="AWS Services Explained Simply"
        description={description}
        canonicalPath="/"
        jsonLd={jsonLd}
      />
      {/* Hero Section */}
      <section className="pt-12 sm:pt-16 md:pt-20 pb-10 sm:pb-16 px-4">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            {/* Main headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4 sm:mb-6">
              <span className="text-gradient-dark">AWS Services</span>
              <br />
              <span className="text-gradient-orange">Explained Simply</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-xl mx-auto leading-relaxed">
              {metadata.total_services} cloud services demystified with plain English explanations, 
              practical examples, and technical deep dives.
            </p>

            {/* HUGE Search Bar */}
            <SearchBar 
              size="large" 
              placeholder="Search services..."
              className="max-w-2xl mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="pb-12 sm:pb-16 px-4">
        <div className="container-wide">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-center mb-6 sm:mb-8">
            Explore by Category
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Feynman Quote */}
      <section className="py-12 sm:py-16 border-t border-border px-4">
        <div className="container-wide">
          <blockquote className="max-w-2xl mx-auto text-center">
            <p className="text-lg sm:text-xl md:text-2xl text-foreground/80 italic leading-relaxed mb-3 sm:mb-4">
              "If you can't explain it simply, you don't understand it well enough."
            </p>
            <footer className="text-sm sm:text-base text-muted-foreground">
              — Richard Feynman
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
};

export default Index;

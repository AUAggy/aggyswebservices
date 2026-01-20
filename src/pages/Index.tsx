import { SearchBar } from "@/components/SearchBar";
import { CategoryCard } from "@/components/CategoryCard";
import { getCategories, getMetadata } from "@/lib/aws-data";

const Index = () => {
  const categories = getCategories();
  const metadata = getMetadata();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            {/* Main headline */}
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6">
              <span className="text-gradient-dark">AWS Services</span>
              <br />
              <span className="text-gradient-orange">Explained Simply</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed">
              {metadata.total_services} cloud services demystified with plain English explanations, 
              real examples, and technical deep dives.
            </p>

            {/* HUGE Search Bar */}
            <SearchBar 
              size="large" 
              placeholder="Search services... try 'S3', 'Lambda', or 'database'"
              className="max-w-2xl mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="pb-16">
        <div className="container-wide">
          <h2 className="text-2xl font-semibold tracking-tight text-center mb-8">
            Explore by Category
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Feynman Quote */}
      <section className="py-16 border-t border-border">
        <div className="container-wide">
          <blockquote className="max-w-2xl mx-auto text-center">
            <p className="text-xl md:text-2xl text-foreground/80 italic leading-relaxed mb-4">
              "If you can't explain it simply, you don't understand it well enough."
            </p>
            <footer className="text-muted-foreground">
              — Richard Feynman
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container-wide text-center text-sm text-muted-foreground">
          <p>
            Built with the Feynman Technique. Learn AWS one service at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

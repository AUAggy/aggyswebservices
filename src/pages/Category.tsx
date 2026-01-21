import { useParams } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { BackButton } from "@/components/BackButton";
import { ServiceListItem } from "@/components/ServiceListItem";
import { getCategoryBySlug, getServicesByCategory } from "@/lib/aws-data";
import NotFound from "./NotFound";

const Category = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  
  if (!categorySlug) return <NotFound />;
  
  const category = getCategoryBySlug(categorySlug);
  const services = getServicesByCategory(categorySlug);
  
  if (!category) return <NotFound />;

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <Sidebar currentCategory={categorySlug} />
      
      {/* Mobile navigation */}
      <MobileNav currentCategory={categorySlug} />
      
      {/* Main content - offset for desktop sidebar */}
      <div className="lg:pl-64">
        <Header />
        
        <main className="px-4 sm:px-6 py-6 sm:py-8 max-w-2xl mx-auto">
          <BackButton to="/" label="All Categories" />
          
          <div className="mt-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{category.icon}</span>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {category.name}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {category.description} — {services.length} services
            </p>
          </div>

          <div className="space-y-3">
            {services.map((service) => (
              <ServiceListItem 
                key={service.service_name} 
                service={service} 
                categorySlug={categorySlug}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Category;

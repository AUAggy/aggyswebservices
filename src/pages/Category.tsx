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
    <div className="flex min-h-screen">
      <Sidebar currentCategory={categorySlug} />
      <MobileNav currentCategory={categorySlug} />
      
      <div className="flex-1 min-w-0">
        <Header />
        
        <main className="container-narrow py-6 px-4 sm:py-8">
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

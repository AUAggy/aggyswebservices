import { useParams } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { BackButton } from "@/components/BackButton";
import { ServiceAccordion } from "@/components/ServiceAccordion";
import { getCategoryBySlug, getServiceBySlug, getServiceSlug } from "@/lib/aws-data";
import NotFound from "./NotFound";

const ServiceDetail = () => {
  const { categorySlug, serviceSlug } = useParams<{ 
    categorySlug: string; 
    serviceSlug: string;
  }>();
  
  if (!categorySlug || !serviceSlug) return <NotFound />;
  
  const category = getCategoryBySlug(categorySlug);
  const service = getServiceBySlug(serviceSlug);
  
  if (!category || !service) return <NotFound />;

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <Sidebar currentCategory={categorySlug} currentService={serviceSlug} />
      
      {/* Mobile navigation */}
      <MobileNav currentCategory={categorySlug} currentService={serviceSlug} />
      
      {/* Main content - offset for desktop sidebar */}
      <div className="lg:pl-64">
        <Header />
        
        <main className="px-4 sm:px-6 py-6 sm:py-8 max-w-2xl mx-auto">
          <BackButton to={`/category/${categorySlug}`} label={category.name} />
          
          <div className="mt-6 mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
              {service.service_name}
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              {service.description}
            </p>
          </div>

          <ServiceAccordion service={service} />
        </main>
      </div>
    </div>
  );
};

export default ServiceDetail;

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
    <div className="flex min-h-screen">
      <Sidebar currentCategory={categorySlug} currentService={serviceSlug} />
      <MobileNav currentCategory={categorySlug} currentService={serviceSlug} />
      
      <div className="flex-1 min-w-0">
        <Header />
        
        <main className="container-narrow py-6 px-4 sm:py-8">
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

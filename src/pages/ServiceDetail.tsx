import { useParams } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { BackButton } from "@/components/BackButton";
import { ServiceAccordion } from "@/components/ServiceAccordion";
import { ServiceIcon } from "@/components/ServiceIcon";
import { getCategoryBySlug, getServiceBySlug, getServiceSlug } from "@/lib/aws-data";
import Seo from "@/components/Seo";
import SiteFooter from "@/components/SiteFooter";
import {
  baseUrl,
  getOrganizationJsonLd,
  getServiceArticleJsonLd,
  getWebSiteJsonLd,
} from "@/lib/seo";
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

  const canonicalPath = `/category/${category.slug}/${getServiceSlug(service.service_name)}/`;
  const jsonLd = [
    getOrganizationJsonLd(),
    getWebSiteJsonLd(),
    getServiceArticleJsonLd({
      serviceName: service.service_name,
      description: service.description,
      url: `${baseUrl}${canonicalPath}`,
    }),
  ];

  return (
    <div className="min-h-screen">
      <Seo
        title={service.service_name}
        description={service.description}
        canonicalPath={canonicalPath}
        jsonLd={jsonLd}
      />
      {/* Desktop sidebar */}
      <Sidebar currentCategory={categorySlug} currentService={serviceSlug} />

      {/* Mobile navigation */}
      <MobileNav currentCategory={categorySlug} currentService={serviceSlug} />

      {/* Main content - offset for desktop sidebar */}
      <div className="xl:pl-64">
        <Header />

        <main className="px-4 sm:px-6 py-6 sm:py-8 max-w-5xl mx-auto">
          <BackButton to={`/category/${categorySlug}`} label={category.name} />

          <div className="mt-6 mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <span aria-hidden="true">{category.icon}</span>
              <span>{category.name}</span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <ServiceIcon icon={service.icon} className="h-7 w-7" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {service.service_name}
              </h1>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {service.description}
            </p>
          </div>

          <ServiceAccordion service={service} />
        </main>

        <SiteFooter />
      </div>
    </div>
  );
};

export default ServiceDetail;

import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import AppRoutes from "@/AppRoutes";

const extractHelmetElements = (helmet: HelmetServerState | undefined) => {
  if (!helmet) return [] as string[];

  const elements = [
    helmet.base.toString(),
    helmet.link.toString(),
    helmet.meta.toString(),
    helmet.script.toString(),
  ];

  return elements.filter((value) => value && value.trim().length > 0);
};

const extractTitle = (helmet: HelmetServerState | undefined) => {
  if (!helmet) return undefined;
  const titleTag = helmet.title.toString();
  if (!titleTag) return undefined;
  return titleTag.replace(/^<title[^>]*>/i, "").replace(/<\/title>$/i, "");
};

export async function prerender(data: { url: string }) {
  const queryClient = new QueryClient();
  const helmetContext: { helmet?: HelmetServerState } = {};

  const app = (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider context={helmetContext}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <StaticRouter location={data.url}>
            <AppRoutes />
          </StaticRouter>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );

  const html = renderToString(app);
  const helmet = helmetContext.helmet;
  const elements = extractHelmetElements(helmet);
  const title = extractTitle(helmet);

  return {
    html,
    head: {
      title,
      elements: new Set(elements),
    },
  };
}

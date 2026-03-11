import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { vitePrerenderPlugin } from "vite-prerender-plugin";

const getPrerenderRoutes = () => {
  const dataPath = path.resolve(__dirname, "src/data/aws-services.json");
  const raw = fs.readFileSync(dataPath, "utf-8");
  const data = JSON.parse(raw) as {
    metadata: { categories: string[] };
    services: { service_name: string; category: string }[];
  };

  const slugify = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");

  const categories = data.metadata.categories.map((name) => ({
    name,
    slug: slugify(name),
  }));

  const services = data.services.map((service) => ({
    slug: slugify(service.service_name),
    categorySlug: slugify(service.category),
  }));

  return [
    "/",
    "/terms/",
    "/license/",
    ...categories.map((category) => `/category/${category.slug}/`),
    ...services.map((service) => `/category/${service.categorySlug}/${service.slug}/`),
  ];
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    vitePrerenderPlugin({
      renderTarget: "#root",
      prerenderScript: path.resolve(__dirname, "src/prerender.tsx"),
      additionalPrerenderRoutes: getPrerenderRoutes(),
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

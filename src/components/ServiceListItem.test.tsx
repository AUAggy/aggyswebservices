import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ServiceListItem } from "@/components/ServiceListItem";
import { getCategories, getServiceSlug, getServicesByCategory } from "@/lib/aws-data";

const categories = getCategories();
const entries = categories.flatMap((category) =>
  getServicesByCategory(category.slug).map((service) => ({ service, categorySlug: category.slug }))
);

describe("ServiceListItem", () => {
  it("uses the existing internal route and a decorative bundled icon for every service", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {entries.map(({ service, categorySlug }) => (
          <ServiceListItem key={service.service_name} service={service} categorySlug={categorySlug} />
        ))}
      </MemoryRouter>
    );

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(69);
    entries.forEach(({ service, categorySlug }, index) => {
      const link = links[index];
      expect(link).toHaveAccessibleName(`${service.service_name} ${service.description}`);
      expect(link).toHaveAttribute("href", `/category/${categorySlug}/${getServiceSlug(service.service_name)}`);
      expect(link).not.toHaveAttribute("target");
      expect(within(link).getByRole("heading", { name: service.service_name })).toBeInTheDocument();
      const icon = link.querySelector("img");
      expect(icon).toHaveAttribute("src", `/icons/aws/${service.icon}.svg`);
      expect(icon).toHaveAttribute("alt", "");
      expect(icon).toHaveAttribute("aria-hidden", "true");
      expect(within(link).queryByRole("img")).not.toBeInTheDocument();
    });
  });

  it("uses an internal chevron without the outbound glyph or hover nudge", () => {
    const category = categories[0];
    const service = getServicesByCategory(category.slug)[0];
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ServiceListItem service={service} categorySlug={category.slug} />
      </MemoryRouter>
    );

    const link = screen.getByRole("link");
    expect(link.querySelector(".lucide-chevron-right")).toHaveAttribute("aria-hidden", "true");
    expect(link.querySelector(".lucide-external-link")).not.toBeInTheDocument();
    expect(link.querySelector(".external-link-icon")).not.toBeInTheDocument();
  });
});

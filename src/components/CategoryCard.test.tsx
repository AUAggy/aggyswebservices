import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CategoryCard } from "@/components/CategoryCard";
import { getCategories } from "@/lib/aws-data";

describe("CategoryCard", () => {
  it("keeps all category destinations without repeating the visible heading through emoji", () => {
    const categories = getCategories();
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {categories.map((category) => <CategoryCard key={category.slug} category={category} />)}
      </MemoryRouter>
    );

    expect(screen.getAllByRole("link")).toHaveLength(12);
    for (const category of categories) {
      const count = `${category.serviceCount} services`;
      const link = screen.getByRole("link", { name: `${category.name} ${category.description} ${count}` });
      expect(link).toHaveAttribute("href", `/category/${category.slug}`);
      expect(within(link).getByRole("heading", { name: category.name })).toBeInTheDocument();
      expect(within(link).getByText(category.icon)).toHaveAttribute("aria-hidden", "true");
      expect(within(link).queryByRole("img")).not.toBeInTheDocument();
      expect(within(link).getByText(count)).toHaveClass("text-accent-text");
    }
  });

  it("preserves singular service wording", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CategoryCard category={{ ...getCategories()[0], serviceCount: 1 }} />
      </MemoryRouter>
    );

    expect(screen.getByText("1 service")).toBeInTheDocument();
  });
});

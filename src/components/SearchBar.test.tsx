import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { getServiceBySlug } from "@/lib/aws-data";

const service = getServiceBySlug("aws-iam-identity-center")!;

describe("SearchBar result layout", () => {
  it.each(["large", "small"] as const)("keeps long names and descriptions separate from the badge (%s)", (size) => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div style={{ width: 256 }}>
          <SearchBar size={size} />
        </div>
      </MemoryRouter>
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: service.service_name } });

    const result = screen.getByRole("button", { name: new RegExp(service.service_name) });
    const name = within(result).getByText(service.service_name);
    const description = within(result).getByText(service.description);
    const badge = within(result).getByText(service.category);

    // These are markup/layout contracts only; jsdom cannot measure phone geometry.
    expect(name).toHaveClass("break-words");
    expect(name.parentElement).toHaveClass("flex-1", "min-w-0");
    expect(description).toHaveClass("line-clamp-2", "break-words");
    expect(description).not.toHaveClass("truncate");
    expect(badge.parentElement).toBe(name.parentElement);
    expect(badge).toHaveClass("inline-block", "max-w-full", "break-words");
    expect(result.querySelector("img")).toHaveAttribute("alt", "");
    expect(within(result).queryByRole("img")).not.toBeInTheDocument();
  });

  it("bounds the dropdown and allows vertical scrolling instead of clipping results", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SearchBar />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "security" } });

    const dropdown = screen.getAllByRole("button")[0].parentElement;
    expect(dropdown).toHaveClass("max-h-[min(24rem,50dvh)]", "overflow-y-auto", "overscroll-contain");
    expect(dropdown).not.toHaveClass("overflow-hidden");
  });
});

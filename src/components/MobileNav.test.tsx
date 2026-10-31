import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MobileNav } from "@/components/MobileNav";

describe("MobileNav small-text accent", () => {
  it("uses the text-only token for the active service without recoloring decorative branding", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MobileNav currentCategory="storage" currentService="amazon-s3" />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const service = screen.getByRole("link", { name: "Amazon S3" });
    expect(service).toHaveClass("text-accent-text");
    expect(service).not.toHaveClass("text-accent");
    expect(service).toHaveAttribute("href", "/category/storage/amazon-s3");
    expect(screen.getByText("Explained")).toHaveClass("text-gradient-orange");
  });
});

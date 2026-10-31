import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";

describe("Sidebar small-text accent", () => {
  it("uses the text-only token for the active service and brand-link hover", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Sidebar currentCategory="storage" currentService="amazon-s3" />
      </MemoryRouter>
    );

    const service = screen.getByRole("link", { name: "Amazon S3" });
    expect(service).toHaveClass("text-accent-text");
    expect(service).not.toHaveClass("text-accent");
    expect(service).toHaveAttribute("href", "/category/storage/amazon-s3");
    expect(screen.getByRole("link", { name: "AWS Explained" })).toHaveClass("hover:text-accent-text");
    expect(screen.getByText("Explained")).toHaveClass("text-gradient-orange");
  });
});

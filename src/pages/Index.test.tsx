import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import Index from "@/pages/Index";
import { brandDescription, getWebSiteJsonLd } from "@/lib/seo";

const description = "69 cloud services demystified with plain English explanations, practical examples, and technical deep dives.";

describe("homepage example framing", () => {
  it("aligns the visible promise, page metadata, and shared structured descriptions", async () => {
    render(
      <HelmetProvider>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Index />
        </MemoryRouter>
      </HelmetProvider>
    );

    expect(screen.getByText(description)).toBeInTheDocument();
    expect(screen.queryByText(/real examples/i)).not.toBeInTheDocument();
    expect(brandDescription).toBe("Plain-English explanations of AWS services with practical examples and technical deep dives.");
    expect(getWebSiteJsonLd().description).toBe(brandDescription);

    await waitFor(() => {
      for (const selector of [
        'meta[name="description"]',
        'meta[property="og:description"]',
        'meta[property="twitter:description"]',
      ]) {
        expect(document.head.querySelector(selector)).toHaveAttribute("content", description);
      }
      const structured = Array.from(document.head.querySelectorAll('script[type="application/ld+json"]'))
        .map((script) => JSON.parse(script.textContent!));
      expect(structured.find((item) => item["@type"] === "WebSite")?.description).toBe(brandDescription);
      expect(structured.find((item) => item["@type"] === "CollectionPage")?.description).toBe(brandDescription);
    });
  });
});

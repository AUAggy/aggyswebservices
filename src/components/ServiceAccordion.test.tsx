import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ServiceAccordion } from "@/components/ServiceAccordion";
import { getServiceBySlug } from "@/lib/aws-data";

const services = ["aws-cloudhsm", "amazon-inspector"].map((slug) => {
  const service = getServiceBySlug(slug);
  if (!service) throw new Error(`${slug} entry missing from the catalog`);
  return service;
});

describe.each(services)("ServiceAccordion rendering $service_name", (service) => {
  it("shows the plain English explanation and official documentation link", () => {
    render(<ServiceAccordion service={service} />);

    expect(screen.getByText(service.feynman_definition.replace(/\s+/g, " "))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /official aws documentation/i })).toHaveAttribute(
      "href",
      service.aws_user_guide_documentation
    );
  });

  it("shows six capabilities and separates gotchas in the technical section", () => {
    render(<ServiceAccordion service={service} />);

    fireEvent.click(screen.getByRole("button", { name: /technical deep dive/i }));

    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    for (const capability of service.key_capabilities ?? []) {
      expect(screen.getByText(capability)).toBeInTheDocument();
    }

    const gotchas = screen.getByRole("heading", { name: /gotchas & constraints/i }).parentElement;
    expect(gotchas).not.toBeNull();
    expect(within(gotchas!).getByText(/Gotcha #1:/i)).toBeInTheDocument();
    expect(within(gotchas!).getByText(/Gotcha #2:/i)).toBeInTheDocument();
    expect(within(gotchas!).getByText(/Constraints:/i)).toBeInTheDocument();
    const mainContent = service.architectural_deep_dive.split("Gotcha #1:")[0].trim();
    expect(screen.getByText(mainContent.replace(/\s+/g, " "))).toBeInTheDocument();
  });

  it("shows the result box in the real-world example section", () => {
    render(<ServiceAccordion service={service} />);

    fireEvent.click(screen.getByRole("button", { name: /real-world example/i }));

    expect(screen.getByText("The Result")).toBeInTheDocument();
    expect(screen.getByText(service.scenario_example.split(/\bResult:\s*/)[1])).toBeInTheDocument();
  });
});

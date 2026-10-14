import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ServiceAccordion } from "@/components/ServiceAccordion";
import { getServiceBySlug } from "@/lib/aws-data";

const cloudhsm = getServiceBySlug("aws-cloudhsm");
if (!cloudhsm) throw new Error("AWS CloudHSM entry missing from the catalog");

describe("ServiceAccordion rendering the AWS CloudHSM entry", () => {
  it("shows six capabilities and separates gotchas in the technical section", () => {
    render(<ServiceAccordion service={cloudhsm} />);

    fireEvent.click(screen.getByRole("button", { name: /technical deep dive/i }));

    expect(screen.getByText("Key Capabilities")).toBeInTheDocument();
    const capabilityBox = screen
      .getByText("Key Capabilities")
      .closest("div");
    const list = capabilityBox?.querySelector("ul");
    expect(list?.children.length).toBe(6);

    expect(screen.getAllByText(/Gotcha #1:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Gotcha #2:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Constraints:/i).length).toBeGreaterThan(0);
  });

  it("shows the result box in the real-world example section", () => {
    render(<ServiceAccordion service={cloudhsm} />);

    fireEvent.click(screen.getByRole("button", { name: /real-world example/i }));

    expect(screen.getByText("The Result")).toBeInTheDocument();
  });
});

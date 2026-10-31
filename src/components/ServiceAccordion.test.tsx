import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
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
    const documentation = screen.getByRole("link", { name: /official aws documentation/i });
    expect(documentation).toHaveAttribute("href", service.aws_user_guide_documentation);
    expect(documentation).toHaveAttribute("target", "_blank");
    expect(documentation).toHaveAttribute("rel", "noopener noreferrer");
    expect(documentation.querySelector(".lucide-external-link")).toBeInTheDocument();
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

  it("frames the example scenario while preserving its text and result box", () => {
    render(<ServiceAccordion service={service} />);

    fireEvent.click(screen.getByRole("button", { name: "Example Scenario" }));

    expect(screen.queryByRole("button", { name: /real-world example/i })).not.toBeInTheDocument();
    expect(screen.getByText(
      "Illustrative scenario; figures are examples, not verified customer results."
    )).toBeInTheDocument();
    const scenario = service.scenario_example.split(/\bResult:\s*/)[0].trim();
    expect(screen.getByText(scenario.replace(/\s+/g, " "))).toBeInTheDocument();
    expect(screen.getByText("The Result")).toBeInTheDocument();
    expect(screen.getByText(service.scenario_example.split(/\bResult:\s*/)[1])).toBeInTheDocument();
  });
});

describe("ServiceAccordion accessibility", () => {
  const service = services[0];

  it("labels each panel with its trigger and hides inactive content from role queries", () => {
    render(<ServiceAccordion service={service} />);
    const triggers = screen.getAllByRole("button");

    expect(triggers).toHaveLength(3);
    for (const trigger of triggers) {
      const panel = document.getElementById(trigger.getAttribute("aria-controls")!);
      expect(panel).toHaveAttribute("role", "region");
      expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
      expect(trigger).toHaveAttribute("type", "button");
      expect(trigger).toHaveClass("focus-visible:ring-2");
    }

    expect(triggers[0]).toHaveAttribute("aria-expanded", "true");
    expect(triggers[0]).toHaveAttribute("aria-disabled", "true");
    expect(triggers[1]).toHaveAttribute("aria-expanded", "false");
    expect(triggers[2]).toHaveAttribute("aria-expanded", "false");
    expect(screen.getAllByRole("region")).toHaveLength(1);
    expect(screen.getByRole("region", { name: "Plain English" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Key Capabilities" })).not.toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    expect(screen.getByText(service.key_capabilities![0])).not.toBeVisible();
    expect(document.getElementById(triggers[1].getAttribute("aria-controls")!)).toHaveAttribute("hidden");
    expect(document.getElementById(triggers[2].getAttribute("aria-controls")!)).toHaveAttribute("hidden");
  });

  it("keeps exactly one panel open and preserves the documentation link outside the panels", () => {
    render(<ServiceAccordion service={service} />);
    const plain = screen.getByRole("button", { name: "Plain English" });
    const technical = screen.getByRole("button", { name: "Technical Deep Dive" });
    const example = screen.getByRole("button", { name: /example/i });

    for (const trigger of [technical, example, example, plain]) {
      fireEvent.click(trigger);
      expect(screen.getAllByRole("region")).toHaveLength(1);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(screen.getAllByRole("button", { expanded: true })).toEqual([trigger]);
      expect(screen.getByRole("region")).toHaveAttribute("aria-labelledby", trigger.id);
      expect(screen.getByRole("link", { name: "Official AWS Documentation" })).toBeVisible();
    }
    expect(screen.getByRole("link", { name: "Official AWS Documentation" })).toHaveAttribute("target", "_blank");
  });

  it.each(["Enter", " "])("retains native %s button activation without cancelling the key event", (key) => {
    render(<ServiceAccordion service={service} />);
    const technical = screen.getByRole("button", { name: "Technical Deep Dive" });
    technical.focus();
    expect(fireEvent.keyDown(technical, { key })).toBe(true);
    expect(fireEvent.keyUp(technical, { key })).toBe(true);
    // jsdom does not synthesize the native button click from a key event.
    // Verify the resulting activation here; real Enter/Space are browser QA.
    fireEvent.click(technical);
    expect(technical).toHaveFocus();
    expect(technical).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "Technical Deep Dive" })).toBeVisible();
    expect(screen.getByText(service.feynman_definition.replace(/\s+/g, " "))).not.toBeVisible();
  });

  it("starts a newly navigated service in Plain English without resetting unrelated rerenders", () => {
    const view = render(<ServiceAccordion service={service} />);
    fireEvent.click(screen.getByRole("button", { name: "Technical Deep Dive" }));
    view.rerender(<ServiceAccordion service={service} />);
    expect(screen.getByRole("button", { name: "Technical Deep Dive" })).toHaveAttribute("aria-expanded", "true");

    view.rerender(<ServiceAccordion service={services[1]} />);
    expect(screen.getByRole("button", { name: "Plain English" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("region")).toHaveLength(1);
  });

  it("preserves prerendered trigger and panel IDs during hydration", () => {
    const accordion = <ServiceAccordion service={service} />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(accordion);
    document.body.appendChild(container);
    const ids = Array.from(container.querySelectorAll("[id]"), (element) => element.id);
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      render(accordion, { container, hydrate: true });
      expect(Array.from(container.querySelectorAll("[id]"), (element) => element.id)).toEqual(ids);
      expect(screen.getByRole("region", { name: "Plain English" })).toBeVisible();
      expect(errors).not.toHaveBeenCalled();
    } finally {
      errors.mockRestore();
    }
  });

  it("uses stable, unique trigger and panel IDs across multiple instances and rerenders", () => {
    const accordions = <>{services.map((item) => <ServiceAccordion key={item.service_name} service={item} />)}</>;
    const view = render(accordions);
    const ids = screen.getAllByRole("button").flatMap((trigger) => [trigger.id, trigger.getAttribute("aria-controls")!]);
    expect(new Set(ids).size).toBe(12);
    for (const id of ids) expect(document.getElementById(id)).toBeInTheDocument();

    view.rerender(accordions);
    expect(screen.getAllByRole("button").flatMap((trigger) => [trigger.id, trigger.getAttribute("aria-controls")!])).toEqual(ids);
  });
});

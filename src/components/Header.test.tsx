import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { Header } from "@/components/Header"

// jsdom cannot evaluate Tailwind breakpoints; browser QA verifies geometry.
describe("Header", () => {
  it("shows the desktop search header only from the same xl breakpoint as the sidebar", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Header />
      </MemoryRouter>
    )

    const header = screen.getByRole("banner")
    expect(header).toHaveClass("hidden", "xl:block")
    expect(header).not.toHaveClass("lg:block")
    expect(screen.getByPlaceholderText("Search services...")).toBeInTheDocument()
  })
})

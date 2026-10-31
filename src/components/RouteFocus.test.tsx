import { useState } from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom"
import { RouteFocus } from "@/components/RouteFocus"

function TestRoutes({ main = true }: { main?: boolean }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [count, setCount] = useState(0)
  const heading = <h1>{pathname === "/" ? "Home" : "Destination"}</h1>

  return (
    <>
      <RouteFocus />
      {main ? <main>{heading}</main> : heading}
      <button type="button" onClick={() => navigate("/destination")}>Navigate</button>
      <button type="button" onClick={() => navigate(-1)}>Back</button>
      <button type="button" onClick={() => setCount(count + 1)}>Rerender {count}</button>
    </>
  )
}

function renderRoutes(main = true) {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TestRoutes main={main} />
    </MemoryRouter>
  )
}

describe("RouteFocus", () => {
  it("does not move focus on first mount or unrelated rerenders", () => {
    renderRoutes()
    expect(screen.getByRole("heading", { name: "Home" })).not.toHaveFocus()

    const button = screen.getByRole("button", { name: "Rerender 0" })
    button.focus()
    fireEvent.click(button)
    expect(screen.getByRole("button", { name: "Rerender 1" })).toHaveFocus()
    expect(screen.getByRole("heading", { name: "Home" })).not.toHaveAttribute("tabindex")
  })

  it("focuses the committed main heading on navigation and browser back", () => {
    renderRoutes()
    fireEvent.click(screen.getByRole("button", { name: "Navigate" }))
    expect(screen.getByRole("heading", { name: "Destination" })).toHaveFocus()
    expect(screen.getByRole("heading", { name: "Destination" })).toHaveAttribute("tabindex", "-1")

    fireEvent.click(screen.getByRole("button", { name: "Back" }))
    expect(screen.getByRole("heading", { name: "Home" })).toHaveFocus()
  })

  it("falls back to a page h1 on pages without a main landmark", () => {
    renderRoutes(false)
    fireEvent.click(screen.getByRole("button", { name: "Navigate" }))
    expect(screen.getByRole("heading", { name: "Destination" })).toHaveFocus()
  })
})

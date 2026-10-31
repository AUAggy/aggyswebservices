import { useState } from "react"
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"
import AppRoutes from "@/AppRoutes"
import { MobileNav } from "@/components/MobileNav"
import { RouteFocus } from "@/components/RouteFocus"

// Exercise the shared SearchBar contract without duplicating the search agent's
// own component tests. Real popup + drawer interaction also needs browser QA.
vi.mock("@/components/SearchBar", () => ({
  SearchBar: function SearchBar({ size, onNavigate }: { size?: string; onNavigate?: () => void }) {
    const navigate = useNavigate()
    const [query, setQuery] = useState("")
    const [open, setOpen] = useState(false)
    const select = () => {
      navigate("/category/storage/amazon-s3")
      onNavigate?.()
    }

    return (
      <div data-size={size}>
        <input
          aria-label="Search services"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(Boolean(event.target.value))
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && open) {
              event.preventDefault()
              event.stopPropagation()
              setOpen(false)
            } else if (event.key === "Enter" && open) {
              select()
            }
          }}
        />
        {open && <button type="button" onClick={select}>Amazon S3</button>}
      </div>
    )
  },
}))

function TestPage() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const title = pathname.endsWith("amazon-s3") ? "Amazon S3" : pathname.endsWith("security-identity-compliance") ? "Security" : "Compute"

  return (
    <>
      <RouteFocus />
      <MobileNav currentCategory="compute" />
      <main>
        <h1>{title}</h1>
        <button type="button" onClick={() => navigate("/category/security-identity-compliance")}>Go elsewhere</button>
        <button type="button" onClick={() => navigate(-1)}>Go back</button>
        <button type="button" onClick={() => navigate(1)}>Go forward</button>
      </main>
    </>
  )
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/category/compute"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TestPage />
    </MemoryRouter>
  )
}

// Flush Radix FocusScope's documented deferred unmount autofocus before
// asserting that route focus was not subsequently overwritten.
async function flushCloseFocus() {
  await act(async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
  })
}

function openMenu() {
  const trigger = screen.getByRole("button", { name: "Open menu" })
  trigger.focus()
  fireEvent.click(trigger)
  return { trigger, dialog: screen.getByRole("dialog", { name: "Explore services" }) }
}

let setDesktop: (matches: boolean) => void
let mediaListeners: Set<EventListenerOrEventListenerObject>

beforeEach(() => {
  mediaListeners = new Set()
  const media = {
    matches: false,
    media: "(min-width: 1280px)",
    onchange: null,
    addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => mediaListeners.add(listener),
    removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => mediaListeners.delete(listener),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }
  vi.spyOn(window, "matchMedia").mockImplementation(() => media)
  setDesktop = (matches) => {
    act(() => {
      media.matches = matches
      const event = new Event("change") as MediaQueryListEvent
      Object.defineProperty(event, "matches", { value: matches })
      for (const listener of mediaListeners) {
        if (typeof listener === "function") listener(event)
        else listener.handleEvent(event)
      }
    })
  }
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("MobileNav", () => {
  it("keeps the active service text contrast-safe without recoloring the brand", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MobileNav currentCategory="storage" currentService="amazon-s3" />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }))
    const service = screen.getByRole("link", { name: "Amazon S3" })
    expect(service).toHaveClass("text-accent-text")
    expect(service).not.toHaveClass("text-accent")
    expect(service).toHaveAttribute("href", "/category/storage/amazon-s3")
    expect(screen.getByText("Explained")).toHaveClass("text-gradient-orange")
  })

  it("does not mount closed menu links or search, and aligns its header to xl", () => {
    renderPage()

    const trigger = screen.getByRole("button", { name: "Open menu" })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(trigger.closest(".xl\\:hidden")).not.toBeNull()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Compute" })).not.toBeInTheDocument()
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    expect(document.querySelector('[href="/category/compute"]')).not.toBeInTheDocument()
  })

  it("opens a named modal with a small shared search and an internal close button", async () => {
    renderPage()
    const heading = screen.getByRole("heading", { name: "Compute" })
    const { trigger, dialog } = openMenu()

    expect(dialog).toHaveAttribute("aria-modal", "true")
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(trigger).toHaveAttribute("aria-controls", dialog.id)
    expect(screen.queryByRole("heading", { name: "Compute" })).not.toBeInTheDocument()
    expect(heading.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(within(dialog).getByRole("textbox", { name: "Search services" }).parentElement).toHaveAttribute("data-size", "small")
    expect(within(dialog).getByRole("navigation", { name: "Service categories" })).toBeInTheDocument()
    expect(document.body).toHaveAttribute("data-scroll-locked")
    expect(document.body.style.pointerEvents).toBe("none")
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Close menu" })).toHaveFocus())

    fireEvent.click(within(dialog).getByRole("button", { name: "Close menu" }))
    await waitFor(() => expect(trigger).toHaveFocus())
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(document.body).not.toHaveAttribute("data-scroll-locked")
    expect(document.body.style.pointerEvents).toBe("")
    expect(screen.getByRole("heading", { name: "Compute" })).toBeVisible()
  })

  it("keeps programmatic focus inside the modal while open", async () => {
    renderPage()
    const backgroundButton = screen.getByRole("button", { name: "Go elsewhere" })
    const { dialog } = openMenu()
    const close = within(dialog).getByRole("button", { name: "Close menu" })
    await waitFor(() => expect(close).toHaveFocus())

    act(() => backgroundButton.focus())
    expect(close).toHaveFocus()
    // This checks Radix integration, not actual browser Tab order or scroll.
  })

  it("lets search consume the first Escape and dismisses the menu on the second", async () => {
    renderPage()
    const { trigger, dialog } = openMenu()
    const input = within(dialog).getByRole("textbox", { name: "Search services" })
    input.focus()
    fireEvent.change(input, { target: { value: "s3" } })
    expect(within(dialog).getByRole("button", { name: "Amazon S3" })).toBeInTheDocument()

    fireEvent.keyDown(input, { key: "Escape" })
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(within(dialog).queryByRole("button", { name: "Amazon S3" })).not.toBeInTheDocument()
    expect(input).toHaveFocus()

    fireEvent.keyDown(input, { key: "Escape" })
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("dismisses on outside pointer interaction and returns focus to its trigger", async () => {
    renderPage()
    const { trigger, dialog } = openMenu()
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Close menu" })).toHaveFocus())
    // Radix registers its document pointer listener after the opening event.
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
    fireEvent.pointerDown(dialog.previousElementSibling!, { pointerType: "mouse", button: 0 })

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("closes on category navigation and focuses the destination, without stealing focus later", async () => {
    renderPage()
    const { trigger, dialog } = openMenu()
    fireEvent.click(within(dialog).getByRole("link", { name: "Security, Identity & Compliance" }))

    const heading = screen.getByRole("heading", { name: "Security" })
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(heading).toHaveAttribute("tabindex", "-1")
    await flushCloseFocus()
    expect(heading).toHaveFocus()
    expect(document.body.style.pointerEvents).toBe("")
    expect(trigger).not.toHaveFocus()

    fireEvent.click(screen.getByRole("button", { name: "Go back" }))
    expect(screen.getByRole("heading", { name: "Compute" })).toHaveFocus()
  })

  it.each(["pointer", "Enter"])("closes and focuses the destination after a search selection by %s", async (method) => {
    renderPage()
    const { trigger, dialog } = openMenu()
    const input = within(dialog).getByRole("textbox", { name: "Search services" })
    input.focus()
    fireEvent.change(input, { target: { value: "s3" } })
    if (method === "Enter") fireEvent.keyDown(input, { key: "Enter" })
    else fireEvent.click(within(dialog).getByRole("button", { name: "Amazon S3" }))

    const heading = screen.getByRole("heading", { name: "Amazon S3" })
    await flushCloseFocus()
    expect(heading).toHaveFocus()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    expect(trigger).not.toHaveFocus()
    expect(document.body).not.toHaveAttribute("data-scroll-locked")
  })

  it("closes during history navigation even when the MobileNav instance stays mounted", async () => {
    renderPage()
    fireEvent.click(screen.getByRole("button", { name: "Go elsewhere" }))
    const back = screen.getByRole("button", { name: "Go back" })
    openMenu()
    fireEvent.click(back)

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole("heading", { name: "Compute" })).toHaveFocus())
    expect(document.body).not.toHaveAttribute("data-scroll-locked")

    fireEvent.click(screen.getByRole("button", { name: "Go forward" }))
    expect(screen.getByRole("heading", { name: "Security" })).toHaveFocus()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it.each(["/category/compute", "/category/compute/amazon-ec2"])("focuses the real destination page when navigating from %s", async (path) => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </MemoryRouter>
      </HelmetProvider>
    )
    const { dialog } = openMenu()
    const input = within(dialog).getByRole("textbox", { name: "Search services" })
    input.focus()
    fireEvent.change(input, { target: { value: "s3" } })
    fireEvent.keyDown(input, { key: "Enter" })

    await flushCloseFocus()
    expect(screen.getByRole("heading", { level: 1, name: "Amazon S3" })).toHaveFocus()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(document.body).not.toHaveAttribute("data-scroll-locked")
    expect(document.body.style.pointerEvents).toBe("")
  })

  it("closes at 1280px, releases modal locks, and focuses the page instead of a hidden trigger", async () => {
    renderPage()
    const { trigger } = openMenu()
    expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 1280px)")
    expect(mediaListeners.size).toBe(1)

    setDesktop(true)

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole("heading", { name: "Compute" })).toHaveFocus())
    expect(trigger).not.toHaveFocus()
    expect(document.body).not.toHaveAttribute("data-scroll-locked")
    expect(document.body.style.pointerEvents).toBe("")
    expect(mediaListeners.size).toBe(0)

    setDesktop(false)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute("aria-expanded", "false")
  })

  it("does not leave modal effects behind if its page unmounts", () => {
    const view = renderPage()
    openMenu()
    view.unmount()

    expect(document.body).not.toHaveAttribute("data-scroll-locked")
    expect(document.body.style.pointerEvents).toBe("")
    expect(mediaListeners.size).toBe(0)
  })
})

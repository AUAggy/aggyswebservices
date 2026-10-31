import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { MemoryRouter, useLocation } from "react-router-dom"
import { SearchBar } from "@/components/SearchBar"
import { getAllServices, getServiceSlug, searchServices } from "@/lib/aws-data"
import type { ComponentProps } from "react"

function CurrentRoute() {
  return <p data-testid="route">{useLocation().pathname}</p>
}

function renderSearch(props: ComponentProps<typeof SearchBar> = {}) {
  const onNavigate = vi.fn()
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SearchBar onNavigate={onNavigate} {...props} />
      <button type="button">Outside search</button>
      <CurrentRoute />
    </MemoryRouter>
  )
  const input = screen.getByRole("combobox", { name: "Search AWS services" })
  return { input, onNavigate }
}

function enterQuery(input: HTMLElement, value: string) {
  act(() => input.focus())
  fireEvent.change(input, { target: { value } })
}

function selectedOption() {
  return screen.getByRole("option", { selected: true })
}

function expectDestination(name: string) {
  const service = getAllServices().find((service) => service.service_name === name)!
  expect(screen.getByTestId("route")).toHaveTextContent(
    `/category/${getServiceSlug(service.category)}/${getServiceSlug(name)}`
  )
}

afterEach(() => vi.restoreAllMocks())

describe("SearchBar result readability", () => {
  it.each(["large", "small"] as const)("preserves narrow layout and decorative icons (%s)", (size) => {
    const { input } = renderSearch({ size })
    enterQuery(input, "AWS IAM Identity Center")
    const service = searchServices("AWS IAM Identity Center")[0]
    const option = selectedOption()
    const name = within(option).getByText(service.service_name)
    const description = within(option).getByText(service.description)
    const badge = within(option).getByText(service.category)
    expect(name).toHaveClass("break-words")
    expect(name.parentElement).toHaveClass("flex-1", "min-w-0")
    expect(description).toHaveClass("line-clamp-2", "break-words")
    expect(description).not.toHaveClass("truncate")
    expect(badge.parentElement).toBe(name.parentElement)
    expect(badge).toHaveClass("inline-block", "max-w-full", "break-words")
    expect(within(option).queryByRole("img")).not.toBeInTheDocument()
    expect(input).toHaveClass("focus-visible:ring-foreground")
    expect(screen.getByRole("button", { name: "Clear search" })).toHaveClass("focus-visible:ring-foreground")
  })

  it("keeps all results inside a bounded scrollable list", () => {
    const { input } = renderSearch()
    enterQuery(input, "security")
    expect(screen.getByRole("listbox")).toHaveClass("max-h-[min(24rem,45dvh)]", "overflow-y-auto", "overscroll-contain")
    expect(screen.getAllByRole("option")).toHaveLength(12)
  })
})

describe("SearchBar combobox semantics", () => {
  it("has an explicit name independent of the placeholder and starts idle", () => {
    const { input } = renderSearch({ placeholder: "Find something", size: "small" })
    expect(input).toHaveAccessibleName("Search AWS services")
    expect(input).toHaveAttribute("aria-autocomplete", "list")
    expect(input).toHaveAttribute("aria-haspopup", "listbox")
    expect(input).toHaveAttribute("aria-expanded", "false")
    expect(input).not.toHaveAttribute("aria-activedescendant")
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    expect(screen.getByRole("status")).toBeEmptyDOMElement()
  })

  it("exposes all 12 security results, a polite total, and the first selected semantic option", () => {
    const { input } = renderSearch()
    enterQuery(input, "security")
    const list = screen.getByRole("listbox", { name: "AWS service results" })
    const options = within(list).getAllByRole("option")
    expect(options).toHaveLength(12)
    expect(input).toHaveAttribute("aria-expanded", "true")
    expect(input).toHaveAttribute("aria-controls", list.id)
    expect(input).toHaveAttribute("aria-activedescendant", options[0].id)
    expect(options[0]).toHaveAttribute("aria-selected", "true")
    expect(options[0]).toHaveClass("bg-secondary")
    expect(options.slice(1).every((option) => option.getAttribute("aria-selected") === "false")).toBe(true)
    expect(screen.getByRole("status")).toHaveTextContent("12 services found.")
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite")
    expect(screen.getByRole("status")).toHaveAttribute("aria-atomic", "true")
    expect(within(list).queryByRole("button")).not.toBeInTheDocument()
    expect(within(list).queryByRole("link")).not.toBeInTheDocument()
    expect(options.every((option) => option.tabIndex === -1)).toBe(true)
    expect(input).toHaveFocus()
  })

  it("announces a singular count for a single result", () => {
    const { input } = renderSearch()
    enterQuery(input, "queue")
    expect(screen.getByRole("status")).toHaveTextContent("1 service found.")
  })

  it("keeps long names, descriptions, and decorative icons in the result markup", () => {
    const { input } = renderSearch()
    enterQuery(input, "AWS IAM Identity Center")
    const option = selectedOption()
    const service = searchServices("AWS IAM Identity Center")[0]
    expect(within(option).getByText(service.service_name)).toBeVisible()
    expect(within(option).getByText(service.description)).toBeVisible()
    expect(within(option).getByText(service.category)).toBeVisible()
    const icon = option.querySelector("img")!
    expect(icon).toHaveAttribute("alt", "")
    expect(icon).toHaveAttribute("aria-hidden", "true")
    expect(icon).toHaveAttribute("src", `/icons/aws/${service.icon}.svg`)
  })

  it("provides unique stable IDs across mounted desktop and mobile instances", () => {
    const { rerender } = render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SearchBar size="large" />
        <SearchBar size="small" />
      </MemoryRouter>
    )
    const inputs = screen.getAllByRole("combobox", { name: "Search AWS services" })
    // Change both directly so both popups are represented in the DOM at once.
    for (const input of inputs) fireEvent.change(input, { target: { value: "S3" } })
    const ids = Array.from(document.querySelectorAll("[id]")).map((element) => element.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const input of inputs) {
      expect(document.getElementById(input.getAttribute("aria-controls")!)).toHaveAttribute("role", "listbox")
      expect(document.getElementById(input.getAttribute("aria-activedescendant")!)).toHaveAttribute("role", "option")
    }
    const inputIds = inputs.map((input) => input.id)
    rerender(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SearchBar size="large" /><SearchBar size="small" />
      </MemoryRouter>
    )
    expect(screen.getAllByRole("combobox").map((input) => input.id)).toEqual(inputIds)
  })
})

describe("SearchBar keyboard navigation", () => {
  it("selects the first visibly active result on Enter and calls onNavigate exactly once", () => {
    const { input, onNavigate } = renderSearch()
    enterQuery(input, " s3 ")
    expect(selectedOption()).toHaveTextContent("Amazon S3")
    fireEvent.keyDown(input, { key: "Enter" })
    expectDestination("Amazon S3")
    expect(onNavigate).toHaveBeenCalledTimes(1)
    expect(input).toHaveValue("")
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })

  it("clamps arrows at both ends while retaining input focus and reaches the last result", () => {
    const { input, onNavigate } = renderSearch()
    enterQuery(input, "security")
    const options = screen.getAllByRole("option")
    fireEvent.keyDown(input, { key: "ArrowUp" })
    expect(selectedOption()).toBe(options[0])
    for (let index = 0; index < options.length + 2; index++) fireEvent.keyDown(input, { key: "ArrowDown" })
    expect(selectedOption()).toBe(options.at(-1))
    expect(input).toHaveAttribute("aria-activedescendant", options.at(-1)!.id)
    expect(input).toHaveFocus()
    fireEvent.keyDown(input, { key: "Enter" })
    expectDestination(searchServices("security").at(-1)!.service_name)
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })

  it("scrolls an active row into view only when it falls outside the bounded list", () => {
    const { input } = renderSearch()
    enterQuery(input, "security")
    const list = screen.getByRole("listbox")
    const options = screen.getAllByRole("option")
    vi.spyOn(list, "getBoundingClientRect").mockReturnValue({ top: 100, bottom: 300 } as DOMRect)
    vi.spyOn(options[1], "getBoundingClientRect").mockReturnValue({ top: 110, bottom: 180 } as DOMRect)
    vi.spyOn(options[2], "getBoundingClientRect").mockReturnValue({ top: 280, bottom: 360 } as DOMRect)
    const visibleScroll = vi.fn()
    const hiddenScroll = vi.fn()
    options[1].scrollIntoView = visibleScroll
    options[2].scrollIntoView = hiddenScroll
    fireEvent.keyDown(input, { key: "ArrowDown" })
    expect(visibleScroll).not.toHaveBeenCalled()
    fireEvent.keyDown(input, { key: "ArrowDown" })
    expect(hiddenScroll).toHaveBeenCalledWith({ block: "nearest" })
  })

  it("resets stale selection immediately when the query changes", () => {
    const { input, onNavigate } = renderSearch()
    enterQuery(input, "security")
    for (let index = 0; index < 10; index++) fireEvent.keyDown(input, { key: "ArrowDown" })
    enterQuery(input, "queue")
    expect(selectedOption()).toHaveTextContent("Amazon SQS")
    expect(input).toHaveAttribute("aria-activedescendant", selectedOption().id)
    fireEvent.keyDown(input, { key: "Enter" })
    expectDestination("Amazon SQS")
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })

  it("dismisses Escape at the root, preserves focus/query, and only lets the next Escape bubble", () => {
    const { input, onNavigate } = renderSearch()
    enterQuery(input, "S3")
    const outerEscape = vi.fn()
    document.addEventListener("keydown", outerEscape)
    try {
      expect(fireEvent.keyDown(input, { key: "Escape" })).toBe(false)
      expect(outerEscape).not.toHaveBeenCalled()
      expect(input).toHaveFocus()
      expect(input).toHaveValue("S3")
      expect(input).toHaveAttribute("aria-expanded", "false")
      expect(input).not.toHaveAttribute("aria-activedescendant")
      expect(screen.queryByRole("option")).not.toBeInTheDocument()
      fireEvent.keyDown(input, { key: "Enter" })
      expect(onNavigate).not.toHaveBeenCalled()
      outerEscape.mockClear()
      expect(fireEvent.keyDown(input, { key: "Escape" })).toBe(true)
      expect(outerEscape).toHaveBeenCalledTimes(1)
    } finally {
      document.removeEventListener("keydown", outerEscape)
    }
    act(() => input.blur())
    act(() => input.focus())
    expect(input).toHaveAttribute("aria-expanded", "true")
    expect(selectedOption()).toHaveTextContent("Amazon S3")
  })

  it("handles Escape from Clear too, and arrows may explicitly reopen a dismissed list", () => {
    const { input } = renderSearch()
    enterQuery(input, "S3")
    const clear = screen.getByRole("button", { name: "Clear search" })
    act(() => clear.focus())
    expect(fireEvent.keyDown(clear, { key: "Escape" })).toBe(false)
    expect(input).toHaveAttribute("aria-expanded", "false")
    act(() => input.focus())
    fireEvent.keyDown(input, { key: "Escape" })
    fireEvent.keyDown(input, { key: "ArrowDown" })
    expect(input).toHaveAttribute("aria-expanded", "true")
    expect(selectedOption()).toHaveTextContent("Amazon S3")
  })

  it("does not navigate on composition Enter, native IME events, or the legacy IME keycode", () => {
    const { input, onNavigate } = renderSearch()
    enterQuery(input, "S3")
    fireEvent.compositionStart(input)
    fireEvent.keyDown(input, { key: "Enter" })
    fireEvent.compositionEnd(input)
    fireEvent.keyDown(input, { key: "Enter", isComposing: true })
    fireEvent.keyDown(input, { key: "Enter", keyCode: 229 })
    expect(onNavigate).not.toHaveBeenCalled()
    expect(input).toHaveValue("S3")
    fireEvent.keyDown(input, { key: "Enter" })
    expectDestination("Amazon S3")
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })

  it.each(["Tab", "Shift+Tab"])("allows %s out without leaving a hidden active option", (key) => {
    const { input, onNavigate } = renderSearch()
    enterQuery(input, "S3")
    expect(fireEvent.keyDown(input, { key: "Tab", shiftKey: key === "Shift+Tab" })).toBe(true)
    expect(input).toHaveAttribute("aria-expanded", "false")
    expect(input).not.toHaveAttribute("aria-activedescendant")
    act(() => screen.getByRole("button", { name: "Outside search" }).focus())
    expect(input).not.toHaveFocus()
    expect(onNavigate).not.toHaveBeenCalled()
  })
})

describe("SearchBar empty, clear, and pointer behavior", () => {
  it("explains no matches using the real catalog size, never navigates, and dismisses with Escape", () => {
    const { input, onNavigate } = renderSearch()
    enterQuery(input, "s33")
    expect(screen.getByRole("status")).toHaveTextContent("0 services found.")
    expect(screen.getByText(/No matches among 69 services/)).toHaveTextContent(/S3.*queue.*database/)
    expect(input).toHaveAttribute("aria-expanded", "true")
    expect(input).not.toHaveAttribute("aria-activedescendant")
    expect(screen.queryByRole("option")).not.toBeInTheDocument()
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onNavigate).not.toHaveBeenCalled()
    expect(fireEvent.keyDown(input, { key: "Escape" })).toBe(false)
    expect(input).toHaveFocus()
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })

  it.each(["", "   ", "\t  "])("treats %j as idle even after an active query", (query) => {
    const { input, onNavigate } = renderSearch()
    enterQuery(input, "S3")
    enterQuery(input, query)
    expect(input).toHaveAttribute("aria-expanded", "false")
    expect(input).not.toHaveAttribute("aria-activedescendant")
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    expect(screen.queryByText(/No matches among/)).not.toBeInTheDocument()
    expect(screen.getByRole("status")).toBeEmptyDOMElement()
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it.each(["pointer", "keyboard"])("clears via %s activation and returns focus to the empty input", (method) => {
    const { input, onNavigate } = renderSearch()
    enterQuery(input, "S3")
    const clear = screen.getByRole("button", { name: "Clear search" })
    if (method === "keyboard") {
      fireEvent.keyDown(input, { key: "Tab" })
      act(() => clear.focus())
      fireEvent.keyDown(clear, { key: "Enter" })
    } else {
      fireEvent.pointerDown(clear)
      act(() => clear.focus())
    }
    // jsdom does not synthesize the native click for button keyboard activation.
    fireEvent.click(clear)
    expect(input).toHaveValue("")
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument()
    expect(screen.getByRole("status")).toBeEmptyDOMElement()
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it("selects by mouse without blurring the input or navigating twice", () => {
    const { input, onNavigate } = renderSearch()
    enterQuery(input, "security")
    const option = screen.getAllByRole("option").at(-1)!
    const expected = searchServices("security").at(-1)!.service_name
    fireEvent.pointerDown(option, { pointerType: "mouse" })
    expect(fireEvent.mouseDown(option)).toBe(false)
    expect(input).toHaveFocus()
    fireEvent.pointerUp(option, { pointerType: "mouse" })
    fireEvent.click(option)
    expectDestination(expected)
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })

  it("survives a touch blur through pointerup and selects the intended result on click", () => {
    const { input, onNavigate } = renderSearch()
    enterQuery(input, "security")
    const option = screen.getAllByRole("option").at(-1)!
    const expected = searchServices("security").at(-1)!.service_name
    expect(fireEvent.pointerDown(option, { pointerType: "touch" })).toBe(true)
    fireEvent.pointerUp(option, { pointerType: "touch" })
    act(() => input.blur())
    expect(option).toBeInTheDocument()
    fireEvent.click(option)
    expectDestination(expected)
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })

  it("allows cancelled touch scrolling without selection and closes on outside pointer interaction", () => {
    const { input, onNavigate } = renderSearch()
    enterQuery(input, "security")
    const option = screen.getAllByRole("option")[0]
    expect(fireEvent.pointerDown(option, { pointerType: "touch" })).toBe(true)
    expect(fireEvent.pointerMove(option, { pointerType: "touch" })).toBe(true)
    fireEvent.pointerCancel(option, { pointerType: "touch" })
    expect(onNavigate).not.toHaveBeenCalled()
    fireEvent.pointerDown(screen.getByRole("button", { name: "Outside search" }))
    expect(input).toHaveAttribute("aria-expanded", "false")
    expect(input).toHaveValue("security")
    expect(screen.getByRole("status")).toBeEmptyDOMElement()
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it("cleans up document and window listeners when an open search unmounts", () => {
    const removeDocument = vi.spyOn(document, "removeEventListener")
    const removeWindow = vi.spyOn(window, "removeEventListener")
    const { unmount } = render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SearchBar />
      </MemoryRouter>
    )
    enterQuery(screen.getByRole("combobox"), "S3")
    unmount()
    expect(removeDocument).toHaveBeenCalledWith("pointerdown", expect.any(Function), true)
    expect(removeDocument).toHaveBeenCalledWith("pointercancel", expect.any(Function), true)
    expect(removeDocument).toHaveBeenCalledWith("click", expect.any(Function))
    expect(removeWindow).toHaveBeenCalledWith("blur", expect.any(Function))
  })

  it("closes on focus leaving the root or the browser window", () => {
    const { input } = renderSearch()
    enterQuery(input, "S3")
    act(() => screen.getByRole("button", { name: "Outside search" }).focus())
    expect(input).toHaveAttribute("aria-expanded", "false")
    act(() => input.focus())
    expect(input).toHaveAttribute("aria-expanded", "true")
    fireEvent(window, new Event("blur"))
    expect(input).toHaveAttribute("aria-expanded", "false")
  })
})

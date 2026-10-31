import { useState, useEffect, useId, useLayoutEffect, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X } from "lucide-react"
import { searchServices, getServiceSlug, getAllServices } from "@/lib/aws-data"
import { ServiceIcon } from "@/components/ServiceIcon"
import type { AWSService } from "@/types/aws"

interface SearchBarProps {
  size?: "large" | "small"
  placeholder?: string
  className?: string
  onNavigate?: () => void
}

export function SearchBar({
  size = "large",
  placeholder = "Search 69 AWS services... try 'S3' or 'database'",
  className = "",
  onNavigate,
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [placement, setPlacement] = useState<"below" | "above">("below")
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const appliedFit = useRef<{ placement: "below" | "above"; height: number } | null>(null)
  const pointerInPopup = useRef(false)
  const isComposing = useRef(false)
  const id = useId()
  const inputId = `${id}-input`
  const listId = `${id}-results`
  const navigate = useNavigate()
  const results = useMemo(() => searchServices(query), [query])
  const popupOpen = isOpen && query.trim().length > 0
  const activeService = popupOpen ? results[selectedIndex] : undefined
  const optionId = (service: AWSService) => `${id}-${getServiceSlug(service.service_name)}`
  const activeId = activeService ? optionId(activeService) : undefined

  useEffect(() => {
    if (!popupOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      pointerInPopup.current = listRef.current?.contains(target) ?? false
      if (!rootRef.current?.contains(target)) setIsOpen(false)
    }
    const resetPointer = () => { pointerInPopup.current = false }
    const close = () => setIsOpen(false)

    // Track touch inside the list through blur, without cancelling native scrolling.
    document.addEventListener("pointerdown", handlePointerDown, true)
    document.addEventListener("click", resetPointer)
    document.addEventListener("pointercancel", resetPointer, true)
    window.addEventListener("blur", close)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true)
      document.removeEventListener("click", resetPointer)
      document.removeEventListener("pointercancel", resetPointer, true)
      window.removeEventListener("blur", close)
      resetPointer()
    }
  }, [popupOpen])

  useEffect(() => {
    if (!activeId || !listRef.current) return
    const option = document.getElementById(activeId)
    if (!option) return
    const row = option.getBoundingClientRect()
    const list = listRef.current.getBoundingClientRect()
    if (row.top < list.top || row.bottom > list.bottom) {
      option.scrollIntoView({ block: "nearest" })
    }
  }, [activeId, results])

  // Keep the popup inside short viewports: clamp the whole popup (including
  // its count line) to the space around the input and flip it above the input
  // when there is more room there. Layout effect so the first paint fits.
  useLayoutEffect(() => {
    const input = inputRef.current
    const popup = popupRef.current
    const list = listRef.current
    if (!popupOpen || !input || !popup || !list) return
    const fit = () => {
      const inputRect = input.getBoundingClientRect()
      const margin = 20 // 12px breathing room plus the popup's own 8px offset
      const below = window.innerHeight - inputRect.bottom - margin
      const above = inputRect.top - margin
      const flip = below < 160 && above > below
      const placement = flip ? "above" : "below"
      const available = Math.max(96, Math.min(384, flip ? above : below))
      const applied = appliedFit.current
      if (applied && applied.placement === placement && Math.abs(applied.height - available) < 1) return
      appliedFit.current = { placement, height: available }
      setPlacement(placement)
      popup.style.maxHeight = `${available}px`
      const chrome = Math.max(0, popup.scrollHeight - list.scrollHeight)
      list.style.maxHeight = `${Math.max(64, available - chrome)}px`
    }
    fit()
    window.addEventListener("resize", fit)
    return () => {
      window.removeEventListener("resize", fit)
      appliedFit.current = null
      popup.style.maxHeight = ""
      list.style.maxHeight = ""
    }
  }, [popupOpen])

  const handleSelect = (service: AWSService) => {
    if (!popupOpen || !results.includes(service)) return
    const categorySlug = getServiceSlug(service.category)
    navigate(`/category/${categorySlug}/${getServiceSlug(service.service_name)}`)
    setQuery("")
    setIsOpen(false)
    setSelectedIndex(0)
    onNavigate?.()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isComposing.current || event.nativeEvent.isComposing || event.keyCode === 229) return

    if (event.key === "Escape" && popupOpen) {
      event.preventDefault()
      event.stopPropagation()
      setIsOpen(false)
      return
    }
    if (event.key === "Tab") {
      setIsOpen(false)
      return
    }
    if (event.target !== inputRef.current) return

    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && results.length > 0) {
      event.preventDefault()
      setIsOpen(true)
      setSelectedIndex((previous) => !popupOpen ? 0 : Math.max(0, Math.min(
        previous + (event.key === "ArrowDown" ? 1 : -1), results.length - 1
      )))
    } else if (event.key === "Enter" && activeService) {
      event.preventDefault()
      handleSelect(activeService)
    }
  }

  const clear = () => {
    setQuery("")
    setSelectedIndex(0)
    inputRef.current?.focus()
    setIsOpen(false)
  }
  const isLarge = size === "large"
  const count = `${results.length} ${results.length === 1 ? "service" : "services"} found.`

  return (
    <div
      ref={rootRef}
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return
        if (pointerInPopup.current) return
        setIsOpen(false)
      }}
    >
      <label htmlFor={inputId} className="sr-only">Search AWS services</label>
      <div
        className={`
          relative flex items-center bg-card border rounded-lg
          transition-all duration-200 motion-reduce:transition-none
          ${isLarge ? "search-focus-glow" : ""}
          ${isFocused ? (isLarge ? "" : "border-accent/50 shadow-elevated") : "border-border"}
        `}
      >
        <Search
          aria-hidden="true"
          className={`
            absolute left-4 transition-colors duration-200 motion-reduce:transition-none
            ${isFocused ? "text-accent" : "text-muted-foreground"}
            ${isLarge ? "w-6 h-6" : "w-4 h-4"}
          `}
        />
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={popupOpen}
          aria-controls={popupOpen ? listId : undefined}
          aria-activedescendant={activeId}
          autoComplete="off"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setSelectedIndex(0)
            setIsOpen(true)
          }}
          onFocus={() => {
            setIsFocused(true)
            setSelectedIndex(0)
            setIsOpen(query.trim().length > 0)
          }}
          onBlur={() => setIsFocused(false)}
          onCompositionStart={() => { isComposing.current = true }}
          onCompositionEnd={() => { isComposing.current = false }}
          placeholder={placeholder}
          className={`
            w-full min-w-0 rounded-lg bg-transparent outline-none text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-foreground
            ${isLarge ? "pl-14 pr-12 py-5 text-lg" : "pl-10 pr-12 py-2.5 text-sm"}
          `}
        />
        {query.length > 0 && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={clear}
            className="absolute right-1 p-2 rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {popupOpen ? count : ""}
      </div>
      {popupOpen && (
        <div
          ref={popupRef}
          data-placement={placement}
          className={`absolute left-0 right-0 bg-card border border-border rounded-lg shadow-elevated overflow-hidden z-50 ${placement === "below" ? "top-full mt-2" : "bottom-full mb-2"}`}
        >
          <p aria-hidden="true" className="px-4 py-2 text-xs text-muted-foreground border-b border-border">
            {count}
          </p>
          {results.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              No matches among {getAllServices().length} services. Try “S3”, “queue”, or “database”.
            </p>
          )}
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label="AWS service results"
            className="max-h-[min(24rem,45dvh)] overflow-y-auto overscroll-contain"
          >
            {results.map((service, index) => (
              <li
                key={service.service_name}
                id={optionId(service)}
                role="option"
                aria-selected={index === selectedIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(service)}
                className={`
                  w-full px-4 py-3 text-left flex items-start gap-3 cursor-pointer
                  ${index === selectedIndex ? "bg-secondary" : "hover:bg-secondary/50"}
                  ${index !== results.length - 1 ? "border-b border-border" : ""}
                `}
              >
                <ServiceIcon icon={service.icon} className="h-5 w-5 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground break-words">{service.service_name}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2 break-words">{service.description}</div>
                  <span className="inline-block max-w-full mt-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded break-words">
                    {service.category}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import * as Dialog from "@radix-ui/react-dialog"
import { Menu, X } from "lucide-react"
import { getCategories, getServicesByCategory, getServiceSlug } from "@/lib/aws-data"
import { ServiceIcon } from "@/components/ServiceIcon"
import { SearchBar } from "@/components/SearchBar"

interface MobileNavProps {
  currentCategory?: string
  currentService?: string
}

export function MobileNav({ currentCategory, currentService }: MobileNavProps) {
  const location = useLocation()
  // A history change closes the modal in the same render as the destination page.
  const [openAtLocation, setOpenAtLocation] = useState<string | null>(null)
  const isOpen = openAtLocation === location.key
  const triggerRef = useRef<HTMLButtonElement>(null)
  const openedLocation = useRef(location.key)
  const latestLocation = useRef(location.key)
  const closeReason = useRef<"dismiss" | "navigate" | "resize">("dismiss")
  const categories = getCategories()

  useEffect(() => {
    latestLocation.current = location.key
    // Do not reopen an old menu when returning to this history entry.
    setOpenAtLocation(null)
  }, [location.key])

  useEffect(() => {
    if (!isOpen) return

    const desktop = window.matchMedia("(min-width: 1280px)")
    const closeOnDesktop = () => {
      if (desktop.matches) {
        closeReason.current = "resize"
        setOpenAtLocation(null)
      }
    }

    closeOnDesktop()
    desktop.addEventListener("change", closeOnDesktop)
    return () => desktop.removeEventListener("change", closeOnDesktop)
  }, [isOpen])

  const closeForNavigation = () => {
    closeReason.current = "navigate"
    setOpenAtLocation(null)
  }

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      closeForNavigation()
    }
  }

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          closeReason.current = "dismiss"
          openedLocation.current = location.key
        }
        setOpenAtLocation(open ? location.key : null)
      }}
    >
      <div className="xl:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
          >
            AWS <span className="text-gradient-orange">Explained</span>
          </Link>

          <Dialog.Trigger asChild>
            <button
              ref={triggerRef}
              type="button"
              className="p-2 -mr-2 rounded-md text-muted-foreground hover:text-foreground transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
          </Dialog.Trigger>
        </div>
      </div>

      <Dialog.Portal>
        <Dialog.Overlay
          data-testid="mobile-menu-overlay"
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={() => setOpenAtLocation(null)}
        />
        <Dialog.Content
          aria-modal="true"
          aria-describedby={undefined}
          className="fixed top-[57px] right-0 bottom-0 z-50 w-72 max-w-full bg-sidebar border-l border-border overflow-y-auto overscroll-contain"
          onEscapeKeyDown={(event) => {
            // Radix listens in document capture. Defer dismissal to our bubble
            // handler so an open SearchBar popup can consume Escape first.
            event.preventDefault()
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault()
              setOpenAtLocation(null)
            }
          }}
          onCloseAutoFocus={(event) => {
            // Never restore an obsolete/offscreen trigger after navigation or
            // resize. RouteFocus runs after route commits and modal cleanup.
            event.preventDefault()
            if (closeReason.current === "resize") {
              const heading = document.querySelector<HTMLElement>("main h1") ?? document.querySelector<HTMLElement>("h1")
              if (heading) {
                heading.tabIndex = -1
                heading.focus()
              }
            } else if (
              closeReason.current === "dismiss" &&
              openedLocation.current === latestLocation.current &&
              triggerRef.current?.isConnected
            ) {
              triggerRef.current.focus()
            }
          }}
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <Dialog.Title className="text-sm font-semibold text-sidebar-foreground">
              Explore services
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close menu"
                className="p-2 -mr-2 rounded-md text-muted-foreground hover:text-foreground transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-inset"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <div className="px-4 pb-3">
            <SearchBar size="small" placeholder="Search services..." onNavigate={closeForNavigation} />
          </div>

          <nav aria-label="Service categories" className="px-4 pb-4 space-y-1">
            {categories.map((category) => {
              const isActive = category.slug === currentCategory
              const services = isActive ? getServicesByCategory(category.slug) : []

              return (
                <div key={category.slug}>
                  <Link
                    to={`/category/${category.slug}`}
                    onClick={handleLinkClick}
                    aria-current={isActive && !currentService ? "page" : undefined}
                    className={`
                      block px-3 py-2.5 rounded-md text-sm transition-colors motion-reduce:transition-none
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-inset
                      ${isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }
                    `}
                  >
                    <span className="mr-2" aria-hidden="true">{category.icon}</span>
                    {category.name}
                  </Link>

                  {isActive && services.length > 0 && (
                    <div className="ml-6 mt-1 mb-2 space-y-0.5 border-l border-sidebar-border pl-3">
                      {services.map((service) => {
                        const slug = getServiceSlug(service.service_name)
                        const isServiceActive = slug === currentService

                        return (
                          <Link
                            key={slug}
                            to={`/category/${category.slug}/${slug}`}
                            onClick={handleLinkClick}
                            aria-current={isServiceActive ? "page" : undefined}
                            className={`
                              flex items-center gap-2 py-2 rounded-sm text-sm transition-colors motion-reduce:transition-none
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-inset
                              ${isServiceActive
                                ? "text-accent-text font-medium"
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                              }
                            `}
                          >
                            <ServiceIcon icon={service.icon} className="h-5 w-5" />
                            <span className="truncate">{service.service_name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

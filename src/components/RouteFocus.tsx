import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"

export function RouteFocus() {
  const { key } = useLocation()
  const previousKey = useRef(key)

  useEffect(() => {
    // Leave direct loads/hydration alone, and ignore unrelated rerenders.
    if (previousKey.current === key) return
    previousKey.current = key

    const heading = document.querySelector<HTMLElement>("main h1") ?? document.querySelector<HTMLElement>("h1")
    if (heading) {
      heading.tabIndex = -1
      heading.focus()
    }
  }, [key])

  return null
}

import { useEffect, useState } from "react"

export function useIsSmallScreen() {
    const [isSmall, setIsSmall] = useState(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 767px)")
        setIsSmall(mediaQuery.matches)

        const handler = (event) => {
            setIsSmall(event.matches)
        }

        mediaQuery.addEventListener("change", handler)

        return () => {
            mediaQuery.removeEventListener("change", handler)
        }
    }, [])

    return isSmall
}
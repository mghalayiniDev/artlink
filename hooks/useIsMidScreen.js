import { useEffect, useState } from "react"

export function useIsMidScreen() {
    const [isMid, setIsMid] = useState(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 1023px)")
        setIsMid(mediaQuery.matches)

        const handler = (event) => {
            setIsMid(event.matches)
        }

        mediaQuery.addEventListener("change", handler)

        return () => {
            mediaQuery.removeEventListener("change", handler)
        }
    }, [])

    return isMid
}
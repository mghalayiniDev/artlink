"use client"

import { useEffect, useState } from "react"
import Topbar from "./Topbar"
import MainHeader from "./MainHeader"

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    
    useEffect(() => {
        function handleScroll() {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            {/* Top bar */}
            <Topbar isScrolled={isScrolled} />
            {/* Main header */}
            <MainHeader isScrolled={isScrolled} />
        </header>
    )
}
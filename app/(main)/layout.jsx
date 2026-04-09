import Header from "../components/header/Header"
import Navbar from "../components/header/Navbar"
import Footer from "../components/Footer"
import { MessageCircle } from "lucide-react"

export const metadata = {
    title: 'ArtLink | Premium Custom Doors',
    description: 'Design and order custom-built doors delivered straight to your location.',
    openGraph: {
        title: 'ArtLink | Premium Custom Doors',
        description: 'Design and order custom-built doors delivered straight to your location.',
        url: 'https://yourwebsite.com',
        siteName: 'ArtLink',
        images: [
            {
                url: 'https://yourwebsite.com/images/default-og-banner.jpg', 
                width: 1200,
                height: 630,
                alt: 'ArtLink Factory Showcase',
            },
        ],
        locale: 'en_AE', 
        type: 'website',
    },
}

export default function MainLayout({ children }) {
    return (
        <main className="min-h-screen">
            <Header />
            <Navbar />
            {children}
            <Footer />
             <a
                href="https://wa.me/971554667720"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-8 w-14 h-14 bg-[#27c160] flex items-center justify-center z-50 animate-bounce-subtle hover:bg-[#23ab52] transition-colors shadow-lg"
                aria-label="Contact us on WhatsApp"
                >
                <svg viewBox="0 0 32 32" className="w-8 h-8 fill-white">
                    <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.502 1.14 6.742 3.072 9.372L1.062 31.1l5.904-1.96c2.518 1.736 5.584 2.756 8.88 2.856h.158c8.822 0 15.996-7.18 15.996-16.004C32 7.176 24.826 0 16.004 0zm9.53 22.61c-.4 1.13-2.352 2.162-3.282 2.238-.876.072-1.688.396-5.684-1.182-4.812-1.904-7.898-6.834-8.136-7.15-.238-.318-1.946-2.588-1.946-4.938 0-2.348 1.232-3.506 1.668-3.984.436-.478.952-.598 1.27-.598.318 0 .636.002.914.016.294.016.688-.112 1.076.82.4.958 1.354 3.308 1.472 3.548.12.238.198.518.04.836-.16.318-.238.518-.478.796-.238.278-.502.622-.716.834-.238.238-.486.498-.208.976.278.478 1.234 2.036 2.65 3.298 1.818 1.622 3.352 2.124 3.83 2.362.478.238.756.198 1.034-.12.278-.318 1.194-1.392 1.512-1.87.318-.478.636-.398 1.074-.238.436.158 2.786 1.314 3.264 1.554.478.238.796.358.914.558.12.198.12 1.152-.278 2.284z"/>
                </svg>
            </a>
        </main>
    )
}
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
                url: 'https://yourwebsite.com/images/default-og-banner.jpg', // Make sure this image is exactly 1200x630 pixels
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
                className="fixed bottom-8 right-8 w-14 h-14 bg-green-600 flex items-center justify-center z-50 animate-bounce-subtle hover:bg-green-700 transition-colors"
                aria-label="Contact us on WhatsApp"
            >
                <MessageCircle className="w-7 h-7 text-background fill-background" />
            </a>
        </main>
    )
}
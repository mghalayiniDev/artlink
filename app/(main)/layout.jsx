import Header from "../components/header/Header"
import Navbar from "../components/header/Navbar"
import Footer from "../components/home/Footer"

export default function MainLayout({ children }) {
    return (
        <main className="min-h-screen">
            <Header />
            <Navbar />
            {children}
            <Footer />
        </main>
    )
}
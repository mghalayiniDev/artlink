import Header from "../components/header/Header"
import Navbar from "../components/header/Navbar"
import Categories from "../components/home/Categories"
import HeroCoursel from "../components/home/HeroCoursel"

export default function Home() {
    return (
        <main className="min-h-screen">
            <Header />
            <Navbar />
            <HeroCoursel />
            <Categories />
        </main>
    )
}
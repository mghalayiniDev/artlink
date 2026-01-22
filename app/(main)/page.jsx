import Header from "../components/header/Header"
import Navbar from "../components/header/Navbar"
import Categories from "../components/home/Categories"
import HeroCoursel from "../components/home/HeroCoursel"
import HowItWorks from "../components/home/HowItWorks"
import ProductGallery from "../components/home/ProductGallery"
import WhyChooseUs from "../components/home/WhyChooseUs"

export default function Home() {
    return (
        <main className="min-h-screen">
            <Header />
            <Navbar />
            <HeroCoursel />
            <Categories />
            <WhyChooseUs />
            <ProductGallery />
            <HowItWorks />
        </main>
    )
}
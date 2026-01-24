import Categories from "../components/home/Categories"
import CTA from "../components/home/CTA"
import HeroCoursel from "../components/home/HeroCoursel"
import HowItWorks from "../components/home/HowItWorks"
import ProductGallery from "../components/home/ProductGallery"
import Testimonial from "../components/home/Testimonial"
import WhyChooseUs from "../components/home/WhyChooseUs"

export default function Home() {
    return (
        <>
            <HeroCoursel />
            <Categories />
            <WhyChooseUs />
            <ProductGallery />
            <HowItWorks />
            <Testimonial />
            <CTA />
        </>
    )
}
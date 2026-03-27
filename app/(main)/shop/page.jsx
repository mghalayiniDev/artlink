import Shop from "@/app/components/shop/Shop"
import { Loader } from "lucide-react"
import { Suspense } from "react"

export default function ShopPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            }
        >
            <Shop />
        </Suspense>
    )
}
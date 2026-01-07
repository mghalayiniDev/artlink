import { cn } from "@/lib/utils"

export default function ContentWrapper({ children, className="" }) {
    return (
        <div
            className={cn(
                "max-w-295 w-full mx-auto px-6 md:px-10",
                className
            )}
        >  
            {children}
        </div>
    )
}
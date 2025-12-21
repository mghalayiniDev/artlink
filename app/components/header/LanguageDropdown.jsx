import { setUserLocale } from "@/actions/locale"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Globe } from "lucide-react"
import { useLocale } from "next-intl"
import Image from "next/image"
import { useTransition } from "react"

export default function Languagedropdown({ color="white" }) {
    const locale = useLocale()
    const [isPending, startTransition] = useTransition()

    const handleLanguageChange = (newLocale) => {
        startTransition(async () => {
            await setUserLocale(newLocale)
            window.location.reload()
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className={`flex items-center gap-3.25 cursor-pointer focus:outline-0 ${locale === "ar" ? "mr-auto" : "ml-auto"}`}>
                <Globe className="w-3.25 h-3.25" />
                <span className="uppercase font-medium text-[0.825rem]">{locale}</span>
                <ChevronDown className="w-3.25 h-3.25" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border border-border min-w-30 text-black mt-3 shadow-md">
                <DropdownMenuItem
                    onClick={() => handleLanguageChange("en")}
                    className="text-[0.785rem] font-medium flex items-center gap-2.5 cursor-pointer"
                    style={{
                        fontFamily: "var(--font-inter)"
                    }}
                >
                    <Image
                        src="/icons/usa.png"
                        alt="USA flag"
                        width={16}
                        height={16}
                    />
                    English
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleLanguageChange("ar")}
                    className="text-[0.825rem] font-medium flex items-center gap-2.5 cursor-pointer"
                    style={{
                        fontFamily: "var(--font-cairo)"
                    }}
                >
                    <Image 
                        src="/icons/ksa.png"
                        alt="KSA flag"
                        width={16}
                        height={16}
                    />
                    العربيه
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
import { setUserLocale } from "@/actions/locale"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { languages } from "@/constants"
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
    
    const currentLang = languages.find((lang) => lang.id === locale) 
        || languages.find((lang) => lang.id === "en")

    return (
        <DropdownMenu>
            <DropdownMenuTrigger 
                className={`flex items-center gap-4.5 cursor-pointer text-white 
                focus:outline-0 ${locale === "ar" ? "mr-auto" : "ml-auto"}`}
            >
                <Image 
                    src={currentLang.icon}
                    alt={currentLang.alt}
                    width={15}
                    height={15}
                />
                <span 
                    className={`uppercase font-medium ${locale === "ar" ? "text-sm" : "text-xs"}`}
                    style={{ fontFamily: `var(--${currentLang.font})` }}
                >
                    {currentLang.name}
                </span>
                <ChevronDown className="w-3.25 h-3.25" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border border-foreground/20 rounded-none z-50 min-w-35 mt-2">
                {languages.map((lang, idx) => (
                    <DropdownMenuItem
                        onClick={() => handleLanguageChange(lang.id)}
                        className={`
                            w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-100 transition-colors cursor-pointer hover:text-[#e58b42]
                            ${locale === lang.id ? "bg-neutral-100 text-[#e58b42]" : "text-foreground"} ${locale === "ar" ? "text-[0.875rem]" : "text-xs"}
                        `}
                        style={{
                            fontFamily: `var(--${lang.font})`
                        }}
                        key={idx}
                    >
                        <Image 
                            src={lang.icon}
                            alt={lang.alt}
                            width={16}
                            height={16}
                        />
                        {lang.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
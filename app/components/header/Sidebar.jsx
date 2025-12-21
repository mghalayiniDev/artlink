import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import Logo from "../Logo"
import Link from "next/link"
import { ChevronDown, Phone } from "lucide-react"
import { useTranslations } from "next-intl"
import Languagedropdown from "./LanguageDropdown"
import Searchbar from "./Searchbar"

export default function Sidebar({ mobileMenuActive, setMobileMenuActive, navLinks }) {
    const t = useTranslations("header")

    return (
        <Sheet open={mobileMenuActive} onOpenChange={setMobileMenuActive}>
            <SheetContent className="md:hidden max-w-[320px] w-full">
                <SheetHeader style={{ direction: "ltr" }}>
                    <SheetTitle>
                        <Logo color="black" />
                    </SheetTitle>
                </SheetHeader>
                <SheetDescription 
                    className="mt-2 px-5.5"
                    asChild
                >
                    <div className="flex flex-col gap-4.5">
                        {navLinks.map((link, key) => (
                            <Link
                                href={link.href}
                                className="text-neutral-600 font-medium border-b pb-4.5"
                                key={key}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <span
                            className="flex items-center gap-3 cursor-pointer text-neutral-600 font-medium border-b pb-4.5"
                        >
                            {t("categories")}
                            <ChevronDown 
                                width={14}
                                height={14}
                            />
                        </span>
                        <Searchbar />
                    </div>
                </SheetDescription>
                <div className="mt-auto px-5.5 flex items-center justify-between gap-3.5 pb-4">
                    <span 
                        className={`flex items-center gap-3 text-[0.8rem]`}
                        style={{ direction: "ltr" }}
                    >
                        <Phone className="w-3 h-3" />
                        +971 55 466 7720 
                    </span>
                    <Languagedropdown />
                </div>
            </SheetContent>
        </Sheet>
    )
}
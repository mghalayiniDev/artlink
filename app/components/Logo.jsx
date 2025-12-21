import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"

export default function Logo({ color="white" }) {
    const t = useTranslations("logo")

    return (
        <Link
            href="/"
            className="w-fit flex items-center gap-3.5 select-none"
        >
            <Image 
                src="/artlink.png"
                alt="Artlink"
                width={36}
                height={36}
            />
            <span className={`text-[1.175rem] md:text-[1.35rem] font-semibold text-${color}`}>
                {t("main")}
            </span>
        </Link>
    )
}
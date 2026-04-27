import { useTranslations } from "next-intl"
import Logo from "../components/Logo"
import { Check, Clock, ShieldCheck } from "lucide-react"

export default function AuthLayout({ children }) {
    const t = useTranslations("auth")

    const stats = [
        {
            name: t("stats.years"),
            stat: 10
        },
        {
            name: t("stats.clients"),
            stat: "900",
        },
        {
            name: t("stats.designs"),
            stat: 30
        }
    ]

    const features = [
        {
            icon: Check,
            feature: t("features.quality")
        },
        {
            icon: Clock,
            feature: t("features.delivery")
        },
        {
            icon: ShieldCheck,
            feature: t("features.warranty")
        }
    ]

    return (
        <main className="min-h-screen flex relative">
            {/* Left Side - Showcase */}
            <div className="hidden xl:flex w-1/2 bg-neutral-100 border-r border-gray-200 relative overflow-hidden flex-col min-h-screen justify-center py-6 items-center">
                {/* Content */}
                <div className="w-full max-w-165 mx-auto px-12">
                    <h1 className="font-heading text-2xl md:text-3xl xl:text-[2.2rem] text-gray-900 leading-normal mb-6.5">
                        "{t("quote")}"
                    </h1>
                    <div className="pt-8 relative flex flex-col gap-7">
                        <div className="w-full h-px bg-linear-to-r from-orange-500 to-transparent mb-5.5" />
                        <div className="grid grid-cols-3 gap-8">
                            {stats.map((stat, idx) => (
                                <div
                                    key={idx}
                                    className="text-center flex flex-col gap-6 justify-center"
                                >
                                    <div className="flex items gap-1.75 justify-center">
                                        <h2 className="text-[3.15rem] text-orange-500 font-bold leading-0">
                                            {stat.stat}
                                        </h2>
                                        <span className="text-[1.75rem] text-orange-500 font-bold leading-[0.75]">+</span>
                                    </div>
                                    <p className="text-gray-500 text-[0.8rem] tracking-wide uppercase font-medium">
                                        {stat.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="w-full h-px bg-linear-to-r from-orange-500 to-transparent mb-5 mt-1" />
                        <div className="grid grid-cols-3 gap-8">
                            {features.map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-center gap-3.5"
                                >
                                    <div
                                        className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center"
                                    >
                                        <feature.icon className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <span className="text-gray-600 text-xs font-mono">{feature.feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.035]">
                    <div className="absolute top-0 left-0 w-full h-full" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, #f97316 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }} />
                </div>
            </div>
            {/* Right Side - Form */}
            <div className="w-full xl:w-1/2 bg-white flex flex-col justify-between xl:justify-center relative">
                <div className="xl:hidden" />
                <div className="max-w-150 xl:max-w-130 w-full mx-auto px-6 py-12 relative z-10">
                    {/* Logo */}
                    <Logo variant="light" />
                    {/* Form */}
                    {children}
                </div>
                <div className="border-t border-gray-100 bg-gray-50 xl:hidden py-4 italic text-gray-400 text-[0.825rem] md:text-[0.925rem]">
                    <p className="max-w-150 w-full mx-auto px-6">
                        "{t("quote")}"
                    </p>
                </div>
            </div>
        </main>
    )
}
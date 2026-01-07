"use client"

import { useLocale, useTranslations } from "next-intl"
import * as Clerk from '@clerk/elements/common'
import * as SignUpElements from '@clerk/elements/sign-up'
import { ArrowRight, Loader } from "lucide-react"
import Image from "next/image"
import Languagedropdown from "@/app/components/header/LanguageDropdown"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useClerk } from "@clerk/nextjs"
import Header from "@/app/components/auth/Header"

export default function SignUp() {
    const t = useTranslations("auth")
    const locale = useLocale()
    const { loaded } = useClerk()

    if (!loaded) {
        return (
            <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-3 my-9">
                    <Skeleton className={"w-[50%] h-8"} />
                    <Skeleton className={"w-[80%] h-4.5"} />
                </div>
                <div className="flex gap-5">
                    <div className="flex-1">
                        <Skeleton className="w-full h-3.5" />
                        <Skeleton className="w-full h-10 mt-2.5" />
                    </div>
                    <div className="flex-1">
                        <Skeleton className="w-full h-3.5" />
                        <Skeleton className="w-full h-10 mt-2.5" />
                    </div>
                </div>
                <div className="mt-6">
                    <Skeleton className="w-[30%] h-3.5" />
                    <Skeleton className="w-full h-10 mt-2.5" />
                </div>
                <Skeleton className="mt-6 w-full h-10" />
                <Skeleton className="my-8 h-0.5 w-full" />
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10 mt-2.5" />
                <Skeleton className="w-[70%] mx-auto h-5 mt-2.5" />
            </div>
        )
    }

    return (
        <SignUpElements.Root 
            className="flex flex-col gap-3.5" 
            transferable={false}
        >
            <Clerk.Loading>
                {(isGlobalLoading) => (
                    <>
                        {/* Start of sign up */}
                        <SignUpElements.Step name="start">
                            {/* Header */}
                            <Header 
                                header={t("signUp.header")}
                                desc={t("signUp.desc")}
                            />
                            <div className="flex gap-5">
                                <Clerk.Field name="firstName" className="flex-1">
                                    <Clerk.Label className="text-white/80 text-sm block">
                                        {t("lables.firstName")}
                                    </Clerk.Label>
                                    <Clerk.Input 
                                        type="text"
                                        placeholder={t("placeholders.firstName")}
                                        className="bg-[#333333] border px-4 border-white/10 text-white placeholder:text-white/40 h-11.5 
                                        focus:border-[#e88839] focus:ring-1 focus:ring-[#e88839] outline-none
                                        data-invalid:border-red-600 data-invalid:text-red-600 block w-full mt-3 text-[0.85rem]"
                                        required
                                    />
                                    <Clerk.FieldError className="text-red-500 text-xs animate-in fade-in duration-300 block" />
                                </Clerk.Field>
                                <Clerk.Field name="lastName" className="flex-1">
                                    <Clerk.Label className="text-white/80 text-sm block">
                                        {t("lables.lastName")}
                                    </Clerk.Label>
                                    <Clerk.Input 
                                        type="text"
                                        placeholder={t("placeholders.lastName")}
                                        className="bg-[#333333] border px-4 border-white/10 text-white placeholder:text-white/40 h-11.5 
                                        focus:border-[#e88839] focus:ring-1 focus:ring-[#e88839] outline-none
                                        data-invalid:border-red-600 data-invalid:text-red-600 block w-full mt-3 text-[0.85rem]"
                                        required
                                    />
                                    <Clerk.FieldError className="text-red-500 text-xs animate-in fade-in duration-300 block" />
                                </Clerk.Field>
                            </div>
                            <Clerk.Field name="emailAddress" className="mt-6">
                                <Clerk.Label
                                    className="text-white/80 text-sm block"
                                >
                                    {t("lables.email")}
                                </Clerk.Label>
                                <Clerk.Input 
                                    type="email"
                                    placeholder={t("placeholders.email")}
                                    className="bg-[#333333] border px-4 border-white/10 text-white placeholder:text-white/40 h-11.5 
                                    focus:border-[#e88839] focus:ring-1 focus:ring-[#e88839] outline-none
                                    data-invalid:border-red-600 data-invalid:text-red-600 block w-full mt-3 text-[0.85rem]"
                                    required
                                />
                                <Clerk.FieldError className="text-red-500 text-xs animate-in fade-in duration-300 block" />
                            </Clerk.Field>
                            <SignUpElements.Captcha />
                            <SignUpElements.Action 
                                submit
                                className="w-full h-11.5 bg-linear-to-r from-[#dd7825] via-[#db8b4a] flex items-center justify-center gap-3 mt-7 to-[#c99061] text-black font-semibold hover:opacity-90 transition-opacity group text-[0.85rem] px-6 cursor-pointer disabled:cursor-default"
                                disabled={isGlobalLoading}
                                >
                                <Clerk.Loading>
                                    {(isLoading) => isLoading ? (
                                        <Loader className="size-4 animate-spin" />
                                    ) : (
                                        <>
                                        {t("signUp.action")}
                                        <ArrowRight
                                            width={15}
                                            height={15}
                                            className={locale === "ar" ? "rotate-180" : "rotate-0"}
                                        />
                                        </>
                                    )
                                    }
                                </Clerk.Loading>
                            </SignUpElements.Action>
                            <Clerk.GlobalError className="text-red-500 text-xs animate-in fade-in duration-300 w-full text-center block mt-3" />
                            <div className="my-10 h-0.5 w-full bg-white/10 relative"> 
                                <p className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] bg-[#1a1a1a] text-white/40 select-none px-4">
                                    {t("or")}
                                </p>
                            </div>
                            <Clerk.Connection 
                                name="google"
                                className="bg-[#333333] border px-4 border-white/10 text-white placeholder:text-white/40 h-11.5 disabled:cursor-default
                                outline-none w-full mt-3 text-[0.825rem] cursor-pointer hover:brightness-110 items-center flex justify-center gap-4" 
                                disabled={isGlobalLoading}
                            >
                                <Clerk.Loading scope="provider:google">
                                    {(isLoading) =>
                                        isLoading ? (
                                            <Loader className="size-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Image 
                                                    width={18}
                                                    height={18}
                                                    alt="google"
                                                    src="/icons/google.png"
                                                />
                                                {t("signUp.googleConnc")}
                                            </>
                                        )
                                    }
                                </Clerk.Loading>
                            </Clerk.Connection>
                            <Clerk.Connection 
                                name="apple"
                                className="bg-[#333333] border px-4 border-white/10 text-white placeholder:text-white/40 h-11.5 disabled:cursor-default
                                outline-none w-full mt-6 text-[0.825rem] cursor-pointer hover:brightness-110 items-center flex justify-center gap-4" 
                                disabled={isGlobalLoading}
                            >
                                <Clerk.Loading scope="provider:apple">
                                    {(isLoading) =>
                                        isLoading ? (
                                            <Loader className="size-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Image 
                                                    width={18}
                                                    height={18}
                                                    alt="google"
                                                    src="/icons/apple.png"
                                                />
                                                {t("signUp.appleConnc")}
                                            </>
                                        )
                                    }
                                </Clerk.Loading>
                            </Clerk.Connection>
                        </SignUpElements.Step>

                        {/* Continue - Check for missing fields */}
                        <SignUpElements.Step name="continue">
                            <Header 
                                header={t("signUp.continueHeader")}
                                desc={t("signUp.continueDesc")}
                            />
                            <div className="flex gap-5">
                                <Clerk.Field name="firstName" className="flex-1">
                                    <Clerk.Label
                                        className="text-white/80 text-sm flex items-center gap-1.75"
                                    >
                                        {t("lables.firstName")} <span className="text-[0.8rem] text-red-400">* {t("required")}</span>
                                    </Clerk.Label>
                                    <Clerk.Input 
                                        type="text"
                                        placeholder={t("placeholders.firstName")}
                                        className="bg-[#333333] border px-4 text-white placeholder:text-white/40 h-11.5 
                                        focus:border-[#e88839] focus:ring-1 focus:ring-[#e88839] outline-none
                                        border-red-600 data-invalid:text-red-600 block w-full mt-3 text-[0.85rem]"
                                        required
                                    />
                                    <Clerk.FieldError className="text-red-500 text-xs animate-in fade-in duration-300 block" />
                                </Clerk.Field>
                                <Clerk.Field name="lastName" className="flex-1">
                                    <Clerk.Label
                                        className="text-white/80 text-sm flex items-center gap-1.75"
                                    >
                                        {t("lables.lastName")} <span className="text-[0.8rem] text-red-400">* {t("required")}</span>
                                    </Clerk.Label>
                                    <Clerk.Input 
                                        type="text"
                                        placeholder={t("placeholders.lastName")}
                                        className="bg-[#333333] border px-4 text-white placeholder:text-white/40 h-11.5 
                                        focus:border-[#e88839] focus:ring-1 focus:ring-[#e88839] outline-none
                                        border-red-600 data-invalid:text-red-600 block w-full mt-3 text-[0.85rem]"
                                        required
                                    />
                                    <Clerk.FieldError className="text-red-500 text-xs animate-in fade-in duration-300 block" />
                                </Clerk.Field>
                            </div>
                            <Clerk.Field name="emailAddress" className="mt-6">
                                <Clerk.Label
                                    className="text-white/80 text-sm flex items-center gap-1.75"
                                >
                                    {t("lables.email")} <span className="text-[0.8rem] text-red-400">* {t("required")}</span>
                                </Clerk.Label>
                                <Clerk.Input 
                                    type="email"
                                    placeholder={t("placeholders.email")}
                                    className="bg-[#333333] border px-4 text-white placeholder:text-white/40 h-11.5 
                                    focus:border-[#e88839] focus:ring-1 focus:ring-[#e88839] outline-none
                                    border-red-600 data-invalid:text-red-600 block w-full mt-3 text-[0.85rem]"
                                    required
                                />
                                <Clerk.FieldError className="text-red-500 text-xs animate-in fade-in duration-300 block" />
                            </Clerk.Field>
                            <SignUpElements.Action 
                                submit
                                className="w-full h-11.5 bg-linear-to-r from-[#dd7825] via-[#db8b4a] flex items-center justify-center gap-3 mt-7
                                        to-[#c99061] text-black font-semibold hover:opacity-90 transition-opacity group text-[0.85rem] px-6 cursor-pointer"
                                disabled={isGlobalLoading}
                            >
                                <Clerk.Loading>
                                    {(isLoading) => isLoading ? (
                                        <Loader className="size-4 animate-spin" />
                                    ) : (
                                        <>
                                            {t("signUp.action")}
                                            <ArrowRight
                                                width={15}
                                                height={15}
                                                className={locale === "ar" ? "rotate-180" : "rotate-0"}
                                            />
                                        </>
                                    )
                                    }
                                </Clerk.Loading>
                            </SignUpElements.Action>
                            <Clerk.GlobalError className="text-red-500 text-xs animate-in fade-in duration-300 w-full text-center block mt-3" />
                        </SignUpElements.Step>

                        {/* Signup email verification */}
                        <SignUpElements.Step name="verifications">
                            <SignUpElements.Strategy name="email_code">
                                {/* Header */}
                                <Header 
                                    header={t("signUp.verifyHeader")}
                                    desc={t("signUp.verifyDesc")}
                                />
                                <Clerk.Field name="code">
                                    <Clerk.Label 
                                        className="text-white/80 text-sm block"
                                    >
                                        {t("lables.verifyCode")}
                                    </Clerk.Label>
                                    <Clerk.Input 
                                        type="text"
                                        placeholder={t("placeholders.verifyCode")}
                                        className="bg-[#333333] border px-4 border-white/10 text-white placeholder:text-white/40 h-11.5 
                                        focus:border-[#e88839] focus:ring-1 focus:ring-[#e88839] outline-none
                                        data-invalid:border-red-600 data-invalid:text-red-600 block w-full mt-3 text-[0.85rem]"
                                        maxLength={6}
                                        required
                                    />
                                    <Clerk.FieldError className="text-red-500 text-xs animate-in fade-in duration-300 block" />
                                </Clerk.Field>
                                <SignUpElements.Action 
                                    submit
                                    className="w-full h-11.5 bg-linear-to-r from-[#dd7825] via-[#db8b4a] flex items-center justify-center gap-3 mt-5
                                            to-[#c99061] text-black font-semibold hover:opacity-90 transition-opacity group text-[0.85rem] px-6 cursor-pointer"
                                    disabled={isGlobalLoading}
                                >
                                    <Clerk.Loading>
                                        {(isLoading) => isLoading ? (
                                            <Loader className="size-4 animate-spin" />
                                        ) : (
                                            <>
                                                {t("signUp.verifyBtn")}
                                                <ArrowRight
                                                    width={15}
                                                    height={15}
                                                    className={locale === "ar" ? "rotate-180" : "rotate-0"}
                                                />
                                            </>
                                        )
                                        }
                                    </Clerk.Loading>
                                </SignUpElements.Action>
                                <div className="flex items-center justify-center pb-3">
                                    <SignUpElements.Action
                                        resend
                                        disabled={isGlobalLoading}
                                        fallback={({ resendableAfter }) => 
                                            <p className="text-white/80 text-[0.8rem] mt-4 disabled:cursor-default">
                                                {t("resendVerifCode", { resendableAfter })}
                                            </p>}
                                        className="text-white/80 text-[0.8rem] mt-4 cursor-pointer hover:text-[#db8b4a] disabled:cursor-default"
                                    >
                                        {t("resendVerifBtn")}
                                    </SignUpElements.Action>
                                </div>
                            </SignUpElements.Strategy>
                        </SignUpElements.Step>

                        {/* Control actions */}
                        <div className="w-full mt-8 flex items-center justify-center gap-4 md:gap-3 text-white/60 text-xs md:text-[0.875rem]">
                            {/* Account exists */}
                            <div className="flex items-center justify-center gap-1.5">
                                <span className="">
                                    {t("signUp.login")}
                                </span>
                                <Link
                                    href="/sign-in"
                                    className="text-[#e88839] font-medium hover:underline cursor-pointer"
                                >
                                    {t("signUp.loginAc")}
                                </Link>
                            </div>
                            <span className="hidden md:inline-block">·</span>
                            {/* Language dropdown */}
                            <div>
                                <Languagedropdown />
                            </div>
                        </div>
                    </>
                )}
            </Clerk.Loading>
        </SignUpElements.Root>
    )
}
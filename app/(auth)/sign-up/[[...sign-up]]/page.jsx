"use client"

import { useLocale, useTranslations } from "next-intl"
import * as Clerk from '@clerk/elements/common'
import * as SignUpElements from '@clerk/elements/sign-up'
import { ArrowRight, Loader } from "lucide-react"
import Image from "next/image"
import Languagedropdown from "@/app/components/header/LanguageDropdown"
import Link from "next/link"
import { useClerk } from "@clerk/nextjs"
import Header from "@/app/components/auth/Header"

export default function SignUp() {
    const t = useTranslations("auth")
    const locale = useLocale()
    const { loaded } = useClerk()

    if (!loaded) {
        return (
            <div className="flex flex-col animate-pulse">
                {/* Header */}
                <div className="flex flex-col gap-2 my-9">
                    <div className="h-9 w-[48%] bg-gray-100" />
                    <div className="h-4 w-[72%] bg-gray-100 mt-1" />
                </div>
                {/* First + Last name */}
                <div className="flex gap-5">
                    <div className="flex-1">
                        <div className="h-3.5 w-[45%] bg-gray-100" />
                        <div className="h-11.5 w-full bg-gray-100 border border-gray-200 mt-3" />
                    </div>
                    <div className="flex-1">
                        <div className="h-3.5 w-[45%] bg-gray-100" />
                        <div className="h-11.5 w-full bg-gray-100 border border-gray-200 mt-3" />
                    </div>
                </div>
                {/* Email label + input */}
                <div className="mt-6">
                    <div className="h-3.5 w-[20%] bg-gray-100" />
                    <div className="h-11.5 w-full bg-gray-100 border border-gray-200 mt-3" />
                </div>
                {/* Submit */}
                <div className="h-11.5 w-full bg-gray-100 mt-7" />
                {/* Or divider */}
                <div className="my-10 h-px w-full bg-gray-200" />
                {/* Google */}
                <div className="h-11.5 w-full bg-gray-100" />
                {/* Apple */}
                <div className="h-11.5 w-full bg-gray-100 mt-3" />
                {/* Bottom nav */}
                <div className="h-4 w-[58%] mx-auto bg-gray-100 mt-8" />
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
                                    <Clerk.Label className="text-gray-700 text-sm block">
                                        {t("lables.firstName")}
                                    </Clerk.Label>
                                    <Clerk.Input
                                        type="text"
                                        placeholder={t("placeholders.firstName")}
                                        className="bg-gray-50 border px-4 border-gray-200 text-gray-900 placeholder:text-gray-400 h-11.5
                                        focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none
                                        data-invalid:border-red-500 data-invalid:text-red-600 block w-full mt-3 text-[0.85rem]"
                                        required
                                    />
                                    <Clerk.FieldError className="text-red-500 text-xs animate-in fade-in duration-300 block" />
                                </Clerk.Field>
                                <Clerk.Field name="lastName" className="flex-1">
                                    <Clerk.Label className="text-gray-700 text-sm block">
                                        {t("lables.lastName")}
                                    </Clerk.Label>
                                    <Clerk.Input
                                        type="text"
                                        placeholder={t("placeholders.lastName")}
                                        className="bg-gray-50 border px-4 border-gray-200 text-gray-900 placeholder:text-gray-400 h-11.5
                                        focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none
                                        data-invalid:border-red-500 data-invalid:text-red-600 block w-full mt-3 text-[0.85rem]"
                                        required
                                    />
                                    <Clerk.FieldError className="text-red-500 text-xs animate-in fade-in duration-300 block" />
                                </Clerk.Field>
                            </div>
                            <Clerk.Field name="emailAddress" className="mt-6">
                                <Clerk.Label
                                    className="text-gray-700 text-sm block"
                                >
                                    {t("lables.email")}
                                </Clerk.Label>
                                <Clerk.Input
                                    type="email"
                                    placeholder={t("placeholders.email")}
                                    className="bg-gray-50 border px-4 border-gray-200 text-gray-900 placeholder:text-gray-400 h-11.5
                                    focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none
                                    data-invalid:border-red-500 data-invalid:text-red-600 block w-full mt-3 text-[0.85rem]"
                                    required
                                />
                                <Clerk.FieldError className="text-red-500 text-xs animate-in fade-in duration-300 block" />
                            </Clerk.Field>
                            <SignUpElements.Captcha />
                            <SignUpElements.Action
                                submit
                                className="w-full h-11.5 bg-orange-500 hover:bg-orange-600 flex items-center justify-center gap-3 mt-7 text-white font-semibold transition-colors group text-[0.85rem] px-6 cursor-pointer disabled:cursor-default disabled:opacity-70"
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
                            <div className="my-10 h-px w-full bg-gray-200 relative">
                                <p className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] bg-white text-gray-400 select-none px-4 text-sm">
                                    {t("or")}
                                </p>
                            </div>
                            <Clerk.Connection
                                name="google"
                                className="bg-gray-50 border px-4 border-gray-200 text-gray-700 h-11.5 disabled:cursor-default
                                outline-none w-full mt-3 text-[0.825rem] cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-colors items-center flex justify-center gap-4"
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
                                className="bg-gray-50 border px-4 border-gray-200 text-gray-700 h-11.5 disabled:cursor-default
                                outline-none w-full mt-3 text-[0.825rem] cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-colors items-center flex justify-center gap-4"
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
                                                    alt="apple"
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
                                        className="text-gray-700 text-sm flex items-center gap-1.75"
                                    >
                                        {t("lables.firstName")} <span className="text-[0.8rem] text-red-400">* {t("required")}</span>
                                    </Clerk.Label>
                                    <Clerk.Input
                                        type="text"
                                        placeholder={t("placeholders.firstName")}
                                        className="bg-gray-50 border px-4 text-gray-900 placeholder:text-gray-400 h-11.5
                                        focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none
                                        border-red-500 data-invalid:text-red-600 block w-full mt-3 text-[0.85rem]"
                                        required
                                    />
                                    <Clerk.FieldError className="text-red-500 text-xs animate-in fade-in duration-300 block" />
                                </Clerk.Field>
                                <Clerk.Field name="lastName" className="flex-1">
                                    <Clerk.Label
                                        className="text-gray-700 text-sm flex items-center gap-1.75"
                                    >
                                        {t("lables.lastName")} <span className="text-[0.8rem] text-red-400">* {t("required")}</span>
                                    </Clerk.Label>
                                    <Clerk.Input
                                        type="text"
                                        placeholder={t("placeholders.lastName")}
                                        className="bg-gray-50 border px-4 text-gray-900 placeholder:text-gray-400 h-11.5
                                        focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none
                                        border-red-500 data-invalid:text-red-600 block w-full mt-3 text-[0.85rem]"
                                        required
                                    />
                                    <Clerk.FieldError className="text-red-500 text-xs animate-in fade-in duration-300 block" />
                                </Clerk.Field>
                            </div>
                            <Clerk.Field name="emailAddress" className="mt-6">
                                <Clerk.Label
                                    className="text-gray-700 text-sm flex items-center gap-1.75"
                                >
                                    {t("lables.email")} <span className="text-[0.8rem] text-red-400">* {t("required")}</span>
                                </Clerk.Label>
                                <Clerk.Input
                                    type="email"
                                    placeholder={t("placeholders.email")}
                                    className="bg-gray-50 border px-4 text-gray-900 placeholder:text-gray-400 h-11.5
                                    focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none
                                    border-red-500 data-invalid:text-red-600 block w-full mt-3 text-[0.85rem]"
                                    required
                                />
                                <Clerk.FieldError className="text-red-500 text-xs animate-in fade-in duration-300 block" />
                            </Clerk.Field>
                            <SignUpElements.Action
                                submit
                                className="w-full h-11.5 bg-orange-500 hover:bg-orange-600 flex items-center justify-center gap-3 mt-7
                                        text-white font-semibold transition-colors group text-[0.85rem] px-6 cursor-pointer disabled:opacity-70"
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
                                        className="text-gray-700 text-sm block"
                                    >
                                        {t("lables.verifyCode")}
                                    </Clerk.Label>
                                    <Clerk.Input
                                        type="text"
                                        placeholder={t("placeholders.verifyCode")}
                                        className="bg-gray-50 border px-4 border-gray-200 text-gray-900 placeholder:text-gray-400 h-11.5
                                        focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none
                                        data-invalid:border-red-500 data-invalid:text-red-600 block w-full mt-3 text-[0.85rem]"
                                        maxLength={6}
                                        required
                                    />
                                    <Clerk.FieldError className="text-red-500 text-xs animate-in fade-in duration-300 block" />
                                </Clerk.Field>
                                <SignUpElements.Action
                                    submit
                                    className="w-full h-11.5 bg-orange-500 hover:bg-orange-600 flex items-center justify-center gap-3 mt-5
                                            text-white font-semibold transition-colors group text-[0.85rem] px-6 cursor-pointer disabled:opacity-70"
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
                                            <p className="text-gray-500 text-[0.8rem] mt-4 disabled:cursor-default">
                                                {t("resendVerifCode", { resendableAfter })}
                                            </p>}
                                        className="text-gray-500 text-[0.8rem] mt-4 cursor-pointer hover:text-orange-500 transition-colors disabled:cursor-default"
                                    >
                                        {t("resendVerifBtn")}
                                    </SignUpElements.Action>
                                </div>
                            </SignUpElements.Strategy>
                        </SignUpElements.Step>

                        {/* Control actions */}
                        <div className="w-full mt-8 flex items-center justify-center gap-4 md:gap-3 text-gray-500 text-xs md:text-[0.875rem]">
                            {/* Account exists */}
                            <div className="flex items-center justify-center gap-1.5">
                                <span className="text-gray-500">
                                    {t("signUp.login")}
                                </span>
                                <Link
                                    href="/sign-in"
                                    className="text-orange-500 font-medium hover:underline cursor-pointer"
                                >
                                    {t("signUp.loginAc")}
                                </Link>
                            </div>
                            <span className="hidden md:inline-block">·</span>
                            {/* Language dropdown */}
                            <div>
                                <Languagedropdown color="#6b7280" />
                            </div>
                        </div>
                    </>
                )}
            </Clerk.Loading>
        </SignUpElements.Root>
    )
}

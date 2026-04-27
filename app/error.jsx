"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        console.error("[GlobalError]", error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-white">
            <div className="max-w-md w-full text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        An unexpected error occurred. Try refreshing the page — if the problem persists, contact support.
                    </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                        onClick={reset}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white
                        text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try again
                    </button>
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200
                        text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Go home
                    </a>
                </div>
            </div>
        </div>
    )
}

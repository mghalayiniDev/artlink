"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function AdminError({ error, reset }) {
    useEffect(() => {
        console.error("[AdminError]", error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center p-6">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <div className="space-y-1.5 max-w-sm">
                <p className="text-lg font-bold text-gray-900">Page error</p>
                <p className="text-sm text-gray-400">
                    Something went wrong loading this section. Your data is safe.
                </p>
            </div>
            <button
                onClick={reset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700
                text-white text-sm font-semibold transition-colors cursor-pointer shadow-sm"
            >
                <RefreshCw className="w-4 h-4" />
                Retry
            </button>
        </div>
    )
}

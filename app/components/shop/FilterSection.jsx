"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Plus } from "lucide-react"

export default function FilterSection({ title, isOpen, onToggle, children }) {
    return (
        <div className="border-b border-black">
            <button
                onClick={onToggle}
                type="button" 
                className="w-full flex items-center justify-between py-4.25 group cursor-pointer"
            >
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/70 group-hover:text-foreground transition-colors">
                    {title}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-4 h-4 flex items-center justify-center"
                >
                    <Plus className="w-3 h-3 group-hover:text-foreground transition-colors" />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pb-5">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
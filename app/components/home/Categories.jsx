"use client"

import { categories } from "@/sample"
import ContentWrapper from "../ContentWrapper"
import { motion } from "framer-motion"
import { useTranslations } from "use-intl"
import CategoryCard from "./CategoryCard"

export default function Categories() {
    const t = useTranslations("categories")

    const renderCategores = () => {
        const count = categories.length

        // --- LAYOUT FOR EXACTLY 2 ---
        if (count === 2) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4.25">
                    {categories.slice(0, 2).map((cat, idx) => (
                        <CategoryCard 
                            key={idx}
                            cat={cat}
                            height={"min-h-[350px] md:min-h-[400px] lg:min-h-144"}
                            index={idx}
                        />
                    ))}
                </div>
            )
        }

        // --- LAYOUT FOR EXACTLY 3 ---
        if (count === 3) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.25">
                    {categories.slice(0, 3).map((cat, idx) => (
                        <CategoryCard 
                            key={idx}
                            cat={cat}
                            height={"min-h-[350px] md:min-h-[400px] lg:min-h-144"}
                            index={idx}
                            span={`${idx === (count-1) ? 'col-span-1 md:col-span-2 lg:col-span-1' : 'col-span-1'}`}
                        />
                    ))}
                </div>
            )
        }

        // --- LAYOUT FOR 4+ ---
        if (count >= 4) {
            return (
                <div  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-4.25 md:h-auto lg:h-150">
                    <CategoryCard 
                        cat={categories[0]}
                        height={'min-h-[350px] md:min-h-[400px] lg:min-h-full'}
                        index={0}
                        span={`col-span-1 lg:row-span-2`}
                    />
                    <CategoryCard
                        cat={categories[1]}
                        height={'min-h-[350px] md:min-h-[400px] lg:min-h-full'}
                        index={1}
                        span={`col-span-1 lg:row-span-1`}
                    />
                   <CategoryCard
                        cat={categories[2]}
                        height={'min-h-[350px] md:min-h-[400px] lg:min-h-full'}
                        index={2}
                        span={`col-span-1 row-span-1`}
                    />
                    <CategoryCard
                        cat={categories[3]}
                        height={'min-h-[350px] md:min-h-[400px] lg:min-h-full'}
                        index={3}
                        span={`lg:col-span-2 row-span-1`}
                    />
                </div>
            )
        }
    }

    return (
        categories.length >= 2 && (
            <section className="w-full bg-background py-16 md:py-20 lg:py-24">
                <ContentWrapper>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-16"
                    >
                        <span className="text-orange-500 font-mono text-sm tracking-widest">
                            {t('subheader')}
                        </span>
                        <span className="font-extrabold uppercase text-4xl md:text-5xl text-foreground mt-3 block">
                            {t('header')}
                        </span>
                    </motion.div>

                    {/* Categories grid */}
                    {renderCategores()}
                </ContentWrapper>
            </section>
        )
    )
}
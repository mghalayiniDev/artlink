import { auth } from "@clerk/nextjs/server"
import { unstable_cache } from "next/cache"
import { NextResponse } from "next/server"

const PROJECT_ID = process.env.POSTHOG_PROJECT_ID
const PH_KEY     = process.env.POSTHOG_PERSONAL_API_KEY
const PH_HOST    = (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com")
    .replace("us.i.posthog.com", "us.posthog.com")
    .replace("eu.i.posthog.com", "eu.posthog.com")

async function hql(query, days) {
    const dateFilter = `timestamp >= now() - interval ${days} day`
    const hydrated   = query.replace(/__DATE__/g, dateFilter)

    const controller = new AbortController()
    const timer      = setTimeout(() => controller.abort(), 10_000)

    try {
        const res = await fetch(`${PH_HOST}/api/projects/${PROJECT_ID}/query`, {
            method:  "POST",
            headers: {
                Authorization:  `Bearer ${PH_KEY}`,
                "Content-Type": "application/json",
            },
            body:   JSON.stringify({ query: { kind: "HogQLQuery", query: hydrated } }),
            cache:  "no-store",
            signal: controller.signal,
        })

        if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            throw new Error(body?.detail ?? body?.error ?? `PostHog ${res.status}`)
        }
        const json = await res.json()
        return json.results ?? []
    } finally {
        clearTimeout(timer)
    }
}

// ── Server-side cache: at most 9 PostHog queries per 5 min regardless of
//    how many admins are viewing analytics simultaneously.
//    Keyed by `days` (7 / 30 / 90) → 3 independent cache entries max.
const fetchAnalyticsData = unstable_cache(
    async (days) => {
        const settled = await Promise.allSettled([

            // 1. Overview — pageviews, unique visitors, sessions
            hql(`
                SELECT
                    count()                              AS pageviews,
                    uniqExact(distinct_id)               AS visitors,
                    uniqExact(properties.$session_id)    AS sessions
                FROM events
                WHERE event = '$pageview' AND __DATE__
            `, days),

            // 2. Avg session duration + bounce rate
            hql(`
                SELECT
                    avg(duration)                          AS avg_duration,
                    countIf(pv_count = 1) / count() * 100 AS bounce_rate
                FROM (
                    SELECT
                        properties.$session_id,
                        dateDiff('second', min(timestamp), max(timestamp)) AS duration,
                        countIf(event = '$pageview')                       AS pv_count
                    FROM events
                    WHERE __DATE__
                    GROUP BY properties.$session_id
                )
            `, days),

            // 3. Daily trend
            hql(`
                SELECT
                    toDate(timestamp)          AS date,
                    uniqExact(distinct_id)     AS visitors,
                    count()                    AS pageviews
                FROM events
                WHERE event = '$pageview' AND __DATE__
                GROUP BY date
                ORDER BY date ASC
            `, days),

            // 4. Top pages
            hql(`
                SELECT
                    properties.$pathname       AS page,
                    count()                    AS views,
                    uniqExact(distinct_id)     AS visitors
                FROM events
                WHERE event = '$pageview' AND __DATE__
                  AND page != ''
                GROUP BY page
                ORDER BY views DESC
                LIMIT 10
            `, days),

            // 5. Traffic sources
            hql(`
                SELECT
                    coalesce(nullIf(properties.$referring_domain, ''), 'Direct') AS source,
                    count()                AS visits,
                    uniqExact(distinct_id) AS visitors
                FROM events
                WHERE event = '$pageview' AND __DATE__
                GROUP BY source
                ORDER BY visits DESC
                LIMIT 10
            `, days),

            // 6. Countries
            hql(`
                SELECT
                    coalesce(nullIf(properties.$geoip_country_name, ''), 'Unknown') AS country,
                    uniqExact(distinct_id) AS visitors
                FROM events
                WHERE event = '$pageview' AND __DATE__
                GROUP BY country
                ORDER BY visitors DESC
                LIMIT 10
            `, days),

            // 7. Device types
            hql(`
                SELECT
                    coalesce(nullIf(properties.$device_type, ''), 'Unknown') AS device,
                    uniqExact(distinct_id) AS visitors
                FROM events
                WHERE event = '$pageview' AND __DATE__
                GROUP BY device
                ORDER BY visitors DESC
                LIMIT 5
            `, days),

            // 8. Browsers
            hql(`
                SELECT
                    coalesce(nullIf(properties.$browser, ''), 'Unknown') AS browser,
                    uniqExact(distinct_id) AS visitors
                FROM events
                WHERE event = '$pageview' AND __DATE__
                GROUP BY browser
                ORDER BY visitors DESC
                LIMIT 8
            `, days),

            // 9. OS breakdown
            hql(`
                SELECT
                    coalesce(nullIf(properties.$os, ''), 'Unknown') AS os,
                    uniqExact(distinct_id) AS visitors
                FROM events
                WHERE event = '$pageview' AND __DATE__
                GROUP BY os
                ORDER BY visitors DESC
                LIMIT 6
            `, days),
        ])

        // Extract results — failed queries fall back to empty arrays so partial
        // data still renders instead of the whole page erroring.
        const [
            overviewResult,
            sessionResult,
            trendResult,
            pagesResult,
            referrerResult,
            countryResult,
            deviceResult,
            browserResult,
            osResult,
        ] = settled.map(r => (r.status === "fulfilled" ? r.value : []))

        const [pageviews = 0, visitors = 0, sessions = 0] = overviewResult[0] ?? []
        const [avg_duration = 0, bounce_rate = 0]         = sessionResult[0]  ?? []
        const totalVisitors = visitors || 1

        return {
            overview: {
                pageviews:    Number(pageviews),
                visitors:     Number(visitors),
                sessions:     Number(sessions),
                avg_duration: Math.round(Number(avg_duration)),
                bounce_rate:  Math.round(Number(bounce_rate)),
            },
            trend:     trendResult.map(([date, v, p])        => ({ date, visitors: Number(v), pageviews: Number(p) })),
            topPages:  pagesResult.map(([page, views, v])    => ({ page, views: Number(views), visitors: Number(v), pct: Math.round(Number(v) / totalVisitors * 100) })),
            referrers: referrerResult.map(([source, vis, v]) => ({ source, visits: Number(vis), visitors: Number(v), pct: Math.round(Number(v) / totalVisitors * 100) })),
            countries: countryResult.map(([country, v])      => ({ country, visitors: Number(v), pct: Math.round(Number(v) / totalVisitors * 100) })),
            devices:   deviceResult.map(([device, v])        => ({ device, visitors: Number(v), pct: Math.round(Number(v) / totalVisitors * 100) })),
            browsers:  browserResult.map(([browser, v])      => ({ browser, visitors: Number(v), pct: Math.round(Number(v) / totalVisitors * 100) })),
            os:        osResult.map(([os, v])                 => ({ os, visitors: Number(v), pct: Math.round(Number(v) / totalVisitors * 100) })),
        }
    },
    ["posthog-analytics"],
    { revalidate: 300, tags: ["analytics"] }
)

export async function GET(request) {
    // ── Auth: must be a signed-in admin ──────────────────────────────────────
    const { userId, sessionClaims } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (sessionClaims?.metadata?.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // ── Env guard ─────────────────────────────────────────────────────────────
    if (!PROJECT_ID || !PH_KEY)
        return NextResponse.json({ error: "PostHog not configured" }, { status: 503 })

    // ── Validate + clamp days param ───────────────────────────────────────────
    const raw  = new URL(request.url).searchParams.get("days")
    const days = Math.min(Math.max(parseInt(raw || "30", 10) || 30, 7), 90)

    try {
        const data = await fetchAnalyticsData(days)
        return NextResponse.json(
            { days, ...data },
            { headers: { "Cache-Control": "private, max-age=300" } }
        )
    } catch (err) {
        console.error("[/api/analytics]", err.message)
        return NextResponse.json(
            { error: "Failed to load analytics data. Please try again." },
            { status: 500 }
        )
    }
}

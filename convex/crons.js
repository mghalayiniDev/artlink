import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

crons.interval(
    "release-expired-stock-reservations",
    { minutes: 10 },
    internal.reservations.releaseExpiredReservations,
)

crons.interval(
    "cleanup-old-notifications",
    { hours: 24 },
    internal.notifications.deleteOldNotifications,
)

export default crons
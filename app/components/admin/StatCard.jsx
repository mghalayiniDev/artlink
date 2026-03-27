export default function StatCard({ title, value, Icon, iconColor }) {
    return (
        <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-[1.75rem] font-bold text-card-foreground tracking-tight">{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${iconColor}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    )
}
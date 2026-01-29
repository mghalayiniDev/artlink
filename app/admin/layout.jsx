import AdminSidebar from "../components/admin/AdminSidebar"

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen flex w-full bg-neutral-100/60">
            <AdminSidebar />
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 xl:p-10">
                {children}
            </main>
        </div>
    )
}
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { SidebarNav, MobileNav } from "@/components/sidebar-nav";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex">
        <SidebarNav user={user} />
      </div>

      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        {children}
      </main>

      <div className="md:hidden">
        <MobileNav user={user} />
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}

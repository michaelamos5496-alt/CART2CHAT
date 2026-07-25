import type { Metadata } from "next";
import { cookies } from "next/headers";

import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { requireSuperAdmin } from "@/features/admin/lib/guards";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireSuperAdmin();

  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    cookieStore,
  ] = await Promise.all([supabase.auth.getUser(), cookies()]);
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <AdminSidebar email={user?.email ?? ""} />
      <SidebarInset>
        <header className="border-border/40 flex h-14 shrink-0 items-center gap-2 border-b px-4 sm:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium">Admin</span>
          <div className="ml-auto flex items-center gap-1">
            <ModeToggle />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

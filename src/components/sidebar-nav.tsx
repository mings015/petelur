"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Home,
  Egg,
  Wheat,
  HeartPulse,
  ShoppingCart,
  Wallet,
  Users,
  CheckSquare,
  BarChart2,
  LogOut,
  MoreHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/login/actions";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { AppLogo } from "@/components/common/app-logo";
import type { User, UserRole } from "@/types";

type NavItem = {
  href: string;
  label: string;
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  mobileHidden?: boolean;
  roles?: UserRole[];
};

const ALL_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", shortLabel: "Beranda", icon: LayoutDashboard },
  { href: "/coops", label: "Kandang", icon: Home, mobileHidden: true, roles: ["owner"] },
  { href: "/production", label: "Produksi Telur", shortLabel: "Produksi", icon: Egg },
  { href: "/feed", label: "Manajemen Pakan", shortLabel: "Pakan", icon: Wheat },
  { href: "/health", label: "Kesehatan Ayam", shortLabel: "Kesehatan", icon: HeartPulse },
  { href: "/sales", label: "Penjualan", icon: ShoppingCart, mobileHidden: true, roles: ["owner"] },
  { href: "/finance", label: "Keuangan", icon: Wallet, mobileHidden: true, roles: ["owner"] },
  { href: "/employees", label: "Pegawai", icon: Users, mobileHidden: true, roles: ["owner"] },
  { href: "/reports", label: "Laporan", icon: BarChart2, mobileHidden: true, roles: ["owner"] },
  { href: "/checklist", label: "Checklist", shortLabel: "Tugas", icon: CheckSquare },
];

function getNavItems(role: UserRole) {
  return ALL_NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}

interface SidebarNavProps {
  user: User;
}

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname();
  const navItems = getNavItems(user.role);

  return (
    <aside className="flex flex-col w-64 h-screen sticky top-0 bg-card border-r shrink-0">
      <div className="p-4 border-b">
        <AppLogo size="sm" />
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === href || (href !== "/" && pathname.startsWith(href + "/"))
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <InstallPrompt />

      <div className="px-3 pt-3 border-t">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-muted/50 mb-1">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-primary-foreground">
              {user.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate leading-tight">{user.fullName}</p>
            <span className="text-[10px] text-muted-foreground capitalize leading-tight">
              {user.role === "owner" ? "Pemilik" : "Pekerja"}
            </span>
          </div>
        </div>
      </div>

      <div className="px-3 pb-3">
        <ConfirmDialog
          trigger={
            <button
              type="button"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          }
          title="Konfirmasi Keluar"
          description="Apakah Anda yakin ingin keluar dari sistem?"
          confirmLabel="Keluar"
          variant="destructive"
          onConfirm={logout}
        />
      </div>
    </aside>
  );
}

export function MobileNav({ user }: SidebarNavProps) {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const visibleItems = getNavItems(user.role).filter((item) => !item.mobileHidden);
  const hiddenItems = getNavItems(user.role).filter((item) => item.mobileHidden);

  return (
    <>
      {/* Bottom sheet overlay */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setShowMore(false)}
        />
      )}
      {showMore && (
        <div className="fixed bottom-14 left-0 right-0 z-50 bg-card border-t rounded-t-2xl p-4 space-y-1 md:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Menu Lainnya
            </span>
            <button onClick={() => setShowMore(false)}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          {hiddenItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setShowMore(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === href || (href !== "/" && pathname.startsWith(href + "/"))
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
          <div className="pt-1 border-t mt-2">
            <ConfirmDialog
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              }
              title="Konfirmasi Keluar"
              description="Apakah Anda yakin ingin keluar dari sistem?"
              confirmLabel="Keluar"
              variant="destructive"
              onConfirm={logout}
            />
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex bg-card border-t md:hidden">
        {visibleItems.map(({ href, label, shortLabel, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 px-1 text-[10px] font-medium transition-colors min-w-0",
              pathname === href || (href !== "/" && pathname.startsWith(href + "/"))
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="leading-none truncate w-full text-center">
              {shortLabel ?? label.split(" ")[0]}
            </span>
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2 px-1 text-[10px] font-medium transition-colors min-w-0",
            showMore ? "text-primary" : "text-muted-foreground",
          )}
        >
          <MoreHorizontal className="w-5 h-5 shrink-0" />
          <span className="leading-none">Lainnya</span>
        </button>
      </nav>
    </>
  );
}

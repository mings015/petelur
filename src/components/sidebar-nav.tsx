"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/login/actions";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import type { User, UserRole } from "@/types";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  mobileHidden?: boolean;
  roles?: UserRole[];
};

const ALL_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/coops", label: "Kandang", icon: Home, roles: ["owner"] },
  { href: "/production", label: "Produksi Telur", icon: Egg },
  { href: "/feed", label: "Manajemen Pakan", icon: Wheat },
  { href: "/health", label: "Kesehatan Ayam", icon: HeartPulse },
  { href: "/sales", label: "Penjualan", icon: ShoppingCart, mobileHidden: true, roles: ["owner"] },
  { href: "/finance", label: "Keuangan", icon: Wallet, mobileHidden: true, roles: ["owner"] },
  { href: "/employees", label: "Pegawai", icon: Users, mobileHidden: true, roles: ["owner"] },
  { href: "/reports", label: "Laporan", icon: BarChart2, mobileHidden: true, roles: ["owner"] },
  { href: "/checklist", label: "Checklist", icon: CheckSquare },
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
    <aside className="flex flex-col w-64 min-h-screen bg-card border-r shrink-0">
      <div className="p-4 border-b">
        <p className="font-bold text-lg">Petelur</p>
        <p className="text-xs text-muted-foreground truncate">
          {user.fullName}
        </p>
        <span className="text-xs capitalize text-muted-foreground">
          {user.role}
        </span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
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

      <div className="p-3 border-t">
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
  const navItems = getNavItems(user.role).filter((item) => !item.mobileHidden);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex bg-card border-t md:hidden">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2 px-1 text-xs font-medium transition-colors",
            pathname === href || (href !== "/" && pathname.startsWith(href + "/"))
              ? "text-primary"
              : "text-muted-foreground",
          )}
        >
          <Icon className="w-5 h-5" />
          <span className="leading-none">{label.split(" ")[0]}</span>
        </Link>
      ))}
      <ConfirmDialog
        trigger={
          <button
            type="button"
            className="flex flex-1 flex-col items-center gap-1 py-2 px-1 text-xs font-medium text-muted-foreground w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="leading-none">Keluar</span>
          </button>
        }
        title="Konfirmasi Keluar"
        description="Apakah Anda yakin ingin keluar dari sistem?"
        confirmLabel="Keluar"
        variant="destructive"
        onConfirm={logout}
      />
    </nav>
  );
}

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NewCoopForm } from "@/features/coops/components/NewCoopForm";

export default function NewCoopPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/coops"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold">Tambah Kandang</h1>
      </div>

      <NewCoopForm />
    </div>
  );
}

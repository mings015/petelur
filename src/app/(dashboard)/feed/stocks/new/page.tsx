import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewFeedStockForm } from "@/features/feed/components/NewFeedStockForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewFeedStockPage() {
  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-4">
      <Link
        href="/feed"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Manajemen Pakan
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Jenis Pakan</CardTitle>
        </CardHeader>
        <CardContent>
          <NewFeedStockForm />
        </CardContent>
      </Card>
    </div>
  );
}

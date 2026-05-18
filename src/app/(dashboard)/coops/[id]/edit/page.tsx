import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCoopById } from "@/features/coops/queries";
import { EditCoopForm } from "@/features/coops/components/EditCoopForm";

interface EditCoopPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoopPage({ params }: EditCoopPageProps) {
  const { id } = await params;
  const coop = await getCoopById(id);

  if (!coop) redirect("/coops");

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href={`/coops/${id}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold">Edit Kandang</h1>
      </div>

      <EditCoopForm coop={coop} />
    </div>
  );
}

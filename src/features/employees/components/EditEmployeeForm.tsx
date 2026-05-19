"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateEmployee, deactivateEmployee, reactivateEmployee } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/types";

interface EditEmployeeFormProps {
  employee: User;
}

export function EditEmployeeForm({ employee }: EditEmployeeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      fullName: employee.fullName,
      phone: employee.phone ?? "",
      joinedAt: employee.joinedAt ?? "",
    },
  });

  async function handleUpdate(data: { fullName: string; phone: string; joinedAt: string }) {
    setIsLoading(true);
    setServerError(null);

    const formData = new FormData();
    formData.set("fullName", data.fullName);
    formData.set("phone", data.phone);
    formData.set("joinedAt", data.joinedAt);

    const boundAction = updateEmployee.bind(null, employee.id);
    const result = await boundAction(formData);
    setIsLoading(false);

    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Data pegawai berhasil diperbarui");
    router.push(`/employees/${employee.id}`);
  }

  async function handleToggleActive() {
    setIsLoading(true);
    const action = employee.isActive
      ? deactivateEmployee.bind(null, employee.id)
      : reactivateEmployee.bind(null, employee.id);
    const result = await action();
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(employee.isActive ? "Pegawai dinonaktifkan" : "Pegawai diaktifkan kembali");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <form onSubmit={handleSubmit(handleUpdate)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nama Lengkap</Label>
          <Input id="fullName" type="text" className="h-12 text-base" {...register("fullName")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Nomor Telepon</Label>
          <Input id="phone" type="tel" className="h-12 text-base" placeholder="08xx-xxxx-xxxx" {...register("phone")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="joinedAt">Tanggal Bergabung</Label>
          <Input id="joinedAt" type="date" className="h-12 text-base" {...register("joinedAt")} />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full h-12 text-base">
          {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </form>

      <div className="pt-2 border-t">
        <Button
          type="button"
          variant={employee.isActive ? "outline" : "default"}
          disabled={isLoading}
          className="w-full h-12 text-base"
          onClick={handleToggleActive}
        >
          {employee.isActive ? "Nonaktifkan Pegawai" : "Aktifkan Kembali"}
        </Button>
      </div>
    </div>
  );
}

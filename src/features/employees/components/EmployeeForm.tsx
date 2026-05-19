"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEmployeeSchema, type CreateEmployeeInput } from "../schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmployeeFormProps {
  onSubmit: (data: CreateEmployeeInput) => Promise<void>;
  isLoading?: boolean;
}

export function EmployeeForm({ onSubmit, isLoading = false }: EmployeeFormProps) {
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema) as Resolver<CreateEmployeeInput>,
    defaultValues: { joinedAt: today },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nama Lengkap</Label>
        <Input
          id="fullName"
          type="text"
          className="h-12 text-base"
          placeholder="Nama pegawai"
          aria-invalid={!!errors.fullName}
          {...register("fullName")}
        />
        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          className="h-12 text-base"
          placeholder="email@contoh.com"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          className="h-12 text-base"
          placeholder="Minimal 8 karakter"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Nomor Telepon (opsional)</Label>
        <Input
          id="phone"
          type="tel"
          className="h-12 text-base"
          placeholder="08xx-xxxx-xxxx"
          {...register("phone")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="joinedAt">Tanggal Bergabung (opsional)</Label>
        <Input
          id="joinedAt"
          type="date"
          className="h-12 text-base"
          {...register("joinedAt")}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full h-12 text-base">
        {isLoading ? "Menyimpan..." : "Tambah Pegawai"}
      </Button>
    </form>
  );
}

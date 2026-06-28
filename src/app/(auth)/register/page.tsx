"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import { registerSchema, type RegisterFormValues } from "@/lib/validation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const {
    register: reg,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await register(values.full_name, values.email, values.password);
      toast("Аккаунт создан. Добро пожаловать!");
      router.push("/dashboard");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Не удалось зарегистрироваться", "error");
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-sm">
      <CardContent className="p-6">
        <h1 className="text-xl font-bold">Регистрация</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Создайте аккаунт репетитора за минуту.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <Field label="Имя" htmlFor="full_name" required error={errors.full_name?.message}>
            <Input id="full_name" placeholder="Иван Иванов" {...reg("full_name")} />
          </Field>
          <Field label="Email" htmlFor="email" required error={errors.email?.message}>
            <Input id="email" type="email" placeholder="you@example.com" {...reg("email")} />
          </Field>
          <Field label="Пароль" htmlFor="password" required error={errors.password?.message} hint="Минимум 6 символов">
            <Input id="password" type="password" placeholder="••••••" {...reg("password")} />
          </Field>
          <Field label="Повторите пароль" htmlFor="confirm" required error={errors.confirm?.message}>
            <Input id="confirm" type="password" placeholder="••••••" {...reg("confirm")} />
          </Field>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Создать аккаунт
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Войти
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

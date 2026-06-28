"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import { loginSchema, type LoginFormValues } from "@/lib/validation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export default function LoginPage() {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const {
    register: reg,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      toast("С возвращением!");
      router.push("/dashboard");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Не удалось войти", "error");
    }
  };

  const demoLogin = async () => {
    try {
      const email = "demo@tutorcrm.app";
      const password = "demo123";
      try {
        await login(email, password);
      } catch {
        await register("Демо Репетитор", email, password);
      }
      toast("Вы вошли в демо-аккаунт");
      router.push("/dashboard");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Ошибка демо-входа", "error");
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-sm">
      <CardContent className="p-6">
        <h1 className="text-xl font-bold">Вход</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Войдите, чтобы вести учеников и оплаты.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <Field label="Email" htmlFor="email" required error={errors.email?.message}>
            <Input id="email" type="email" placeholder="you@example.com" {...reg("email")} />
          </Field>
          <Field label="Пароль" htmlFor="password" required error={errors.password?.message}>
            <Input id="password" type="password" placeholder="••••••" {...reg("password")} />
          </Field>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            Войти
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">или</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={demoLogin}>
          <Sparkles className="h-4 w-4" />
          Демо-вход
        </Button>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Нет аккаунта?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

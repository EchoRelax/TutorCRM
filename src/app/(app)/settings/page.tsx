"use client";

import * as React from "react";
import { Save, Loader2, LogOut } from "lucide-react";
import { useData } from "@/context/DataProvider";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import { CURRENCY_OPTIONS } from "@/lib/constants";
import type { Currency } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MenuSelect } from "@/components/ui/menu-select";
import { Field } from "@/components/ui/field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  const { profile, saveProfile } = useData();
  const { logout } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [currency, setCurrency] = React.useState<Currency>("RUB");
  const [duration, setDuration] = React.useState(60);
  const [price, setPrice] = React.useState(1000);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setEmail(profile.email);
      setCurrency(profile.default_currency);
      setDuration(profile.default_lesson_duration);
      setPrice(profile.default_lesson_price);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    try {
      setSaving(true);
      await saveProfile({
        id: profile.id,
        email,
        full_name: fullName,
        default_currency: currency,
        default_lesson_duration: duration,
        default_lesson_price: price,
      });
      toast("Настройки сохранены");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Не удалось сохранить", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Настройки" description="Профиль и параметры по умолчанию" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Профиль</CardTitle>
            <CardDescription>Эти данные используются в интерфейсе</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Имя" htmlFor="full_name">
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Параметры по умолчанию</CardTitle>
            <CardDescription>Подставляются в новые записи</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Валюта по умолчанию">
              <MenuSelect
                value={currency}
                onChange={(v) => setCurrency(v as Currency)}
                options={CURRENCY_OPTIONS}
              />
            </Field>
            <Field label="Длительность занятия (мин)">
              <Input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </Field>
            <Field label="Цена занятия по умолчанию">
              <Input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </Field>
            <Field label="Язык интерфейса">
              <MenuSelect
                value="ru"
                onChange={() => {}}
                disabled
                options={[{ value: "ru", label: "Русский" }]}
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Сохранить настройки
        </Button>
        <Button variant="ghost" onClick={logout} className="text-destructive hover:text-destructive">
          <LogOut className="h-4 w-4" />
          Выйти из аккаунта
        </Button>
      </div>
    </div>
  );
}

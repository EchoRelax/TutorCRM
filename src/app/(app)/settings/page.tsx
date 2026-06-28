"use client";

import * as React from "react";
import { Save, RotateCcw, Loader2, LogOut, Database } from "lucide-react";
import { useData } from "@/context/DataProvider";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import { CURRENCY_OPTIONS, TIMEZONES } from "@/lib/constants";
import type { Currency } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MenuSelect } from "@/components/ui/menu-select";
import { Field } from "@/components/ui/field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function SettingsPage() {
  const { profile, saveProfile, resetDemo } = useData();
  const { logout } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [timezone, setTimezone] = React.useState("Europe/Moscow");
  const [currency, setCurrency] = React.useState<Currency>("RUB");
  const [duration, setDuration] = React.useState(60);
  const [price, setPrice] = React.useState(1000);
  const [saving, setSaving] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setEmail(profile.email);
      setTimezone(profile.timezone);
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
        timezone,
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

  const handleReset = async () => {
    await resetDemo();
    toast("Демо-данные восстановлены");
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
            <Field label="Часовой пояс">
              <MenuSelect
                value={timezone}
                onChange={setTimezone}
                options={TIMEZONES.map((tz) => ({ value: tz, label: tz }))}
              />
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            Хранилище данных
          </CardTitle>
          <CardDescription>
            Данные хранятся локально в браузере (localStorage). Очистка данных браузера удалит их.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="h-4 w-4" />
            Восстановить демо-данные
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Восстановить демо-данные?"
        description="Текущие данные будут заменены демонстрационным набором. Это действие нельзя отменить."
        confirmText="Восстановить"
        destructive
        onConfirm={handleReset}
      />
    </div>
  );
}

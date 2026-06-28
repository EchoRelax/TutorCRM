"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { ShieldCheck, MonitorSmartphone, Trash2, LogOut } from "lucide-react";
import { useToast } from "@/context/ToastProvider";
import {
  disableTwoFactorAction,
  enableTwoFactorAction,
  getTwoFactorStatusAction,
  listSessionsAction,
  revokeOtherSessionsAction,
  revokeSessionAction,
  setupTwoFactorAction,
  deleteAccountAction,
  type SessionInfo,
  type TwoFactorSetup,
} from "@/lib/actions/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

function deviceLabel(ua: string): string {
  const browser = /Edg/.test(ua)
    ? "Edge"
    : /Chrome/.test(ua)
      ? "Chrome"
      : /Firefox/.test(ua)
        ? "Firefox"
        : /Safari/.test(ua)
          ? "Safari"
          : "Браузер";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /iPhone|iPad|Mac OS/.test(ua)
      ? "iOS/macOS"
      : /Android/.test(ua)
        ? "Android"
        : /Linux/.test(ua)
          ? "Linux"
          : "";
  return [browser, os].filter(Boolean).join(" · ") || "Устройство";
}

export function PrivacySection() {
  const { toast } = useToast();
  const router = useRouter();

  const [twoFA, setTwoFA] = React.useState(false);
  const [sessions, setSessions] = React.useState<SessionInfo[]>([]);
  const [setup, setSetup] = React.useState<TwoFactorSetup | null>(null);
  const [setupOpen, setSetupOpen] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const refresh = React.useCallback(async () => {
    try {
      const [enabled, list] = await Promise.all([
        getTwoFactorStatusAction(),
        listSessionsAction(),
      ]);
      setTwoFA(enabled);
      setSessions(list);
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const startSetup = async () => {
    try {
      setBusy(true);
      const s = await setupTwoFactorAction();
      setSetup(s);
      setCode("");
      setSetupOpen(true);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Ошибка", "error");
    } finally {
      setBusy(false);
    }
  };

  const confirmEnable = async () => {
    if (!setup) return;
    try {
      setBusy(true);
      await enableTwoFactorAction(code);
      toast("Двухэтапная аутентификация включена");
      setSetupOpen(false);
      setSetup(null);
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Неверный код", "error");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    try {
      await disableTwoFactorAction();
      toast("Двухэтапная аутентификация отключена");
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Ошибка", "error");
    }
  };

  const revoke = async (id: string) => {
    try {
      await revokeSessionAction(id);
      toast("Сеанс завершён");
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Ошибка", "error");
    }
  };

  const revokeOthers = async () => {
    try {
      await revokeOtherSessionsAction();
      toast("Другие сеансы завершены");
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Ошибка", "error");
    }
  };

  const doDelete = async () => {
    try {
      await deleteAccountAction();
      toast("Аккаунт удалён");
      router.push("/login");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Ошибка", "error");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Конфиденциальность</CardTitle>
        <CardDescription>Безопасность аккаунта и управление сеансами</CardDescription>
      </CardHeader>
      <CardContent className="space-y-0">
        {/* 2FA */}
        <div className="privacy-row">
          <div>
            <p className="flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              Двухэтапная аутентификация
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {twoFA ? "Включена — вход требует код из приложения." : "Выключена — дополнительная защита при входе."}
            </p>
          </div>
          {twoFA ? (
            <Button variant="outline" size="sm" onClick={disable}>
              Отключить
            </Button>
          ) : (
            <Button size="sm" onClick={startSetup} disabled={busy}>
              Включить
            </Button>
          )}
        </div>

        {/* Sessions */}
        <div className="privacy-row">
          <div className="min-w-0 grow">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 font-medium">
                <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
                Активные сеансы
              </p>
              {sessions.length > 1 && (
                <Button variant="ghost" size="sm" onClick={revokeOthers}>
                  <LogOut className="h-4 w-4" />
                  Завершить все остальные
                </Button>
              )}
            </div>
            <ul className="mt-2 space-y-2">
              {sessions.length === 0 ? (
                <li className="text-sm text-muted-foreground">Нет активных сеансов.</li>
              ) : (
                sessions.map((s) => (
                  <li key={s.id} className="session-row">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {deviceLabel(s.userAgent)}
                        {s.current && <span className="badge badge--accent ml-2">Это устройство</span>}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.ip || "IP скрыт"} · {format(parseISO(s.createdAt), "d MMM yyyy, HH:mm", { locale: ru })}
                      </p>
                    </div>
                    {!s.current && (
                      <Button variant="ghost" size="sm" onClick={() => revoke(s.id)}>
                        Завершить
                      </Button>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Delete account */}
        <div className="privacy-row">
          <div>
            <p className="flex items-center gap-2 font-medium text-destructive">
              <Trash2 className="h-4 w-4" />
              Удаление аккаунта
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Удалит аккаунт и все данные (ученики, занятия, оплаты) безвозвратно.
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
            Удалить аккаунт
          </Button>
        </div>
      </CardContent>

      {/* 2FA setup */}
      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent onOpenChange={setSetupOpen}>
          <DialogHeader>
            <DialogTitle>Настройка 2FA</DialogTitle>
            <DialogDescription>
              Отсканируйте QR в приложении-аутентификаторе (Google Authenticator, Authy) и введите код.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="items-center text-center">
            {setup?.qr && (
              <img src={setup.qr} alt="QR-код для 2FA" width={200} height={200} className="mx-auto rounded-md border border-[var(--hairline)]" />
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Не получается отсканировать? Введите ключ вручную:{" "}
              <code className="break-all">{setup?.secret}</code>
            </p>
            <Field label="Код подтверждения (6 цифр)" className="mt-3 text-left">
              <Input
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmEnable()}
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSetupOpen(false)}>
              Отмена
            </Button>
            <Button onClick={confirmEnable} disabled={busy || code.length < 6}>
              Подтвердить и включить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Удалить аккаунт?"
        description="Аккаунт и все связанные данные будут удалены безвозвратно. Это действие нельзя отменить."
        confirmText="Удалить навсегда"
        destructive
        onConfirm={doDelete}
      />
    </Card>
  );
}

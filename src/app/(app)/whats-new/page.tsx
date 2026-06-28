"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface UpdateEntry {
  date: string;
  items: string[];
}

const UPDATES: UpdateEntry[] = [
  {
    date: "Июнь 2026",
    items: [
      "Настройки конфиденциальности: двухэтапная аутентификация, управление сеансами, удаление аккаунта",
      "Единый шрифт Manrope на всём сайте",
      "Календарь выбора даты и времени в фирменном стиле",
      "Попапы: затемнение и лёгкое размытие фона, прокрутка внутри",
      "На дашборде — метрика «Общий доход»",
      "Шторка «Ещё» в мобильной навигации",
      "Тарифы Pro и Lifetime будут доступны после бета-тестирования",
    ],
  },
];

export default function WhatsNewPage() {
  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Что нового?" description="История изменений и новые возможности" />

      {UPDATES.map((entry, ei) => (
        <Card key={ei}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--caramel)]" />
              {entry.date}
            </CardTitle>
            <CardDescription>Изменения в этой версии</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {entry.items.map((it) => (
                <li key={it} className="whatsnew-item">
                  {it}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

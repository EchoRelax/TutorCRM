"use client";

import * as React from "react";
import { X, Sparkles } from "lucide-react";

// Поднимай версию ключа, когда добавляешь новые пункты в UPDATES — тогда блок
// снова покажется 1 раз за новую сессию.
const STORAGE_KEY = "tutorcrm:whatsnew:v1";

interface UpdateEntry {
  title: string;
  items: string[];
}

const UPDATES: UpdateEntry[] = [
  {
    title: "Что нового",
    items: [
      "Календарь выбора даты и времени в фирменном стиле",
      "Попапы: затемнение и лёгкое размытие фона, прокрутка внутри",
      "На дашборде — метрика «Общий доход»",
      "Шторка «Ещё» в мобильной навигации",
      "Тарифы Pro и Lifetime будут доступны после бета-тестирования",
    ],
  },
];

export function WhatsNew() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    try {
      if (!sessionStorage.getItem(STORAGE_KEY)) setShow(true);
    } catch {
      // sessionStorage недоступен
    }
  }, []);

  const close = React.useCallback(() => {
    setShow(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  if (!show) return null;

  const entry = UPDATES[0];

  return (
    <div className="whatsnew animate-slide-in-right" role="status" aria-live="polite">
      <div className="whatsnew-head">
        <span className="whatsnew-title">
          <Sparkles />
          {entry.title}
        </span>
        <button
          type="button"
          className="icon-btn"
          onClick={close}
          aria-label="Закрыть"
        >
          <X />
        </button>
      </div>
      <ul className="whatsnew-list">
        {entry.items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

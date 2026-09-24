# Candy Roses Shop — Storefront (Next.js)

Витрина https://candyrosesshop.com (English, USD). Документация всего проекта и деплой — в репозитории [candyroses-backend](https://github.com/madeburo/candyroses-backend/blob/main/deploy/README.md).

```bash
cp .env.example .env.local   # для локальной разработки
npm install
npm run dev                  # http://localhost:3000 (API должен работать на :4000)
```

Каталожные данные загружаются в Server Components с ISR-кэшем (`src/lib/server-api.ts`); корзина, checkout и кабинет — клиентские компоненты, обращающиеся к `/api/*` того же домена.

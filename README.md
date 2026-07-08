# FlowFinance

FlowFinance sekarang berjalan dengan React, Express API lokal, dan MySQL Laragon.

## Prasyarat

- Node.js
- Laragon/MySQL aktif
- Database MySQL bernama `flowfinance`

## Setup Database

Import schema dan data awal:

```bash
mysql -u root < database/flowfinance.sql
```

Atau kalau database `flowfinance` sudah ada:

```bash
mysql -u root flowfinance < database/flowfinance.sql
```

## Jalankan Development

```bash
npm install
npm run dev
```

Frontend berjalan di `http://localhost:3000`.
API berjalan di `http://localhost:3001`.

## Jalankan Production Lokal

```bash
npm run build
npm start
```

App production akan diserve oleh Express di `http://localhost:3001`.

## Akun Awal

- Admin: `rafiabiassyarif@gmail.com` / `admin123`
- User: `user.demo@flowfinance.com` / `user123`

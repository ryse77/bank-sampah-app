# Deploy ke VPS Contabo

Panduan ini diasumsikan untuk aplikasi `bank-sampah-app` berbasis `Next.js + Prisma + PostgreSQL`, dengan proses aplikasi dijalankan lewat `pm2` dan domain dikelola lewat Cloudflare.

## 1. Setup awal VPS Contabo

Contoh berikut diasumsikan OS `Ubuntu 22.04/24.04`.

### Login dan update server

```bash
ssh root@IP_CONTABO
apt update && apt upgrade -y
timedatectl set-timezone Asia/Jakarta
hostnamectl set-hostname bank-sampah-contabo
```

### Buat user deploy

```bash
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

Sesudah itu login ulang:

```bash
ssh deploy@IP_CONTABO
```

### Install dependency server

```bash
sudo apt install -y curl git nginx ufw postgresql postgresql-contrib
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
node -v
npm -v
pm2 -v
psql --version
```

### Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## 2. Backup dari VPS Biznet

Ada dua opsi backup. Untuk migrasi VPS penuh, saya sarankan pakai `pg_dump` sebagai backup utama. Endpoint backup aplikasi bisa dipakai sebagai cadangan tambahan.

### Cek app dan PM2 di Biznet

```bash
pm2 list
pm2 describe bank-sampah
pm2 logs bank-sampah --lines 100
```

### Ambil file penting

Di Biznet, backup hal berikut:

- source code atau hasil `git clone` + branch aktif
- file `.env`
- dump database PostgreSQL
- konfigurasi Nginx
- daftar PM2

### Backup PostgreSQL

```bash
pg_dump -Fc -U postgres -d bank_sampah_app > bank_sampah_app.dump
pg_dumpall --globals-only -U postgres > pg_globals.sql
```

Kalau ingin format SQL biasa:

```bash
pg_dump -U postgres -d bank_sampah_app > bank_sampah_app.sql
```

### Backup konfigurasi aplikasi

```bash
pm2 save
pm2 startup
cp ~/.pm2/dump.pm2 ~/dump.pm2.backup
sudo cp /etc/nginx/sites-available/default ~/nginx-default.backup
tar -czf bank-sampah-app-files.tar.gz /path/ke/project
```

### Backup tambahan dari aplikasi

Aplikasi ini punya endpoint:

- `GET /api/backup/export`
- `POST /api/backup/import`

Endpoint ini hanya cocok sebagai backup data aplikasi, bukan backup sistem penuh. Batas import saat ini `10 MB`, jadi jangan dijadikan satu-satunya metode kalau data sudah besar.

## 3. Kirim backup ke Contabo

Dari laptop lokal atau antar server:

```bash
scp bank_sampah_app.dump deploy@IP_CONTABO:/home/deploy/
scp pg_globals.sql deploy@IP_CONTABO:/home/deploy/
scp bank-sampah-app-files.tar.gz deploy@IP_CONTABO:/home/deploy/
```

Kalau repo sudah ada di GitHub, biasanya lebih rapi pakai:

- source code: `git clone`
- data: kirim hanya `.dump` dan `.env`

## 4. Restore PostgreSQL di Contabo

### Buat database dan user

Masuk ke PostgreSQL:

```bash
sudo -u postgres psql
```

Lalu jalankan:

```sql
CREATE USER bankapp WITH PASSWORD 'GANTI_PASSWORD_DB';
CREATE DATABASE bank_sampah_app OWNER bankapp;
\q
```

### Restore dump

Kalau pakai custom dump:

```bash
pg_restore -U postgres -d bank_sampah_app --no-owner --role=bankapp /home/deploy/bank_sampah_app.dump
```

Kalau pakai SQL:

```bash
psql -U postgres -d bank_sampah_app < /home/deploy/bank_sampah_app.sql
```

### Verifikasi isi database

```bash
psql -U postgres -d bank_sampah_app -c "\dt"
psql -U postgres -d bank_sampah_app -c "select count(*) from users;"
```

## 5. Deploy aplikasi ke Contabo

### Clone project

```bash
sudo mkdir -p /var/www/bank-sampah-app
sudo chown -R deploy:deploy /var/www/bank-sampah-app
cd /var/www/bank-sampah-app
git clone <URL_REPO_GIT> current
cd current
```

Kalau tidak pakai Git:

```bash
mkdir -p /var/www/bank-sampah-app/current
tar -xzf ~/bank-sampah-app-files.tar.gz -C /
```

### Pasang environment

Gunakan `.env.example` sebagai template, lalu buat `.env` produksi:

```bash
cp .env.example .env
nano .env
```

Minimal isi:

```env
DATABASE_URL="postgresql://bankapp:GANTI_PASSWORD_DB@localhost:5432/bank_sampah_app?schema=public&sslmode=disable"
JWT_SECRET="ISI_SECRET_ACAK_PANJANG"
NEXT_PUBLIC_APP_URL="https://domain-anda.com"
```

### Install dan build

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
```

### Jalankan lewat PM2

Repo ini sudah disiapkan file `ecosystem.config.cjs`.

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
pm2 status
pm2 logs bank-sampah --lines 100
```

## 6. Nginx reverse proxy

Buat file:

```bash
sudo nano /etc/nginx/sites-available/bank-sampah
```

Isi:

```nginx
server {
    listen 80;
    server_name domain-anda.com www.domain-anda.com;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/bank-sampah /etc/nginx/sites-enabled/bank-sampah
sudo nginx -t
sudo systemctl reload nginx
```

## 7. Hubungkan domain di Cloudflare

Di Cloudflare DNS:

- buat `A record` untuk `@` ke `IP_CONTABO`
- buat `A record` untuk `www` ke `IP_CONTABO`

Mode awal yang aman:

- set `DNS only` dulu sampai origin server terverifikasi
- setelah situs normal, baru aktifkan proxy oranye jika diinginkan

Setelah DNS mengarah, uji:

```bash
curl -I http://domain-anda.com
curl -I http://IP_CONTABO
```

## 8. SSL

Kalau ingin origin tetap sederhana, pasang SSL di origin dengan Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d domain-anda.com -d www.domain-anda.com
```

Rekomendasi Cloudflare SSL mode:

- gunakan `Full (strict)` setelah sertifikat origin aktif

## 9. Cutover live tanpa downtime panjang

Urutan aman:

1. Siapkan Contabo sampai app bisa dibuka via IP.
2. Matikan aktivitas admin di Biznet sementara.
3. Ambil backup database paling akhir dari Biznet.
4. Restore ulang dump final ke Contabo.
5. Restart PM2 di Contabo.
6. Ubah DNS Cloudflare ke IP Contabo.
7. Verifikasi login, dashboard, setor sampah, pencairan, laporan.

## 10. Checklist verifikasi setelah live

- `pm2 status` harus `online`
- `curl http://127.0.0.1:3000`
- `sudo nginx -t`
- login admin berhasil
- data user tampil
- input setoran berhasil
- approve pencairan berhasil
- halaman artikel tampil
- endpoint backup export bisa diakses admin

## 11. Rollback plan

Kalau ada masalah setelah cutover:

1. kembalikan DNS Cloudflare ke IP Biznet
2. hidupkan lagi PM2/Nginx di Biznet bila sempat dimatikan
3. analisis log Contabo:

```bash
pm2 logs bank-sampah --lines 200
sudo journalctl -u nginx -n 100 --no-pager
```

## Catatan penting khusus repo ini

- aplikasi berjalan dengan `npm run build` lalu `pm2 -> npm start`
- Prisma memakai `DATABASE_URL` PostgreSQL
- `JWT_SECRET` wajib sama formatnya, tetapi sebaiknya diganti ke secret yang kuat
- jangan salin file `.env` lama tanpa review, terutama jika domain berubah
- jika data besar, utamakan `pg_dump/pg_restore`, bukan endpoint import aplikasi

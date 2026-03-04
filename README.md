# Loyalty App (Next.js + Supabase)

Μια μοντέρνα εφαρμογή επιβράβευσης πελατών με QR codes, φτιαγμένη με **Next.js App Router**, **Tailwind CSS** και **Supabase**.

## Τεχνολογίες

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS 4
- Supabase (Postgres, Auth, Realtime)
- qrcode.react (παραγωγή QR)
- html5-qrcode (σκανάρισμα QR)
- lucide-react (icons)

## Βασική λειτουργία

Η εφαρμογή υποστηρίζει δύο τύπους χρηστών:

- **Πελάτης**: βλέπει το προσωπικό του QR, λαμβάνει δώρα (rewards) και τα εξαργυρώνει.
- **Ιδιοκτήτης**: σκανάρει QR των πελατών, στέλνει δώρα και βλέπει πρόσφατες εξαργυρώσεις.

### Ροή Πελάτη (`/customer`)

1. Ο χρήστης κάνει **Sign Up** ως `Πελάτης` ή **Login** στη σελίδα `/login`.
2. Μετά τη σύνδεση, οδηγείται στη σελίδα `/customer`.
3. Εκεί βλέπει:
   - Το **Supabase user id** του (ως ID Πελάτη).
   - Ένα **QR Code** με τιμή `LOYALTY:{userId}`.
   - Λίστα **"Οι Ανταμοιβές μου"** με τα ενεργά δώρα (`status = pending`).
   - Ενότητα **"Ιστορικό"** με δώρα που έχουν εξαργυρωθεί (`status = used`).
4. Για κάθε pending δώρο υπάρχει κουμπί **"Εξαργύρωση τώρα"**:
   - Ζητά επιβεβαίωση.
   - Αν επιβεβαιωθεί, γίνεται `UPDATE` στο Supabase (`status = "used"`).
   - Στην επιτυχία παίζει animation (πράσινο checkmark) και το δώρο μετακινείται στο ιστορικό.
5. Όλες οι λίστες ενημερώνονται **σε πραγματικό χρόνο** μέσω Supabase Realtime καναλιών.

### Ροή Ιδιοκτήτη (`/owner`)

1. Ο χρήστης κάνει **Sign Up** ως `Ιδιοκτήτης` ή **Login** στη σελίδα `/login`.
2. Μετά τη σύνδεση, οδηγείται στη σελίδα `/owner`.
3. Κύριες λειτουργίες:
   - **Scanner QR Πελατών**:
     - Πατάει **"Έναρξη Σκαναρίσματος"**.
     - Ανοίγει το component `html5-qrcode` και χρησιμοποιεί την κάμερα.
     - Όταν σκαναριστεί QR `LOYALTY:{customerId}`, εμφανίζεται modal:
       - Κείμενο: "Σκανάρατε τον Πελάτη: {customerId}".
       - Πεδίο κειμένου: "Τι δώρο θέλετε να στείλετε;".
       - Κουμπί **"Αποστολή"**, που κάνει `INSERT` στο Supabase:
         - `customer_id`
         - `owner_id` (το Supabase user id του ιδιοκτήτη)
         - `description`
         - `status = "pending"`.
   - **Πρόσφατες Εξαργυρώσεις**:
     - Νέα ενότητα που δείχνει τελευταία δώρα με `status = "used"`.
     - Ενημερώνεται σε real-time μέσω Realtime `UPDATE` events.

### Πίνακες Supabase (ενδεικτικό σχήμα)

Στην Supabase βάση δεδομένων, χρειάζεστε τουλάχιστον:

```sql
-- Πίνακας profiles (συνδέεται με auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('owner', 'customer')),
  created_at timestamp with time zone default now()
);

-- Πίνακας rewards
create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users(id),
  owner_id uuid references auth.users(id),
  description text,
  status text check (status in ('pending', 'used')) default 'pending',
  created_at timestamp with time zone default now()
);
```

> Σημείωση: Ρυθμίστε κατάλληλα RLS policies στην Supabase, ανάλογα με το επίπεδο ασφάλειας που θέλετε.

## Auth & Προστασία Σελίδων

- Auth γίνεται με **Supabase Auth** (email + password).
- Ρόλος (`owner` / `customer`) αποθηκεύεται στον πίνακα `profiles`.
- Συντόμως:
  - `/login`:
    - Είσοδος / Εγγραφή.
    - Επιλογή ρόλου στην εγγραφή, αποθήκευση στο `profiles`.
  - Middleware (`middleware.ts`):
    - Προστατεύει `/customer/*` και `/owner/*`.
    - Αν δεν υπάρχει cookie `loyalty_session`, κάνει redirect στο `/login?redirectTo=...`.
- Στις σελίδες `/customer` και `/owner`:
  - Γίνεται κλήση `supabase.auth.getUser()`.
  - Αν δεν υπάρχει user, redirect σε `/login`.

## Header & Log out

- Το header βρίσκεται στο `src/app/layout.tsx`.
- Το component `HeaderActions` (`src/components/HeaderActions.tsx`):
  - Ανιχνεύει αν υπάρχει ενεργός χρήστης.
  - Εμφανίζει κουμπί **"Log out"** που:
    - Κάνει `supabase.auth.signOut()`.
    - Καθαρίζει το cookie `loyalty_session`.
    - Κάνει redirect στο `/login`.

## Τοπική ανάπτυξη

1. **Εγκατάσταση εξαρτήσεων**

```bash
npm install
```

2. **Ρύθμιση μεταβλητών περιβάλλοντος**

Δημιουργήστε αρχείο `.env.local` στη ρίζα:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_or_publishable_key
```

3. **Εκκίνηση dev server**

```bash
npm run dev
```

Η εφαρμογή θα είναι διαθέσιμη στο `http://localhost:3000`.

## Build & Deploy

Για να ελέγξετε ότι το build λειτουργεί:

```bash
npm run build
```

Η εντολή αυτή **έχει ήδη δοκιμαστεί** και ολοκληρώνεται επιτυχώς με τις τρέχουσες ρυθμίσεις.

## Deploy στο Vercel

Βήματα υψηλού επιπέδου:

1. **Push σε GitHub/GitLab/Bitbucket**
   - Ανεβάστε το repo σε έναν Git provider (π.χ. GitHub).

2. **Δημιουργία Project στο Vercel**
   - Μπείτε στο [Vercel Dashboard](https://vercel.com).
   - Πατήστε **"Add New" → "Project"**.
   - Συνδέστε τον λογαριασμό GitHub (αν δεν το έχετε ήδη κάνει).
   - Επιλέξτε το repo με το Loyalty App.

3. **Ρύθμιση Environment Variables στο Vercel**

Στο project σας στο Vercel:

- Μεταβείτε στο **Settings → Environment Variables**.
- Προσθέστε τις παρακάτω μεταβλητές:

  - **`NEXT_PUBLIC_SUPABASE_URL`**
    - Τιμή: το Project URL από το Supabase (π.χ. `https://xxxx.supabase.co`).
    - Scope: `Production`, `Preview`, `Development` (όπως προτιμάτε).
  - **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
    - Τιμή: το **anon/publishable key** από την καρτέλα **API** του Supabase.
    - Scope: ίδιο όπως παραπάνω.

> Σημαντικό: Οι μεταβλητές που ξεκινούν με `NEXT_PUBLIC_` είναι προσβάσιμες στο browser, κάτι που είναι **αναμενόμενο** για το Supabase anon key.

4. **Trigger Deploy**

- Μόλις αποθηκεύσετε τα Environment Variables, τρέξτε ένα **deploy**:
  - είτε κάνοντας push μια νέα αλλαγή στο main branch,
  - είτε πατώντας **"Redeploy"** στο Vercel.

5. **Έλεγχος παραγωγής**

- Ανοίξτε το Production URL του Vercel.
- Δοκιμάστε:
  - `/login` → εγγραφή ως `Πελάτης`, μετά `/customer`.
  - `/login` → εγγραφή ως `Ιδιοκτήτης`, μετά `/owner`.
  - Σκανάρισμα QR και επιβεβαίωση ότι:
    - Δημιουργούνται εγγραφές στον πίνακα `rewards`.
    - Ο πελάτης βλέπει τα δώρα του και μπορεί να τα εξαργυρώσει.
    - Ο ιδιοκτήτης βλέπει τις **Πρόσφατες Εξαργυρώσεις**.

## Σημειώσεις για παραγωγή

- Φροντίστε να έχετε ρυθμίσει **RLS policies** στην Supabase ανά ρόλο χρήστη.
- Για πραγματικό production, ιδανικά:
  - Αντικαθιστάτε το απλό cookie `loyalty_session` με πιο αυστηρό μηχανισμό session, αν χρειαστεί.
  - Προσθέτετε monitoring/logging για σφαλμάτων.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# loyalty-app

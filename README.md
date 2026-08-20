# AI Farms — Farm Tracker

Three workspaces under one roof, switched from the toggle at the top:
**Poultry**, **Bell Pepper Fields**, and **Whole Farm**.

---

## Poultry

Multi-flock: switch between your Ross 308 broilers and Hy-Line layers, or add a
new batch. Each flock keeps its own daily log, feed, growth curve, breed
standard, sales, litter and vaccinations.

- **Dashboard** — birds, mortality, survival, hen-day % (layers) or **FCR**
  against a Ross 308 target (broilers), revenue / cost / margin, **feed
  run-out projection**, litter age and condition, manure banked.
- **Feed & Inventory** — log purchases here; the running balance updates
  automatically from those purchases *and* from the "feed given" you log
  each day in Daily Log, merged into one chronological ledger. You never
  enter usage twice, and the balance is always correct even if entries are
  logged out of order (e.g. a purchase logged today, then yesterday's usage
  added afterwards). A low-stock banner projects days of feed remaining.
- **Feed Mix** — home-mix ration calculator (see below).
- **Litter & Manure** — litter laid, topped up, turned, changed, and
  **removed to field** as manure, with condition tracking.
- **Growth** — weight samples charted against the flock's breed standard.
- **Sales & Profit** — egg/bird sales, with cost broken into feed, litter and setup.
- **Health** — medications and vaccinations, plus one-click loading of the
  standard Hy-Line or Ross 308 vaccination programme.
- **Reminders** — vaccinations due, feed reorder, litter change, plus your own tasks.

### Feed Mix calculator
Enter your ingredient prices and blend; it returns finished **protein,
calcium and energy** against the target band for the ration type, your
**cost per kg**, the saving versus bagged feed, and the exact **weigh-out in
kg** for your batch size. Recipes save so you can compare blends as maize
prices move.

> The nutrient figures are typical book values for comparing blends and
> catching a bad ratio — not a lab analysis. **Always follow the inclusion
> rate printed on your concentrate bag**, since brands differ. And check your
> maize: mouldy maize carries aflatoxin, which quietly cuts laying, weakens
> shells and can kill birds.

---

## Bell Pepper Fields

Two-field operation with a Field A / Field B / Both selector filtering every view.

- **Dashboard** — plant stand, pest pressure, harvest-hold status, yield,
  revenue / cost / margin, plus alerts.
- **Crop Cycle** — variety, transplant date, live days-after-transplant counter,
  plant count, expected first harvest.
- **Scouting** — pest and disease logging with a pressure trend chart.
- **Spray & Fertigation** — products with **pre-harvest interval** enforcement
  and an active-ingredient rotation warning.
- **Input Stock** — agrochemicals and fertilisers with reorder levels.
- **Harvest & Sales** — kg, grade, price, buyer.
- **Reminders** — harvest holds, scouting due, low input stock.

---

## Whole Farm

Combined profit and loss: poultry margin + pepper margin + a general expense
log (labour, transport, utilities, repairs), plus manure recycled from the
poultry house to the fields. Feed, litter, spray and setup costs are pulled
in automatically — add only what those don't already capture.

---

## Soil Monitoring & Batch Performance

Under **Bell Pepper Fields → Soil & Batches**, the same manure-then-mixed-soil
testing workflow from the AI Farms soil monitoring sheet, now digitised.

### Soil Monitoring
- **Manure pile readings** — sample a few spots before mixing (moisture, EC,
  pH, N, P, K); the app averages them and shows a Fertility (N+P+K) total.
- **Field soil readings** — test several spots in a field on the same day
  after mixing; the app averages the most recent round per field and shows
  Days Since Mix (from the field's Manure Applied date, set in Crop Cycle).
- **Transplant readiness** — a Safe / Caution / Not safe verdict per field,
  following the gate that actually matters: EC and pH. Nitrogen, Phosphorus
  and Potassium are shown for information against **targets you set per
  field** (Crop Cycle → Edit → Soil targets — defaults are typical bell
  pepper ranges, but every farm's soil is different).
- **Retest reminders** — if a field has a manure-applied date and hasn't
  reached Safe yet, a reminder nudges you roughly every 7 days to retest.

### Planting Batches
Each time you transplant, the field's current planting becomes one entry in
its history — a **batch**. Hit **+ New Batch** in Crop Cycle when you replant;
the app archives what was there and starts the new one.

**Batch Performance** (Soil & Batches → Batch Performance) shows, for every
batch a field has ever had: the soil reading closest to its transplant date,
and that batch's actual yield, revenue, cost, and margin — computed from
harvests, sprays, and scouting logged within that batch's own date window.
Nothing needs tagging by hand; the app works out which records belong to
which batch from their dates.

> Batch cost is that batch's own setup cost plus sprays in its window — it
> doesn't include the field's shared structures or general expenses, which
> stay at the field level in the Dashboard and Whole Farm P&L.

---

## Farm Team & Payroll

Under **Whole Farm → Farm Team**, track your farm help and what you pay them.

- **Staff** — name, role, phone, pay type (Daily/Weekly/Monthly), usual rate,
  start date. Mark someone Inactive when they leave; you can only **Delete**
  a staff record outright if they have no payment history yet, so payment
  records never go missing by accident.
- **Payments** — each one is Wage, Advance, Repaid in cash, or Worked off,
  and can be assigned to poultry, bell pepper, or general — down to a
  **specific field or flock**. Picking a staff member auto-suggests their
  usual rate for a Wage payment.
- **Advances** — give someone money ahead of work, and the app tracks what
  they still owe. When they've worked it off, log it as **Worked off** (no
  new cash left the farm, so no new cost — it just clears the balance). If
  they hand cash back instead, log **Repaid in cash** (refunds the cost).
- **Due-payment warnings** — based on pay type and the last wage actually
  logged, the tab flags anyone whose next payment is due or overdue.

Because payments live in the same cost ledger as everything else, they flow
straight into the Whole Farm P&L, and into the specific field or flock's own
cost — the same way Structures & Assets and general expenses already do.

> The general **Labour** category under Whole Farm expenses still exists for
> one-off casual hires you don't want to add as a named staff member. For
> anyone regular, log through Farm Team instead — logging the same payment
> in both places would count it twice.

---

## Structures & assets (net houses, coops)

Big builds — an insect net house, a poultry coop, a drip system, a borehole —
are tracked in **Whole Farm → Structures & assets**, not as ordinary expenses.

Add one with **+ Add structure**, then set:

- **What is it** — net house, coop, irrigation, fencing, etc.
- **Enterprise** — poultry or bell pepper.
- **Which field / flock** — assign it to Field A, Field B, a specific flock, or shared.
- **Amount** and **useful life in years** (sensible defaults are filled in).

The cost is then **spread over its useful life** rather than charged entirely to
the season it was built. A GH₵25,000 net house on a 4-year life charges about
GH₵6,250 a year — so one build doesn't make an otherwise good season look like a
disaster. The assets table shows what you invested, what's been written off, and
what value is left.

Because structures are assigned to a field or flock, **Field A and Field B are
directly comparable** — the pepper field snapshot shows structures and charged
cost per field, so once the second net house is up you can see whether the
netting actually paid for itself.

### Fixing a feed purchase entered wrong

If you saved a purchase without the quantity (or with a wrong cost), open
**Feed & Inventory**, find the record in the **Purchases & adjustments**
table, and tap **Edit**. Correct the amount and save — the running balance
and your feed-cost-per-bird recalculate from the correction immediately,
rather than stacking the fix on top of the mistake. **Delete** is there too,
if a record shouldn't exist at all.

### Litter you clear now, assign to a field later

When you clean the coop, log it under **Litter & Manure → + Log litter**,
action **"Removed to field."** Give it a **Batch label** — e.g. "Broiler coop
clean-out" — so you can tell it apart from any other batch later. If you
don't know which field it's going to yet — it's still composting, or you
haven't decided — choose **"Stored / composting"** as the destination
instead of a field.

That batch shows up under an **awaiting assignment** banner at the top of
the tab, listed by name (or by quantity and date if you skipped the label).
Whenever you actually apply it, find that batch — by its label, in the new
**Batch** column — and tap **Edit**, then change "To field" to the real
field. The manure total for that field updates immediately.

There's no automatic batch tracking beyond this — the app doesn't know which
physical pile is which, only what you tell it. The label is what makes
several stored batches distinguishable later, so it's worth filling in
whenever you're not assigning a field the same day.

---

> Don't enter the same money twice. If you log a net house here, leave that
> field's **Setup cost** in Crop Cycle blank — otherwise it's counted in both
> places and your margin will look worse than it is.

---

## Install on your phone

The tracker is a PWA, so it installs like a normal app — its own icon, no
browser address bar, and it opens offline.

- **Android / Chrome:** an "Install" bar appears in the app; tap it. Or use
  the browser menu → *Install app* / *Add to Home screen*.
- **iPhone / Safari:** tap the **Share** button, then **Add to Home Screen**.
  (iOS gives no install button, so the app shows this instruction instead.)

Once installed it works with no signal: your data is saved on the device and
syncs whenever you're back online.

---

## Login & cloud sync

You sign in with an email and password. The Supabase URL and key are built
into the app, so there is nothing to type on each device — install, sign in,
and your farm data is there.

### If the app says "Saved on this device only"

That means the build had no Supabase details. Either:

- **Best:** set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel and
  **redeploy** — env vars are read at build time, so adding them without a
  redeploy changes nothing. Then close and reopen the installed app.
- **Or, right now:** tap **Set up cloud sync** on the sync bar and paste the
  Project URL and anon key. It checks the connection before saving, and stores
  them on that device.

Installed app still showing the old version after a redeploy? Close it fully and
reopen — the service worker fetches a fresh copy on launch. On Android you can
also clear the app's cache from the browser's site settings.

### One-time setup

1. Create a free project at supabase.com.
2. **SQL Editor → New query**, paste all of `supabase-setup.sql`, and Run.
3. **Authentication → Providers → Email**: make sure Email is enabled.
   If you'd rather skip confirmation emails, turn **Confirm email** off under
   *Authentication → Sign In / Up*.
4. **Project Settings → API**: copy the **Project URL** and the
   **anon public** key. Never use the `service_role` key.
5. In Vercel, add them as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   (see `.env.example`), then redeploy.
6. Open the app, choose **Create an account**, and sign in.
7. Once your account exists, go to **Authentication → Sign In / Up** and turn
   **Allow new users to sign up** OFF, so nobody else can register.

### Vaccinations

Loading a programme creates **scheduled** shots — the app never assumes one was
given. Each appears under **To confirm** in the Health tab with **Done** and
**Not given** buttons, and stays there until you say which. Confirming Done
stamps it with today's date. You can undo a confirmation at any time.

### Security

Each row in `farm_state` is tied to your user id, and row-level security means
the database only ever returns rows belonging to whoever is signed in. The
anon key in the bundle cannot read your records without a valid login.

### How syncing behaves

Sync is **automatic** once you're signed in — you never have to remember to
tap a button:

- A few seconds after you save anything, it's pushed to the cloud on its own.
- Reopening the app, or bringing it back to the foreground after it's been
  backgrounded, triggers a check too.
- **Sync now** and **Pull from cloud** are still there for manual control —
  useful right before you hand the phone to someone else, or if you just want
  to confirm everything's up to date.

**Built-in protection against the failure that matters most:** if a device's
local data gets wiped — storage cleared, app reinstalled, phone reset — it
still starts with a fresh, "just now" timestamp, which could otherwise trick
the app into thinking that empty local copy is the newest version and
pushing it over your real cloud data. Auto-sync checks for this: if a device
looks dramatically emptier than your cloud account, it **pulls your real
data back down instead of overwriting it**, and shows a banner explaining
what happened. This is last-write-wins for genuine edits across devices —
log on two devices without syncing in between and the later push still wins
— but a wipe is never mistaken for a genuine edit.

**Backup / Restore** buttons remain as an extra, offline safety net — worth
using occasionally regardless, since a local file is one thing that doesn't
depend on your connection or your Supabase project being reachable.

If no Supabase keys are configured, the app skips the login screen entirely and
runs purely on-device — no auto-sync, no cloud copy, so Backup/Restore is the
only safety net in that mode.

---

## Deploy

```bash
npm install
npm run dev      # local
npm run build    # production
```

Push to GitHub and import in Vercel as a Vite project.

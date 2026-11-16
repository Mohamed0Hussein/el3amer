# El3amer: design brief

Brief for a designer or design AI. Goal: improve the customer app's UI, using what works in popular grocery delivery apps, without changing what the app does. Screenshots are in `docs/screenshots/` (dark theme, English, plus one Arabic).

## The product

- One neighbourhood grocery store in Cairo (El Matareya). Not a marketplace: one store, one catalogue (up to about 5,000 products).
- Customers order for delivery within a few kilometres, usually in about 30 minutes. Flat delivery fee (currently EGP 20).
- Payment: cash on delivery now, card (Kashier) later.
- Users: local families, many on mid- or low-end Android phones, mixed Arabic and English readers. Arabic is the main language for most of them.
- A separate staff app runs the store. Out of scope here.

## Platform and constraints

- React Native 0.81 with Expo SDK 54 and Expo Router. Android first, iOS possible later.
- Styling is plain `StyleSheet` with our own theme tokens (below). There's no UI kit, and adding one isn't wanted.
- Must stay fully bilingual. Arabic is right-to-left and uses the Almarai font. English uses Figtree.
- Light and dark themes are both required. The system setting decides.
- Must stay fast on cheap phones: no heavy blur, large shadows, video or Lottie on scrolling lists.
- Product photos are mostly taken in the store with a phone (uneven light, hands visible, mixed backgrounds). Many products have no photo yet. The design has to look good anyway.
- Map is OpenStreetMap (Leaflet inside a WebView).
- Icons: Ionicons from `@expo/vector-icons`.

## Current design system

### Colour (light / dark)

| Role | Light | Dark |
| --- | --- | --- |
| Primary (brand orange) 500 | `#C94A0A` | `#FB8B4E` |
| Primary 50 (tinted surfaces) | `#FFF3EB` | `#2A1508` |
| Screen background | `#EFE7DE` | `#14100C` |
| Raised background | `#FFFBF7` | `#1C1712` |
| Card | `#FFFFFF` | `#241E17` |
| Text primary / secondary / tertiary | `#1C1712` / `#443C34` / `#7C6F60` | `#FAF6F2` / `#E7DCD1` / `#A99884` |
| Success / warning / error / info | `#15803D` / `#B45309` / `#DC2626` / `#2563EB` | `#4ADE80` / `#F59E0B` / `#F87171` / `#60A5FA` |

Grays are warm (brown-tinted), 50–900. Each status colour also has a tint set (bg, border, strong, text, solid) for notices and badges. The splash and app icon background is `#E2560F`.

### Type

- Latin: Figtree 400 / 500 / 600 / 700 / 800. Arabic: Almarai 400 / 700 / 800. The wordmark always uses Figtree.
- Sizes: 12, 14, 16 (base), 18, 20, 24, 30.

### Spacing and shape

- Spacing: 4, 8, 12, 16, 20, 24, 32. Screen side padding is about 18–20.
- Radius: 8, 12, 16, 20, and full (pills). Cards use about 16–20. Main buttons are full pills.
- Shadows: soft orange-tinted shadow on primary buttons. Cards are mostly flat.

### Components in use

- Product card (2-column grid): photo, favourite heart, name, unit, price, round "+" button that turns into a − / qty / + stepper.
- "Bought before" row: horizontal compact cards with an "Add" pill.
- Category chips: rounded square icon tile with a coloured tint, label below. Scrolls horizontally.
- Hero banner: orange card with 3 rotating messages.
- Sort control: segmented pill (A–Z, Low, High).
- Bottom tabs: Home, Cart (with count badge), Profile.
- Screen header: round back button plus title.
- Notice boxes using status tints (out of stock, store closed, outside delivery area, promo result).
- Skeleton loaders, empty states, an offline banner, and an "update available" prompt.

## Screens and flows

1. **Sign in / sign up**: tab switch, email and password, Google sign-in, forgot password (code sent by email).
2. **Home**: delivery address at the top (tap to change), greeting, search, hero banner, categories, "Bought before", product count with sort, product grid.
3. **Category**: product grid for one category.
4. **Product details**: big photo, category, name, stock and per-customer limit pills, price per unit, description, delivery time and fee card, "You may also like" row, sticky footer with quantity stepper and Add to Cart. Weighed items (kg / g) step by a set amount, for example 250 g.
5. **Cart**: line items with steppers, subtotal, delivery fee, total, Proceed to Checkout.
6. **Checkout**: address and phone, promo code, payment method, order summary, Confirm order. Notices appear if the store is closed or busy, or the address is outside the delivery area.
7. **Delivery address**: map with a fixed centre pin and a "use my location" button. Below it: whether we deliver there and the fee, then a text field for building, floor and apartment.
8. **Orders and order details**: list with status chips. Details shows the status hero, a timeline (received, being prepared, on the way, delivered), the items, and the missing-items card. When the store is out of something it offers substitutes, and the customer chooses: accept substitutes, complete without missing items, or cancel.
9. **Profile and settings**: account, favourites, address, language, password, privacy policy, terms, delete account.

## Known weak spots

- **Arabic layout isn't mirrored.** Text switches to Arabic but the back button, rows and chevrons stay left-to-right.
- **Photos.** Hand-held shots on grey, plus empty dark boxes when a product has no photo. Cards look uneven.
- **"Fresh" pill.** It shows on every product, coffee included, so it means nothing.
- **Generic home screen.** The hero banner text is placeholder copy, and the home screen has no real promos or sections yet.
- **Typography.** Heavy extra-bold everywhere, with weak hierarchy between title, price and meta text.
- **Uppercase tracked labels** ("FRESH DAILY", "BEVERAGES") feel template-like.
- **Order status.** It's text-heavy. Delivery progress could be clearer at a glance.
- **Dark theme** is the main one people see in screenshots; check that light mode holds up just as well.

## Reference apps

Popular in Egypt and the region: **Breadfast**, **Talabat Mart**, **Rabbit**, **Instashop**, **Carrefour (MAF)**. Global quick commerce: **Blinkit**, **Zepto**, **Getir**, **Instacart**.

Patterns worth looking at:

- Sticky address and delivery-time header.
- Category tiles with real product imagery.
- Persistent mini-cart bar on browse screens.
- Quick-add steppers on cards.
- Reorder ("buy again") rows.
- Clear out-of-stock states.
- Live order tracker with a progress bar.
- Substitution choices shown per item.
- Free-delivery-threshold nudges, which can come later.

## What to deliver

1. A short critique of the current screens against these references, most impactful first.
2. Revised design tokens (colour, type scale with weights, spacing, radius, elevation) that work for light and dark mode and for Arabic and English. Keep the brand orange recognisable.
3. Redesigns of these screens, in Arabic (RTL) and English, light and dark:
   - Home
   - Product card
   - Product details
   - Cart
   - Checkout
   - Order details
4. A product-photo treatment that makes uneven photos and missing photos look consistent, for example a fixed light tile, contain-fit, and a branded placeholder.
5. A component list with states: default, pressed, disabled, out of stock, loading.

Keep it buildable in React Native with `StyleSheet`, Ionicons and the two existing fonts. No new screens or features unless they're flagged as optional.

# Frontend Implementation Notes

Stand: 2026-07-02  
Branch: `feature/frontend-shop-home`

## Ziel

Das Frontend wird mit React, TypeScript, Vite und CoreUI umgesetzt. Der erste Fokus liegt auf einer Shop-Startseite im Stil eines afrikanischen Fashion-/Stoff-Shops und einer sauberen Struktur fuer spaetere Backend-Anbindung.

## Verwendete Technologien

- React: Komponentenbasierte Benutzeroberflaeche.
- TypeScript: Typisierung fuer Komponenten, API-Daten und Props.
- Vite: Entwicklungsserver und Build-Tool.
- React Router: Navigation zwischen Seiten wie Home, Produkte, Warenkorb und Login.
- CoreUI: Basis-CSS und spaeter UI-Komponenten.
- Axios: HTTP-Client fuer Backend-Aufrufe.

## Aktuelle Struktur

```text
frontend/src
├── api
│   ├── axiosClient.ts
│   └── productApi.ts
├── components
│   ├── home
│   │   ├── HeroSection.tsx
│   │   └── IntroSection.tsx
│   ├── layout
│   │   └── SiteHeader.tsx
│   └── product
│       ├── ProductCard.tsx
│       └── ProductSection.tsx
├── pages
│   ├── CartPage.tsx
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── OrdersPage.tsx
│   └── ProductsPage.tsx
├── types
│   └── Product.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Routing

`main.tsx` kapselt die App mit `BrowserRouter`. In `App.tsx` werden die Routen definiert:

- `/` -> HomePage
- `/products` -> ProductsPage
- `/products/:productId` -> ProductDetailPage
- `/cart` -> CartPage
- `/login` -> LoginPage
- `/orders` -> OrdersPage

Der Header verwendet `NavLink`, damit aktive Navigationseintraege spaeter visuell markiert werden koennen.

## Produkt-API

Die Produktdaten sind vorbereitet fuer die Backend-Endpunkte:

- `GET /api/categories`
- `GET /api/products`
- `GET /api/products?categoryId=...&search=...`
- `GET /api/products/{id}`

Die Typen liegen in `types/Product.ts`. Die API-Funktionen liegen in `api/productApi.ts`.

## Produktdetailseite

Die Produktkarten in der Produktuebersicht sind anklickbar und fuehren zu `/products/:productId`.

`ProductDetailPage.tsx` liest die `productId` aus der URL, ruft `getProductById(productId)` auf und zeigt:

- Produktname
- Kategorie
- Preis
- Beschreibung
- Lagerbestand
- Aktiv-Status

Der Button `In den Warenkorb` ist aktuell nur als UI vorbereitet. Die echte Warenkorb-Funktion wird spaeter mit der Cart-API verbunden.

## Auth-Flow

Der Login ist im Frontend vorbereitet und mit der Backend-API verbunden:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/users/me`

Die Dateien dazu:

- `api/authApi.ts`: enthaelt die HTTP-Aufrufe.
- `auth/tokenStorage.ts`: speichert Access- und Refresh-Token in `localStorage`.
- `auth/AuthContext.tsx`: haelt den aktuellen Nutzer im React-State und stellt `login`, `register` und `logout` bereit.
- `api/axiosClient.ts`: haengt den Access-Token automatisch als `Authorization: Bearer ...` an API-Requests.

Wichtig: Weil `axiosClient.ts` zentral ist, muessen spaetere API-Dateien wie Warenkorb, Bestellungen und Ruecksendungen den Token nicht selbst setzen.

## Kundenkonto-Navigation

Der Header trennt oeffentliche Shop-Navigation und Kundenkonto-Funktionen:

- Nicht angemeldet: In der Topbar wird `Anmelden` angezeigt.
- Angemeldet: In der Topbar wird ein Konto-Bereich mit Vorname, `Bestellungen`, `Ruecksendungen` und `Abmelden` angezeigt.
- Die Hauptnavigation bleibt fuer Shop-Bereiche wie Start, Stoffe, Kleidung, Accessoires und Specials reserviert.

## Bestellhistorie

Die Seite `OrdersPage.tsx` ist mit dem Backend-Endpunkt `GET /api/me/orders` vorbereitet.

Die Dateien dazu:

- `types/Order.ts`: beschreibt Bestellungen und Bestellpositionen im Frontend.
- `api/orderApi.ts`: kapselt die HTTP-Aufrufe fuer Bestellungen.
- `pages/OrdersPage.tsx`: zeigt Login-Hinweis, Loading-State, Error-State, Empty-State und Bestellkarten.
- `pages/OrderDetailPage.tsx`: zeigt `GET /api/me/orders/{orderId}` mit Uebersicht und Bestellpositionen.

Wichtig: Die Seite nutzt `useAuth()`. Ohne Login wird kein geschuetzter API-Aufruf gesendet.
In den Bestelldetails wird `returnableQuantity` angezeigt. Nur wenn mindestens ein Artikel ruecksendbar ist, wird der Link zur Ruecksendung angeboten.

## Ruecksendungen

Die Seite `ReturnsPage.tsx` ist mit dem Backend-Endpunkt `GET /api/me/returns` vorbereitet.

Die Dateien dazu:

- `types/ReturnRequest.ts`: beschreibt Ruecksendeanfragen und Ruecksende-Positionen.
- `api/returnApi.ts`: kapselt die HTTP-Aufrufe fuer Ruecksendungen.
- `pages/ReturnsPage.tsx`: zeigt Login-Hinweis, Loading-State, Error-State, Empty-State und Ruecksendekarten.
- `pages/CreateReturnPage.tsx`: laedt `GET /api/me/orders/{orderId}/returnable-items` und erstellt Ruecksendungen.
- `pages/ReturnDetailPage.tsx`: zeigt `GET /api/me/returns/{returnId}`.

Zusaetzlich ist `createReturnRequest(orderId, request)` vorbereitet fuer `POST /api/me/orders/{orderId}/returns`.

Hinweis zum Backend-Contract: `OrderSummaryResponse` verwendet im aktuellen `develop` den Feldnamen `orderDate`. `OrderItemResponse` enthaelt `returnableQuantity`. Deshalb kann das Ruecksendeformular notfalls aus den Bestelldetails ableiten, welche Artikel ruecksendbar sind, falls der separate `returnable-items` Endpunkt in einem Branch noch fehlt.
Der Endpunkt `GET /api/me/orders/{orderId}/returnable-items` liefert `OrderItemResponse` mit `id`. Im Frontend wird dieses Feld in `returnApi.ts` zu `orderItemId` normalisiert, weil `POST /api/me/orders/{orderId}/returns` pro Item `orderItemId` erwartet.

## Warenkorb

Der Warenkorb ist mit der vorhandenen Cart-API verbunden:

- `GET /api/cart/me`
- `POST /api/cart/me/items`
- `PUT /api/cart/items/{itemId}?quantity=...`
- `DELETE /api/cart/items/{itemId}`
- `DELETE /api/cart/me`

Die Dateien dazu:

- `types/Cart.ts`: beschreibt Warenkorb und Warenkorbpositionen.
- `api/cartApi.ts`: kapselt die HTTP-Aufrufe fuer den Warenkorb.
- `pages/CartPage.tsx`: zeigt Warenkorb, Mengenfelder, Entfernen und Leeren.
- `pages/ProductDetailPage.tsx`: legt ein Produkt in den Warenkorb.
- `pages/CheckoutPage.tsx`: erstellt aus dem Warenkorb eine Bestellung ueber `POST /api/cart/checkout`.

Hinweis: Die alten Cart-Endpunkte mit `customerId` bleiben fuer Kompatibilitaet vorhanden. Das Frontend nutzt aber die JWT-basierte Variante und laesst das Backend den Kunden aus dem Token ermitteln.

Backend-Contract-Fix: Der Produktkatalog verwendet `Long` fuer `products.id`. Deshalb wurden `cart_item.product_id` und `order_items.product_id` ebenfalls auf `BIGINT`/`Long` angepasst. Vorher war dort `UUID`, wodurch Produktdetailseite und Warenkorb nicht sauber zusammenpassen konnten.

## Checkout

Der Checkout nutzt den vorhandenen Backend-Endpunkt `POST /api/cart/checkout`.
Das Frontend nutzt die JWT-basierte Variante `POST /api/me/cart/checkout`.

Request-Daten:

- `street`, `zipCode`, `city`: werden im Checkout-Formular eingegeben.

Nach erfolgreicher Bestellung leitet das Frontend auf `/orders/{orderId}` weiter. Der Zahlungsstatus wird im Backend aktuell simuliert.

## Datenfluss auf der Produktseite

`ProductsPage.tsx` laedt beim Anzeigen:

1. Kategorien ueber `getCategories()`.
2. Produkte ueber `getProducts(...)`.
3. Wandelt Backend-Produkte in UI-Produktkarten um.
4. Zeigt Loading-, Error- oder Empty-State an.

Die Produktkarten bleiben dadurch unabhaengig vom Backend-Format. Das macht die UI spaeter leichter wiederverwendbar.

## Styling

Das Styling liegt aktuell global in `index.css`.

Design-Richtung:

- schwarze Topbar
- warmer Orange-/Gold-Akzent
- helle Shop-Flaechen
- afrikanisch inspirierte Muster
- Produktgrid mit Badges und Preis
- responsive Layouts fuer Desktop, Tablet und Mobile

## Naechste sinnvolle Schritte

1. Backend lokal starten und Produkt-API live testen.
2. Seed-Daten fuer Kategorien/Produkte ergaenzen.
3. Login im Browser gegen das echte Backend testen.
4. Bestelldetails im Browser gegen das echte Backend testen.
5. Ruecksendungen und Ruecksendeformular im Browser gegen das echte Backend testen.
6. DTO-Feldnamen mit dem finalen Backend-Branch abgleichen.
7. Warenkorb und Checkout im Browser gegen das echte Backend testen.
8. Optional: Alte Cart-Endpunkte mit `customerId` spaeter entfernen, wenn keine Kompatibilitaet mehr gebraucht wird.

## Wichtige Hinweise

- Keine feste `customerId` im Frontend verwenden.
- Fuer eingeloggte Kunden spaeter immer `/api/me/...` Endpunkte nutzen.
- `axiosClient.ts` ist die zentrale Stelle fuer Backend-Basis-URL und spaeter JWT-Headers.
- API-Typen sollten zum Backend-DTO passen, nicht frei erfunden werden.

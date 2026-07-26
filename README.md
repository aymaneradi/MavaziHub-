# MavaziHub

MavaziHub ist eine webbasierte B2C-E-Commerce-Plattform für traditionelle und modern interpretierte afrikanische Kleidung. Das Projekt besteht aus einem Spring-Boot-Backend, einer PostgreSQL-Datenbank und einem React/Vite-Frontend.

## Projektstruktur

```txt
backend/            Spring Boot REST API
frontend/frontend/  React + Vite Frontend
docker-compose.yml  lokale PostgreSQL-Datenbank
.env.example        Beispiel-Konfiguration für Backend/Docker
```

Hinweis: Die aktuelle Vite-App liegt in `frontend/frontend/`.

## Voraussetzungen

- Java 17 oder neuer
- Maven oder der Maven Wrapper aus dem Backend
- Node.js und npm
- Docker Desktop für PostgreSQL

## Env-Variablen

Die Root-Datei `.env.example` ist die Vorlage für Docker Compose und Backend-Konfiguration. Kopiere sie einmalig zu `.env`:

```powershell
Copy-Item .env.example .env
```

Wichtige Variablen:

```txt
POSTGRES_DB        Name der lokalen Datenbank
POSTGRES_HOST      Host der Datenbank, lokal meistens localhost
POSTGRES_USER      Datenbanknutzer
POSTGRES_PASSWORD  Datenbankpasswort
POSTGRES_PORT      Host-Port für PostgreSQL, aktuell 5433
BACKEND_PORT       Dokumentation des Backend-Ports, aktuell 8080
FRONTEND_PORT      Dokumentation des Frontend-Ports, aktuell 5173
JWT_SECRET_KEY     Base64URL-kodierter JWT-Schlüssel für Signaturen
MAVAZIHUB_MEDIA_DIR lokaler Ordner für hochgeladene Produktbilder, Standard ./media
```

Das Backend liest diese Werte in `backend/src/main/resources/application.yaml`. Wichtig ist besonders `JWT_SECRET_KEY`; der Name muss exakt so heißen.

Das Frontend hat zusätzlich eine eigene Datei:

```txt
frontend/frontend/.env.example
```

Diese wird zu `frontend/frontend/.env` kopiert:

```powershell
Copy-Item frontend\frontend\.env.example frontend\frontend\.env
```

Frontend-Variable:

```txt
VITE_API_BASE_URL=http://localhost:8080/api
```

Vite gibt nur Variablen an den Browser weiter, die mit `VITE_` beginnen. Deshalb steht die API-Adresse im Frontend in `VITE_API_BASE_URL`.

## Datenbank starten

Im Projektwurzelordner:

```powershell
docker compose up -d
```

Prüfen, ob PostgreSQL läuft:

```powershell
docker compose ps
```

Die Datenbank läuft lokal auf Port `5433`, damit sie nicht mit einer eventuell lokal installierten PostgreSQL-Instanz auf `5432` kollidiert.

## Backend starten

Im Backend-Ordner:

```powershell
cd backend
mvn spring-boot:run
```

Alternativ mit Maven Wrapper:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend prüfen:

```txt
http://localhost:8080/api/health
http://localhost:8080/api/health/db
http://localhost:8080/swagger-ui/index.html
```

Erwartung:

```txt
/api/health     meldet status UP
/api/health/db  meldet status UP, wenn PostgreSQL erreichbar ist
Swagger UI      zeigt die dokumentierten REST-Endpunkte
```

## Produktbilder hochladen

Admins und Mitarbeiter können im Adminbereich lokale Produktbilder hochladen. Das Backend speichert die Dateien im lokalen Medienordner und liefert sie über `/media/products/...` aus.

Standard lokal:

```txt
media/products/
```

Der Ordner ist in `.gitignore` ausgeschlossen. Im Repository werden also nicht die hochgeladenen Dateien gespeichert, sondern nur die Bildadressen in der Datenbank.

Optional kann der Speicherort gesetzt werden:

```powershell
$env:MAVAZIHUB_MEDIA_DIR="C:\dev\mavazihub-media"
```

## Frontend starten

Im Frontend-Ordner:

```powershell
cd frontend\frontend
npm install
npm run dev
```

Danach im Browser öffnen:

```txt
http://localhost:5173
```

Für echte Login-, Warenkorb-, Checkout-, Bestell- und Adminfunktionen müssen Datenbank und Backend laufen. Einige Shopseiten haben Fallback-Daten, aber der Kernprozess braucht die API.

## Rollen und Testzugänge

Es gibt keine fest eingebauten Passwörter im Code. Für Tests werden Konten über die normale Registrierung angelegt.

Empfohlene Testkonten:

```txt
Kunde:
customer@mavazihub.test
Demo12345!

Mitarbeiter:
employee@mavazihub.test
Demo12345!

Admin:
admin@mavazihub.test
Demo12345!
```

Vorgehen:

1. Frontend öffnen.
2. Für jedes Testkonto über `/register` registrieren.
3. Der erste Admin muss einmalig per Datenbankrolle hochgestuft werden, weil es vorher noch keinen Admin gibt.

Adminrolle für das erste Admin-Konto setzen:

```powershell
docker compose exec postgres psql -U mavazihub_user -d mavazihub -c "INSERT INTO users_roles (user_id, role_id) SELECT u.id, r.id FROM users u CROSS JOIN roles r WHERE u.email = 'admin@mavazihub.test' AND r.name = 'ROLE_ADMIN' ON CONFLICT DO NOTHING;"
```

Optional Mitarbeiterrolle direkt per Datenbank setzen:

```powershell
docker compose exec postgres psql -U mavazihub_user -d mavazihub -c "INSERT INTO users_roles (user_id, role_id) SELECT u.id, r.id FROM users u CROSS JOIN roles r WHERE u.email = 'employee@mavazihub.test' AND r.name = 'ROLE_EMPLOYEE' ON CONFLICT DO NOTHING;"
```

Alternativ kann der Admin später im Adminbereich unter `/admin/users` Rollen vergeben.

Nach Rollenänderungen ausloggen und wieder einloggen, damit das Frontend die Rollen frisch über `GET /api/users/me` lädt.

## Authentifizierung und Token

Das Frontend speichert keine JWTs dauerhaft in `localStorage`. Nach dem Login setzt das Backend zwei httpOnly-Cookies:

```txt
accessToken   kurzlebiger JWT für geschützte API-Anfragen
refreshToken  länger gültiger Token für Session-Erneuerung
```

Zusätzlich setzt das Backend einen lesbaren `csrfToken`-Cookie. Das Frontend schickt diesen Wert bei schreibenden Anfragen als `X-CSRF-Token`-Header mit.

Wenn der Access Token abläuft, versucht das Frontend automatisch `POST /api/auth/refresh`. Das Backend rotiert dabei den Refresh Token und setzt neue Cookies. Beim Logout wird der Refresh Token widerrufen und alle Auth-Cookies werden gelöscht.

## Rollenmodell

```txt
ROLE_USER:
- Shop nutzen
- Warenkorb und Checkout
- eigene Bestellungen
- eigene Rücksendungen

ROLE_EMPLOYEE:
- Produkte verwalten
- Kategorien verwalten
- Varianten und Lagerbestand verwalten
- Bestellungen verwalten
- Retouren verwalten

ROLE_ADMIN:
- alles von Employee
- Nutzerverwaltung
- Rollen ändern
- Nutzer aktivieren/deaktivieren
```

## Automatische Prüfungen

Frontend:

```powershell
cd frontend\frontend
npm run lint
npm run build
```

Was geprüft wird:

```txt
npm run lint   prüft TypeScript/React-Code mit ESLint
npm run build  führt TypeScript-Check aus und baut das Vite-Produktionsbundle
```

Backend:

```powershell
cd backend
mvn test
```

Was geprüft wird:

```txt
Spring-Kontext startet
Flyway-Migrationen werden validiert
Order-History-Tests laufen
Return-Request-Tests laufen
Controller-Tests für Bestellhistorie und Rücksendungen laufen
```

## Manuelle Testcheckliste

### 1. Öffentlicher Shop

```txt
Startseite öffnen
Produktübersicht /products öffnen
Suche verwenden
Kategorie wechseln
Produktdetail öffnen
Falls Admin/Employee: lokales Produktbild hochladen und Produkt speichern
```

Erwartung:

```txt
Seiten laden ohne Fehler
Produkte werden angezeigt
Filter verändern die Produktliste
Produktdetail zeigt Preis, Kategorie, Verfügbarkeit, Varianten und mehrere Bilder
Hochgeladene Produktbilder erscheinen ohne kaputtes Bildsymbol
```

### 2. Authentifizierung

```txt
Neuen Kunden registrieren
Einloggen
Profil öffnen
Ausloggen
Mit falschem Passwort einloggen
```

Erwartung:

```txt
Registrierung erstellt normales ROLE_USER-Konto
Login setzt Auth-Cookies und lädt Nutzerdaten sowie Rollen
Profil ist nur eingeloggt erreichbar
Falscher Login zeigt Fehlermeldung
Logout entfernt den Zugriff auf geschützte Seiten
```

### 3. Warenkorb und Checkout

```txt
Produkt in Warenkorb legen
Menge erhöhen/verringern
Artikel entfernen
Checkout starten
Adresse eingeben
Zahlungsart simulieren
Bestellung bestätigen
```

Erwartung:

```txt
Warenkorb zeigt Artikel und Summe
Mengenänderung aktualisiert Summe
Checkout hat maximal vier Schritte
Bestellung wird über POST /api/cart/checkout angelegt
Warenkorb ist danach leer
Bestellung erscheint in /orders
```

### 4. Bestellungen und Rücksendungen

```txt
/orders öffnen
Bestelldetail öffnen
Rücksendung starten
Artikel und Menge auswählen
Rücksendung absenden
/returns öffnen
```

Erwartung:

```txt
Bestellhistorie zeigt abgeschlossene Bestellungen
Detailseite zeigt Positionen und eine Status-Timeline
Rücksendung wird über POST /api/returns angelegt
Meine Rücksendungen zeigt den aktuellen Status als Timeline
```

### 5. Admin als Employee

Mit `employee@mavazihub.test` einloggen.

```txt
/admin öffnen
Produkte öffnen
Kategorien öffnen
Bestellungen öffnen
Retouren öffnen
Direkt /admin/users aufrufen
```

Erwartung:

```txt
Employee sieht Dashboard, Produkte, Kategorien, Bestellungen, Retouren
Employee sieht keinen Menüpunkt Nutzer
/admin/users leitet zurück nach /admin
Backend erlaubt Employee keine /api/admin/users/** Endpunkte
```

### 6. Admin als Admin

Mit `admin@mavazihub.test` einloggen.

```txt
/admin öffnen
Produkt anlegen
Produkt bearbeiten
Lokale Produktbilder hochladen
Produkt veröffentlichen/deaktivieren
Variante anlegen
Lagerbestand ändern
Kategorie anlegen/bearbeiten
Bestellstatus ändern
Retourenstatus ändern
Nutzerrollen ändern
Nutzer aktivieren/deaktivieren
Mit deaktiviertem Nutzer erneut einloggen
```

Erwartung:

```txt
Admin sieht alle Adminmenüpunkte
Produkt- und Kategorieänderungen werden gespeichert
Hochgeladene Produktbilder werden als Bildadressen übernommen
Bestellstatus und Retourenstatus werden gespeichert
Rollenänderungen wirken nach erneutem Login
Deaktivierte Nutzer können sich nicht mehr anmelden
```

### 7. Responsive und Tastaturbedienung

Teste im Browser mit schmalem und breitem Viewport:

```txt
ca. 390px  Smartphone
ca. 768px  Tablet
ca. 1280px Desktop
```

Tastaturtest:

```txt
Mit Tab durch Header, Produktkarten, Formulare und Adminmenü gehen
Mit Enter Links und Buttons auslösen
Formulare ohne Maus ausfüllen
Skip-Link "Zum Inhalt springen" testen
```

Erwartung:

```txt
Keine Texte überlappen
Tab-Fokus ist sichtbar
Formulare sind vollständig per Tastatur nutzbar
Tabellen im Adminbereich bleiben auf kleinen Bildschirmen horizontal scrollbar
```

## Bekannte Einschränkungen

```txt
Produkt löschen ist nicht im UI, weil kein finaler Backend-Endpunkt definiert ist.
Kategorie löschen ist nicht im UI, weil kein finaler Backend-Endpunkt definiert ist.
Produktbilder werden lokal im Medienordner gespeichert; eine Cloud- oder CDN-Anbindung ist nicht Teil der Laborversion.
Der erste Admin muss initial per Datenbankrolle gesetzt werden.
Wenn ein Nutzer seine E-Mail ändert, sollte er sich neu einloggen, weil JWTs aktuell die E-Mail als Subject verwenden.
Cookie Secure ist lokal deaktiviert, damit die Entwicklung über http://localhost funktioniert; produktiv müsste HTTPS genutzt werden.
```

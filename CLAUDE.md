# CLAUDE.md – Matteo Shopify téma

Ez a fájl a projekt háttere és szabályai, minden munkamenet elején olvasd el.
**A felhasználóval magyarul kommunikálj.**

## A projekt

- **Matteo**: induló magyar streetwear ruhamárka, főleg melegítőszettekkel (kapucnis pulóver + melegítőnadrág).
- A webshopot Balázs (a repó tulajdonosa, `HorvathBalazs01`) építi egy barátjának, akié a márka.
- Platform: **Shopify**, egyedi Online Store 2.0 témával. A backend (adatbázis, termékek,
  rendelések, vásárlói fiókok, pénztár, fizetés) a Shopifyé, mi **csak a témát** írjuk:
  Liquid + HTML + CSS + JavaScript + JSON.
- A bolt jelenleg **fejlesztői bolt**, jelszóval védve, még nincs élesítve.
- Balázs a Shopify működésével most ismerkedik, ezért a Shopify-specifikus lépéseket
  (admin menük, beállítások) mindig lépésről lépésre, magyar menünevekkel írd le.

## Munkamenet és GitHub

- A repó be van kötve a Shopifyba (**Online áruház → Témák → Csatlakoztatás GitHubról**, `main` branch).
- **A szinkron kétirányú.** Amit a `main`-re pusholunk, megjelenik a Shopifyban; amit a
  témaszerkesztőben átállítanak, azt a Shopify visszacommitolja ide
  (főleg `templates/*.json`, `sections/*-group.json`, `config/settings_data.json`).
  - **Munka előtt mindig `git pull`.**
  - A JSON sablonokban és a `settings_data.json`-ban lehetnek a szerkesztőben beállított értékek
    (kiválasztott kollekciók, képek, szövegek). Ezeket ne írd felül vakon, csak célzottan módosíts.
- Ajánlott: nagyobb változtatásokhoz `dev` branch egy második, nem közzétett témához; ha jó, merge a `main`-be.
- Helyi előnézet: `shopify theme dev --store <bolt>.myshopify.com`
- **Commit előtt futtasd: `shopify theme check`.** Jelenleg 0 hiba, 0 figyelmeztetés – így is maradjon.
- Élő bolton a kódot eddig nem teszteltük; hibánál Balázs képernyőképet küld.

## Design

A design a márka tulajdonosától kapott referencia képből indult (sötét hero, nagyban a szignó logó,
alatta előnysáv és termékrács). Fekete-fehér, letisztult, minimalista vonalak. A barát jóváhagyta az alapot.

### Színpaletta

A `config/settings_schema.json` → Színek alatt állítható, CSS változóként: `snippets/css-variables.liquid`.

| Szerep | Hex | CSS változó |
|---|---|---|
| Mélyfekete (footer) | `#070707` | `--color-bg-deep` |
| Alap háttér | `#0A0A0A` | `--color-bg` |
| Felület (sávok, panelek) | `#121212` | `--color-surface` |
| Vonal, elválasztó | `#1E1E1E` | `--color-line` |
| Erősebb keret | `#4A4A4A` | `--color-line-strong` |
| Képek háttere / helyőrző | `#1A1A1A` | `--color-placeholder` |
| Másodlagos szöveg | `#8A8A8A` | `--color-muted` |
| Hosszabb szöveg | `#B3B3B3` | `--color-text-soft` |
| Fehér: logó, címek, gombok | `#FFFFFF` | `--color-text` |

- Nincs akcentszín: a kiemelés a fehér, a vonal és a térköz.
- A referencia képen a szürke szöveg kb. `#6E6E6E`, de az a fekete háttéren kis méretben nem olvasható
  elég jól (kontraszt), ezért szövegre `#8A8A8A` a minimum. Ne menj ennél sötétebbre.

### Tipográfia

- **Logó:** egyedi kézírásos szignó, képként (`assets/logo.png`, a referencia képről kivágva, ideiglenes;
  vektoros SVG-t még kérni kell). Témabeállításokban cserélhető (`settings.logo`). Render: `{% render 'logo' %}`,
  a szélességet a szülő elem adja.
- **Montserrat** (300 / 400 / 500 / 600): címek, menü, gombok, címkék – NAGYBETŰ, széles betűköz.
  - Szlogen/nagy cím: 300, `letter-spacing: .22em` (osztály: `.display`)
  - Menü, szekciócím, gomb: 500–600, 11–13 px, `.2em`–`.24em`
- **Inter** (400 / 500): folyószöveg, 14–16 px, sormagasság ~1.7.
- A betűk **saját tárhelyről** jönnek (`assets/*.woff2`, `snippets/fonts.liquid`, latin + latin-ext az ő/ű miatt),
  **nem Google Fonts-ról** (teljesítmény + EU-s adatvédelem). Ne tegyél be Google Fonts linket.

### Stílusszabályok

- Sarkok: 0 px, minden szögletes.
- Vonalak: 1 px (`--color-line`, kiemelve fehér).
- Ikonok: vékony, 1.3–1.4 px vonalas inline SVG (`snippets/icon.liquid`). Emojit ne használj.
- Gombok: `.btn` (fehér keretes, átlátszó) és `.btn--solid` (fehér kitöltés, fekete szöveg).
- Szekciócím: `.section-title` (nagybetű + utána vékony vízszintes vonal).
- Termékfotók 4:5 arányúak, sötét / deszaturált stúdiófotók.
- Térköz: 8 px-es rács; szekciók között 72–112 px.
- Mobilon minden működjön (töréspontok: 989 px, 749 px, 480 px); érintési célpont min. 44 px.
- Akadálymentesség: valódi `<button>` / `<a>`, `aria-label` az ikongombokon, `visually-hidden` címkék.

## A téma szerkezete

```
layout/theme.liquid        váz: header-group, main, footer-group, cart-drawer, window.theme (routes, strings)
layout/password.liquid     jelszóoldal váza
config/settings_schema.json témabeállítások (logó, színek, oldalszélesség, kosár típus, ingyenes szállítás határ, social)
locales/hu.default.json    MINDEN felületi szöveg itt van (magyar az alapértelmezett nyelv)
assets/theme.css           összes stílus, szakaszokra bontva
assets/theme.js            drawer-ek, prediktív keresés, hero csúszka, változatválasztó, kosár Ajax API, ajánlások, szűrők
```

**Szekciók**
- `announcement-bar`, `header` (bal + jobb menü, mobil menü drawer, kereső panel) → `header-group.json`
- `footer` (blokkok: brand / menu / text, fizetési ikonok) → `footer-group.json`
- Főoldal (`templates/index.json`): `hero` (diák blokkban, 01/02/03 lapozó, autoplay, swipe),
  `trust-bar` (4 előny), `featured-collection` (Legnépszerűbb termékeink), `collection-tiles` (kategória csempék),
  `about` (Rólunk, `id="rolunk"`), `newsletter` (customer form, `newsletter` tag)
- `main-collection`: fejléc sáv, gyorslinkek (menüből), szűrők (`collection.filters`), rendezés, lapozás
- `main-product`: galéria, blokkok: title, price, variant_picker (radio, swatch, elfogyott áthúzva),
  buy_buttons (Kosárba + „Szettként” párosított termék), perks, description, collapsible, text, @app
- `product-recommendations` (Section Rendering API-val töltődik)
- `main-cart` + `cart-drawer` (statikus szekció, `sections=cart-drawer` paraméterrel frissül)
- `main-search`, `main-page`, `main-404`, `main-list-collections`, `main-password`

**Snippetek:** `product-card`, `price`, `cart-item`, `shipping-bar`, `pagination`, `icon`, `logo`,
`social-links`, `css-variables`, `fonts`, `meta-tags`

### Konvenciók

- Minden felhasználónak látható szöveg a `locales/hu.default.json`-ba, `{{ 'kulcs' | t }}`-vel.
  Kivétel: a szekciók `{% schema %}` címkéi és alapértékei – ezek közvetlenül magyarul vannak.
- Range beállításoknál a `default` legyen a `step` többszöröse a `min`-től számolva (különben a Shopify elutasítja).
- Liquid tag-paraméterben nincs szűrő és nincs `{{ }}` interpoláció: előbb `assign`, utána add át.
- Ne nevezz el változót globális objektum nevére (`collection`, `product` stb.), ha nem az.
- Kosár: a Shopify Ajax API (`/cart/add.js`, `/cart/change.js`, `/cart.js`) + Section Rendering API.
  Pénzformázás mindig a szerveren (`| money`), JS-ben ne formázz árat.
- Árak Liquidben fillérben vannak (×100), HUF-nál is.
- Képek: `image_url` + `image_tag` `widths` és `sizes` paraméterrel; hiányzó képnél `placeholder_svg_tag`.

## Magyar webshop tudnivalók

- Pénznem: HUF, időzóna: Budapest, nyelv: magyar.
- Fizetés: a Shopify Payments 2025 márciusa óta elérhető Magyarországon; Barion / SimplePay alternatíva.
- Számlázás appal: Számlázz.hu vagy Billingo (NAV-kompatibilis).
- Szállítás appal: Foxpost, Packeta, GLS csomagautomaták.
- Kötelező oldalak élesítés előtt: ÁSZF, Adatvédelem, Szállítás, Visszaküldés (14 nap), cégadatok / impresszum.

## Helyőrzők – cserélni kell

- `[EMAIL CÍM]`, `[TELEFONSZÁM]`, `[CÉGNÉV, SZÉKHELY]` a footerben (`footer-group.json`)
- Rólunk szöveg és kép (`index.json` → `about`), aláírás
- Hero képek; a 2. és 3. dia szlogenje kitalált („Az új szett. Most érkezett.”, „Fekete. Fehér. Matteo.”)
- `[ANYAGÖSSZETÉTEL, MOSÁSI ÚTMUTATÓ]` a termékoldalon (`product.json` → `care`)
- A korábbi tervekben szereplő terméknevek („Signature / Essential hoodie”) csak példák voltak
- Ideiglenes logó → vektoros SVG kell

## Teendők / következő lépések

- [ ] Bekötés és első teszt az élő fejlesztői boltban; hibák javítása
- [ ] Menük beállítása (`main-menu` bal oldal; második menü a jobb oldalra: GYIK, Kapcsolat)
- [ ] Hiányzó sablonok: `blog`, `article`, `gift_card`, GYIK oldal (pl. accordion szekció), Kapcsolat oldal (contact form), mérettáblázat oldal
- [ ] Valódi tartalom: termékek, fotók, árak, szövegek, logó
- [ ] Fizetés, szállítás, számlázó app beállítása
- [ ] Élesítés előtt: jogi oldalak, jelszóvédelem levétele, téma közzététele

# Matteo – Shopify téma

Egyedi Shopify (Online Store 2.0) téma a Matteo streetwear márkának. Fekete-fehér, minimalista design.

## Szerkezet

```
layout/      az oldal váza (theme.liquid, password.liquid)
templates/   oldaltípusok JSON-ben (főoldal, kollekció, termék, kosár…)
sections/    szerkeszthető szekciók (hero, termékrács, Rólunk, footer…)
snippets/    újrahasznosítható darabok (termékkártya, ár, ikonok, logó)
assets/      CSS, JavaScript, betűtípusok, logó
config/      témabeállítások (színek, logó, kosár, közösségi linkek)
locales/     magyar szövegek (hu.default.json)
```

## Bekötés a Shopifyba (GitHub)

1. Shopify admin → **Online áruház → Témák**
2. **Téma hozzáadása → Csatlakoztatás GitHubról**
3. Válaszd ki ezt a repót és a `main` branchet.

A szinkron kétirányú: a pusholt változások megjelennek a Shopifyban, a témaszerkesztőben
tett módosításokat pedig a Shopify visszacommitolja ide. Munka előtt mindig: `git pull`.

## Helyi fejlesztés

```bash
npm install -g @shopify/cli
shopify theme dev --store <bolt-neve>.myshopify.com   # élő előnézet a gépeden
shopify theme check                                   # hibakeresés
```

VS Code-ba ajánlott bővítmény: **Shopify Liquid**.

## Első beállítások a boltban

- **Online áruház → Navigáció:** `main-menu` (bal oldali fejléc menü, pl. Kezdőlap, Kollekció, Rólunk),
  és egy második menü a jobb oldalra (pl. GYIK, Kapcsolat), amit a Fejléc szekcióban kell kiválasztani.
- **Testreszabás → Főoldal:** hero képek, Kiemelt termékek kollekciója, kategória csempék kollekciói, Rólunk szöveg és kép.
- **Testreszabás → Témabeállítások:** logó (fehér, átlátszó PNG/SVG), közösségi linkek, ingyenes szállítás értékhatára.
- Termékoldal: a „Szett párja” beállítással a pulóverhez hozzárendelhető a nadrág (és fordítva).
- A termékkártyán az „ÚJ” címke az `uj` vagy `új` taggel jelenik meg.

## Betűtípusok

Montserrat és Inter, a témából betöltve (nem a Google Fonts-ról), SIL Open Font License alatt.

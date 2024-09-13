# Huonekalujen Hinta-arviointi Työkalu

Tämä projekti on Node.js-pohjainen sovellus, joka käyttää Google Gemini AI -mallia huonekalujen hinta-arvioiden tekemiseen ja kuvien analysointiin.

## Ominaisuudet

1. Huonekalujen hinta-arviointi käyttäjän syöttämien tietojen perusteella
2. Huonekalujen tunnistus ja analysointi kuvista (ei vielä käytössä tässä versiossa)
3. Gemini AI -mallin hyödyntäminen tietojen käsittelyssä

## Tiedostorakenne

- `priceAnalysis.js`: Sisältää logiikan hinta-arvioiden tekemiseen Gemini AI:n avulla
- `imageAnalysis.js`: Sisältää logiikan kuvien analysointiin (ei käytössä tässä versiossa)
- `index.js`: Pääsovellustiedosto, joka demonstroi hinta-arvioinnin toimintaa

## Asennus

1. Kloonaa tämä repositorio
2. Asenna riippuvuudet komennolla `npm install`
3. Kopioi `.env.example` tiedosto nimellä `.env`:
   ```
   cp .env.example .env
   ```
4. Avaa `.env` tiedosto ja lisää sinne oma GEMINI_API_KEY


## Käyttö

Aja sovellus komennolla:

```
npm start
```

Tämä suorittaa `index.js`-tiedoston, joka demonstroi hinta-arvioinnin toimintaa kovakoodatulla esimerkillä.

## Toiminnallisuuden kuvaus

1. `priceAnalysis.js`:
   - `estimateFurniturePrice`-funktio ottaa vastaan huonekalun tiedot ja lähettää ne Gemini AI -mallille analysoitavaksi
   - Gemini AI palauttaa hinta-arvion ja muita tietoja JSON-muodossa

2. `imageAnalysis.js`:
   - `analyzeImage`-funktio on suunniteltu analysoimaan kuvia Gemini AI:n avulla
   - Tämä toiminnallisuus ei ole vielä käytössä nykyisessä versiossa

3. `index.js`:
   - Demonstroi hinta-arvioinnin toimintaa kovakoodatulla esimerkillä
   - Tulostaa huonekalun tiedot ja saadun hinta-arvion konsoliin

## Huomioitavaa

- Tämä on prototyyppiversio, joka demonstroi toiminnallisuutta
- Todellisessa sovelluksessa tiedot tulisivat käyttöliittymästä tai API-kutsusta
- Promptia ja mallin asetuksia voi säätää tarpeen mukaan paremman tarkkuuden saavuttamiseksi
- TypeScriptin käyttö parantaisi koodin laatua ja tyypitystä


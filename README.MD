# Sisällysluettelo

1. [Toiminnallisuuden kuvaus](#toiminnallisuuden-kuvaus)
2. [Hyödyllisiä vinkkejä jatkokehitykseen](#hyödyllisiä-vinkkejä-jatkokehitykseen)
3. [LLM-mallien käyttö ja promptien optimointi](#llm-mallien-käyttö-ja-promptien-optimointi)
4. [API-hinnoittelu](#api-hinnoittelu-yksinkertaisia-esimerkkejä-syyskuu-2024)
5. [Hyödyllisiä työkaluja RAG-toteutukseen](#hyödyllisiä-työkaluja-rag-toteutukseen)
6. [Sovelluksen julkaisu CSC Rahti 2:ssa](#sovelluksen-julkaisu-csc-rahti-2ssa-dockerin-avulla---yksinkertainen-ohje)
7. [GitHub-integraatio Rahti 2:ssa](#sovelluksen-julkaisu-csc-rahti-2ssa-github-integraatiolla)
8. [React (Vite) + Node.js sovelluksen tuotanto versiot](#react-vite--nodejs-sovelluksen-tuotanto-versiot)

## Ominaisuudet

Vanhan kalustearvio projektin esimerkki Node.js koodina

1. Huonekalujen tunnistus ja analysointi kuvista
2. Kuvan optimointi ennen analysointia
3. Strukturoidun datan tuottaminen Zod-skeeman avulla
4. OpenAI:n GPT-4 Vision -mallin hyödyntäminen kuva-analyysissa
5. Gemini AI -mallin hyödyntäminen tietojen käsittelyssä

## Tiedostorakenne

- `priceAnalysis.js`: Sisältää logiikan hinta-arvioiden tekemiseen Gemini AI:n avulla
- `ZodExample.js`: Sisältää logiikan kuvien analysointiin ja datan strukturointiin
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

4. `ZodExample.js`:

- `analyzeFurnitureWithZod`-funktio ottaa vastaan kuvatiedoston polun
- Kuva optimoidaan Sharp-kirjaston avulla
- Optimoitu kuva lähetetään OpenAI:n GPT-4 Vision -mallille analysoitavaksi
- Analyysin tulos validoidaan ja muotoillaan Zod-skeeman avulla
- Funktio palauttaa strukturoidun objektin, joka sisältää tiedot analysoidusta huonekalusta

Zod-skeema (`FurnitureAnalysis`) määrittelee seuraavat kentät:

- type: Huonekalun tyyppi
- brand: Valmistaja tai suunnittelija
- model: Mallinimi tai -numero
- color: Pääväri
- dimensions: Mitat (pituus, leveys, korkeus)
- age: Arvioitu ikä vuosissa
- condition: Kunto
- haagaHelia: Onko huonekalu Haaga-Heliasta (boolean) ( Tämä on lisätty vain esimerkin vuoksi )

## Huomioitavaa

- Tämä on prototyyppiversio, joka demonstroi toiminnallisuutta
- Todellisessa sovelluksessa tiedot tulisivat käyttöliittymästä tai API-kutsusta
- Promptia ja mallin asetuksia voi säätää tarpeen mukaan paremman tarkkuuden saavuttamiseksi
- TypeScriptin käyttö parantaisi koodin laatua ja tyypitystä

## Hyödyllisiä vinkkejä jatkokehitykseen

### Structured Output Gemini AI:lla

Gemini AI tukee strukturoitua JSON-muotoista tulostetta. Tämä voi olla hyödyllinen tapa saada johdonmukaisia ja helposti käsiteltäviä vastauksia. Voit määritellä JSON-skeeman joko promptissa tai mallin konfiguraatiossa.

Esimerkki skeeman määrittelystä mallin konfiguraatiossa:

```javascript
const schema = {
  type: SchemaType.OBJECT,
  properties: {
    price: {
      type: SchemaType.NUMBER,
      description: "Estimated price of the furniture",
    },
    confidence: {
      type: SchemaType.STRING,
      description: "Confidence level of the estimation",
    },
  },
  required: ["price", "confidence"],
};

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema,
  },
});
```

Lisätietoja: [Gemini API Structured Output Documentation](https://ai.google.dev/gemini-api/docs/structured-output?lang=node)

### Vercel AI SDK

Vercel AI SDK tarjoaa myös hyvän tavan tuottaa strukturoitua dataa. Se käyttää `zod`-kirjastoa skeemojen määrittelyyn ja validointiin.

Esimerkki tekstin analysoinnista:

```javascript
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const result = await generateObject({
  model: openai("gpt-4-turbo"),
  schema: z.object({
    price: z.number(),
    confidence: z.string(),
  }),
  prompt: "Estimate the price of this furniture...",
});
```

Esimerkki kuvan analysoinnista:

```javascript
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

async function analyzeFurnitureImage() {
  const { object } = await generateObject({
    model: openai("gpt-4o-2024-08-06"),
    maxTokens: 512,
    schema: z.object({
      furniture: z.object({
        type: z.string(),
        material: z.string(),
        color: z.string(),
        estimatedPrice: z.number(),
        condition: z.string(),
      }),
    }),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this furniture image and provide details about it.",
          },
          {
            type: "image",
            image: fs.readFileSync("./path/to/your/furniture/image.jpg"),
          },
        ],
      },
    ],
  });

  console.log(JSON.stringify(object, null, 2));
}

analyzeFurnitureImage();
```

Tässä esimerkissä:

1. Käytämme `gpt-4o-2024-08-06` mallia, joka pystyy analysoimaan kuvia.
2. Määrittelemme skeeman `zod`:in avulla, joka kuvaa odotettua vastausta.
3. Lähetämme sekä tekstimuotoisen ohjeen että kuvan analysoitavaksi.
4. Saamme takaisin strukturoidun objektin, joka sisältää tietoja huonekalusta.

Huomaa, että tarvitset OpenAI API avaimen tätä esimerkkiä varten, ja sinun tulee asentaa tarvittavat riippuvuudet (`@vercel/ai`, `openai`, `zod`).

Lisätietoja: [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)

### Kuvien esikäsittely

Kuvien esikäsittely ennen niiden lähettämistä AI-mallille voi parantaa analyysin tarkkuutta ja nopeutta. Sharp-kirjasto on erinomainen työkalu tähän tarkoitukseen.

Esimerkki Sharp-kirjaston käytöstä:

```javascript
import sharp from "sharp";

const processedImage = await sharp("input.jpg").resize(800, 600).toBuffer();
```

Lisätietoja: [Sharp Documentation](https://sharp.pixelplumbing.com/)

Nämä työkalut ja tekniikat voivat merkittävästi parantaa sovelluksen toiminnallisuutta ja tehokkuutta jatkokehityksessä.

## LLM-mallien käyttö ja promptien optimointi

Tässä projektissa käytetään LLM-malleja (Large Language Models) kuten Gemini ja OpenAI:n GPT-malleja. Tässä on muutamia hyödyllisiä vinkkejä näiden mallien tehokkaaseen käyttöön:

### 1. Promptien suunnittelu

- **Ole tarkka ja yksityiskohtainen**: Mitä tarkempi olet promptissasi, sitä parempia tuloksia saat.
- **Kontekstin antaminen**: Anna mallille riittävästi kontekstia tehtävästä ja halutusta lopputuloksesta.
- **Esimerkkien käyttö**: Few-shot learning -tekniikka, jossa annat mallille esimerkkejä halutusta vastauksesta, voi parantaa tuloksia huomattavasti.

Esimerkki parannellusta promptista:

```javascript
const prompt = `
Olet asiantuntija huonekalujen arvioinnissa. Analysoi seuraava huonekalu:
Tyyppi: ${furniture.type}
Merkki: ${furniture.brand}
Malli: ${furniture.model}
Materiaali: ${furniture.material}
Kunto: ${furniture.condition}
Ikä: ${furniture.age} vuotta

Anna hinta-arvio euroina ja perustele se lyhyesti. Ota huomioon Suomen markkinatilanne.

Esimerkki vastauksesta:
Hinta-arvio: 450 €
Perustelu: Kyseessä on hyväkuntoinen, tunnetun valmistajan tuote. Ikä ja pienet käytön jäljet laskevat hieman arvoa, mutta klassinen design pitää hinnan kohtuullisena.

Anna nyt vastauksesi tästä huonekalusta:
`;
```

### 2. Mallin valinta ja parametrit

- **Mallin valinta**: Geminin ja OpenAI:n eri malleilla on erilaisia vahvuuksia. Kokeile eri malleja löytääksesi parhaiten tehtävään sopivan.
- **Lämpötila (Temperature)**: Matalampi lämpötila (lähellä 0) tuottaa johdonmukaisempia vastauksia, korkeampi (lähellä 1) luovempia.
- **Maksimitokenit**: Säädä tätä tarpeen mukaan, mutta muista, että pidempi vastaus ei aina ole parempi.

Esimerkki mallin konfiguroinnista Geminillä:

```javascript
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 500,
  },
});
```

### 3. Vastausten käsittely ja validointi

- **Strukturoitu data**: Pyydä mallia tuottamaan vastaukset strukturoidussa muodossa (esim. JSON) helpompaa jatkokäsittelyä varten.
- **Validointi**: 
  - Strukturoidun datan kanssa: Jos käytät ennalta määriteltyä skeemaa tai työkalua, joka pakottaa mallin tuottamaan strukturoidun tuloksen, voit vähentää tai jopa poistaa erillisen validoinnin tarpeen.
  - Vapaamuotoisen datan kanssa: On hyvä tarkistaa mallin tuottamat vastaukset. Käytä esimerkiksi Zod-kirjastoa JSON-vastausten validointiin.

### 4. Jatkuva parantaminen

- **Vastausten arviointi**: Seuraa mallien suorituskykyä ja kerää palautetta käyttäjiltä.
- **Promptien iterointi**: Hienosäädä prompteja saadun palautteen perusteella jatkuvasti.
- **RAG (Retrieval-Augmented Generation)**: Harkitse RAG-mallin käyttöönottoa oman datan integroimiseksi LLM:n vastauksiin. Tämä on usein tehokkaampi ja joustavampi vaihtoehto kuin perinteinen fine-tuning.

#### RAG-mallin käyttö

RAG yhdistää tiedonhaun (retrieval) ja tekstin generoinnin, mahdollistaen LLM:n käytön yhdessä ulkoisen tietokannan kanssa. Tämä on erityisen hyödyllistä, kun haluat yhdistää yleisen LLM:n tietämyksen omaan erikoistuneeseen dataasi.

RAG:in etuja:

- **Ajantasaisuus**: Voit päivittää tietokantaa ilman mallin uudelleenkoulutusta.
- **Läpinäkyvyys**: Voit jäljittää, mistä tieto on peräisin.
- **Kustannustehokkuus**: Usein edullisempi kuin koko mallin fine-tuning.

Esimerkki RAG:in implementoinnista:

```javascript
import { OpenAI } from 'langchain/llms/openai';
import { VectorStore } from 'langchain/vectorstores/base';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

async function ragQuery(query, vectorStore) {
  // 1. Hae relevantit dokumentit vektoritietokannasta
  const relevantDocs = await vectorStore.similaritySearch(query, 3);

  // 2. Muodosta konteksti relevanteista dokumenteista
  const context = relevantDocs.map(doc => doc.pageContent).join('\n');

  // 3. Luo prompti, joka yhdistää kyselyn ja kontekstin
  const prompt = `
  Konteksti: ${context}

  Kysymys: ${query}

  Anna vastaus perustuen annettuun kontekstiin ja yleiseen tietämykseesi.
  `;

  // 4. Lähetä prompti LLM:lle
  const llm = new OpenAI();
  const response = await llm.predict(prompt);

  return response;
}

// Käyttöesimerkki
const vectorStore = // ... alusta vektoritietokanta omalla datallasi
const query = "Mikä on tyypillinen hinta Artekin jakkara 60:lle?";
const answer = await ragQuery(query, vectorStore);
console.log(answer);
```

Tämä lähestymistapa mahdollistaa LLM:n vastausten rikastamisen omalla datasetillasi, mikä on erityisen hyödyllistä huonekalujen hinnoittelussa ja arvioinnissa, missä markkinatilanne ja hinnat voivat vaihdella alueittain ja ajan myötä.

Nämä vinkit auttavat sinua hyödyntämään LLM-malleja tehokkaammin projektissasi ja tuottamaan tarkempia ja luotettavampia tuloksia huonekalujen arvioinnissa.

## API-hinnoittelu: Yksinkertaisia esimerkkejä (Syyskuu 2024)

Nämä esimerkit perustuvat GPT-4o-2024-08-06 -mallin hinnoitteluun syyskuussa 2024. Käytämme normaalia hinnoittelua, ei Batch API -hintoja.

### Tekstipohjainen kysely

Esimerkki: Huonekalun hinta-arvio tekstikuvauksen perusteella

```
Kysely: "Anna hinta-arvio ruskealle nahkasohvalle, joka on 3 vuotta vanha ja hyvässä kunnossa."
Vastaus: "Perustuen annettuihin tietoihin, arvioisin ruskean nahkasohvan hinnaksi noin 600-800 euroa käytettynä..."
```

Arvioitu kustannus:

- Syöte: ~30 tokenia ≈ $0.000075 (€0.000069)
- Tuloste: ~50 tokenia ≈ $0.0005 (€0.00046)
- Yhteensä: $0.000575 (€0.00053) (noin 0,05 senttiä)

### Kuvapohjainen kysely

Esimerkki: Huonekalun tunnistus ja hinta-arvio kuvan perusteella

```
[Kuva ruskeasta nahkasohvasta]
Kysely: "Mikä huonekalu tämä on ja paljonko se voisi maksaa?"
Vastaus: "Kuva esittää ruskeaa nahkasohvaa. Se näyttää olevan hyvässä kunnossa..."
```

Arvioitu kustannus:

- Kuva (oletetaan 1024x768px): $0.000638 (€0.00059)
- Tekstisyöte: ~10 tokenia ≈ $0.000025 (€0.000023)
- Tuloste: ~50 tokenia ≈ $0.0005 (€0.00046)
- Yhteensä: $0.001163 (€0.00107) (noin 0,1 senttiä)

### Kokonaiskustannusarvio tyypilliselle käyttötapaukselle

Oletetaan, että sovelluksesi analysoi 100 huonekalua päivässä, joista puolet tekstipohjaisesti ja puolet kuvapohjaisesti:

- 50 tekstipohjaista kyselyä: 50 \* €0.00053 = €0.0265
- 50 kuvapohjaista kyselyä: 50 \* €0.00107 = €0.0535
- Päivittäinen kokonaiskustannus: €0.08 (noin 8 senttiä)

Kuukausikustannus (30 päivää): €2.40

### Huomioitavaa

1. Nämä hinnat perustuvat GPT-4o-2024-08-06 -malliin, joka on edullisempi kuin aiemmat versiot.
2. Todelliset kustannukset voivat vaihdella riippuen tarkan kyselyn ja vastauksen pituudesta sekä kuvan koosta.
3. Suuremmilla volyymeilla voi olla mahdollista käyttää Batch API -hinnoittelua, joka puolittaisi kustannukset.
4. Hinnat voivat muuttua ajan myötä, joten tarkista aina viimeisimmät hinnat OpenAI:n sivustolta.

Nämä esimerkit osoittavat, että GPT-4o-mallin käyttö on suhteellisen edullista. Yksittäiset kyselyt maksavat vain murto-osia sentistä, mikä mahdollistaa laajan käytön ilman merkittäviä kustannuksia.

## Hyödyllisiä työkaluja RAG-toteutukseen

### LangChain

LangChain on monipuolinen sovelluskehys LLM-pohjaisten sovellusten rakentamiseen. Se on saatavilla sekä Python- että Node.js-ympäristöihin, mikä tekee siitä joustavan vaihtoehdon eri kehitysympäristöihin. LangChain tarjoaa useita hyödyllisiä ominaisuuksia:

- Promptien hallinta ja ketjutus
- Muistikomponentit keskusteluhistorian hallintaan
- Integraatiot eri vektoritietokantoihin ja hakumoottoreihin
- Valmiit työkalut RAG-toteutuksiin

LangChainin avulla voit helposti yhdistää eri LLM-malleja, tietokantoja ja muita komponentteja kokonaisvaltaisiksi AI-sovelluksiksi.

### Supabase

Supabase on avoimen lähdekoodin Backend-as-a-Service (BaaS) alusta, joka tarjoaa myös vektoritietokantaominaisuuksia. Se on rakennettu PostgreSQL:n päälle ja tarjoaa ilmaisen tason kehittäjille. Supabasen vektoritietokanta-ominaisuudet tekevät siitä houkuttelevan vaihtoehdon RAG-toteutuksiin:

- Helppo integroida olemassa oleviin sovelluksiin
- Tuki pgvector-laajennukselle, mikä mahdollistaa tehokkaan vektorihakujen
- Skaalautuva ratkaisu, joka kasvaa projektisi mukana
- Yhdistää perinteisen relaatiotietokannan ja vektoritietokannan edut

Supabase tarjoaa myös muita hyödyllisiä palveluita, kuten autentikaation ja reaaliaikaisen tiedonsiirron, mikä tekee siitä monipuolisen alustan kokonaisvaltaisten sovellusten rakentamiseen.

### Datan kerääminen

RAG-mallien tehokas käyttö edellyttää usein oman erikoistuneen datan keräämistä. Web scraping on yksi yleinen menetelmä tähän tarkoitukseen. Tässä muutamia työkaluja ja huomioita web scrapingiin liittyen:

- **Python-työkalut**: 
  - BeautifulSoup: Helppokäyttöinen kirjasto HTML- ja XML-tiedostojen jäsentämiseen
  - Scrapy: Tehokas ja skaalautuva web crawling -sovelluskehys

- **Node.js-työkalut**:
  - Cheerio: Nopea ja joustava kirjasto HTML:n manipulointiin
  - Puppeteer: Googlen kehittämä työkalu, joka mahdollistaa selainpohjaisen scrapingin

Web scraping on tehokas tapa kerätä dataa, mutta huomioi, että jotkin sivustot saattavat rajoittaa tai kieltää scraping-toiminnan.

# Sovelluksen julkaisu CSC Rahti 2:ssa Dockerin avulla - Yksinkertainen ohje

## Tärkeä huomio ennen aloitusta!
Rahti 2:n konttirekisterin käyttöön on kaksi vaihtoehtoa:
1. Luo ImageStream manuaalisesti projektiisi (ohjeet alla)
2. TAI vie ensimmäinen sovellus DockerHubin kautta:
   - Käytä DockerHub-rekisteriä ensimmäisessä julkaisussa
   - Rahti luo onnistuneen julkaisun jälkeen automaattisesti ImageStreamin sovelluksellesi
   - Tämän jälkeen voit siirtyä käyttämään Rahdin omaa konttirekisteriä
   - ImageStream löytyy Builds → ImageStreams -valikosta

## 1. Kirjautuminen Rahtiin

1. Mene Rahti 2:n web-käyttöliittymään
2. Klikkaa oikeasta yläkulmasta nimeäsi -> "Copy login command"
3. Kopioi ja suorita kirjautumiskomento terminaalissa:
```bash
oc login --token=sha256~[sinun-tokenisi] --server=https://api.2.rahti.csc.fi:6443
```

## 2. Kontin rakennus ja testaus

1. Rakenna Docker-image:
```bash
# Peruskomento
docker build -t sovelluksesi-nimi .

# TAI jos haluat välttää välimuistin käyttöä (valinnainen)
docker build --no-cache -t sovelluksesi-nimi .
```

2. Testaa paikallisesti (valinnainen vaihe):
```bash
# Ilman ympäristömuuttujia
docker run -p 3000:3000 sovelluksesi-nimi

# Ympäristömuuttujien kanssa
docker run --env-file .env -p 3000:3000 sovelluksesi-nimi
```

## 3. Imagen vienti rekisteriin

Valitse JOKO Rahti 2:n oma konttirekisteri TAI DockerHub:

### Vaihtoehto A: Rahti 2:n konttirekisteri

(Käytettävissä kun ImageStream on luotu tai ensimmäinen sovellus on viety DockerHubin kautta)

Lisätietoa Rahti 2:n konttirekisterin käytöstä löytyy täältä: https://docs.csc.fi/cloud/rahti2/images/Using_Rahti_2_integrated_registry/

1. Kirjaudu Rahti 2:n rekisteriin:
```bash
docker login -u unused -p $(oc whoami -t) image-registry.apps.2.rahti.csc.fi
```

2. Tagaa ja työnnä image:
```bash
docker tag sovelluksesi-nimi image-registry.apps.2.rahti.csc.fi/projektisi-nimi/sovelluksesi-nimi:latest
docker push image-registry.apps.2.rahti.csc.fi/projektisi-nimi/sovelluksesi-nimi:latest
```

### Vaihtoehto B: DockerHub
```bash
docker tag sovelluksesi-nimi käyttäjätunnus/sovelluksesi-nimi:latest
docker push käyttäjätunnus/sovelluksesi-nimi:latest
```

## 4. Sovelluksen käyttöönotto Rahti 2:ssa

### Vaihtoehto 1: Suora käyttöönotto konttirekisteristä
1. Siirry Rahti 2:n web-konsoliin ja projektiisi
2. Valitse "Add" → "Container images"
3. "Deploy Image" -näkymässä:
   
   **Image-asetukset:**
   - Valitse "Deploy an existing Image from an Image Stream or Image registry"
   - Käytä joko:
     - **DockerHub image**: Syötä suoraan muodossa `käyttäjätunnus/sovellus:latest` (esim. `laguagu/alya:latest`)
     - TAI **Rahti registry**: Valitse sisäisestä rekisteristä
   
   **Huom DockerHub yksityiset kuvat:**
   - Jos käytät yksityistä DockerHub-kuvaa, sinun täytyy luoda "Image pull secret"
   - Määritä secret name, registry (docker.io), käyttäjätunnus ja salasana
   - Julkisille kuville tätä ei tarvita

   **Yleiset asetukset:**
   - **Application**: Valitse/luo sovelluskokoonpano (esim. "alya-avustaja")
   - **Name**: Anna komponentille uniikki nimi
   - **Target port**: Määritä portti, jossa sovelluksesi kuuntelee (esim. 3000)

Rahti luo automaattisesti julkisen URL-osoitteen sovelluksellesi oletusasetuksilla:
- Generoi automaattisesti hostnamen
- Käyttää Edge TLS-terminointia
- Ohjaa HTTP-liikenteen HTTPS:ään

### Vaihtoehto 2: ImageStream luonti ja käyttö
1. Siirry Builds → ImageStreams → Create ImageStream
2. Luo ImageStream:
```yaml
apiVersion: image.openshift.io/v1
kind: ImageStream
metadata:
  name: sovelluksesi-nimi
  namespace: projektisi-nimi
```
3. Käytä luotua ImageStreamia sovelluksen käyttöönotossa

## 5. Deployment-asetukset

Määrittele käyttöönoton yhteydessä:
- **Deployment strategy**: Rolling Update
- **Auto deploy**: Kytke päälle "Auto deploy when new Image is available"
- **Environment Variables**: Lisää tarvittavat ympäristömuuttujat Name/Value -pareina

# Sovelluksen julkaisu CSC Rahti 2:ssa GitHub-integraatiolla

Tämä ohje kattaa:
- Sovelluksen julkaisun Rahti 2:ssa käyttäen GitHub-integraatiota (BuildConfig)
- Automaattisen build-prosessin konfiguroinnin GitHub webhookin avulla

## Tärkeä huomautus (8.11.2024)

**Rahti 2:n nykyinen rajoitus/bugi:** Kun yrität luoda projektin suoraan GitHub-integraatiolla ja omalla Dockerfilella, saat virheilmoituksen "URL is valid but cannot be reached", vaikka SSH-yhteys olisi konfiguroitu oikein.

### Builder Image vs. Oma Dockerfile

Voit valita kahdesta lähestymistavasta:

1. **Käytä Rahdin Builder Imagea (yksinkertaisempi):**
   - Sopii perinteisille Node.js sovelluksille
   - Riittävä useimmille yksinkertaisille web-sovelluksille
   - Ei vaadi omaa Dockerfilea
   - Nopeampi ottaa käyttöön

2. **Käytä omaa Dockerfilea (joustavampi):**
   - Tarvitaan jos sovelluksella on erityisvaatimuksia
   - Vaaditaan esimerkiksi React Viten kanssa
   - Antaa täyden kontrollin build-prosessiin
   - Vaatii kaksivaiheisen setupin:
     1. Luo ensin projekti käyttäen Rahdin valmista Builder Imagea
     2. Muokkaa sen jälkeen BuildConfig käyttämään oman repositorysi Dockerfilea

Valitse lähestymistapa sovelluksesi vaatimusten mukaan. Jos et ole varma, aloita Builder Imagella - voit aina siirtyä käyttämään omaa Dockerfilea myöhemmin.

## Sisällysluettelo
1. [SSH-avaimen luonti ja konfigurointi](#ssh-avaimen-luonti-ja-konfigurointi)
2. [Rahdin konfigurointi](#rahdin-konfigurointi)
3. [Dockerfile konfigurointi (valinnainen)](#dockerfile-konfigurointi-valinnainen)
4. [Webhook määrittely](#webhook-määrittely)

## SSH-avaimen luonti ja konfigurointi

1. **Luo SSH-avainpari:**
```bash
ssh-keygen -t rsa -b 4096 -C "projektisi@example.com" -f ./rahti_github_key
```
* Paina Enter kun kysytään passphrasea (tyhjä on ok)

2. **GitHub konfigurointi:**
* Mene GitHub repositorion asetuksiin → Deploy keys
* Klikkaa "Add deploy key"
* Kopioi julkinen avain tiedostosta: `cat rahti_github_key.pub`
* Anna avaimelle kuvaava nimi (esim. "Rahti Deploy Key")
* Valitse "Allow write access"

## Rahdin konfigurointi

1. **Luo uusi projekti Rahdissa:**
* Valitse +Add → Import from Git
* Git Repo URL: Käytä SSH-muotoista URL:ää (esim. `git@github.com:username/repo.git`)
  * SSH-muodon repositorysta saat avaamalla repon, klikkaamalla Code-painiketta ja valitsemalla SSH
* Paina "Show advanced Git options"

2. **Lisää SSH-avain Rahtiin:**
* Source Secret → Create new Secret
* Authentication type: SSH key
* Kopioi yksityinen avain (`cat rahti_github_key`)
* **Tärkeää:** Sisällytä myös BEGIN ja END rivit

**HUOM!** Tässä vaiheessa Rahti näyttää virheen "URL is valid but cannot be reached" vaikka olet lisännyt SSH-avaimet oikein sekä Rahtiin että GitHubiin. Tämän rajoituksen takia emme voi käyttää Import Strategy → Dockerfile -vaihtoehtoa, vaan meidän on valittava valmis Builder Image (esim. Node.js). Voit jatkaa eteenpäin virheestä huolimatta ja valita Builder Image seuraavissa vaiheissa.

3. **Builder Image määrittely:**
* Valitse sopiva Builder Image (esim. Node.js 18 (UBI 8))
* Määritä sovelluksen portti Advanced options -kohdassa
* Valitse "Create a route" julkista URL:ää varten
* Lopuksi paina "Create"

**Huom:** Jos sovelluksesi toimii tällä konfiguraatiolla, voit jatkaa käyttämään sitä eikä oman Dockerfilen määrittelyä tarvita

## Dockerfile konfigurointi (valinnainen)

Jos Builder Image ei riitä sovelluksesi tarpeisiin:

1. **BuildConfig muokkaus Builder Imagesta omaan Dockerfileen:**
* Siirry Builds → BuildConfig → YAML
* Muuta strategy-osio käyttämään repositorysi Dockerfilea:
```yaml
strategy:
  type: Docker
  dockerStrategy:
    dockerfilePath: Dockerfile
```
Tämä korvaa Builder Image -konfiguraation ja alkaa käyttää repositoryssasi olevaa Dockerfilea.

**Huom!** Dockerfilen luominen on rajattu tämän ohjeen ulkopuolelle. Jos tarvitset apua Dockerfilen luomisessa sovelluksellesi, voit hyödyntää:
- ChatGPT/Claudea
- Dockerin virallista dokumentaatiota jne.

## Webhook määrittely

1. **Hae webhook tiedot Rahdista:**
* BuildConfig:ista löytyy automaattisesti generoidut webhook secretit
* Kopioi GitHub webhook secret (`<buildconfig-nimi>-github-webhook-secret`)

2. **Lisää webhook GitHubiin:**
* GitHub repository → Settings → Webhooks → Add webhook
* Payload URL muoto:
```
https://api.2.rahti.csc.fi:6443/apis/build.openshift.io/v1/namespaces/<projekti>/buildconfigs/<buildconfig>/webhooks/<secret>/github
```
> Voit kopioda URL osoitteen Rahdin käyttöliittymästä Webhooks -> "Copy URL with Secret"

* Content type: `application/json`
* Secret: Sama kuin URL:ssä oleva secret
* SSL verification: Enable
* Just the push event: ✓
* Active: ✓

## Testaus

1. Tee muutos GitHub repositorioon
2. Push main-branchiin
3. Tarkista Rahdista että build käynnistyy automaattisesti

## Huomioitavaa

* Rahti 2:ssa voi esiintyä "URL is valid but cannot be reached" -virhe SSH-yhteyden kanssa
* Ongelma voidaan kiertää käyttämällä ensin Builder Imagea ja sen jälkeen konfiguroimalla BuildConfig käyttämään Dockerfilea
* Varmista että portit täsmäävät konfiguraatiossa

## Hyödyllisiä vinkkejä Rahti/Docker ympäristöön

### Tagien käyttö
Rahti rakentaa kuvan määritellyn tagin perusteella. Voit määritellä tagin itse:
```bash
# Esimerkki uuden version julkaisusta tietyllä tagilla
docker tag sovelluksesi-nimi image-registry.apps.2.rahti.csc.fi/projektisi-nimi/sovelluksesi-nimi:v1.0.0
docker push image-registry.apps.2.rahti.csc.fi/projektisi-nimi/sovelluksesi-nimi:v1.0.0
```
- Jos käytät `:latest` tagia, Rahti rakentaa aina uuden kuvan kun työnnät uuden version
- Voit määritellä Rahdissa tagi tunnisteen itse minkä perusteella auto deploy käynnistyy

### Hyödyllisiä komentoja

**ImageStream ja buildit (pysyvät resurssit):**
```bash
# Tarkista ImageStream ja sen tagit
oc get imagestream
oc describe imagestream sovelluksesi-nimi
```

**Podit (väliaikaiset suoritusympäristöt):**
```bash
# Katso podien tila
oc get pods
# Podit voivat olla tilassa:
# - Running (käynnissä)
# - Pending (käynnistymässä)
# - CrashLoopBackOff (käynnistysongelmia)

# Katso podien logit
oc logs pods/podin-nimi

# Tarkista deployment tila (hallinnoi podeja)
oc get deployment

# Poista pod (Rahti luo automaattisesti uuden)
oc delete pod podin-nimi

# Listaa kaikki
oc get all
```

**Huom! Podeista:**
- Podit ovat väliaikaisia suoritusympäristöjä, jotka voivat tuhoutua ja käynnistyä uudelleen
- Rahti hallinnoi podeja automaattisesti Deploymenttien kautta
- Jos pod tuhoutuu, Rahti käynnistää automaattisesti uuden
- Älä tallenna dataa podiin, sillä se häviää podin tuhoutuessa

### Yleisiä käytäntöjä
1. Testaa ympäristömuuttujat ennen tuotantoon vientiä
2. Tarkista sovelluksen logit käyttöönoton jälkeen
3. Pidä image mahdollisimman pienenä (käytä .dockerignore)

# React (Vite) + Node.js sovelluksen tuotanto versiot

> **HUOM!** Tämä ohje sisältää teoreettisia ratkaisuvaihtoehtoja, joita ei ole vielä täysin testattu Rahti 2 tuotantoympäristössä. Periaatteet ovat oikein, mutta yksityiskohdissa voi olla tarvetta hienosäätöön. Käytä tätä ohjetta pohjana ja muokkaa tarvittaessa omaan käyttöösi sopivaksi.

Tämä ohje kattaa kolme eri tapaa julkaista React (Vite) + Node.js sovellus Rahdissa.

## Vaihtoehto A: Yksinkertainen ratkaisu (ilman erillistä DockerFileä)

Tämä on helpoin tapa, jos et halua käyttää Dockeria itse vaan antaa Rahdin hoitaa kontituksen:

1. Tee React-sovelluksen build:
```bash
cd frontend-repo
npm run build
```

2. Valmistele backend:
```bash
cd backend-repo
mkdir client      # Luo kansio frontend buildille
```

3. Kopioi frontend build backendiin:
- Kopioi `frontend-repo/dist` -kansio `backend-repo/client/dist` -kansioon

4. Muokkaa backend/index.js:
```javascript
const express = require('express');
const path = require('path');
const app = require('./app');
require('dotenv').config();

// Frontend buildin tarjoilu
app.use(express.static(path.join(__dirname, 'client/dist')));

// Tämä pitää olla API-reittien jälkeen
// Handlaa client-side reitityksen
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

**Huom!** 
- Kun käynnistät sovelluksen `npm start` komennolla, sekä backend että frontend pyörivät samassa portissa (8080)
- Frontend build on staattista sisältöä, jota backend tarjoilee
- Ei tarvetta erilliselle frontend-palvelimelle
- Kaikki API-kutsut menevät samaan osoitteeseen missä frontend pyörii

## Vaihtoehto B: Docker Compose (monorepo-ratkaisu)

1. Projektirakenne:
```
project/
├── backend/
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json
├── docker-compose.yml
└── Dockerfile
```

2. Dockerfile:
```dockerfile
FROM node:18-alpine
WORKDIR /app

# Kopioi package.json tiedostot
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Asenna riippuvuudet
RUN npm install
RUN cd frontend && npm install
RUN cd backend && npm install

# Kopioi ja buildaa
COPY . .
RUN cd frontend && npm run build
RUN mkdir -p backend/client
RUN cp -r frontend/dist backend/client/

EXPOSE 8080
CMD ["node", "backend/index.js"]
```

3. docker-compose.yml:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
      - OPENAI_KEY=your_key_here
```

## Vaihtoehto C: Erillinen Backend API

Backend toimii itsenäisenä API:na Rahdin Node.js samplen avulla rakennettuna. Frontend tarvitsee oman Dockerfilen, jos haluat vain kontittaa Vite-sovelluksen ja kutsua backend API:a.

### 1. Backend API:n käyttö
Backend toimii jo Rahdissa (esim. URL: https://backend-projektisi.rahtiapp.fi):
```javascript
const express = require('express');
const cors = require('cors');
const app = require('./app');
require('dotenv').config();

// CORS asetukset - lisää frontend URL
app.use(cors({
  origin: ['https://frontend-projektisi.rahtiapp.fi']
}));

// API reitit...
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### 2. Frontend setup (Vite)

1. Lisää Dockerfile frontend-kansioon:
```dockerfile
# Build vaihe
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Tuotantovaihe
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN npm install -g serve
EXPOSE 8080
CMD ["serve", "-s", "dist", "-p", "8080"]
```

### Serve-työkalun käyttö

* Dockerfilessa käytetty komento `serve -s dist` on tarkoitettu SPA-sovelluksille
* `-s` tai `--single` lippu:
  * Ohjaa kaikki pyynnöt index.html:ään
  * Välttämätön SPA-reitityksen toiminnalle (React Router, Vue Router jne.)
* **Jos sovelluksesi EI ole SPA:**
  * Poista `-s` lippu komennosta 
  * Käytä: `CMD ["serve", "dist", "-p", "8080"]`
  * Soveltuu tavallisille staattisille sivuille (multi-page)

2. Lisää .dockerignore frontend-kansioon:
```
node_modules
dist
.env
```

3. Määritä backendin URL frontendissä:
```javascript
// src/config.js
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

// Käyttö komponenteissa
const response = await fetch(`${BACKEND_URL}/api/endpoint`, {
  method: "POST",
  body: formData,
});
```

### Huomioita
- Frontend käyttää porttia 8080 (Rahdin vaatimus tässä esimerkissä)
- CORS-asetusten pitää sallia frontend URL
- Rahti luo automaattisesti julkisen URL:n frontendille

### Ympäristömuuttujat ja Tietoturva
- **API-reittien suojaus:** Käytä aina asianmukaista suojausta
  - API-avain (VITE_API_KEY)
  - JWT token
  - Muut autentikaatiomenetelmät

```env
VITE_BACKEND_URL=https://backend-projektisi.rahtiapp.fi
VITE_API_KEY=your-secret-api-key
```

## Yhteenveto

Valitse ratkaisu tarpeidesi mukaan:

A. **Yksinkertainen ratkaisu**: Vie Vite build backendiin
   - Helpoin toteuttaa
   - Ei vaadi Dockeria
   - Kaikki yhdessä palvelussa

B. **Docker-ratkaisu**: Yhdistä frontend ja backend
   - Monorepo-lähestymistapa
   - Helppo ylläpitää
   - Hyvä kehitysympäristö

C. **Erillinen API**: Pidä frontend ja backend erillään
   - Selkeä jako palveluiden välillä
   - Skaalautuu hyvin
   - Vaatii CORS-konfiguraation

Tärkeimmät muistettavat asiat:
1. Käytä oikeaa porttia Rahdissa. Tässä esimerkissä 8080
2. Määrittele API-polut oikein
3. Huomioi CORS-asetukset tarvittaessa

## API-polkujen käyttö

### Yhdistetyssä ratkaisussa (Vaihtoehdot A ja B):
```javascript
// Käytä suhteellisia polkuja
const response = await fetch("/api/endpoint", {
  method: "POST",
  body: formData,
});
```

### Erillisessä API-ratkaisussa (Vaihtoehto C):
```javascript
// Käytä täyttä URL:ia konfiguraatiosta
const response = await fetch(`${BACKEND_URL}/api/endpoint`, {
  method: "POST",
  body: formData,
});
```

## Automatisointi monorepo-ympäristössä

```
monorepo/
├── package.json           # Päätason package.json
├── node_modules/
├── frontend/             # Frontend-projekti
│   ├── package.json
│   ├── src/
│   └── dist/            # Build-kansio
└── backend/             # Backend-projekti
    ├── package.json
    ├── src/
    └── client/          # Frontend build kopioidaan tänne
        └── dist/
```

Jos pidät frontendin ja backendin samassa repositoriossa, voit automatisoida build-prosessin lisäämällä seuraavan scriptin päätason package.json tiedostoon:

```json
{
  "scripts": {
    "build:frontend": "cd frontend && npm install && npm run build",
    "postbuild:frontend": "rm -rf backend/client/dist && cp -r frontend/dist backend/client/",
    "prebuild": "npm install",
    "build": "npm run build:frontend",
    "start": "cd backend && npm start"
  }
}
```

Tämä mahdollistaa:
1. Frontendin buildauksen
2. Buildin automaattisen kopioinnin backend/client -kansioon
3. Koko prosessin ajamisen yhdellä komennolla: `npm run build`

### Kehitysympäristön scriptit

Voit myös lisätä kehitysympäristön scriptin concurrently-paketin avulla:
```json
{
  "scripts": {
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\""
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

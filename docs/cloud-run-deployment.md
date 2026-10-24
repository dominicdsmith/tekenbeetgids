# Automatische deployment naar Google Cloud Run

`.github/workflows/deploy.yml` bouwt met Bun/Vite, voert de tests uit en publiceert
een Node-servercontainer bij iedere push op `main`. Handmatig starten kan ook,
maar alleen vanaf `main`. Project: `tekenbeetgids-vertex-ai`, regio:
`europe-west4`, servicenaam en Artifact Registry-repository: `tekenbeetgids`.
De bestaande Lovable-publicatie wordt niet aangepast.

**Nieuw migratiedoel (23 oktober 2026):** bronadministratie en automatische taken
ook naar Google, met behoud van wijzigen vanuit Lovable. Onderstaande instructies
beschrijven de **huidige hybride uitvoering**, niet de definitieve databaseverhuizing.
De veilige omschakelvoorwaarden staan in [google-database-migration.md](./google-database-migration.md).
Zet de bestaande verbinding en taken niet uit voordat die controles zijn afgerond.

## 1. Google Cloud eenmalig instellen

Facturering moet actief zijn. Schakel Cloud Run API, Artifact Registry API en,
voor servergeheimen, Secret Manager API in. Maak een **Docker**-repository
`tekenbeetgids` in Artifact Registry, locatie `europe-west4`.

Maak twee aparte serviceaccounts:

- `github-deployer`: deploymentaccount; Cloud Run Admin
  (`roles/run.admin`) op het project en Artifact Registry Writer
  (`roles/artifactregistry.writer`) op de repository.
- `tekenbeetgids-runtime`: account waaronder de app draait; geef dit geen
  deployrechten. Geef de deployer Service Account User
  (`roles/iam.serviceAccountUser`) **op dit runtimeaccount**.

Cloud Run Admin is nodig omdat de workflow deze openbare website publiceert met
`--no-invoker-iam-check`. De Cloud Run service agent krijgt normaal automatisch
de rechten om images in hetzelfde project te lezen. Controleer deze rechten als
uw organisatie het standaardbeleid heeft gewijzigd.

Bij `github-deployer` → Keys → Add key → Create new key → JSON downloadt u de
deploymentkey. Bewaar deze niet in Git of Docker en stuur hem niet in de chat.
Heeft uw organisatie het maken van keys geblokkeerd, gebruik dan Workload
Identity Federation (zie hieronder), niet een breder account.

## 2. GitHub instellen

Maak een GitHub Environment `production`; voeg eventueel vereiste goedkeuring
toe. Onder Settings → Secrets and variables → Actions, of in dit Environment:

### Secret

| Naam | Inhoud |
| --- | --- |
| `GCP_SA_KEY` | Het volledige gedownloade JSON-bestand van `github-deployer`, niet de Gemini API-key. |

### Variables (geen private sleutels)

| Naam | Inhoud |
| --- | --- |
| `GCP_RUNTIME_SERVICE_ACCOUNT` | `tekenbeetgids-runtime@tekenbeetgids-vertex-ai.iam.gserviceaccount.com` |
| `VITE_SUPABASE_URL` | De huidige publieke backend-URL van de app. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | De huidige publieke/publishable backend-key. |
| `VITE_SUPABASE_PROJECT_ID` | De bestaande publieke projectidentifier (optioneel). |
| `CLOUD_BACKEND_URL` | `https://tekenrisicokaart.lovable.app` — de blijvende Lovable-publicatie, niet het domein dat u later naar Cloud Run verplaatst. |
| `CLOUD_RUN_SECRETS` | Verplicht: `CLOUD_BACKEND_SECRET=cloud-backend-secret:1` (gebruik de werkelijk opgeslagen versie). |

De `VITE_*`-waarden komen in de browsercode en zijn dus **niet geheim**. Gebruik
hier nooit een private key. Project en regio staan al in de workflow.

## 3. Beveiligde verbinding met Lovable Cloud

Een deploymentkey geeft toestemming om te publiceren; hij vervangt **niet** de
Gemini-key of andere appgeheimen. Lovable Cloud-geheimen worden niet automatisch
naar Google Cloud gekopieerd.

De bestaande database blijft in Lovable Cloud. Cloud Run stuurt deelname,
registratie, meldstatus, contact, opt-out, telling, fotoscans en assistentvragen
via een beperkte serververbinding naar de bestaande Lovable-publicatie.
De bestaande controles en Google-koppelingen blijven daar draaien.
Beheer leest rechtstreeks met de aangemelde beheerder en de bestaande rechten;
de verbinding kan geen beheerrecords opvragen of willekeurige databaseopdrachten uitvoeren.

Maak in het beveiligde Lovable-venster `CLOUD_BACKEND_SECRET` aan met **Generate**.
Kopieer dezelfde waarde naar Google Secret Manager, secret `cloud-backend-secret`.
Bewaar geen waarde in GitHub-variables, browsercode of Docker. Geef het
runtimeaccount Secret Manager Secret Accessor **alleen op dit secret**.
Vul in de GitHub-variable `CLOUD_RUN_SECRETS`:

```text
CLOUD_BACKEND_SECRET=cloud-backend-secret:1
```

Publiceer eerst de aangepaste app op Lovable; controleer dat dit adres behouden
blijft als uw domeinen later verhuizen. Zet `CLOUD_BACKEND_URL` alleen in Cloud Run,
nooit op de Lovable-bronwebsite: dat zou een kringverbinding veroorzaken.
Bij rotatie vervangt u de waarde in beide omgevingen en publiceert u opnieuw.
Aanvragen zijn ondertekend, maximaal één minuut geldig en met een eenmalige
aanvraagcode beschermd tegen herhaling. Writes worden niet automatisch herhaald.

De Lovable Cloud-serverkey hoeft niet naar Cloud Run en blijft ontoegankelijk.
Ook bestaande intrekcodes blijven geldig omdat ze in dezelfde bronomgeving
gecontroleerd worden. Er worden geen databasegegevens gemigreerd en geen
publieke schrijf- of leesrechten toegevoegd.

Gemini-, mail-, werkkopie- en back-upgeheimen blijven in Lovable, net als
bestaande geplande taken. Ze hoeven niet naar Google Secret Manager.
Foto's worden uitsluitend tijdens de expliciet gekozen scan doorgestuurd;
de verbinding bewaart geen foto's of assistentgesprekken.

## 4. Starten en controleren

Na deze instellingen: push naar `main`, of Actions → Deploy TekenbeetGids to
Cloud Run → Run workflow (main). De workflow stopt als tests, build, push,
deployment, HTTP-paginacontrole of `/api/public/backend-status` mislukken.
De statuscontrole toetst de ondertekende verbinding, een databaseaanvraag en
aanwezigheid van benodigde geheimen, niet de externe diensten zelf.
Controleer echte deelname → registratie → beheerteruglezing → opt-out,
contact, scans en assistent afzonderlijk vóór
u bestaande bezoekers omschakelt. Een mislukte controle draait de nieuwe
Cloud Run-revisie niet automatisch terug.

De `run.app`-URL toont op `/` de kaart: deze app kiest TekenbeetGids op basis
van de host `tekenbeetgids.nl`. Gebruik op de tijdelijke URL `/tekenbeethulp`
om de gids te bekijken. DNS, TLS, de domeinkoppeling en toegestane
aanmeld-/terugkeeradressen worden niet automatisch gewijzigd. Voor
`europe-west4` is een externe Application Load Balancer met serverless NEG een
geschikte domeinroute; controleer beschikbaarheid van directe Cloud Run
domain mapping voordat u die kiest. Laat uw bestaande domeinen staan totdat
alle functies zijn gecontroleerd.

Cloud Run, Artifact Registry en eventuele load balancer kunnen kosten geven;
stel een budgetwaarschuwing in. De workflow begrenst de service op 3 instances,
maar dat is geen kostenplafond.

## Veiliger alternatief: zonder JSON-key

Voor langdurig gebruik heeft Workload Identity Federation de voorkeur:
GitHub krijgt dan tijdelijk toegang via OIDC. Beperk de identity-provider op
uw specifieke repository, eigenaar en `refs/heads/main`; geef de identity
Workload Identity User op `github-deployer`. Voeg `id-token: write` toe aan
de workflowpermissions en vervang uitsluitend het auth-onderdeel door:

```yaml
with:
  workload_identity_provider: ${{ vars.GCP_WORKLOAD_IDENTITY_PROVIDER }}
  service_account: ${{ vars.GCP_DEPLOY_SERVICE_ACCOUNT }}
  project_id: ${{ env.GCP_PROJECT_ID }}
```

Configureer de provider eerst, test een deployment en verwijder daarna de
JSON-key en `GCP_SA_KEY`. De geleverde workflow gebruikt de gevraagde
serviceaccountkey, niet beide methoden tegelijk.
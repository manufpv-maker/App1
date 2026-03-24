# Psalmen Mini App (App1)

Eine moderne Telegram Mini App zum Durchsuchen und Lesen von Psalmen aus 8 verschiedenen Sammlungen.

## Features

- 📖 3850 Psalmen aus 8 Sammlungen
- 🔍 Flexible Suche nach Nummer, Namen oder Titel
- 📱 Responsive Design für Mobile
- ⚡ Schnelle Ladezeiten (alles lokal)
- 💾 Offline-fähig
- 📋 Kopieren-Button für Psalm-Texte

## Sammlungen

| Abkürzung | Name | Psalmen |
|-----------|------|---------|
| п | Песни Юности | 1005 |
| к | Кувшинчик | 89 |
| н | Новые псалмы | 217 |
| г | Горлица | 571 |
| с | Псалмы Сиона | 525 |
| м | Мы поём Господу | 200 |
| юс | Мелодия юных сердец | 850 |
| гх | Голосок хваления | 393 |

## Installation

```bash
npm install
```

## Verwendung

```bash
PORT=3000 npm start
# oder
PORT=3000 node server.js
```

Dann öffnen: `http://localhost:3000`

## Verwendungsbeispiele

### Sammlung durchsuchen
1. App öffnen
2. Sammlung auswählen (z.B. "Песни Юности")
3. Psalm-Liste anschauen
4. Nach Titel/Nummer suchen
5. Psalm öffnen und lesen

### Psalm kopieren
1. Psalm öffnen
2. "📋 Kopieren" Button klicken
3. Text ist in Zwischenablage

## Dateistruktur

```
App1/
├── index.html           # Single-Page App
├── server.js            # Express Server
├── psalms-data.json     # Psalm-Datenbank
├── package.json         # Dependencies
└── README.md            # Diese Datei
```

## Technologie

- **Frontend:** Vanilla JavaScript (keine Frameworks)
- **Backend:** Node.js + Express
- **Daten:** JSON (lokal)
- **Styling:** CSS

## Performance

- Ladezeit: < 100ms
- Suchgeschwindigkeit: < 50ms
- Speicher: ~80MB (psalms-data.json)

## Deployment

### Railway

```bash
git push railway main
```

Umgebungsvariablen:
- `PORT=3000` (oder 8080)

### Docker

```bash
docker build -t psalms-app1 .
docker run -p 3000:3000 psalms-app1
```

## Lizenz

MIT

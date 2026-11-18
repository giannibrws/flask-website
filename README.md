# Museo Picasso

A small, interactive online museum of ten paintings by Pablo Picasso, built with Flask.
Walk through his life in four rooms, look at every painting up close, and break any of them
into a jigsaw puzzle to put it back together yourself.

It started as a basic Flask website for a web-development class and grew into this.

## What you can do

### Browse the collection
Ten paintings, spread over four rooms that follow Picasso's life:

| Room | Period | Years | Paintings |
|------|--------|-------|-----------|
| I | The Young Master | 1896–1901 | *Science and Charity*, *Yo, Picasso*, *Child with a Dove* |
| II | Blue Period | 1901–1904 | *The Old Guitarist*, *The Tragedy* |
| III | Rose Period | 1904–1906 | *Boy with a Pipe*, *Family of Saltimbanques*, *Portrait of Gertrude Stein* |
| IV | War & Grief | 1937 | *Guernica*, *The Weeping Woman* |

### Search and take a tour
Search by title, year, museum or subject (try `blue`, `circus`, `1905` or `war`) and filter by room.
**Start the tour** walks you through the results one painting at a time, with buttons or the
<kbd>←</kbd> <kbd>→</kbd> arrow keys.

### Look closely
Every painting hangs in its own dark gallery room with a wall label: year, medium, the museum
that owns it, a short story about the work and its colour palette.

- **Zoom and pan**: scroll, double-click or use <kbd>+</kbd> <kbd>−</kbd>, then drag to move around
- **Loupe** (<kbd>L</kbd>): a magnifying glass that follows your pointer
- **Fullscreen** (<kbd>F</kbd>)

### Solve it as a jigsaw puzzle
Press **Start puzzle** (or <kbd>P</kbd>) and the painting breaks into real interlocking jigsaw
pieces that scatter around the board. Drag them back; a piece snaps into place when it's close.

- **Easy / Medium / Hard**: about 9, 16 or 36 pieces
- **Peek** shows a faint copy of the painting on the board
- **Shuffle** throws the loose pieces around again; **Solve** finishes it for you
- Your best time per painting and difficulty is remembered in your browser
- **Random puzzle** in the menu picks a painting for you

## Run it locally

Requires Python 3.10 or newer.

```bash
python -m venv venv
venv\Scripts\activate        # Windows  (macOS/Linux: source venv/bin/activate)
pip install -r requirements.txt
python app.py
```

Then open http://127.0.0.1:5000. You need an internet connection, because the paintings are
loaded from Wikipedia (see below).

## How it's built

```
app.py              Flask routes: home, collection/search, artwork pages, random
artworks.py         the collection as typed dataclasses, plus search
templates/          Jinja templates (base, home, collection, artwork, 404)
static/css/         one stylesheet
static/js/
  jigsaw.js         jigsaw geometry: the curved knob-and-hole outline of each piece
  puzzle.js         the puzzle game
  viewer.js         zoom, pan, loupe, fullscreen and keyboard navigation
  teaser.js         the home page painting with lifted pieces
```

- **Backend:** Flask 3 and Python dataclasses. No database: the collection lives in `artworks.py`.
- **Frontend:** no framework and no build step. Plain ES modules (classes, private fields,
  `async`/`await`) and modern CSS: cascade layers, native nesting, container queries and
  cross-document View Transitions, so a painting glides from the wall into its room.
- **Smooth dragging:** every puzzle piece is cut once into its own small `<canvas>`, with the
  shadow baked in. While you drag, the browser only moves that canvas on the GPU and never
  repaints anything. Placed pieces are painted onto one shared board canvas, so there is less
  to move the further you get.

## Image credits

The paintings are **not** stored in this repository. Picasso's work is still under copyright
(© Succession Picasso), so the images are shown from Wikipedia / Wikimedia, which hosts them
for educational use. Every artwork page links back to its source. This is a non-commercial
school project.

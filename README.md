# Museo Picasso

A small, interactive Picasso museum built with Flask. Originally a basic Flask website for web-dev class.

- **Collection**: search 10 Picasso paintings by title, year, museum or subject, and filter by room (period)
- **Tour**: visit the search results one by one, using buttons or the arrow keys
- **Viewer**: every painting has its own gallery room, with zoom, pan, a loupe and fullscreen
- **Jigsaw puzzle**: hit "Start puzzle" and the painting falls apart into real interlocking pieces.
  Drag them back in place (Easy / Medium / Hard, with peek, shuffle and your best time)

## Run locally

Requires Python 3.9+.

```
python -m venv venv
venv\Scripts\activate        # Windows  (macOS/Linux: source venv/bin/activate)
pip install -r requirements.txt
python app.py
```

Then open http://127.0.0.1:5000

## Project layout

```
app.py          routes
artworks.py     the collection (data + search)
templates/      Jinja templates (base, home, collection, artwork, 404)
static/css/     styles
static/js/      viewer.js (painting viewer), puzzle.js (jigsaw puzzles)
```

## Image credits

The paintings are **not** stored in this repository. Picasso's work is still under copyright
(© Succession Picasso), so the images are shown from Wikipedia / Wikimedia, which hosts them
for educational use. Every artwork page links back to its source. This is a non-commercial school project.

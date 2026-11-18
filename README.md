# Museo Picasso · Flask-vleugel

A small, interactive Picasso museum built with Flask. Originally a basic Flask website for web-dev class.

- **Collectie**: search 10 Picasso paintings by title, year, museum or subject, and filter by room (period)
- **Rondleiding**: visit the search results one by one, using buttons or the arrow keys
- **Zaal**: every painting has its own gallery room, with zoom, pan, a magnifying loupe and fullscreen
- **Atelier**: build your own cubist Mediterranean village from SVG parts, then download it as a PNG

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
templates/      Jinja templates (base, home, collection, artwork, atelier, 404)
static/css/     styles
static/js/      viewer.js (painting viewer), atelier.js (the builder)
```

## Image credits

The paintings are **not** stored in this repository. Picasso's work is still under copyright
(© Succession Picasso), so the images are shown from Wikipedia / Wikimedia, which hosts them
for educational use. Every artwork page links back to its source. This is a non-commercial school project.
The atelier artwork is original SVG drawn for this project.

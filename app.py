from __future__ import annotations

import random

from flask import Flask, abort, redirect, render_template, request, url_for
from werkzeug.wrappers import Response

from artworks import ARTWORKS, BY_SLUG, ROOMS, Artwork
from artworks import search as search_artworks

app = Flask(__name__)

# disable caching of static files during development:
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0

FEATURED = ("the-old-guitarist", "guernica", "boy-with-a-pipe", "the-weeping-woman")
HERO = "boy-with-a-pipe"


@app.context_processor
def inject_globals() -> dict[str, object]:
    room_counts = {key: sum(art.room == key for art in ARTWORKS) for key in ROOMS}
    return {"rooms": ROOMS, "room_counts": room_counts, "total": len(ARTWORKS)}


def room_arg() -> str:
    """The ?room= filter, or "" when it isn't a real room."""
    room = request.args.get("room", "")
    return room if room in ROOMS else ""


def filtered(query: str, room: str) -> list[Artwork]:
    """Search results, optionally limited to one room."""
    return [art for art in search_artworks(query) if not room or art.room == room]


@app.get("/")
def home() -> str:
    return render_template("home.html", featured=[BY_SLUG[s] for s in FEATURED], hero=BY_SLUG[HERO])


@app.get("/collection")
def collection() -> str:
    query = request.args.get("q", "").strip()
    room = room_arg()
    return render_template("collection.html", results=filtered(query, room), query=query, room=room)


# old search urls (and plain form posts) keep working:
@app.route("/search/<keyword>")
@app.route("/search", methods=["GET", "POST"])
def search(keyword: str = "") -> Response:
    return redirect(url_for("collection", q=request.values.get("search", keyword)))


@app.get("/art/<slug>")
def artwork(slug: str) -> str:
    art = BY_SLUG.get(slug) or abort(404)

    # a "tour" walks through the current search results (and room) in order:
    query = request.args.get("q", "").strip()
    room = room_arg()
    tour = filtered(query, room)
    if art not in tour:
        tour, query, room = list(ARTWORKS), "", ""
    idx = tour.index(art)

    return render_template(
        "artwork.html",
        art=art,
        room=ROOMS[art.room],
        query=query,
        tour_room=room,
        position=idx + 1,
        tour_length=len(tour),
        prev_art=tour[idx - 1] if idx > 0 else None,
        next_art=tour[idx + 1] if idx < len(tour) - 1 else None,
        autoplay=request.args.get("play") == "1",
    )


@app.get("/random")
@app.get("/generator")
def generator() -> Response:
    play = "1" if request.args.get("play") == "1" else None
    return redirect(url_for("artwork", slug=random.choice(ARTWORKS).slug, play=play))


# retired pages:
@app.get("/extra")
@app.get("/atelier")
def retired() -> Response:
    return redirect(url_for("collection"))


# redirect user when trying to access admin urls:
@app.get("/admin")
def admin() -> Response:
    return redirect(url_for("home"))


@app.errorhandler(404)
def not_found(error: Exception) -> tuple[str, int]:
    return render_template("404.html"), 404


# execute only if app.py is executed as a script:
if __name__ == "__main__":
    app.run(debug=True)

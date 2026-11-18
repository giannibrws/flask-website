import random
from importlib.metadata import version

from flask import Flask, abort, redirect, render_template, request, url_for

from artworks import ARTWORKS, BY_SLUG, ROOMS, search as search_artworks

app = Flask(__name__)
FLASK_VERSION = version("flask")

# disable caching of static files during development:
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0


@app.context_processor
def inject_globals():
    room_counts = {key: sum(a["room"] == key for a in ARTWORKS) for key in ROOMS}
    return {"rooms": ROOMS, "room_counts": room_counts, "total": len(ARTWORKS),
            "flask_version": FLASK_VERSION}


@app.route("/")
def home():
    featured = [BY_SLUG[s] for s in ("de-oude-gitarist", "guernica", "jongen-met-pijp", "de-huilende-vrouw")]
    return render_template("home.html", featured=featured)


def filtered(query, room):
    """Search results, optionally limited to one room."""
    results = search_artworks(query)
    if room in ROOMS:
        results = [a for a in results if a["room"] == room]
    return results


@app.route("/collectie")
def collection():
    query = request.args.get("q", "").strip()
    room = request.args.get("zaal", "")
    room = room if room in ROOMS else ""
    return render_template("collection.html", results=filtered(query, room), query=query, room=room)


# old search urls (and the search form on every page) keep working:
@app.route("/search/<keyword>")
@app.route("/search", methods=["GET", "POST"])
def search(keyword=""):
    query = request.values.get("search", keyword)
    return redirect(url_for("collection", q=query))


@app.route("/werk/<slug>")
def artwork(slug):
    art = BY_SLUG.get(slug)
    if art is None:
        abort(404)

    # a "tour" walks through the current search results (and room) in order:
    query = request.args.get("q", "").strip()
    room = request.args.get("zaal", "")
    room = room if room in ROOMS else ""
    tour = filtered(query, room)
    if art not in tour:
        tour, query, room = list(ARTWORKS), "", ""
    idx = tour.index(art)
    prev_art = tour[idx - 1] if idx > 0 else None
    next_art = tour[idx + 1] if idx < len(tour) - 1 else None

    return render_template("artwork.html", art=art, room=ROOMS[art["room"]], query=query,
                           tour_room=room, position=idx + 1, tour_length=len(tour),
                           prev_art=prev_art, next_art=next_art)


@app.route("/atelier")
def atelier():
    return render_template("atelier.html")


@app.route("/generator")
def generator():
    return redirect(url_for("artwork", slug=random.choice(ARTWORKS)["slug"]))


@app.route("/extra")
def extra():
    return redirect(url_for("atelier"))


# redirect user when trying to access admin urls:
@app.route("/admin")
def admin():
    return redirect(url_for("home"))


@app.errorhandler(404)
def not_found(error):
    return render_template("404.html"), 404


# execute only if app.py is executed as a script:
if __name__ == "__main__":
    app.run(debug=True)

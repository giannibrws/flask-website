"""The collection: 10 Picasso paintings.

Images are NOT stored in this repo (Picasso's work is still under copyright).
They are shown from Wikipedia/Wikimedia, which hosts them for educational use;
every artwork page links back to its source.
"""

from __future__ import annotations

from dataclasses import dataclass, field

WIKI = "https://en.wikipedia.org/wiki/"
UPLOAD = "https://upload.wikimedia.org/wikipedia/en/"

@dataclass(frozen=True, slots=True)
class Room:
    name: str
    number: str
    years: str


@dataclass(frozen=True, slots=True)
class Artwork:
    slug: str
    title: str
    original: str
    year: str
    room: str
    medium: str
    museum: str
    city: str
    image: str
    wiki: str
    palette: tuple[str, ...]
    tags: tuple[str, ...]
    text: str
    _haystack: str = field(init=False, repr=False, compare=False)

    def __post_init__(self) -> None:
        # everything search looks at, lower-cased once
        room = ROOMS[self.room]
        words = [self.title, self.original, self.year, self.museum, self.city,
                 self.room, room.name, *self.tags, self.text]
        object.__setattr__(self, "_haystack", " ".join(words).lower())

    def matches(self, words: list[str]) -> bool:
        return all(word in self._haystack for word in words)


ROOMS: dict[str, Room] = {
    "early": Room("The Young Master", "I", "1896–1901"),
    "blue": Room("Blue Period", "II", "1901–1904"),
    "rose": Room("Rose Period", "III", "1904–1906"),
    "war": Room("War & Grief", "IV", "1937"),
}

_DATA = [
    {
        "slug": "science-and-charity",
        "title": "Science and Charity",
        "original": "Ciencia y caridad",
        "year": "1897",
        "room": "early",
        "medium": "Oil on canvas",
        "museum": "Museu Picasso",
        "city": "Barcelona",
        "image": UPLOAD + "d/d6/Science_and_Charity_by_Picasso.jpg",
        "wiki": WIKI + "Science_and_Charity",
        "palette": ["#3b2f25", "#8a7454", "#d9cfb8", "#5c6b73"],
        "tags": ["academic", "realism", "doctor", "sickbed", "nun", "youth"],
        "text": "Picasso was only fifteen when he painted this huge canvas. A doctor takes the "
                "pulse of a sick woman while a nun offers her a drink. Strict, academic and fully "
                "realistic: proof that he mastered the rules long before he started breaking them.",
    },
    {
        "slug": "yo-picasso",
        "title": "Yo, Picasso",
        "original": "Yo, Picasso",
        "year": "1901",
        "room": "early",
        "medium": "Oil on canvas",
        "museum": "Private collection",
        "city": "",
        "image": UPLOAD + "f/ff/Yo%2C_Picasso.jpg",
        "wiki": WIKI + "Yo,_Picasso",
        "palette": ["#e2582b", "#f2e6d0", "#2b2a2e", "#d9a441"],
        "tags": ["self-portrait", "paris", "orange", "youth", "portrait"],
        "text": "Nineteen years old, freshly arrived in Paris, and the title says it all: "
                "\"I, Picasso\". A confident self-portrait with a blazing orange cravat and quick, "
                "loose brushwork in the spirit of Van Gogh and Toulouse-Lautrec.",
    },
    {
        "slug": "child-with-a-dove",
        "title": "Child with a Dove",
        "original": "L'Enfant au pigeon",
        "year": "1901",
        "room": "early",
        "medium": "Oil on canvas",
        "museum": "Private collection",
        "city": "",
        "image": UPLOAD + "thumb/e/e1/Child_With_a_Dove_by_Pablo_Picasso.jpg/"
                 "1280px-Child_With_a_Dove_by_Pablo_Picasso.jpg",
        "wiki": WIKI + "Child_with_a_Dove",
        "palette": ["#e9e2cf", "#7aa3b8", "#c8443a", "#4d6b4f"],
        "tags": ["child", "dove", "bird", "ball", "tender", "portrait"],
        "text": "A small child gently holds a white dove to its chest, a ball lying at its feet. "
                "Heavy dark outlines and flat colour already hint at where Picasso is heading, "
                "but the mood is still warm and soft.",
    },
    {
        "slug": "the-old-guitarist",
        "title": "The Old Guitarist",
        "original": "The Old Guitarist",
        "year": "1903–1904",
        "room": "blue",
        "medium": "Oil on panel",
        "museum": "Art Institute of Chicago",
        "city": "Chicago",
        "image": UPLOAD + "thumb/b/bc/Old_guitarist_chicago.jpg/1280px-Old_guitarist_chicago.jpg",
        "wiki": WIKI + "The_Old_Guitarist",
        "palette": ["#1d3557", "#3c6e91", "#9fb7c9", "#a67c52"],
        "tags": ["blue", "guitar", "music", "poverty", "barcelona", "blind"],
        "text": "A gaunt, blind street musician hunches over his guitar. Everything is blue except "
                "the brown instrument: the only warm thing he has left. The icon of the Blue "
                "Period, painted in Barcelona.",
    },
    {
        "slug": "the-tragedy",
        "title": "The Tragedy",
        "original": "La Tragédie",
        "year": "1903",
        "room": "blue",
        "medium": "Oil on panel",
        "museum": "National Gallery of Art",
        "city": "Washington, D.C.",
        "image": UPLOAD + "3/39/The_Tragedy.JPG",
        "wiki": WIKI + "The_Tragedy_(Picasso)",
        "palette": ["#1f3b57", "#4f7896", "#b9c9d3", "#2a2a2a"],
        "tags": ["blue", "sea", "beach", "family", "grief", "poverty"],
        "text": "A man, a woman and a child stand barefoot on the shore, cold and turned inward. "
                "Nobody looks at anyone else. The Blue Period never gets quieter, or sadder, "
                "than this.",
    },
    {
        "slug": "boy-with-a-pipe",
        "title": "Boy with a Pipe",
        "original": "Garçon à la pipe",
        "year": "1905",
        "room": "rose",
        "medium": "Oil on canvas",
        "museum": "Private collection",
        "city": "",
        "image": UPLOAD + "9/9c/Gar%C3%A7on_%C3%A0_la_pipe.jpg",
        "wiki": WIKI + "Gar%C3%A7on_%C3%A0_la_pipe",
        "palette": ["#3f5a3a", "#c9806b", "#e9c9a8", "#2d4a6a"],
        "tags": ["rose", "boy", "pipe", "flowers", "garland", "paris", "portrait"],
        "text": "A Parisian boy in blue, a pipe in his hand and a garland of flowers in his hair. "
                "In 2004 it sold at auction for over 104 million dollars, a world record at "
                "the time.",
    },
    {
        "slug": "family-of-saltimbanques",
        "title": "Family of Saltimbanques",
        "original": "Famille de saltimbanques",
        "year": "1905",
        "room": "rose",
        "medium": "Oil on canvas",
        "museum": "National Gallery of Art",
        "city": "Washington, D.C.",
        "image": UPLOAD + "thumb/c/ca/Family_of_Saltimbanques.JPG/1280px-Family_of_Saltimbanques.JPG",
        "wiki": WIKI + "Family_of_Saltimbanques",
        "palette": ["#c98a6b", "#e6c6a3", "#6d8fa6", "#b33b2e"],
        "tags": ["rose", "circus", "harlequin", "acrobat", "landscape", "family"],
        "text": "Travelling circus performers gather in an empty landscape, yet each of them seems "
                "alone. The harlequin on the left is often read as Picasso himself. The largest "
                "work of his Rose Period.",
    },
    {
        "slug": "portrait-of-gertrude-stein",
        "title": "Portrait of Gertrude Stein",
        "original": "Portrait of Gertrude Stein",
        "year": "1905–1906",
        "room": "rose",
        "medium": "Oil on canvas",
        "museum": "The Metropolitan Museum of Art",
        "city": "New York",
        "image": UPLOAD + "d/d6/GertrudeStein.JPG",
        "wiki": WIKI + "Portrait_of_Gertrude_Stein",
        "palette": ["#5a3b2a", "#9c6b48", "#d1a77c", "#2b2522"],
        "tags": ["portrait", "writer", "mask", "proto-cubism", "paris"],
        "text": "Stein sat for him some ninety times. Unhappy with the result, Picasso wiped out "
                "the face and later repainted it from memory as a hard, mask-like head. When people "
                "said she didn't look like that, he replied: \"She will.\"",
    },
    {
        "slug": "guernica",
        "title": "Guernica",
        "original": "Guernica",
        "year": "1937",
        "room": "war",
        "medium": "Oil on canvas",
        "museum": "Museo Reina Sofía",
        "city": "Madrid",
        "image": UPLOAD + "7/74/PicassoGuernica.jpg",
        "wiki": WIKI + "Guernica_(Picasso)",
        "palette": ["#111111", "#5e5e5e", "#bdbdbd", "#f2f2f2"],
        "tags": ["war", "cubism", "black-and-white", "horse", "bull", "bombing", "spain"],
        "text": "Picasso's furious response to the bombing of the Basque town of Guernica. Almost "
                "eight metres wide, painted only in black, white and grey: a screaming horse, "
                "a bull, a lamp for an eye. Perhaps the most famous anti-war painting ever made.",
    },
    {
        "slug": "the-weeping-woman",
        "title": "The Weeping Woman",
        "original": "La Femme qui pleure",
        "year": "1937",
        "room": "war",
        "medium": "Oil on canvas",
        "museum": "Tate Modern",
        "city": "London",
        "image": UPLOAD + "1/14/Picasso_The_Weeping_Woman_Tate_identifier_T05010_10.jpg",
        "wiki": WIKI + "The_Weeping_Woman",
        "palette": ["#e2c33b", "#3d7f4f", "#d9443a", "#3a6fb5"],
        "tags": ["cubism", "portrait", "dora maar", "grief", "war", "colour"],
        "text": "An echo of Guernica: a woman in a red hat weeps, her face shattered into shards. "
                "The model was photographer Dora Maar. The loud colours only make the grief "
                "sharper.",
    },
]

ARTWORKS: tuple[Artwork, ...] = tuple(
    Artwork(**{**data, "palette": tuple(data["palette"]), "tags": tuple(data["tags"])})
    for data in _DATA
)
BY_SLUG: dict[str, Artwork] = {art.slug: art for art in ARTWORKS}


def search(query: str | None) -> list[Artwork]:
    """Artworks matching every word of the query (title, year, museum, room, tags, text)."""
    words = (query or "").lower().split()
    return [art for art in ARTWORKS if art.matches(words)]

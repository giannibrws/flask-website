"""The collection: 10 Picasso paintings.

Images are NOT stored in this repo (Picasso's work is still under copyright).
They are shown from Wikipedia/Wikimedia, which hosts them for educational use;
every artwork page links back to its source.
"""

WIKI = "https://en.wikipedia.org/wiki/"
UPLOAD = "https://upload.wikimedia.org/wikipedia/en/"

ROOMS = {
    "vroeg": {"name": "Zaal I — De jonge meester", "years": "1896–1901"},
    "blauw": {"name": "Zaal II — Blauwe periode", "years": "1901–1904"},
    "roze": {"name": "Zaal III — Roze periode", "years": "1904–1906"},
    "oorlog": {"name": "Zaal IV — Oorlog & verdriet", "years": "1937"},
}

ARTWORKS = [
    {
        "slug": "wetenschap-en-naastenliefde",
        "title": "Wetenschap en naastenliefde",
        "original": "Ciencia y caridad",
        "year": "1897",
        "room": "vroeg",
        "medium": "Olieverf op doek",
        "museum": "Museu Picasso",
        "city": "Barcelona",
        "image": UPLOAD + "d/d6/Science_and_Charity_by_Picasso.jpg",
        "wiki": WIKI + "Science_and_Charity",
        "palette": ["#3b2f25", "#8a7454", "#d9cfb8", "#5c6b73"],
        "tags": ["academisch", "realisme", "dokter", "ziekbed", "non", "jeugd"],
        "text": "Picasso was pas vijftien toen hij dit enorme doek schilderde. Een dokter "
                "voelt de pols van een zieke vrouw, een non brengt haar iets te drinken. "
                "Strak, academisch en volledig realistisch: het bewijs dat hij de regels "
                "beheerste voordat hij ze ging breken.",
    },
    {
        "slug": "yo-picasso",
        "title": "Yo, Picasso",
        "original": "Yo, Picasso",
        "year": "1901",
        "room": "vroeg",
        "medium": "Olieverf op doek",
        "museum": "Privécollectie",
        "city": "",
        "image": UPLOAD + "f/ff/Yo%2C_Picasso.jpg",
        "wiki": WIKI + "Yo,_Picasso",
        "palette": ["#e2582b", "#f2e6d0", "#2b2a2e", "#d9a441"],
        "tags": ["zelfportret", "parijs", "oranje", "jeugd", "portret"],
        "text": "Negentien jaar, net in Parijs, en de titel zegt het al: \"Ik, Picasso\". "
                "Een zelfverzekerd zelfportret met een vlammende oranje das en losse, "
                "snelle penseelstreken in de geest van Van Gogh en Toulouse-Lautrec.",
    },
    {
        "slug": "kind-met-duif",
        "title": "Kind met duif",
        "original": "L'Enfant au pigeon",
        "year": "1901",
        "room": "vroeg",
        "medium": "Olieverf op doek",
        "museum": "Privécollectie",
        "city": "",
        "image": UPLOAD + "thumb/e/e1/Child_With_a_Dove_by_Pablo_Picasso.jpg/"
                 "1280px-Child_With_a_Dove_by_Pablo_Picasso.jpg",
        "wiki": WIKI + "Child_with_a_Dove",
        "palette": ["#e9e2cf", "#7aa3b8", "#c8443a", "#4d6b4f"],
        "tags": ["kind", "duif", "vogel", "bal", "zacht", "portret"],
        "text": "Een klein kind houdt teder een witte duif tegen zich aan; aan zijn voeten "
                "ligt een bal. Dikke donkere contouren en vlakke kleuren laten al zien "
                "waar Picasso naartoe gaat, maar de toon is nog warm en zacht.",
    },
    {
        "slug": "de-oude-gitarist",
        "title": "De oude gitarist",
        "original": "The Old Guitarist",
        "year": "1903–1904",
        "room": "blauw",
        "medium": "Olieverf op paneel",
        "museum": "Art Institute of Chicago",
        "city": "Chicago",
        "image": UPLOAD + "thumb/b/bc/Old_guitarist_chicago.jpg/1280px-Old_guitarist_chicago.jpg",
        "wiki": WIKI + "The_Old_Guitarist",
        "palette": ["#1d3557", "#3c6e91", "#9fb7c9", "#a67c52"],
        "tags": ["blauw", "gitaar", "muziek", "armoede", "barcelona", "blind"],
        "text": "Een uitgemergelde, blinde straatmuzikant buigt zich over zijn gitaar. "
                "Alles is blauw, behalve het bruine instrument: het enige warme dat hem "
                "nog rest. Het icoon van de Blauwe periode, geschilderd in Barcelona.",
    },
    {
        "slug": "de-tragedie",
        "title": "De tragedie",
        "original": "La Tragédie",
        "year": "1903",
        "room": "blauw",
        "medium": "Olieverf op paneel",
        "museum": "National Gallery of Art",
        "city": "Washington D.C.",
        "image": UPLOAD + "3/39/The_Tragedy.JPG",
        "wiki": WIKI + "The_Tragedy_(Picasso)",
        "palette": ["#1f3b57", "#4f7896", "#b9c9d3", "#2a2a2a"],
        "tags": ["blauw", "zee", "strand", "familie", "verdriet", "armoede"],
        "text": "Een man, een vrouw en een kind staan blootsvoets aan de kust, "
                "in zichzelf gekeerd en koud. Niemand kijkt elkaar aan. Stiller "
                "en droeviger dan dit wordt de Blauwe periode niet.",
    },
    {
        "slug": "jongen-met-pijp",
        "title": "Jongen met pijp",
        "original": "Garçon à la pipe",
        "year": "1905",
        "room": "roze",
        "medium": "Olieverf op doek",
        "museum": "Privécollectie",
        "city": "",
        "image": UPLOAD + "9/9c/Gar%C3%A7on_%C3%A0_la_pipe.jpg",
        "wiki": WIKI + "Gar%C3%A7on_%C3%A0_la_pipe",
        "palette": ["#3f5a3a", "#c9806b", "#e9c9a8", "#2d4a6a"],
        "tags": ["roze", "jongen", "pijp", "bloemen", "krans", "parijs", "portret"],
        "text": "Een Parijse jongen in blauw, met een pijp in zijn hand en een "
                "bloemenkrans in zijn haar. In 2004 werd het voor ruim 104 miljoen "
                "dollar geveild, destijds een wereldrecord.",
    },
    {
        "slug": "familie-van-saltimbanques",
        "title": "Familie van saltimbanques",
        "original": "Famille de saltimbanques",
        "year": "1905",
        "room": "roze",
        "medium": "Olieverf op doek",
        "museum": "National Gallery of Art",
        "city": "Washington D.C.",
        "image": UPLOAD + "thumb/c/ca/Family_of_Saltimbanques.JPG/1280px-Family_of_Saltimbanques.JPG",
        "wiki": WIKI + "Family_of_Saltimbanques",
        "palette": ["#c98a6b", "#e6c6a3", "#6d8fa6", "#b33b2e"],
        "tags": ["roze", "circus", "harlekijn", "acrobaat", "landschap", "familie"],
        "text": "Rondtrekkende circusartiesten staan samen in een leeg landschap, "
                "maar ieder lijkt alleen. De harlekijn links wordt vaak gezien als "
                "Picasso zelf. Het grootste werk uit zijn Roze periode.",
    },
    {
        "slug": "portret-van-gertrude-stein",
        "title": "Portret van Gertrude Stein",
        "original": "Portrait of Gertrude Stein",
        "year": "1905–1906",
        "room": "roze",
        "medium": "Olieverf op doek",
        "museum": "The Metropolitan Museum of Art",
        "city": "New York",
        "image": UPLOAD + "d/d6/GertrudeStein.JPG",
        "wiki": WIKI + "Portrait_of_Gertrude_Stein",
        "palette": ["#5a3b2a", "#9c6b48", "#d1a77c", "#2b2522"],
        "tags": ["portret", "schrijfster", "masker", "proto-kubisme", "parijs"],
        "text": "Stein poseerde zo'n negentig keer. Picasso was ontevreden, veegde het "
                "gezicht weg en schilderde het later uit zijn hoofd als een strak, "
                "masker-achtig gelaat. Toen men zei dat ze er niet zo uitzag, zei hij: "
                "\"Dat komt nog wel.\"",
    },
    {
        "slug": "guernica",
        "title": "Guernica",
        "original": "Guernica",
        "year": "1937",
        "room": "oorlog",
        "medium": "Olieverf op doek",
        "museum": "Museo Reina Sofía",
        "city": "Madrid",
        "image": UPLOAD + "7/74/PicassoGuernica.jpg",
        "wiki": WIKI + "Guernica_(Picasso)",
        "palette": ["#111111", "#5e5e5e", "#bdbdbd", "#f2f2f2"],
        "tags": ["oorlog", "kubisme", "zwart-wit", "paard", "stier", "bombardement", "spanje"],
        "text": "Picasso's woedende antwoord op het bombardement van het Baskische stadje "
                "Guernica. Bijna acht meter breed, alleen in zwart, wit en grijs: een "
                "schreeuwend paard, een stier, een lamp als oog. Misschien het "
                "beroemdste anti-oorlogsschilderij ooit.",
    },
    {
        "slug": "de-huilende-vrouw",
        "title": "De huilende vrouw",
        "original": "La Femme qui pleure",
        "year": "1937",
        "room": "oorlog",
        "medium": "Olieverf op doek",
        "museum": "Tate Modern",
        "city": "Londen",
        "image": UPLOAD + "1/14/Picasso_The_Weeping_Woman_Tate_identifier_T05010_10.jpg",
        "wiki": WIKI + "The_Weeping_Woman",
        "palette": ["#e2c33b", "#3d7f4f", "#d9443a", "#3a6fb5"],
        "tags": ["kubisme", "portret", "dora maar", "verdriet", "oorlog", "kleur"],
        "text": "Een nagalm van Guernica: een vrouw met een rode hoed huilt, haar gezicht "
                "in scherven gebroken. Model was fotografe Dora Maar. De felle kleuren "
                "maken het verdriet alleen maar scherper.",
    },
]

BY_SLUG = {a["slug"]: a for a in ARTWORKS}


def search(query):
    """Return artworks matching every word of the query (title, year, museum, room, tags, text)."""
    words = [w for w in (query or "").lower().split() if w]
    if not words:
        return list(ARTWORKS)

    def haystack(a):
        room = ROOMS[a["room"]]
        return " ".join([a["title"], a["original"], a["year"], a["museum"], a["city"],
                         a["room"], room["name"], " ".join(a["tags"]), a["text"]]).lower()

    return [a for a in ARTWORKS if all(w in haystack(a) for w in words)]

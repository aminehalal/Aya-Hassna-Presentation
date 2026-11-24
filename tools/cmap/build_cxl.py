"""Generates the "5 grands enjeux RH de 2023" concept map as CmapTools CXL files
(File > Import > CXL in CmapTools), plus a plain-text list of propositions.

    python tools/cmap/build_cxl.py        ->  export/cmap/*.cxl, propositions.md
"""

import itertools
import math
import os
from xml.sax.saxutils import quoteattr

OUT = os.path.join("export", "cmap")
os.makedirs(OUT, exist_ok=True)

ROOT = "Les 5 grands enjeux RH de 2023"
COLORS = [(79, 140, 255), (150, 110, 255), (30, 190, 165), (240, 150, 50), (20, 175, 215)]  # one per enjeu
INK = (14, 22, 52)


def tint(c, k):
    return tuple(int(v + (255 - v) * k) for v in c)


def rgba(c, a=255):
    return f"{c[0]},{c[1]},{c[2]},{a}"


# (enjeu, phrase from root, [(phrase, concept, [(phrase, sub-concept), ...]), ...])
ENJEUX = [
    ("1. Recruter de nouveaux talents", "se décline en", [
        ("concerne", "46 % des responsables RH veulent attirer de nouveaux talents (selon le webinar)", []),
        ("passe par", "Une marque employeur solide, en interne et en externe", [
            ("évite que", "69 % des candidats rejettent une entreprise à l'image médiocre (selon le webinar)")]),
        ("s'appuie d'abord sur", "Le vivier interne : promotion, reconversion, nouvelles missions", []),
        ("exige", "Un processus de recrutement simple, rapide et créatif", [
            ("peut prendre la forme d'", "Entretiens collectifs, ludiques ou à distance")]),
        ("suppose des", "Offres d'emploi attractives", [
            ("mettent en avant l'", "Équilibre vie pro / perso et télétravail"),
            ("mettent en avant la", "Rémunération : fixe, variable, avantages"),
            ("mettent en avant le", "Sens au travail et critères ESG"),
            ("mettent en avant l'", "Évolution de carrière et montée en compétences"),
            ("mettent en avant l'", "Autonomie et responsabilités")]),
    ]),
    ("2. Engager puis fidéliser les talents", "se décline en", [
        ("commence par", "Un pré-boarding et un onboarding réussis", [
            ("peut améliorer la rétention de", "+ 82 % (selon le webinar)")]),
        ("s'appuie sur une", "Vision et des valeurs partagées et vécues par tous", []),
        ("développe le", "Sentiment d'appartenance", []),
        ("se nourrit du", "Feedback des collaborateurs", [
            ("prend la forme de", "Rapports d'étonnement, 360° de fin de période d'essai, enquêtes ciblées")]),
        ("transforme les collaborateurs en", "Ambassadeurs fiers de leur entreprise", [
            ("se découvrent grâce à un", "Baromètre social qui révèle les leviers d'engagement")]),
    ]),
    ("3. QVCT et climat social", "se décline en", [
        ("vise à prévenir l'", "Épuisement professionnel", [
            ("touche", "35 % des salariés ont déclaré un burn-out en 2022 (selon le webinar)")]),
        ("se mesure avec un", "Baromètre social anonyme et régulier", [
            ("révèle les", "Irritants et les leviers d'engagement")]),
        ("se précise avec des", "Sondages ciblés sur une équipe ou un sujet", []),
        ("exige de", "Communiquer avant, pendant et après l'enquête", []),
        ("repose sur un", "Management plus attentif et éclairé", []),
    ]),
    ("4. Pérenniser les nouveaux modes de travail", "se décline en", [
        ("repose sur un", "Travail hybride durable", [
            ("atteint en moyenne", "2 jours de télétravail par semaine en 2022 (selon le webinar)")]),
        ("demande des", "Espaces de travail axés sur les interactions", []),
        ("place au centre les", "Collaborateurs, questionnés sur leur ressenti", []),
        ("nécessite d'accompagner les", "Managers, passés d'un management de proximité à un management à distance", []),
    ]),
    ("5. Moderniser les processus RH", "se décline en", [
        ("commence par", "Définir son besoin : quelles tâches automatiser ?", []),
        ("passe par un", "Équipement simple et efficace : SIRH, logiciel de paie, baromètre social", []),
        ("réduit la", "Charge administrative", [
            ("occupe la moitié du temps de", "69 % des RH (selon le webinar)")]),
        ("libère du temps pour la", "Stratégie et la dimension humaine du métier", [
            ("a motivé le choix du métier de", "71 % des RH (selon le webinar)")]),
    ]),
]

CONTEXT = ("Un contexte anxiogène : crise sanitaire, grande démission, crise énergétique, inflation",
           "explique les")
CONCLUSION = [
    ("exigent de", "Impliquer les collaborateurs et recueillir leur feedback"),
]
CONCLUSION_CHAIN = [
    ("permet de trouver des", "Solutions collectives"),
    ("responsabilise et implique les", "Équipes dans la réussite de l'entreprise"),
]
GO_FURTHER = ("sera approfondi avec la", "Diversité, l'équité et l'inclusion")


class MapBuilder:
    def __init__(self, title):
        self.title = title
        self.ids = itertools.count(1)
        self.concepts = {}  # id -> [label, x, y, w, h]
        self.phrases = {}
        self.links = []  # (id, from, to)
        self.lines = []  # for propositions
        self.style = {}  # concept id -> (color, level)
        self.pstyle = {}  # phrase id -> color

    def _size(self, label, phrase=False):
        if phrase:
            return (max(70, int(len(label) * 7.4 + 24)), 26)
        w = 210 if len(label) > 26 else max(120, int(len(label) * 8 + 36))
        lines = max(1, math.ceil(len(label) * 7.6 / (w - 24)))
        return (w, 24 + 18 * lines)

    def concept(self, label, x, y, color=INK, level=0):
        cid = str(next(self.ids))
        w, h = self._size(label)
        if level == 0:
            w, h = max(w, 250), max(h, 70)
        elif level == 1:
            w, h = max(w, 230), max(h, 56)
        self.concepts[cid] = [label, x, y, w, h]
        self.style[cid] = (color, level)
        return cid

    def link(self, a, phrase, b):
        """a --phrase--> b"""
        pid = str(next(self.ids))
        ax, ay = self.concepts[a][1:3]
        bx, by = self.concepts[b][1:3]
        w, h = self._size(phrase, True)
        self.phrases[pid] = [phrase, (ax + bx) / 2, (ay + by) / 2, w, h]
        self.pstyle[pid] = self.style[b][0]
        self.links.append((str(next(self.ids)), a, pid))
        self.links.append((str(next(self.ids)), pid, b))
        self.lines.append(f"{self.concepts[a][0]}  —[{phrase}]→  {self.concepts[b][0]}")

    def xml(self):
        xs = [v[1] for v in itertools.chain(self.concepts.values(), self.phrases.values())]
        ys = [v[2] for v in itertools.chain(self.concepts.values(), self.phrases.values())]
        dx, dy = 200 - min(xs), 120 - min(ys)
        for v in itertools.chain(self.concepts.values(), self.phrases.values()):
            v[1] += dx
            v[2] += dy
        width = int(max(v[1] for v in self.concepts.values()) + 260)
        height = int(max(v[2] for v in self.concepts.values()) + 160)
        o = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<cmap xmlns="http://cmap.ihmc.us/xml/cmap/" xmlns:dc="http://purl.org/dc/elements/1.1/" '
             'xmlns:dcterms="http://purl.org/dc/terms/" xmlns:vcard="http://www.w3.org/2001/vcard-rdf/3.0#">',
             f'  <res-meta><dc:title>{self.title}</dc:title><dc:language>fr</dc:language>'
             '<dc:creator><vcard:FN>Aya Yakoubi, Hassna Elhaddajy</vcard:FN></dc:creator></res-meta>',
             f'  <map width="{width}" height="{height}">',
             '    <concept-list>']
        o += [f'      <concept id="{i}" label={quoteattr(v[0])}/>' for i, v in self.concepts.items()]
        o += ['    </concept-list>', '    <linking-phrase-list>']
        o += [f'      <linking-phrase id="{i}" label={quoteattr(v[0])}/>' for i, v in self.phrases.items()]
        o += ['    </linking-phrase-list>', '    <connection-list>']
        o += [f'      <connection id="{i}" from-id="{a}" to-id="{b}"/>' for i, a, b in self.links]
        o += ['    </connection-list>', '    <concept-appearance-list>']
        o += [f'      <concept-appearance id="{i}" x="{int(v[1])}" y="{int(v[2])}" width="{v[3]}" height="{v[4]}"/>' for i, v in self.concepts.items()]
        o += ['    </concept-appearance-list>', '    <linking-phrase-appearance-list>']
        o += [f'      <linking-phrase-appearance id="{i}" x="{int(v[1])}" y="{int(v[2])}" width="{v[3]}" height="{v[4]}"/>' for i, v in self.phrases.items()]
        o += ['    </linking-phrase-appearance-list>', '  </map>', '  <style-sheet-list>', '    <style-sheet id="_Default_">',
              '      <map-style background-color="248,250,255,255" image-style="full" image-top-left="0,0"/>',
              '      <concept-style font-name="Segoe UI" font-size="14" font-style="plain" font-color="14,22,52,255" text-margin="6" '
              'background-color="237,244,255,255" border-color="79,140,255,255" border-style="solid" border-thickness="2" '
              'border-shape="rounded-rectangle" border-shape-rrarc="18.0" text-alignment="center" shadow-style="none" '
              'min-width="-1" min-height="-1" max-width="-1.0" max-height="-1.0" group-child-spacing="10" group-parent-spacing="10"/>',
              '      <linking-phrase-style font-name="Segoe UI" font-size="12" font-style="italic" font-color="90,100,130,255" text-margin="2" '
              'background-color="248,250,255,255" border-color="248,250,255,255" border-style="solid" border-thickness="1" '
              'border-shape="rectangle" text-alignment="center" shadow-style="none" min-width="-1" min-height="-1" max-width="-1.0" max-height="-1.0"/>',
              '      <connection-style color="120,135,175,255" style="solid" thickness="2" type="curved" arrowhead="if-to-concept-and-from-linking-phrase"/>',
              '    </style-sheet>']
        for cid, (color, level) in self.style.items():
            if level == 0:
                fill, border, font, size, st = INK, INK, (255, 255, 255), 20, "bold"
            elif level == 1:
                fill, border, font, size, st = color, color, (255, 255, 255), 17, "bold"
            elif level == 2:
                fill, border, font, size, st = tint(color, 0.86), color, INK, 14, "plain"
            else:
                fill, border, font, size, st = (255, 255, 255), color, INK, 13, "plain"
            o.append(f'    <style-sheet id="{cid}"><concept-style font-name="Segoe UI" font-size="{size}" font-style="{st}" font-color="{rgba(font)}" '
                     f'background-color="{rgba(fill)}" border-color="{rgba(border)}" border-thickness="2" border-shape="rounded-rectangle" '
                     'border-shape-rrarc="18.0" text-alignment="center"/></style-sheet>')
        for pid, color in self.pstyle.items():
            o.append(f'    <style-sheet id="{pid}"><linking-phrase-style font-name="Segoe UI" font-size="12" font-style="italic" '
                     f'font-color="{rgba(tuple(int(v * 0.8) for v in color))}"/></style-sheet>')
        o += ['  </style-sheet-list>', '</cmap>']
        return "\n".join(o)

    def save(self, name):
        with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
            f.write(self.xml())


X_ROOT, X_ENJEU, X_LEAF, X_SUB = 0, 640, 1320, 2080
ROW = 118


def tree(m, enjeux_idx, with_context):
    """Left-to-right tree: root -> enjeux -> leaves -> sub-concepts. Returns (root id, bottom y)."""
    y = 0
    placed = []
    for k in enjeux_idx:
        name, phrase, leaves = ENJEUX[k]
        leaf_ys = []
        for (lp, ll, subs) in leaves:
            rows = max(1, len(subs))
            sub_ys = [y + i * ROW for i in range(rows)]
            leaf_ys.append((sum(sub_ys) / rows, sub_ys))
            y += rows * ROW
        y += 40  # air between branches
        placed.append((k, leaf_ys))
    enjeu_ys = [sum(ly for ly, _ in lys) / len(lys) for _, lys in placed]
    root_y = sum(enjeu_ys) / len(enjeu_ys)
    root = m.concept(ROOT, X_ROOT, root_y, INK, 0)
    if with_context:
        ctx = m.concept(CONTEXT[0], X_ROOT, root_y - 330, (210, 80, 70), 2)
        m.link(ctx, CONTEXT[1], root)
    for (k, lys), ey in zip(placed, enjeu_ys):
        name, phrase, leaves = ENJEUX[k]
        node = m.concept(name, X_ENJEU, ey, COLORS[k], 1)
        m.link(root, phrase, node)
        for (lp, ll, subs), (ly, sub_ys) in zip(leaves, lys):
            leaf = m.concept(ll, X_LEAF, ly, COLORS[k], 2)
            m.link(node, lp, leaf)
            for (sp, sl), sy in zip(subs, sub_ys):
                m.link(leaf, sp, m.concept(sl, X_SUB, sy, COLORS[k], 3))
    return root, y


# ---------------------------------------------------------------- main map
main = MapBuilder("Les 5 grands enjeux RH de 2023 — carte conceptuelle")
root, bottom = tree(main, range(5), True)
concl = main.concept(CONCLUSION[0][1], X_ENJEU, bottom + 120, (60, 70, 110), 2)
main.link(root, CONCLUSION[0][0], concl)
prev = concl
for k, (p_, l) in enumerate(CONCLUSION_CHAIN):
    nxt = main.concept(l, [X_LEAF, X_SUB][k], bottom + 120, (60, 70, 110), 2)
    main.link(prev, p_, nxt)
    prev = nxt
main.link(prev, GO_FURTHER[0], main.concept(GO_FURTHER[1], X_SUB, bottom + 120 + ROW * 1.3, (240, 150, 50), 2))
main.save("00-carte-complete-5-enjeux-RH-2023.cxl")

# ---------------------------------------------------------------- one map per enjeu
for k in range(5):
    m = MapBuilder(f"Enjeu RH 2023 — {ENJEUX[k][0]}")
    tree(m, [k], False)
    m.save(f"0{k + 1}-enjeu-{k + 1}.cxl")

# ---------------------------------------------------------------- propositions (fallback: type or paste)
with open(os.path.join(OUT, "propositions.md"), "w", encoding="utf-8") as f:
    f.write("# Carte conceptuelle — propositions « concept — [mot de liaison] → concept »\n\n")
    f.write("Source : webinar Bleexo « Les 5 grands enjeux RH de 2023 » (les chiffres sont ceux cités dans le webinar).\n\n")
    for line in main.lines:
        f.write(f"- {line}\n")
print("written:", ", ".join(sorted(os.listdir(OUT))))


# ---------------------------------------------------------------- preview image (to check the layout)
from PIL import Image, ImageDraw, ImageFont


def preview(m, name):
    items = list(m.concepts.values()) + list(m.phrases.values())
    xs = [v[1] for v in items]
    ys = [v[2] for v in items]
    pad = 160
    x0, y0 = min(xs) - pad - 100, min(ys) - pad
    W, H = int(max(xs) - x0 + pad + 100), int(max(ys) - y0 + pad)
    img = Image.new("RGB", (W, H), (248, 250, 255))
    d = ImageDraw.Draw(img)

    def f(sz, b=False):
        return ImageFont.truetype("C:/Windows/Fonts/" + ("segoeuib.ttf" if b else "segoeui.ttf"), sz)

    pos = {i: (v[1] - x0, v[2] - y0) for i, v in {**m.concepts, **m.phrases}.items()}
    for _, a, b in m.links:
        col = m.pstyle.get(a) or m.pstyle.get(b) or (120, 135, 175)
        d.line([pos[a], pos[b]], fill=tint(col, 0.15), width=3)

    def wrap(txt, font, width):
        lines, cur = [], ""
        for w_ in txt.split():
            t = (cur + " " + w_).strip()
            if d.textlength(t, font=font) <= width:
                cur = t
            else:
                lines.append(cur)
                cur = w_
        return lines + [cur]

    for cid, (label, x, y, w, h) in m.concepts.items():
        color, level = m.style[cid]
        if level == 0:
            fill, border, fc, sz, bold = INK, INK, (255, 255, 255), 21, True
        elif level == 1:
            fill, border, fc, sz, bold = color, color, (255, 255, 255), 18, True
        elif level == 2:
            fill, border, fc, sz, bold = tint(color, 0.86), color, INK, 15, False
        else:
            fill, border, fc, sz, bold = (255, 255, 255), color, INK, 14, False
        cx, cy = pos[cid]
        font = f(sz, bold)
        lines = wrap(label, font, w - 20)
        lh = sz + 5
        hh = max(h, len(lines) * lh + 20)
        d.rounded_rectangle([cx - w / 2, cy - hh / 2, cx + w / 2, cy + hh / 2], radius=16, fill=fill, outline=border, width=3)
        for i, ln in enumerate(lines):
            d.text((cx, cy - len(lines) * lh / 2 + i * lh + lh / 2), ln, font=font, fill=fc, anchor="mm")
    for pid, (label, x, y, w, h) in m.phrases.items():
        cx, cy = pos[pid]
        d.rounded_rectangle([cx - w / 2, cy - 13, cx + w / 2, cy + 13], radius=8, fill=(248, 250, 255))
        d.text((cx, cy), label, font=f(13), fill=tuple(int(v * 0.75) for v in m.pstyle[pid]), anchor="mm")
    img.save(os.path.join(OUT, name))


preview(main, "apercu-carte-complete.png")

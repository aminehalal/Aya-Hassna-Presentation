"""Assets for the Upskilling & Reskilling deck (creative template look):
organic blobs, doodles (dot grid, sparkles, squiggle), flat people for the
pictogram, and the unDraw illustrations recoloured to the deck palette.
Output: export/skills/

    python tools/pptx/make_skills_assets.py
"""

import math
import os
import random
import re

from PIL import Image, ImageDraw

ART = os.path.join("tools", "pptx", "skills-art")  # unDraw SVGs (free licence, undraw.co)
OUT = os.path.join("export", "skills")
os.makedirs(OUT, exist_ok=True)
SS = 4

VIOLET = (108, 99, 255)
ORANGE = (255, 138, 91)
LILAC = (234, 231, 255)
PEACH = (255, 228, 214)
GREY = (196, 196, 210)


def save(img, name, size):
    img.resize(size, Image.LANCZOS).save(os.path.join(OUT, name), optimize=True)


def blob(name, color, seed, size=900):
    rnd = random.Random(seed)
    W = size * SS
    img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    harmonics = [(k, rnd.uniform(0.04, 0.09), rnd.uniform(0, 6.28)) for k in (2, 3, 4)]
    pts = []
    for t in range(0, 720):
        a = t / 720 * 2 * math.pi
        r = 0.42 * (1 + sum(amp * math.sin(k * a + ph) for k, amp, ph in harmonics))
        pts.append((W / 2 + math.cos(a) * r * W, W / 2 + math.sin(a) * r * W))
    d.polygon(pts, fill=color + (255,))
    save(img, name, (size, size))


blob("blob-lilac.png", LILAC, 3)
blob("blob-peach.png", PEACH, 11)

# dot grid
W, H = 7 * 34, 5 * 34
img = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
for i in range(7):
    for j in range(5):
        cx, cy = (17 + i * 34) * SS, (17 + j * 34) * SS
        d.ellipse([cx - 4 * SS, cy - 4 * SS, cx + 4 * SS, cy + 4 * SS], fill=VIOLET + (150,))
save(img, "dots.png", (W, H))

# sparkles (4-point stars)
for name, col in (("spark-orange.png", ORANGE), ("spark-violet.png", VIOLET)):
    S = 120 * SS
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c, R, r = S / 2, S * 0.48, S * 0.11
    pts = []
    for k in range(8):
        a = -math.pi / 2 + k * math.pi / 4
        rr = R if k % 2 == 0 else r
        pts.append((c + math.cos(a) * rr, c + math.sin(a) * rr))
    d.polygon(pts, fill=col + (255,))
    save(img, name, (120, 120))

# squiggle
W, H = 260, 60
img = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
pts = [(x * SS, (30 + 18 * math.sin(x / 260 * 4 * math.pi)) * SS) for x in range(10, 250)]
d.line(pts, fill=ORANGE + (255,), width=7 * SS, joint="curve")
for p in (pts[0], pts[-1]):
    d.ellipse([p[0] - 3.5 * SS, p[1] - 3.5 * SS, p[0] + 3.5 * SS, p[1] + 3.5 * SS], fill=ORANGE + (255,))
save(img, "squiggle.png", (W, H))

# flat people for the pictogram / walker
for name, col in (("violet", VIOLET), ("orange", ORANGE), ("grey", GREY)):
    w, h = 120 * SS, 170 * SS
    m = Image.new("L", (w, h), 0)
    md = ImageDraw.Draw(m)
    cx = w // 2
    md.ellipse([cx - 19 * SS, 21 * SS, cx + 19 * SS, 59 * SS], fill=255)
    md.rounded_rectangle([cx - 31 * SS, 70 * SS, cx + 31 * SS, 153 * SS], radius=26 * SS, fill=255)
    out = Image.new("RGBA", (w, h), col + (0,))
    out.putalpha(m)
    save(out, f"person-{name}.png", (120, 170))

# illustrations: unDraw's accent colour (#6c63ff) -> violet (as is) or orange
for f in os.listdir(ART):
    if not f.endswith(".svg"):
        continue
    svg = open(os.path.join(ART, f), encoding="utf-8").read()
    open(os.path.join(OUT, f), "w", encoding="utf-8").write(svg)
    open(os.path.join(OUT, f.replace(".svg", "-orange.svg")), "w", encoding="utf-8").write(re.sub("#6c63ff", "#ff8a5b", svg, flags=re.I))
    open(os.path.join(OUT, f.replace(".svg", "-white.svg")), "w", encoding="utf-8").write(re.sub("#6c63ff", "#ffffff", svg, flags=re.I))
print("assets in", OUT)

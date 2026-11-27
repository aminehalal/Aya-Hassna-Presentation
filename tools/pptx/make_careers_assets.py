"""Assets for "La gestion des carrières" (career subway-map design):
dot texture, flat people (climber / walker) and the unDraw illustrations
recoloured to each subway line (green, pink, yellow, blue) + white.
Output: export/careers/

    python tools/pptx/make_careers_assets.py
"""

import os
import re

from PIL import Image, ImageDraw

ART = os.path.join("tools", "pptx", "careers-art")  # unDraw SVGs (free licence, undraw.co)
OUT = os.path.join("export", "careers")
os.makedirs(OUT, exist_ok=True)
SS = 4

INK = (29, 27, 58)
LINES = {"green": "#17a673", "pink": "#e9407a", "yellow": "#f2ae00", "blue": "#2f6bff", "white": "#ffffff"}


def save(img, name, size):
    img.resize(size, Image.LANCZOS).save(os.path.join(OUT, name), optimize=True)


# dot texture
W, H = 7 * 34, 5 * 34
img = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
for i in range(7):
    for j in range(5):
        cx, cy = (17 + i * 34) * SS, (17 + j * 34) * SS
        d.ellipse([cx - 4 * SS, cy - 4 * SS, cx + 4 * SS, cy + 4 * SS], fill=INK + (60,))
save(img, "dots.png", (W, H))

# flat people
for name, col in (("ink", INK), ("pink", (233, 64, 122)), ("green", (23, 166, 115)), ("blue", (47, 107, 255))):
    w, h = 120 * SS, 170 * SS
    m = Image.new("L", (w, h), 0)
    md = ImageDraw.Draw(m)
    cx = w // 2
    md.ellipse([cx - 19 * SS, 21 * SS, cx + 19 * SS, 59 * SS], fill=255)
    md.rounded_rectangle([cx - 31 * SS, 70 * SS, cx + 31 * SS, 153 * SS], radius=26 * SS, fill=255)
    out = Image.new("RGBA", (w, h), col + (0,))
    out.putalpha(m)
    save(out, f"person-{name}.png", (120, 170))

# illustrations: unDraw accent (#6c63ff) -> line colour; secondary pink kept
for f in os.listdir(ART):
    if not f.endswith(".svg"):
        continue
    svg = open(os.path.join(ART, f), encoding="utf-8").read()
    for name, hexcol in LINES.items():
        open(os.path.join(OUT, f.replace(".svg", f"-{name}.svg")), "w", encoding="utf-8").write(re.sub("#6c63ff", hexcol, svg, flags=re.I))
print("assets in", OUT)

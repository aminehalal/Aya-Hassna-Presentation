"""Assets for the Upskilling & Reskilling deck (professional look):
- background.png: clean white-to-cool-grey, a very faint navy diagonal band on
  the right, nothing decorative that competes with the content;
- person-<colour>.png: flat silhouettes (no glow) in the deck's colours.
Output: export/skills/

    python tools/pptx/make_skills_assets.py
"""

import os

from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join("export", "skills")
os.makedirs(OUT, exist_ok=True)
W, H = 1920, 1080

# ---------------------------------------------------------------- background
img = Image.new("RGB", (W, H))
d = ImageDraw.Draw(img)
for y in range(H):
    k = y / H
    d.line([(0, y), (W, y)], fill=(int(251 - 6 * k), int(252 - 5 * k), int(253 - 3 * k)))
band = Image.new("RGBA", (W, H), (0, 0, 0, 0))
bd = ImageDraw.Draw(band)
bd.polygon([(1500, 0), (1920, 0), (1920, 1080), (1150, 1080)], fill=(31, 78, 140, 9))
bd.polygon([(1700, 0), (1920, 0), (1920, 1080), (1450, 1080)], fill=(31, 78, 140, 7))
band = band.filter(ImageFilter.GaussianBlur(2))
img = Image.alpha_composite(img.convert("RGBA"), band)
img.convert("RGB").save(os.path.join(OUT, "background.png"), optimize=True)

# ---------------------------------------------------------------- people
SS = 4
COLORS = {"navy": (31, 78, 140), "gold": (194, 145, 58), "grey": (176, 184, 196), "slate": (61, 90, 128)}
for name, col in COLORS.items():
    w, h = 120 * SS, 170 * SS
    m = Image.new("L", (w, h), 0)
    md = ImageDraw.Draw(m)
    cx = w // 2
    r = 19 * SS
    md.ellipse([cx - r, 40 * SS - r, cx + r, 40 * SS + r], fill=255)
    md.rounded_rectangle([cx - 31 * SS, 70 * SS, cx + 31 * SS, 153 * SS], radius=26 * SS, fill=255)
    out = Image.new("RGBA", (w, h), col + (0,))
    out.putalpha(m)
    out.resize((120, 170), Image.LANCZOS).save(os.path.join(OUT, f"person-{name}.png"), optimize=True)
print("assets in", OUT)

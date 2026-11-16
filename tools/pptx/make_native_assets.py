"""Icon set for the native PowerPoint version (no video): people, light-bulbs,
glowing orbs, the core, a gyroscope and the starry background. Transparent
PNGs, drawn at 4x and downsampled for clean edges. Output: export/native/*.png

    python tools/pptx/make_native_assets.py
"""

import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join("export", "native")
os.makedirs(OUT, exist_ok=True)
SS = 4  # supersampling

COLORS = {
    "grey": (135, 148, 180),
    "blue": (79, 140, 255),
    "violet": (169, 139, 255),
    "cyan": (69, 224, 255),
    "amber": (255, 184, 107),
    "teal": (63, 224, 197),
    "white": (232, 240, 255),
    "coral": (255, 122, 107),
}


def save(img, name, size=None):
    if size:
        img = img.resize(size, Image.LANCZOS)
    img.save(os.path.join(OUT, f"{name}.png"), optimize=True)


def glow_layer(size, shape_mask, color, radius, strength=1.0):
    """Soft coloured glow from a mask."""
    g = Image.new("RGBA", size, color + (0,))
    blurred = shape_mask.filter(ImageFilter.GaussianBlur(radius))
    alpha = blurred.point(lambda v: int(min(255, v * strength)))
    g.putalpha(alpha)
    return g


def lighten(c, k):
    return tuple(int(v + (255 - v) * k) for v in c)


def darken(c, k):
    return tuple(int(v * (1 - k)) for v in c)


# ---------------------------------------------------------------- people
def person(name, color):
    W, H = 120 * SS, 170 * SS
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    cx = W // 2
    # head
    r = 19 * SS
    d.ellipse([cx - r, 30 * SS - r + 10 * SS, cx + r, 30 * SS + r + 10 * SS], fill=255)
    # torso (rounded shoulders)
    d.rounded_rectangle([cx - 31 * SS, 70 * SS, cx + 31 * SS, 150 * SS], radius=26 * SS, fill=255)
    body = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    # vertical gradient fill
    grad = Image.new("RGBA", (W, H))
    gd = ImageDraw.Draw(grad)
    top, bottom = lighten(color, 0.45), darken(color, 0.12)
    for y in range(H):
        k = y / H
        gd.line([(0, y), (W, y)], fill=tuple(int(top[i] + (bottom[i] - top[i]) * k) for i in range(3)) + (255,))
    body.paste(grad, (0, 0), mask)
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    out.alpha_composite(glow_layer((W, H), mask, color, 9 * SS, 0.55))
    out.alpha_composite(body)
    save(out, f"person-{name}", (120, 170))


for n, c in COLORS.items():
    person(n, c)


# ---------------------------------------------------------------- orbs (soft glows)
def orb(name, color, size=256, core=0.0):
    W = size * SS
    img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    px = img.load()
    c = W / 2
    for y in range(0, W, SS):
        for x in range(0, W, SS):
            d = math.hypot(x - c, y - c) / c
            a = max(0.0, 1 - d) ** 2.2
            col = lighten(color, min(1.0, core * max(0.0, 1 - d * 2.5)))
            for dy in range(SS):
                for dx in range(SS):
                    px[x + dx, y + dy] = col + (int(255 * a),)
    save(img, f"orb-{name}", (size, size))


for n, c in COLORS.items():
    orb(n, c, core=0.6)


# ---------------------------------------------------------------- core (the organisation)
def sphere(name, color, size=320):
    W = size * SS
    img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    mask = Image.new("L", (W, W), 0)
    m = ImageDraw.Draw(mask)
    pad = int(W * 0.2)
    m.ellipse([pad, pad, W - pad, W - pad], fill=255)
    img.alpha_composite(glow_layer((W, W), mask, color, W * 0.08, 0.9))
    shade = Image.new("RGBA", (W, W))
    sp = shade.load()
    R = (W - 2 * pad) / 2
    cx = cy = W / 2
    hx, hy = cx - R * 0.35, cy - R * 0.4
    for y in range(pad, W - pad):
        for x in range(pad, W - pad):
            if (x - cx) ** 2 + (y - cy) ** 2 > R * R:
                continue
            k = min(1.0, math.hypot(x - hx, y - hy) / (R * 1.6))
            col = tuple(int(lighten(color, 0.75)[i] * (1 - k) + darken(color, 0.35)[i] * k) for i in range(3))
            sp[x, y] = col + (255,)
    img.alpha_composite(shade)
    save(img, name, (size, size))


sphere("core", (98, 92, 255))
sphere("sphere-cyan", COLORS["cyan"], 200)
for n in ("blue", "violet", "amber", "teal"):
    sphere(f"sphere-{n}", COLORS[n], 200)


# ---------------------------------------------------------------- light-bulbs
def bulb(name, glass, glow_strength, size=(140, 200)):
    W, H = size[0] * SS, size[1] * SS
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    cx = W // 2
    r = int(W * 0.36)
    cy = int(H * 0.36)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    d.polygon([(cx - r * 0.62, cy + r * 0.72), (cx + r * 0.62, cy + r * 0.72), (cx + r * 0.36, int(H * 0.72)), (cx - r * 0.36, int(H * 0.72))], fill=255)
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    out.alpha_composite(glow_layer((W, H), mask, glass, 14 * SS, glow_strength))
    body = Image.new("RGBA", (W, H), lighten(glass, 0.35) + (255,))
    out.alpha_composite(Image.composite(body, Image.new("RGBA", (W, H), (0, 0, 0, 0)), mask))
    # highlight + filament
    dd = ImageDraw.Draw(out)
    shine = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shine).ellipse([cx - r * 0.55, cy - r * 0.62, cx - r * 0.15, cy - r * 0.2], fill=(255, 255, 255, 140))
    out.alpha_composite(shine)
    fil = darken(glass, 0.35) + (255,)
    dd.line([(cx - r * 0.3, cy + r * 0.55), (cx - r * 0.15, cy), (cx, cy + r * 0.3), (cx + r * 0.15, cy), (cx + r * 0.3, cy + r * 0.55)], fill=fil, width=3 * SS)
    # screw base
    by = int(H * 0.72)
    for k in range(3):
        dd.rounded_rectangle([cx - r * 0.4, by + k * 9 * SS, cx + r * 0.4, by + k * 9 * SS + 7 * SS], radius=3 * SS, fill=(150, 162, 196, 255))
    dd.ellipse([cx - r * 0.18, by + 26 * SS, cx + r * 0.18, by + 36 * SS], fill=(120, 130, 160, 255))
    save(out, name, size)


bulb("bulb-off", (150, 160, 200), 0.25)
for n in ("cyan", "violet", "blue", "amber", "coral"):
    bulb(f"bulb-{n}", COLORS[n], 0.8)
bulb("bulb-lit", (255, 210, 122), 1.0)


# ---------------------------------------------------------------- gyroscope (change)
def gyroscope(size=220):
    W = size * SS
    img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    mask = Image.new("L", (W, W), 0)
    m = ImageDraw.Draw(mask)
    c = W // 2
    for rx, ry, rot in ((0.36, 0.16, -20), (0.36, 0.16, 50), (0.22, 0.22, 0)):
        ring = Image.new("L", (W, W), 0)
        rd = ImageDraw.Draw(ring)
        rd.ellipse([c - W * rx, c - W * ry, c + W * rx, c + W * ry], outline=255, width=6 * SS)
        mask.paste(255, (0, 0), ring.rotate(rot, resample=Image.BICUBIC))
    m.polygon([(c, c - 18 * SS), (c + 14 * SS, c), (c, c + 18 * SS), (c - 14 * SS, c)], fill=255)
    color = COLORS["blue"]
    img.alpha_composite(glow_layer((W, W), mask, color, 10 * SS, 0.9))
    body = Image.new("RGBA", (W, W), lighten(color, 0.55) + (255,))
    img.alpha_composite(Image.composite(body, Image.new("RGBA", (W, W), (0, 0, 0, 0)), mask))
    save(img, "gyroscope", (size, size))


gyroscope()


# ---------------------------------------------------------------- background
def background():
    W, H = 1920, 1080
    img = Image.new("RGB", (W, H), (3, 5, 11))
    d = ImageDraw.Draw(img)
    for y in range(H):
        k = y / H
        d.line([(0, y), (W, y)], fill=(int(6 - 3 * k), int(9 - 4 * k), int(20 - 9 * k)))
    neb = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    nd = ImageDraw.Draw(neb)
    for (x, y, r, col, a) in ((1350, 420, 520, (40, 60, 160), 70), (300, 900, 480, (60, 40, 140), 55), (1700, 120, 380, (20, 70, 140), 50)):
        nd.ellipse([x - r, y - r, x + r, y + r], fill=col + (a,))
    neb = neb.filter(ImageFilter.GaussianBlur(160))
    img = Image.alpha_composite(img.convert("RGBA"), neb)
    stars = ImageDraw.Draw(img)
    rnd = random.Random(7)
    for _ in range(520):
        x, y = rnd.random() * W, rnd.random() * H
        b = rnd.randint(90, 220)
        s = rnd.choice((1, 1, 1, 2))
        stars.ellipse([x, y, x + s, y + s], fill=(b, b, min(255, b + 30), 255))
    img.convert("RGB").save(os.path.join(OUT, "background.png"), optimize=True)


background()
print("assets in", OUT)

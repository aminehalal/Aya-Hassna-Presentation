"""Generates the dark gradient overlays ("scrims") placed between the 3D video
and the text in the PowerPoint version — the same gradients the website uses
to keep text readable over the 3D scenes. Output: export/assets/scrim-*.png"""

import math
import os
import sys

from PIL import Image

W, H = 1920, 1080
INK = (3, 5, 11)
OUT = os.path.join(sys.argv[1] if len(sys.argv) > 1 else "export", "assets")
os.makedirs(OUT, exist_ok=True)


def ramp(stops, t):
    """Piecewise-linear alpha (0..1) from [(position, alpha), ...]."""
    for (p0, a0), (p1, a1) in zip(stops, stops[1:]):
        if t <= p1:
            k = 0 if p1 == p0 else (t - p0) / (p1 - p0)
            return a0 + (a1 - a0) * max(0.0, min(1.0, k))
    return stops[-1][1]


def save(name, alpha_at):
    img = Image.new("RGBA", (W, H))
    px = img.load()
    for y in range(H):
        for x in range(W):
            a = alpha_at(x / W, y / H)
            px[x, y] = INK + (int(255 * max(0.0, min(1.0, a))),)
    img = img.resize((W // 2, H // 2), Image.LANCZOS)  # smooth gradients compress well at half size
    img.save(os.path.join(OUT, f"scrim-{name}.png"), optimize=True)
    print("saved", name)


LEFT = [(0, 0.9), (0.36, 0.66), (0.64, 0.0), (1, 0.0)]
save("left", lambda x, y: ramp(LEFT, x))
save("top", lambda x, y: ramp([(0, 0.86), (0.42, 0.48), (0.64, 0.0), (1, 0.0)], y))
save("bottom", lambda x, y: ramp([(0, 0.95), (0.34, 0.65), (0.62, 0.0), (1, 0.0)], 1 - y))
save("question", lambda x, y: max(ramp([(0, 0.88), (0.4, 0.5), (0.58, 0.0), (1, 0)], y), ramp([(0, 0.65), (0.3, 0)], 1 - y)))
save(
    "center",
    lambda x, y: ramp([(0, 0.74), (0.6, 0.3), (1, 0.0)], math.hypot((x - 0.5) / 0.62, (y - 0.5) / 0.58)),
)
save("radial", lambda x, y: ramp([(0, 0.7), (1, 0.0)], math.hypot((x - 0.5) / 0.4, (y - 0.5) / 0.42)))

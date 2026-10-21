"""Repair the exact fixed ocular rim cut out of the original WebP layers.

Only the scope metal silhouette is reassigned: base and original stay untouched.
The head, hairstyle, controls, and educational model are not redesigned.
Run once against the PR #18 assets, then commit the two output WebPs.
"""
from hashlib import sha256
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent / "assets" / "optics"
INPUT_SHA256 = {
    "optic-artwork.webp": "1bad9aafdc6c2af3a0539df11182b81ab9c06f488d61c8521517593e84aaf5f1",
    "optic-static.webp": "d422ba10d10c8db7758b42aa27526b29e01ff83bdcf181ef54d1e564f663dbc3",
    "optic-head.webp": "e8cbb6cb30d7583a675c1d47a06801ff873d44e2a5d7f24175bc120e2cc08e50",
    "optic-foreground.webp": "b8cfd30966b26a4a85cbc3a25dd08a4bd4e189138a351ab8d6432099871cd81e",
}
for filename, expected in INPUT_SHA256.items():
    digest = sha256((ROOT / filename).read_bytes()).hexdigest()
    if digest != expected:
        raise RuntimeError(f"Source asset changed since review: {filename} ({digest})")

original = Image.open(ROOT / "optic-artwork.webp").convert("RGBA")
static = Image.open(ROOT / "optic-static.webp").convert("RGBA")
head = Image.open(ROOT / "optic-head.webp").convert("RGBA")
front = Image.open(ROOT / "optic-foreground.webp").convert("RGBA")
assert original.size == static.size == head.size == front.size == (1320, 528)

# Outline follows the original ocular's upper and right rim. The nearby
# fringe of hair begins to the RIGHT of this polygon and remains movable.
rim = [
    (763, 148), (784, 148), (797, 151), (804, 156),
    (810, 165), (814, 178), (817, 192), (817, 228),
    (813, 238), (806, 246), (793, 251), (763, 252),
]
mask = Image.new("L", original.size, 0)
ImageDraw.Draw(mask).polygon(rim, fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(0.70))

# Source-of-truth original pixels become the permanently fixed foreground;
# the identical pixels are removed from the translated head, not recolored.
front = Image.composite(original, front, mask)
head.putalpha(ImageChops.multiply(head.getchannel("A"), ImageChops.invert(mask)))

# Verify the ocular core is bit-identical at all slider travel extremes,
# even with vertical head displacement. Only head is translated.
observed = []
for dx, dy in [(-4, -1), (0, 0), (4, 1)]:
    translated = Image.new("RGBA", original.size)
    translated.alpha_composite(head, (dx, dy))
    composite = Image.alpha_composite(Image.alpha_composite(static, translated), front)
    observed.append(composite.crop((770, 165, 803, 239)).tobytes())
if not (observed[0] == observed[1] == observed[2]):
    raise RuntimeError("Fixed ocular rim still moves under head translations")
if mask.getpixel((835, 175)) != 0:
    raise RuntimeError("Ocular repair mask overlaps moving hair")

head.save(ROOT / "optic-head.webp", "WEBP", quality=97, method=6, exact=True)
front.save(ROOT / "optic-foreground.webp", "WEBP", quality=97, method=6, exact=True)
print("Repaired fixed ocular rim; confirmed identical core at ±4px, ±1px.")

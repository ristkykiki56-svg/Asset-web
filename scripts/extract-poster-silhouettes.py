#!/usr/bin/env python3
"""Extract four original orange silhouette targets from supplied poster as raster WebP.

The silhouettes are directly segmented from source pixels, not vector traced
or reimagined. Official sizes must come from the IMSSU rulebook, not the image.
"""
import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

BOXES = {
    "ram": (869, 137, 903, 176),
    "turkey": (864, 188, 900, 230),
    "pig": (848, 251, 891, 295),
    "chicken": (833, 299, 878, 350),
}

def extract(poster, output):
    src = np.asarray(Image.open(poster).convert("RGB"))
    if src.shape != (1536, 1065, 3):
        raise ValueError(f"Unexpected poster shape: {src.shape}")
    output.mkdir(parents=True, exist_ok=True)
    for animal, (x0, y0, x1, y1) in BOXES.items():
        rgb = src[y0:y1, x0:x1].astype(np.float32)
        red, green, blue = (rgb[:, :, i] for i in range(3))
        strong = ((red > 175) & (red-green > 100) & (green-blue > 32)
                  & (green < 140)).astype("uint8")
        count, labels, stats, _ = cv2.connectedComponentsWithStats(strong, 8)
        if count < 2:
            raise RuntimeError(f"No {animal} shape in poster")
        main = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        count_pixels = int(stats[main, cv2.CC_STAT_AREA])
        if count_pixels < 170:
            raise RuntimeError(f"{animal} silhouette too small: {count_pixels}")
        clean = np.uint8(labels == main)
        region = cv2.dilate(clean, np.ones((3, 3), np.uint8), iterations=2)
        alpha = (np.clip((red-green-20)/125, 0, 1) *
                 np.clip((green-blue-2)/34, 0, 1) * region)
        alpha[clean > 0] = 1
        alpha = np.uint8(np.round(np.clip(alpha, 0, 1)*255))
        ys, xs = np.where(alpha > 10)
        if len(xs) < 175:
            raise RuntimeError(f"Missing {animal} silhouette after extraction")
        xlo, xhi, ylo, yhi = int(xs.min()), int(xs.max()+1), int(ys.min()), int(ys.max()+1)
        cropped = Image.fromarray(np.dstack([np.uint8(rgb), alpha]), "RGBA").crop((xlo, ylo, xhi, yhi))
        scale = min(190/cropped.width, 148/cropped.height)
        width, height = round(cropped.width*scale), round(cropped.height*scale)
        cropped = cropped.resize((width, height), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (232, 176), (0, 0, 0, 0))
        canvas.alpha_composite(cropped, ((232-width)//2, (176-height)//2))
        file = output / f"{animal}.webp"
        canvas.save(file, format="WEBP", quality=94, method=6, exact=True)
        decoded = Image.open(file)
        if decoded.mode != "RGBA" or not decoded.getchannel("A").getbbox():
            raise RuntimeError(f"Unexpected WebP alpha: {animal}")
        print(animal, count_pixels, file.stat().st_size)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--poster", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    options = parser.parse_args()
    extract(options.poster, options.output)

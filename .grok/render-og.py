#!/usr/bin/env python3
"""Flashframe share-card: 16:9 geometric film-cover, then ffmpeg crops to 1200x630."""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1792, 1008
INK = (15, 13, 11)
SURFACE = (26, 23, 20)
IVORY = (244, 239, 232)
TAUPE = (168, 159, 148)
TERRACOTTA = (216, 90, 70)
TERRACOTTA_DEEP = (168, 58, 46)
TERRACOTTA_HOT = (232, 118, 96)
APERTURE = (10, 8, 7)

OUT = Path("/workspace/.grok/card-raw.png")
FONT_DISPLAY = "/usr/share/fonts/truetype/liberation/LiberationSansNarrow-Bold.ttf"
FONT_TAG = "/usr/share/fonts/truetype/liberation/LiberationSansNarrow-Regular.ttf"


def lerp(a, b, t):
    return a + (b - a) * t


def mix(c0, c1, t):
    return tuple(int(lerp(c0[i], c1[i], t)) for i in range(3))


def draw_vignette(base: Image.Image) -> Image.Image:
    arr = np.asarray(base).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W]
    dx = (xx - W / 2) / (W * 0.62)
    dy = (yy - H / 2) / (H * 0.58)
    r = np.sqrt(dx * dx + dy * dy)
    falloff = np.clip(1.0 - np.clip(r - 0.35, 0, None) * 0.72, 0.28, 1.0)
    arr *= falloff[..., None]
    return Image.fromarray(arr.astype(np.uint8), "RGB")


def add_grain(img: Image.Image, amount: float = 9.0) -> Image.Image:
    arr = np.asarray(img).astype(np.int16)
    rng = np.random.default_rng(frame_seed := 46)
    noise = rng.normal(0, amount, arr.shape).astype(np.int16)
    # slightly more grain in shadows
    lum = arr.mean(axis=2, keepdims=True)
    weight = (1.15 - lum / 255.0).clip(0.55, 1.2)
    arr = np.clip(arr + noise * weight, 0, 255).astype(np.uint8)
    return Image.fromarray(arr, "RGB")


def film_sprockets(draw: ImageDraw.ImageDraw) -> None:
    strip = 78
    draw.rectangle([0, 0, strip, H], fill=SURFACE)
    draw.rectangle([W - strip, 0, W, H], fill=SURFACE)
    # rebate lines
    draw.rectangle([strip, 0, strip + 6, H], fill=mix(INK, TERRACOTTA, 0.18))
    draw.rectangle([W - strip - 6, 0, W - strip, H], fill=mix(INK, TERRACOTTA, 0.18))
    hole_w, hole_h = 28, 18
    gap = 28
    y = 36
    while y + hole_h < H - 24:
        for x0 in (22, W - 22 - hole_w):
            draw.rounded_rectangle(
                [x0, y, x0 + hole_w, y + hole_h],
                radius=5,
                fill=IVORY,
            )
        y += hole_h + gap


def iris(draw: ImageDraw.ImageDraw, cx: int, cy: int) -> None:
    outer = 338
    inner = 108
    blades = 8
    # outer warm ring
    draw.ellipse(
        [cx - outer - 18, cy - outer - 18, cx + outer + 18, cy + outer + 18],
        fill=mix(SURFACE, TERRACOTTA, 0.22),
    )
    draw.ellipse(
        [cx - outer - 8, cy - outer - 8, cx + outer + 8, cy + outer + 8],
        outline=mix(TERRACOTTA, IVORY, 0.18),
        width=3,
    )

    for i in range(blades):
        a0 = i * (2 * math.pi / blades) - 0.22
        a1 = (i + 1) * (2 * math.pi / blades) + 0.08
        color = TERRACOTTA if i % 2 == 0 else TERRACOTTA_DEEP
        pts = []
        # inner hitch so blades overlap like a leaf shutter
        hitch = 0.38
        pts.append(
            (
                cx + math.cos((a0 + a1) / 2) * inner * hitch,
                cy + math.sin((a0 + a1) / 2) * inner * hitch,
            )
        )
        steps = 14
        for s in range(steps + 1):
            t = s / steps
            a = a0 + (a1 - a0) * t
            # slight scallop on the outer edge
            r = outer * (0.96 + 0.04 * math.sin(t * math.pi))
            pts.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
        draw.polygon(pts, fill=color)

    # inner aperture
    draw.ellipse(
        [cx - inner, cy - inner, cx + inner, cy + inner],
        fill=APERTURE,
    )
    draw.ellipse(
        [cx - inner + 10, cy - inner + 10, cx + inner - 10, cy + inner - 10],
        outline=mix(TERRACOTTA_HOT, IVORY, 0.25),
        width=2,
    )
    # tiny catchlight in the void
    draw.ellipse(
        [cx - 26, cy - 34, cx + 10, cy - 6],
        fill=mix(APERTURE, TERRACOTTA, 0.28),
    )


def text_size(font: ImageFont.FreeTypeFont, text: str, spacing: float) -> float:
    if not text:
        return 0.0
    return sum(font.getlength(c) for c in text) + spacing * (len(text) - 1)


def draw_spaced(
    draw: ImageDraw.ImageDraw,
    text: str,
    y: float,
    font: ImageFont.FreeTypeFont,
    fill,
    spacing: float,
    cx: float,
) -> None:
    total = text_size(font, text, spacing)
    x = cx - total / 2
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += font.getlength(ch) + spacing


def lockup(base: Image.Image, cx: int) -> Image.Image:
    # glow layer
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g = ImageDraw.Draw(glow)
    display = ImageFont.truetype(FONT_DISPLAY, 168)
    tag_font = ImageFont.truetype(FONT_TAG, 36)

    flash_h = 168
    frame_h = 168
    gap = -18
    tag_gap = 28
    block_h = flash_h + gap + frame_h + tag_gap + 36
    y0 = (H - block_h) / 2 - 8

    # soft terracotta bloom behind type
    bloom_box = [cx - 420, y0 - 30, cx + 420, y0 + block_h + 40]
    g.ellipse(bloom_box, fill=(216, 90, 70, 40))
    glow = glow.filter(ImageFilter.GaussianBlur(42))
    base = Image.alpha_composite(base.convert("RGBA"), glow).convert("RGB")

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)

    # hairline rule above
    rule_w = 210
    ry = y0 - 18
    d.rectangle([cx - rule_w, ry, cx + rule_w, ry + 2], fill=(*TERRACOTTA, 220))

    draw_spaced(d, "FLASH", y0, display, (*IVORY, 255), 14, cx)
    draw_spaced(d, "FRAME", y0 + flash_h + gap, display, (*IVORY, 255), 14, cx)

    tag_y = y0 + flash_h + gap + frame_h + tag_gap
    draw_spaced(d, "SNAP  ·  KEEP  ·  REPLAY", tag_y, tag_font, (*TAUPE, 255), 3, cx)

    # hairline rule below tag
    by = tag_y + 52
    d.rectangle([cx - 86, by, cx + 86, by + 2], fill=(*TERRACOTTA, 200))

    return Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB")


def main() -> None:
    img = Image.new("RGB", (W, H), INK)
    draw = ImageDraw.Draw(img)
    film_sprockets(draw)
    iris(draw, W // 2, H // 2 + 6)
    img = lockup(img, W // 2)
    img = draw_vignette(img)
    img = add_grain(img, 7.5)
    img.save(OUT, "PNG")
    print(f"wrote {OUT} {img.size}")


if __name__ == "__main__":
    main()

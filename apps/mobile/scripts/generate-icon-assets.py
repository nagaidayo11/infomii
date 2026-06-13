#!/usr/bin/env python3
"""
Regenerate Infomii mobile icon assets from the AI-designed source.

- App icon: AI glossy squircle (full bleed), background denoised, glyph kept sharp
- Splash: solid #16c59a + white “i” from app icon (same glyph as home screen)
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
AI_SOURCE = ASSETS / "icon-ai-source.png"
BRAND = (22, 197, 154)
SIZE = 1024


def is_outer_bg(r: int, g: int, b: int, a: int) -> bool:
    if a < 10:
        return True
    if r < 16 and g < 16 and b < 16:
        return True
    if r > 248 and g > 248 and b > 248:
        return True
    return False


def is_teal(r: int, g: int, b: int, a: int) -> bool:
    return g > r + 8 and g > b + 4 and g > 90 and not (r > 220 and g > 220 and b > 220)


def is_glyph(r: int, g: int, b: int, a: int) -> bool:
    return r > 175 and g > 175 and b > 175 and not is_teal(r, g, b, a)


def crop_ai_content(img: Image.Image) -> Image.Image:
    w, h = img.size
    px = img.load()
    minx, miny, maxx, maxy = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            if not is_outer_bg(*px[x, y]):
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
    pad = 1
    return img.crop(
        (
            max(0, minx - pad),
            max(0, miny - pad),
            min(w, maxx + 1 + pad),
            min(h, maxy + 1 + pad),
        )
    )


def glyph_mask(img: Image.Image, *, dilate: int = 5) -> Image.Image:
    w, h = img.size
    mask = Image.new("L", (w, h), 0)
    mp = mask.load()
    px = img.load()
    for y in range(h):
        for x in range(w):
            if is_glyph(*px[x, y]):
                mp[x, y] = 255
    if dilate > 1:
        mask = mask.filter(ImageFilter.MaxFilter(dilate))
    return mask


def denoise_ai_icon(img: Image.Image) -> Image.Image:
    """Remove grain on teal gloss; lightly smooth the white i."""
    mask = glyph_mask(img, dilate=7)
    bg_smoothed = img.filter(ImageFilter.MedianFilter(5))
    bg_smoothed = bg_smoothed.filter(ImageFilter.SMOOTH_MORE)
    cleaned = Image.composite(img, bg_smoothed, ImageChops.invert(mask))
    glyph_smoothed = img.filter(ImageFilter.MedianFilter(3))
    cleaned = Image.composite(glyph_smoothed, cleaned, mask)
    return cleaned.filter(ImageFilter.UnsharpMask(radius=1.1, percent=100, threshold=4))


def build_app_icon(source: Image.Image, size: int = SIZE) -> Image.Image:
    crop = crop_ai_content(source)
    upscaled = crop.resize((size, size), Image.Resampling.LANCZOS)
    return denoise_ai_icon(upscaled)


def draw_clean_i(canvas: Image.Image, *, cx: float, cy: float, scale: float) -> None:
    """Crisp white i for splash (no AI grain)."""
    s = scale
    dot_r = s * 0.108
    stem_w = s * 0.185
    stem_h = s * 0.43
    gap = s * 0.055
    dot_cy = cy - s * 0.22
    stem_top = dot_cy + dot_r + gap
    stem_bottom = stem_top + stem_h
    stem_radius = stem_w * 0.5
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(
        (cx - stem_w / 2, stem_top, cx + stem_w / 2, stem_bottom),
        radius=stem_radius,
        fill=(255, 255, 255, 255),
    )
    draw.ellipse(
        (cx - dot_r, dot_cy - dot_r, cx + dot_r, dot_cy + dot_r),
        fill=(255, 255, 255, 255),
    )


def glyph_mask_center(img: Image.Image, *, dilate: int = 5) -> Image.Image:
    """Glyph mask limited to center disk — excludes squircle corner gloss without cropping the i."""
    w, h = img.size
    cx, cy = w / 2, h / 2
    max_r = min(w, h) * 0.38
    max_r_sq = max_r * max_r
    mask = Image.new("L", (w, h), 0)
    mp = mask.load()
    px = img.load()
    for y in range(h):
        for x in range(w):
            dx, dy = x - cx, y - cy
            if dx * dx + dy * dy > max_r_sq:
                continue
            if is_glyph(*px[x, y]):
                mp[x, y] = 255
    if dilate > 1:
        mask = mask.filter(ImageFilter.MaxFilter(dilate))
    return mask


def expand_bbox(bbox: tuple[int, int, int, int], pad: int, bounds: tuple[int, int]) -> tuple[int, int, int, int]:
    max_x, max_y = bounds
    return (
        max(0, bbox[0] - pad),
        max(0, bbox[1] - pad),
        min(max_x, bbox[2] + pad),
        min(max_y, bbox[3] + pad),
    )


def build_splash_glyph_from_icon(icon: Image.Image, size: int = SIZE) -> Image.Image:
    """White i extracted from the app icon (same glyph as home screen), on transparent."""
    w, h = icon.size
    mask = glyph_mask_center(icon, dilate=5)
    bbox = mask.getbbox()
    if not bbox:
        raise RuntimeError("Could not extract glyph from app icon")

    pad = max(12, int(max(bbox[2] - bbox[0], bbox[3] - bbox[1]) * 0.06))
    bbox = expand_bbox(bbox, pad, (w, h))

    cropped_icon = icon.crop(bbox)
    cropped_mask = mask.crop(bbox)
    glyph = Image.new("RGBA", cropped_icon.size, (0, 0, 0, 0))
    glyph.paste(cropped_icon, mask=cropped_mask)

    gw, gh = glyph.size
    # Leave safe margin on splash canvas so dot/stem anti-aliasing is not clipped.
    target = size * 0.44
    scale = target / max(gw, gh)
    new_w = max(1, int(gw * scale))
    new_h = max(1, int(gh * scale))
    scaled = glyph.resize((new_w, new_h), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(scaled, ((size - new_w) // 2, (size - new_h) // 2), scaled)
    return canvas


def build_splash_glyph(size: int = SIZE) -> Image.Image:
    """Deprecated fallback — prefer build_splash_glyph_from_icon."""
    big = Image.new("RGBA", (size * 2, size * 2), (0, 0, 0, 0))
    draw_clean_i(big, cx=size, cy=size, scale=size * 0.56)
    return big.resize((size, size), Image.Resampling.LANCZOS)


def build_monochrome(icon: Image.Image) -> Image.Image:
    alpha = icon.split()[3]
    mono = Image.new("RGBA", icon.size, (255, 255, 255, 0))
    mono.putalpha(alpha)
    white = Image.new("RGBA", icon.size, (255, 255, 255, 255))
    white.putalpha(alpha)
    return white


def main() -> None:
    if not AI_SOURCE.exists():
        raise SystemExit(f"Missing AI source: {AI_SOURCE}")

    source = Image.open(AI_SOURCE).convert("RGBA")
    icon = build_app_icon(source)
    splash = build_splash_glyph_from_icon(icon)
    bg = Image.new("RGBA", (SIZE, SIZE), (*BRAND, 255))

    icon_rgb = icon.convert("RGB")
    icon_rgb.save(ASSETS / "icon.png", format="PNG", optimize=True)
    splash.save(ASSETS / "splash-icon.png", optimize=True)
    icon.save(ASSETS / "android-icon-foreground.png", optimize=True)
    bg.save(ASSETS / "android-icon-background.png", optimize=True)
    build_monochrome(icon).save(ASSETS / "android-icon-monochrome.png", optimize=True)
    icon_rgb.resize((48, 48), Image.Resampling.LANCZOS).save(
        ASSETS / "favicon.png", format="PNG", optimize=True
    )

    print("Wrote AI-based icon assets to", ASSETS)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Regenerate Infomii mobile icon assets from the AI-designed source.

- App icon: AI glossy squircle (full bleed), background denoised, glyph kept sharp
- Splash: solid #16c59a + white “i” only (extracted from cleaned icon)
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = Path(__file__).resolve().parents[3]
ASSETS = ROOT / "assets"
AI_SOURCE = ASSETS / "icon-ai-source.png"
WEB_ICON = REPO_ROOT / "public" / "icon-512.png"
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


def build_clean_brand_icon(size: int = SIZE) -> Image.Image:
    """Flat teal + white i — matches public/icon-512.png (no black outline)."""
    canvas = Image.new("RGBA", (size, size), (*BRAND, 255))
    draw_clean_i(canvas, cx=size / 2, cy=size / 2, scale=size * 0.42)
    return canvas


def build_app_icon(source: Image.Image, size: int = SIZE) -> Image.Image:
    if WEB_ICON.exists():
        web = Image.open(WEB_ICON).convert("RGBA")
        return web.resize((size, size), Image.Resampling.LANCZOS)
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


def build_splash_glyph(size: int = SIZE) -> Image.Image:
    """White i on transparent — splash bg is solid #16c59a in app.config."""
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
    if WEB_ICON.exists():
        icon = build_app_icon(Image.open(WEB_ICON).convert("RGBA"))
    elif AI_SOURCE.exists():
        icon = build_app_icon(Image.open(AI_SOURCE).convert("RGBA"))
    else:
        icon = build_clean_brand_icon()
    splash = build_splash_glyph()
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

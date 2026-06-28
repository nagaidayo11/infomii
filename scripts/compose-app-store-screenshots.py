#!/usr/bin/env python3
"""
Compose App Store marketing screenshots from real app captures.

- Input: public/app-store/screenshots/raw/*.png (real screens)
- Output:
    public/app-store/screenshots/iphone-1242x2688/*.png
    public/app-store/screenshots/ipad-2064x2752/*.png
- Rich brand background + burned-in catch copy.
- Headlines share one uniform size and always fit on a single line, and the
  device sits at a fixed position so screenshot sizes never vary across slides.

Run:
    python3 scripts/compose-app-store-screenshots.py
"""

from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "public/app-store/screenshots/raw"
OUT_IPHONE = ROOT / "public/app-store/screenshots/iphone-1242x2688"
OUT_IPAD = ROOT / "public/app-store/screenshots/ipad-2064x2752"

FONT_DIR = Path("/System/Library/Fonts")
F_HEAVY = str(FONT_DIR / "ヒラギノ角ゴシック W8.ttc")
F_BOLD = str(FONT_DIR / "ヒラギノ角ゴシック W7.ttc")
F_MED = str(FONT_DIR / "ヒラギノ角ゴシック W6.ttc")

INK = (17, 24, 39)
INK_SOFT = (78, 92, 108)
ACCENT = (6, 142, 110)
EYEBROW_BG = (214, 248, 236)
EYEBROW_TX = (7, 120, 94)

# (raw file, eyebrow, headline, accent-substring, subcopy)
SLIDES = [
    (
        "02-ai-home.png",
        "AIでつくる",
        "あなた専用の案内ページを3分で。",
        "3分",
        "一文を入れるだけで、AIが下書きを用意。",
    ),
    (
        "05-guest.png",
        "旅行ページ",
        "旅行のしおりを作る。",
        "しおり",
        "写真・リンク・日程・地図をひとつのページに。",
    ),
    (
        "03-editor.png",
        "かんたん編集",
        "リンク・画像・地図を一つに。",
        "一つに",
        "ブロックを置くだけ、スマホでその場編集。",
    ),
    (
        "04-publish.png",
        "すぐ共有",
        "QRコードですぐ共有。",
        "QRコード",
        "公開してQRを見せるだけ。アプリ不要で開けます。",
    ),
    (
        "01-templates.png",
        "テンプレート",
        "用途はあなた次第。",
        "あなた次第",
        "ホテル / 結婚式 / 推し活 / BBQ / 旅行 / 学園祭",
    ),
]

_DUMMY = ImageDraw.Draw(Image.new("RGB", (10, 10)))


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def vgrad(w, h, top, bottom):
    col = Image.new("RGB", (1, h))
    p = col.load()
    for y in range(h):
        p[0, y] = lerp(top, bottom, y / max(1, h - 1))
    return col.resize((w, h)).convert("RGBA")


def soft_blob(canvas, cx, cy, r, color, alpha):
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse((cx - r, cy - r, cx + r, cy + r), fill=(*color, alpha))
    canvas.alpha_composite(layer.filter(ImageFilter.GaussianBlur(r * 0.5)))


def floating_card(canvas, cx, cy, cw, ch, angle, *, outline=None, fill=None, width=4):
    pad = 60
    card = Image.new("RGBA", (cw + pad * 2, ch + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(card)
    box = (pad, pad, pad + cw, pad + ch)
    radius = round(cw * 0.14)
    if fill:
        d.rounded_rectangle(box, radius=radius, fill=fill)
    if outline:
        d.rounded_rectangle(box, radius=radius, outline=outline, width=width)
    card = card.rotate(angle, expand=True, resample=Image.BICUBIC)
    canvas.alpha_composite(card, (round(cx - card.width / 2), round(cy - card.height / 2)))


def dot_grid(canvas, x0, y0, cols, rows, step, r, color, alpha):
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for i in range(cols):
        for j in range(rows):
            cx = x0 + i * step
            cy = y0 + j * step
            d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(*color, alpha))
    canvas.alpha_composite(layer)


def grain(canvas, alpha):
    w, h = canvas.size
    noise = Image.effect_noise((w // 2, h // 2), 26).resize((w, h)).convert("L")
    layer = Image.merge("RGBA", (noise, noise, noise, Image.new("L", (w, h), alpha)))
    canvas.alpha_composite(layer)


def vignette(canvas, alpha):
    w, h = canvas.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rectangle((0, round(h * 0.6), w, h), fill=(8, 40, 32, alpha))
    canvas.alpha_composite(layer.filter(ImageFilter.GaussianBlur(h * 0.12)))


def background(w, h, seed):
    rng = random.Random(seed)
    canvas = vgrad(w, h, (228, 249, 242), (243, 251, 250))

    # top sheen
    soft_blob(canvas, w * 0.5, -h * 0.05, w * 0.7, (255, 255, 255), 120)

    # aurora mesh
    palette = [
        (22, 197, 154),
        (110, 210, 255),
        (66, 200, 178),
        (168, 236, 200),
        (255, 233, 168),
        (140, 224, 255),
    ]
    rng.shuffle(palette)
    soft_blob(canvas, w * 0.94, h * 0.04, w * 0.46, (22, 197, 154), 120)
    soft_blob(canvas, w * 0.04, h * 0.14, w * 0.38, palette[0], 95)
    soft_blob(canvas, w * 0.10, h * 0.96, w * 0.44, (22, 197, 154), 80)
    soft_blob(canvas, w * 0.92, h * 0.9, w * 0.34, palette[1], 70)
    for _ in range(3):
        soft_blob(
            canvas,
            w * rng.uniform(0.15, 0.85),
            h * rng.uniform(0.25, 0.75),
            w * rng.uniform(0.18, 0.30),
            rng.choice(palette),
            rng.randint(28, 50),
        )

    # decorative floating cards in the margins
    floating_card(canvas, w * 0.86, h * 0.30, round(w * 0.26), round(w * 0.40), -16,
                  outline=(255, 255, 255, 150), width=max(3, w // 360))
    floating_card(canvas, w * 0.12, h * 0.62, round(w * 0.22), round(w * 0.32), 12,
                  fill=(255, 255, 255, 26))
    floating_card(canvas, w * 0.90, h * 0.74, round(w * 0.18), round(w * 0.26), 8,
                  outline=(22, 197, 154, 90), width=max(3, w // 420))

    # dot grids
    dot_grid(canvas, round(w * 0.06), round(h * 0.05), 6, 5, round(w * 0.035),
             max(3, round(w * 0.006)), (16, 150, 118), 60)
    dot_grid(canvas, round(w * 0.74), round(h * 0.88), 6, 4, round(w * 0.035),
             max(3, round(w * 0.006)), (16, 150, 118), 45)

    grain(canvas, 8)
    vignette(canvas, 70)
    return canvas


def device_glow(canvas, cx, cy, w, h):
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), fill=(22, 197, 154, 95))
    canvas.alpha_composite(layer.filter(ImageFilter.GaussianBlur(w * 0.10)))


def rounded_mask(size, radius):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return m


def paste_device(canvas, shot, dev_w, dev_h, cx, top):
    bezel = max(8, round(dev_w * 0.016))
    in_w, in_h = dev_w - bezel * 2, dev_h - bezel * 2
    r_out = round(dev_w * 0.095)
    r_in = max(2, r_out - bezel)
    left = round(cx - dev_w / 2)

    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    off = round(dev_w * 0.03)
    ImageDraw.Draw(shadow).rounded_rectangle(
        (left, top + off, left + dev_w, top + dev_h + off), radius=r_out, fill=(15, 35, 30, 115)
    )
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(dev_w * 0.055)))

    frame = Image.new("RGBA", (dev_w, dev_h), (0, 0, 0, 0))
    ImageDraw.Draw(frame).rounded_rectangle((0, 0, dev_w - 1, dev_h - 1), radius=r_out, fill=(20, 28, 34, 255))
    canvas.alpha_composite(frame, (left, top))

    screen = shot.convert("RGBA").resize((in_w, in_h), Image.Resampling.LANCZOS)
    screen.putalpha(rounded_mask((in_w, in_h), r_in))
    canvas.alpha_composite(screen, (left + bezel, top + bezel))


def split_accent(headline, accent):
    if not accent or accent not in headline:
        return [(headline, INK)]
    i = headline.index(accent)
    out = []
    if headline[:i]:
        out.append((headline[:i], INK))
    out.append((accent, ACCENT))
    if headline[i + len(accent):]:
        out.append((headline[i + len(accent):], INK))
    return out


def uniform_headline_size(frame_w, frame_h):
    """Largest size at which every headline fits on a single line."""
    max_w = frame_w * 0.90
    cap = round(min(frame_w * 0.072, frame_h * 0.036))
    headlines = [s[2] for s in SLIDES]
    size = cap
    while size > 24:
        f = font(F_HEAVY, size)
        if all(_DUMMY.textlength(h, font=f) <= max_w for h in headlines):
            break
        size -= 1
    return size


def draw_single_line(canvas, segments, fnt, cx, top):
    d = ImageDraw.Draw(canvas)
    total = sum(d.textlength(t, font=fnt) for t, _ in segments)
    x = cx - total / 2
    for t, color in segments:
        d.text((x, top), t, font=fnt, fill=color)
        x += d.textlength(t, font=fnt)
    asc, desc = fnt.getmetrics()
    return top + asc + desc


def wrap_text(text, fnt, max_w):
    lines = [""]
    for ch in text:
        if _DUMMY.textlength(lines[-1] + ch, font=fnt) > max_w and lines[-1]:
            lines.append("")
        lines[-1] += ch
    return lines


def draw_centered_text(canvas, text, fnt, cx, top, line_h, fill):
    d = ImageDraw.Draw(canvas)
    y = top
    for line in wrap_text(text, fnt, canvas.size[0] * 0.84):
        w = d.textlength(line, font=fnt)
        d.text((cx - w / 2, y), line, font=fnt, fill=fill)
        y += line_h
    return y


def draw_eyebrow(canvas, label, fnt, cx, top):
    d = ImageDraw.Draw(canvas)
    tw = d.textlength(label, font=fnt)
    asc, desc = fnt.getmetrics()
    th = asc + desc
    pad_x, pad_y = round(th * 0.85), round(th * 0.42)
    bw, bh = round(tw + pad_x * 2), round(th + pad_y * 2)
    left = round(cx - bw / 2)
    d.rounded_rectangle((left, top, left + bw, top + bh), radius=bh // 2, fill=EYEBROW_BG)
    d.text((left + pad_x, top + pad_y), label, font=fnt, fill=EYEBROW_TX)
    return top + bh


def compose(slide, frame_w, frame_h, head_size, seed):
    raw_name, eyebrow, headline, accent, subcopy = slide
    canvas = background(frame_w, frame_h, seed)
    cx = frame_w // 2

    s_size = round(min(frame_w * 0.032, frame_h * 0.017))
    e_size = round(s_size * 1.02)

    f_head = font(F_HEAVY, head_size)
    f_sub = font(F_MED, s_size)
    f_eye = font(F_BOLD, e_size)

    draw_eyebrow(canvas, eyebrow, f_eye, cx, round(frame_h * 0.060))

    head_top = round(frame_h * 0.118)
    draw_single_line(canvas, split_accent(headline, accent), f_head, cx, head_top)

    sub_top = head_top + round(head_size * 1.55)
    draw_centered_text(canvas, subcopy, f_sub, cx, sub_top, round(s_size * 1.5), INK_SOFT)

    # fixed device frame so screenshot size never varies between slides
    device_top = round(frame_h * 0.300)
    bottom_pad = round(frame_h * 0.045)
    avail_h = frame_h - bottom_pad - device_top
    max_w = frame_w * (0.78 if frame_w < frame_h * 0.6 else 0.56)

    shot = Image.open(RAW / raw_name)
    ratio = shot.height / shot.width
    dev_h = avail_h
    dev_w = dev_h / ratio
    if dev_w > max_w:
        dev_w = max_w
        dev_h = dev_w * ratio
    dev_w_i, dev_h_i = round(dev_w), round(dev_h)
    dev_top = round(device_top + (avail_h - dev_h_i) / 2)

    device_glow(canvas, cx, dev_top + dev_h_i / 2, dev_w_i * 1.25, dev_h_i * 1.05)
    paste_device(canvas, shot, dev_w_i, dev_h_i, cx, dev_top)
    return canvas.convert("RGB")


def main():
    OUT_IPHONE.mkdir(parents=True, exist_ok=True)
    OUT_IPAD.mkdir(parents=True, exist_ok=True)

    iphone_head = uniform_headline_size(1242, 2688)
    ipad_head = uniform_headline_size(2064, 2752)
    print(f"headline size  iphone={iphone_head}  ipad={ipad_head}")

    for i, slide in enumerate(SLIDES, start=1):
        name = f"{i:02d}.png"
        compose(slide, 1242, 2688, iphone_head, seed=i).save(OUT_IPHONE / name, optimize=True)
        print("saved", (OUT_IPHONE / name).relative_to(ROOT))
        compose(slide, 2064, 2752, ipad_head, seed=i).save(OUT_IPAD / name, optimize=True)
        print("saved", (OUT_IPAD / name).relative_to(ROOT))


if __name__ == "__main__":
    main()

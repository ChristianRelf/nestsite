"""Turn the hills photo into abstract, liquid backgrounds for the hero and footer.

    python scripts/make-backgrounds.py

Reads src/assets/hills.avif and writes src/assets/hero-abstract.avif and
src/assets/footer-abstract.avif. Grain is added live in CSS, not baked in.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance
from scipy.ndimage import gaussian_filter, map_coordinates, zoom

ASSETS = Path(__file__).resolve().parent.parent / 'src' / 'assets'


def flow(shape, cells, seed, smooth):
    """Smooth random field in -1..1."""
    rng = np.random.default_rng(seed)
    h, w = shape
    coarse = rng.uniform(-1, 1, (cells, int(cells * w / h) + 1))
    f = zoom(coarse, (h / coarse.shape[0], w / coarse.shape[1]), order=3)[:h, :w]
    f = gaussian_filter(f, smooth)
    return f / (np.abs(f).max() + 1e-6)


def warp(img, seed, amount, passes=2):
    """Domain-warp the image: each pass pushes pixels along a smooth random flow."""
    a = np.asarray(img, dtype=np.float32)
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    for p in range(passes):
        dx = flow((h, w), 3 + p, seed + p * 10, 60) * amount
        dy = flow((h, w), 3 + p, seed + p * 10 + 1, 60) * amount * 0.6
        # A long horizontal swell keeps the ridges reading as waves.
        dy += np.sin(xx / w * np.pi * (2.2 + p) + seed) * amount * 0.35
        coords = [yy + dy, xx + dx]
        a = np.stack([map_coordinates(a[..., c], coords, order=1, mode='reflect') for c in range(3)], -1)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def finish(img, blur, sat, contrast):
    a = gaussian_filter(np.asarray(img, dtype=np.float32), (blur, blur, 0))
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    img = ImageEnhance.Color(img).enhance(sat)
    return ImageEnhance.Contrast(img).enhance(contrast)


def main():
    src = Image.open(ASSETS / 'hills.avif').convert('RGB')
    src = src.resize((2200, round(2200 * src.height / src.width)), Image.LANCZOS)

    hero = finish(warp(src, seed=3, amount=260, passes=3), blur=22, sat=1.15, contrast=1.05)
    hero.save(ASSETS / 'hero-abstract.avif', quality=70)

    # Footer: mirrored so the light rises from the bottom edge, warped differently.
    foot = src.transpose(Image.FLIP_TOP_BOTTOM).transpose(Image.FLIP_LEFT_RIGHT)
    foot = finish(warp(foot, seed=21, amount=240, passes=3), blur=22, sat=1.2, contrast=1.08)
    foot.save(ASSETS / 'footer-abstract.avif', quality=70)

    for name in ('hero-abstract.avif', 'footer-abstract.avif'):
        print(name, (ASSETS / name).stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    main()

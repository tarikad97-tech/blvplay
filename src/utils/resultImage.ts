import { getInitials } from "../data/players";
import type { ChallengeResult } from "../context/ResultContext";

const W = 1080;
const H = 1350;
const FONT = '"Tajawal", "Segoe UI", "Noto Sans Arabic", Tahoma, Arial, sans-serif';

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, color: string, weight = 700, maxWidth?: number) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = "rtl";
  ctx.fillText(s, x, y, maxWidth);
}

/** Draws the share card for a finished challenge. Photos that fail to load become initials. */
export async function renderResultImage(result: ChallengeResult): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported");

  const images = await Promise.all(result.items.map((i) => loadImage(i.image)));
  if (document.fonts?.ready) await document.fonts.ready.catch(() => undefined);

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#07110d");
  bg.addColorStop(1, "#030605");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(31,164,99,.35)";
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, W - 72, H - 72);

  text(ctx, "BLV PLAY", W / 2, 110, 40, "#1fa463", 800);
  text(ctx, result.title, W / 2, 190, 56, "#f4f7f2", 800, W - 140);
  text(ctx, result.headline, W / 2, 270, 44, "#f4f7f2", 700, W - 140);
  text(ctx, result.detail, W / 2, 335, 32, "#9db3a6", 500, W - 140);

  const cols = 3;
  const rows = Math.ceil(result.items.length / cols);
  const top = 400;
  const cellW = (W - 120) / cols;
  const cellH = Math.min(230, (H - top - 140) / rows);
  const r = Math.min(72, cellH * 0.3);

  result.items.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    // RTL: first item sits on the right.
    const cx = W - 60 - cellW * (col + 0.5);
    const cy = top + cellH * row + r + 6;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#12281d";
    ctx.fill();
    ctx.clip();
    const img = images[i];
    if (img) {
      const s = Math.max((r * 2) / img.width, (r * 2) / img.height);
      ctx.drawImage(img, cx - (img.width * s) / 2, cy - (img.height * s) / 2, img.width * s, img.height * s);
    } else {
      text(ctx, getInitials(item.name), cx, cy, r * 0.8, "#f4f7f2", 800);
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#1fa463";
    ctx.lineWidth = 4;
    ctx.stroke();

    text(ctx, item.name, cx, cy + r + 30, 28, "#f4f7f2", 700, cellW - 16);
    text(ctx, item.sub ? `${item.label} · ${item.sub}` : item.label, cx, cy + r + 62, 22, "#9db3a6", 500, cellW - 16);
  });

  text(ctx, "العب، اختَر، تحدَّ.", W / 2, H - 80, 30, "#9db3a6", 600);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png")
  );
}

export function resultAsText(result: ChallengeResult): string {
  const lines = result.items.map((i, n) => `${n + 1}. ${i.name}${i.sub ? ` (${i.sub})` : ""} — ${i.label}`);
  return [`BLV Play — ${result.title}`, result.headline, result.detail, "", ...lines].join("\n");
}

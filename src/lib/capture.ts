const MAX_EDGE = 720;
const JPEG_QUALITY = 0.72;

export function captureFrame(
  video: HTMLVideoElement,
  cssFilter: string,
  mirrored: boolean,
): string | null {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) return null;

  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const cw = Math.max(1, Math.round(width * scale));
  const ch = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.filter = cssFilter === "none" ? "none" : cssFilter;
  if (mirrored) {
    ctx.translate(cw, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, cw, ch);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.filter = "none";

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function shotFilename(filterId: string) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `flashframe-${filterId}-${stamp}.jpg`;
}

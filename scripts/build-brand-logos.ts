import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

async function main() {
  const inputPath = path.resolve("MalatiGroupLogo", "logo color.jpg");
  const publicBrand = path.resolve("public", "brand");
  await fs.mkdir(publicBrand, { recursive: true });

  console.log("Loading master image:", inputPath);

  // 1. First trim the white margins off the master logo
  const trimmedBuffer = await sharp(inputPath)
    .trim({ threshold: 10 })
    .toBuffer();

  // 2. Load trimmed image raw pixels
  const { data, info } = await sharp(trimmedBuffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log("Trimmed dimensions:", info.width, "x", info.height);

  const numPixels = info.width * info.height;
  const rgbaOrange = Buffer.alloc(numPixels * 4);
  const rgbaWhite = Buffer.alloc(numPixels * 4);

  // Malati Brand Orange: #F4512A = (244, 81, 42)
  const BRAND_R = 244;
  const BRAND_G = 81;
  const BRAND_B = 42;

  let minAlpha = 255, maxAlpha = 0, transparentCount = 0, solidCount = 0;

  for (let i = 0; i < numPixels; i++) {
    const srcIdx = i * 3;
    const destIdx = i * 4;

    const r = data[srcIdx];
    const g = data[srcIdx + 1];
    const b = data[srcIdx + 2];

    // Whiteness estimation
    // If r, g, b are all close to 255, alpha is 0
    // In the original, white is (255, 255, 255), solid orange is ~ (254, 74, 28)
    // Distance from white:
    const diffR = 255 - r;
    const diffG = 255 - g;
    const diffB = 255 - b;

    // Use max difference / expected full difference
    // For orange: 255-74 = 181 for G, 255-28 = 227 for B
    const maxDiff = Math.max(diffG / 180, diffB / 225);

    let alpha = Math.min(255, Math.max(0, Math.round(maxDiff * 255)));

    // Clean thresholding for pure background
    if (r > 250 && g > 250 && b > 250) {
      alpha = 0;
    } else if (r > 240 && g < 120 && b < 70) {
      alpha = 255;
    }

    if (alpha < minAlpha) minAlpha = alpha;
    if (alpha > maxAlpha) maxAlpha = alpha;
    if (alpha === 0) transparentCount++;
    if (alpha === 255) solidCount++;

    // Write Orange version
    rgbaOrange[destIdx] = BRAND_R;
    rgbaOrange[destIdx + 1] = BRAND_G;
    rgbaOrange[destIdx + 2] = BRAND_B;
    rgbaOrange[destIdx + 3] = alpha;

    // Write White version
    rgbaWhite[destIdx] = 255;
    rgbaWhite[destIdx + 1] = 255;
    rgbaWhite[destIdx + 2] = 255;
    rgbaWhite[destIdx + 3] = alpha;
  }

  console.log("Alpha stats:", { minAlpha, maxAlpha, transparentCount, solidCount, total: numPixels });

  // 3. Convert raw RGBA buffers to intermediate master PNG buffers
  const masterOrangeBuffer = await sharp(rgbaOrange, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 6 })
    .toBuffer();

  const masterWhiteBuffer = await sharp(rgbaWhite, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 6 })
    .toBuffer();

  console.log("Writing web-optimized logo assets...");

  // Brand orange 800px
  await sharp(masterOrangeBuffer)
    .resize(800)
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(path.join(publicBrand, "malati-logo-orange.png"));

  await sharp(masterOrangeBuffer)
    .resize(800)
    .webp({ quality: 95 })
    .toFile(path.join(publicBrand, "malati-logo-orange.webp"));

  // Brand white 800px (for dark backgrounds)
  await sharp(masterWhiteBuffer)
    .resize(800)
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(path.join(publicBrand, "malati-logo-white.png"));

  await sharp(masterWhiteBuffer)
    .resize(800)
    .webp({ quality: 95 })
    .toFile(path.join(publicBrand, "malati-logo-white.webp"));

  // Header mark (2x resolution: height 96 for 48px display)
  await sharp(masterOrangeBuffer)
    .resize({ height: 96 })
    .png()
    .toFile(path.join(publicBrand, "malati-mark-header.png"));

  await sharp(masterWhiteBuffer)
    .resize({ height: 96 })
    .png()
    .toFile(path.join(publicBrand, "malati-mark-white-header.png"));

  // Favicon (crisp square container with centered mark)
  const favMark = await sharp(masterOrangeBuffer)
    .resize(52, 52, { fit: "inside" })
    .toBuffer();

  await sharp({
    create: {
      width: 64,
      height: 64,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite([{ input: favMark, gravity: "center" }])
    .png()
    .toFile(path.join(publicBrand, "favicon-64x64.png"));

  // Also write to public/favicon.ico as PNG format
  const fav32 = await sharp(masterOrangeBuffer)
    .resize(28, 28, { fit: "inside" })
    .toBuffer();

  await sharp({
    create: {
      width: 32,
      height: 32,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite([{ input: fav32, gravity: "center" }])
    .png()
    .toFile(path.resolve("public", "favicon.ico"));

  // Apple touch icon (180x180, white square background with centered orange mark + subtle padding)
  const touchMark = await sharp(masterOrangeBuffer)
    .resize(130, 130, { fit: "inside" })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: touchMark, gravity: "center" }])
    .png()
    .toFile(path.join(publicBrand, "apple-touch-icon.png"));

  console.log("All brand logo assets successfully created!");
}

main().catch((err) => {
  console.error("Failed to build brand logos:", err);
  process.exit(1);
});

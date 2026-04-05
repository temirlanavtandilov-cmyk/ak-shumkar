async function compressForOCR(img) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX = 1024;
      let w = image.width, h = image.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round((h * MAX) / w); w = MAX; }
        else { w = Math.round((w * MAX) / h); h = MAX; }
      }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(image, 0, 0, w, h);
      resolve({
        data: canvas.toDataURL("image/jpeg", 0.8).split(",")[1],
        mime: "image/jpeg",
      });
    };
    image.onerror = () => resolve({ data: img.data, mime: img.mime });
    image.src = `data:${img.mime};base64,${img.data}`;
  });
}

export async function geminiOCR(images, proxyUrl, geminiKey) {
  const compressed = await Promise.all(images.map(compressForOCR));

  const parts = compressed.map((img) => ({
    inlineData: { mimeType: img.mime, data: img.data },
  }));
  parts.push({
    text: "Read ALL text visible in these images. Focus on: part numbers, OEM numbers, barcodes, stamps, casting numbers, sticker labels, fitment info, brand names. Return every piece of text organized clearly.",
  });

  const resp = await fetch(`${proxyUrl}/gemini`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ geminiKey, contents: [{ parts }] }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error?.message || "Gemini OCR failed");
  }

  const data = await resp.json();
  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") || "";

  if (!text || text.trim().length < 5) {
    throw new Error(
      "OCR returned no readable text. Try clearer photos with visible part numbers."
    );
  }

  return text;
}

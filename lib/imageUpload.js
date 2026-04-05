export async function compressImage(b64, mime) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX = 1600;
      let w = img.width,
        h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) {
          h = Math.round((h * MAX) / w);
          w = MAX;
        } else {
          w = Math.round((w * MAX) / h);
          h = MAX;
        }
      }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.85).split(",")[1]);
    };
    img.onerror = () => resolve(b64);
    img.src = `data:${mime};base64,${b64}`;
  });
}

export async function uploadToEbayEPS(imageB64, index, proxyUrl, cfg) {
  const compressed = await compressImage(imageB64.data, imageB64.mime);

  // Upload to imgbb for a public URL
  const form = new FormData();
  form.append("image", compressed);
  form.append("expiration", "3600");
  const imgbbResp = await fetch(
    `https://api.imgbb.com/1/upload?key=${cfg.imgbbKey}`,
    { method: "POST", body: form }
  );
  const imgbbData = await imgbbResp.json();
  const imgUrl = imgbbData?.data?.url;
  if (!imgUrl) throw new Error("imgbb upload failed");

  // Tell eBay EPS to fetch the public URL
  const epsXml = `<?xml version="1.0" encoding="utf-8"?>
<UploadSiteHostedPicturesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${cfg.token}</eBayAuthToken>
  </RequesterCredentials>
  <PictureName>part_${index + 1}</PictureName>
  <ExternalPictureURL>${imgUrl}</ExternalPictureURL>
</UploadSiteHostedPicturesRequest>`;

  const resp = await fetch(`${proxyUrl}/eps`, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml",
      "X-EBAY-API-COMPATIBILITY-LEVEL": "967",
      "X-EBAY-API-CALL-NAME": "UploadSiteHostedPictures",
      "X-EBAY-API-SITEID": "0",
      "X-EBAY-API-APP-NAME": cfg.appId,
      "X-EBAY-API-DEV-NAME": cfg.devId,
      "X-EBAY-API-CERT-NAME": cfg.certId,
    },
    body: epsXml,
  });

  const text = await resp.text();
  const doc = new DOMParser().parseFromString(text, "text/xml");
  const url = doc.querySelector("FullURL")?.textContent;

  if (!url || !url.startsWith("http")) {
    const errMsg =
      doc.querySelector("ShortMessage")?.textContent || "EPS upload failed";
    throw new Error(errMsg);
  }

  return url;
}

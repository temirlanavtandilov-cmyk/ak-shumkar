import { PART_CATEGORIES, VALID_CATEGORIES } from "@/lib/constants";

async function resolveCategory(listing, proxyUrl, cfg) {
  const titleLower = (listing.title || "").toLowerCase();
  const partKeyword = Object.keys(PART_CATEGORIES).find((k) => titleLower.includes(k));

  if (partKeyword && proxyUrl && cfg.appId && cfg.certId) {
    try {
      const resp = await fetch(`${proxyUrl}/taxonomy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId: cfg.appId, certId: cfg.certId, query: `car truck ${partKeyword}` }),
      });
      if (resp.ok) {
        const data = await resp.json();
        const suggestions = data.categorySuggestions || [];
        const leaf = suggestions.find(
          (s) => s.category?.categoryId && s.categoryTreeNodeAncestors?.length >= 2
        );
        if (leaf?.category?.categoryId) return leaf.category.categoryId;
      }
    } catch (_) {
      // fall through
    }
  }

  const aiCat = String(listing.ebay?.categoryId || "");
  if (VALID_CATEGORIES.has(aiCat)) return aiCat;

  for (const [key, val] of Object.entries(PART_CATEGORIES)) {
    if (titleLower.includes(key)) return val;
  }

  return "33642";
}

// eslint-disable-next-line no-unused-vars
function safeInt(val, fallback) {
  const n = parseInt(String(val || "").replace(/[^0-9]/g, ""), 10);
  return isNaN(n) || n < 1 ? fallback : n;
}

function buildItemSpecificsXml(specs) {
  return specs
    .filter((s) => s.name && s.value && String(s.value).trim().length > 0)
    .map(
      (s) =>
        `<NameValueList><Name>${s.name}</Name><Value>${String(s.value).trim().substring(0, 65)}</Value></NameValueList>`
    )
    .join("\n    ");
}

function buildCompatibilityXml(compatibility) {
  const valid = (compatibility || []).filter(
    (c) => c.year && c.make && c.model && /^\d{4}$/.test(String(c.year))
  );
  if (!valid.length) return "";

  const entries = valid
    .map(
      (c) => `
    <Compatibility>
      <NameValueList><Name>Year</Name><Value>${c.year}</Value></NameValueList>
      <NameValueList><Name>Make</Name><Value>${c.make}</Value></NameValueList>
      <NameValueList><Name>Model</Name><Value>${c.model}</Value></NameValueList>
    </Compatibility>`
    )
    .join("");

  return `<ItemCompatibilityList>${entries}\n    </ItemCompatibilityList>`;
}

export async function publishToEbay(listing, photoUrls, proxyUrl, cfg, promotion = { type: "none", rate: "12" }) {
  const lean = listing.lean || {};
  const ebay = listing.ebay || {};
  const price = parseFloat(lean.price) || 29.99;
  const title = (listing.title || "Auto Part").substring(0, 80);
  const desc = (listing.description || "").replace(/\n/g, "<br/>");
  const conditionId = ebay.conditionId || "3000";
  const categoryId = await resolveCategory(listing, proxyUrl, cfg);

  const specs = [...(ebay.itemSpecifics || [])];
  if (!specs.find((s) => s.name === "Brand")) {
    specs.push({
      name: "Brand",
      value: lean.oem ? lean.oem.split(/[-\s]/)[0] : "OEM",
    });
  }

  const picXml =
    photoUrls.length > 0
      ? `<PictureDetails>${photoUrls.map((u) => `<PictureURL>${u}</PictureURL>`).join("")}</PictureDetails>`
      : "";

  const specsXml = buildItemSpecificsXml(specs);
  const compatXml = buildCompatibilityXml(ebay.compatibility);

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<AddFixedPriceItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${cfg.token}</eBayAuthToken>
  </RequesterCredentials>
  <ErrorLanguage>en_US</ErrorLanguage>
  <WarningLevel>High</WarningLevel>
  <Item>
    <Title>${title}</Title>
    <Description><![CDATA[${desc}]]></Description>
    <PrimaryCategory><CategoryID>${categoryId}</CategoryID></PrimaryCategory>
    <StartPrice>${price.toFixed(2)}</StartPrice>
    <CategoryMappingAllowed>true</CategoryMappingAllowed>
    <ConditionID>${conditionId}</ConditionID>
    <Country>US</Country>
    <Currency>USD</Currency>
    <DispatchTimeMax>3</DispatchTimeMax>
    <ListingDuration>GTC</ListingDuration>
    <ListingType>FixedPriceItem</ListingType>
    <Location>${cfg.location || "Chicago, IL"}</Location>
    <Quantity>1</Quantity>
    <ShippingDetails>
      <ShippingType>Flat</ShippingType>
      <ShippingServiceOptions>
        <ShippingServicePriority>1</ShippingServicePriority>
        <ShippingService>USPSPriority</ShippingService>
        <ShippingServiceCost>${listing.shipping?.type === "flat" ? parseFloat(listing.shipping?.cost || cfg.shippingCost || "19.99").toFixed(2) : "0.00"}</ShippingServiceCost>
        <FreeShipping>${listing.shipping?.type === "flat" ? "false" : "true"}</FreeShipping>
      </ShippingServiceOptions>
    </ShippingDetails>
    <ReturnPolicy>
      <ReturnsAcceptedOption>ReturnsAccepted</ReturnsAcceptedOption>
      <RefundOption>MoneyBack</RefundOption>
      <ReturnsWithinOption>Days_30</ReturnsWithinOption>
      <ShippingCostPaidByOption>Seller</ShippingCostPaidByOption>
    </ReturnPolicy>
    <Site>eBayMotors</Site>
    ${picXml}
    ${specsXml ? `<ItemSpecifics>\n    ${specsXml}\n    </ItemSpecifics>` : ""}
    ${compatXml}
  </Item>
</AddFixedPriceItemRequest>`;

  console.log("eBay XML:", xml);
  const response = await fetch(`${proxyUrl}/`, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml",
      "X-EBAY-API-COMPATIBILITY-LEVEL": "967",
      "X-EBAY-API-CALL-NAME": "AddFixedPriceItem",
      "X-EBAY-API-SITEID": "100",
      "X-EBAY-API-APP-NAME": cfg.appId,
      "X-EBAY-API-DEV-NAME": cfg.devId,
      "X-EBAY-API-CERT-NAME": cfg.certId,
    },
    body: xml,
  });

  const text = await response.text();
  const doc = new DOMParser().parseFromString(text, "text/xml");
  const ack = doc.querySelector("Ack")?.textContent;
  const itemId = doc.querySelector("ItemID")?.textContent;

  if ((ack === "Success" || ack === "Warning") && itemId) {
    if (promotion.type === "general" && cfg.campaignId && cfg.token) {
      try {
        await fetch(`${proxyUrl}/marketing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: cfg.token,
            campaignId: cfg.campaignId,
            itemId,
            bidPercentage: parseFloat(promotion.rate || 12).toFixed(1),
          }),
        });
      } catch (_) {
        // Non-fatal
      }
    }
    return { itemId, url: `https://www.ebay.com/itm/${itemId}` };
  }

  const errors = Array.from(doc.querySelectorAll("Errors"))
    .filter((e) => e.querySelector("SeverityCode")?.textContent === "Error")
    .map((e) => e.querySelector("ShortMessage")?.textContent);
  const code = doc.querySelector("ErrorCode")?.textContent || "";
  throw new Error(errors.join(", ") || `eBay returned: ${ack} (code: ${code})`);
}

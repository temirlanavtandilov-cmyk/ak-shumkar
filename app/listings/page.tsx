'use client'

import { useState, useEffect } from "react";

import { loadConfig, loadHistory, saveHistory } from "@/lib/config";
import { geminiOCR } from "@/lib/ocr";
import { generateListing } from "@/lib/listing";
import { uploadToEbayEPS } from "@/lib/imageUpload";
import { publishToEbay } from "@/lib/ebay";

import UploadZone from "@/components/UploadZone";
import ImagePreview from "@/components/ImagePreview";
import StatusBar from "@/components/StatusBar";
import ResultCard from "@/components/ResultCard";
import EditableField from "@/components/EditableField";
import PromotionPicker from "@/components/PromotionPicker";
import StepProgress from "@/components/StepProgress";
import SkeletonLoader from "@/components/SkeletonLoader";
import TigerMascot from "@/components/TigerMascot";
import ListingChatAgent from "@/components/ListingChatAgent";

export default function ListingsPage() {
  const [images, setImages] = useState<any[]>([]);
  const [status, setStatus] = useState<any>({ type: "idle", message: "" });
  const [listing, setListing] = useState<any>(null);
  const [ocrText, setOcrText] = useState("");
  const [config, setConfig] = useState<any>({});
  const [publishedUrl, setPublishedUrl] = useState("");
  const [promotion, setPromotion] = useState({ type: "none", rate: "12" });
  const [chatOpen, setChatOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [mascot, setMascot] = useState("idle");
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    setConfig(loadConfig());
    try {
      const restore = localStorage.getItem("tigersRestoreV2");
      if (restore) {
        setListing(JSON.parse(restore));
        setStep(3);
        setStatus({ type: "success", message: "Listing restored from history." });
        localStorage.removeItem("tigersRestoreV2");
      }
    } catch {}
  }, []);

  const addImages = (newImgs: any[]) =>
    setImages((prev: any[]) => [...prev, ...newImgs].slice(0, 10));

  const removeImage = (idx: number) =>
    setImages((prev: any[]) => prev.filter((_: any, i: number) => i !== idx));

  const updateListing = (path: string, value: any) => {
    setListing((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!images.length)
      return setStatus({ type: "error", message: "Upload at least one photo first." });
    if (!config.proxyUrl)
      return setStatus({ type: "error", message: "Set your Cloudflare Worker URL in Settings." });
    if (!config.geminiKey)
      return setStatus({ type: "error", message: "Set your Gemini API Key in Settings." });

    try {
      setStep(1); setMascot("scanning"); setLoadingResults(true);
      setStatus({ type: "loading", message: "Step 1/2 — Reading photos with Gemini OCR..." });
      const text = await geminiOCR(images, config.proxyUrl, config.geminiKey);
      setOcrText(text);

      setStep(2); setMascot("thinking");
      setStatus({ type: "loading", message: "Step 2/2 — Generating listing with Claude Haiku..." });
      const result = await generateListing(text, config.proxyUrl);
      setListing(result);
      setPublishedUrl("");
      setLoadingResults(false);
      setStep(3); setMascot("idle");
      setStatus({ type: "success", message: "Listing generated! Review and edit below before publishing." });
    } catch (err: any) {
      setMascot("error"); setLoadingResults(false);
      setStatus({ type: "error", message: err.message });
    }
  };

  const handlePublish = async () => {
    if (!listing) return;
    if (!config.token)
      return setStatus({ type: "error", message: "eBay Auth Token missing — check Settings." });

    try {
      setMascot("uploading");
      setStatus({ type: "loading", message: "Uploading photos to eBay..." });
      const photoUrls = await Promise.all(
        images.map((img: any, i: number) => uploadToEbayEPS(img, i, config.proxyUrl, config))
      );

      setStatus({ type: "loading", message: "Publishing to eBay Motors..." });
      const result: any = await publishToEbay(listing, photoUrls, config.proxyUrl, config, promotion);
      setPublishedUrl(result.url);

      const history = loadHistory();
      history.unshift({
        listing,
        date: new Date().toISOString(),
        itemId: result.itemId,
        url: result.url,
      });
      saveHistory(history);

      setMascot("success");
      setStatus({ type: "success", message: `Published! eBay Item #${result.itemId}` });
    } catch (err: any) {
      setMascot("error");
      setStatus({ type: "error", message: err.message });
    }
  };

  const handleReset = () => {
    setImages([]);
    setListing(null);
    setOcrText("");
    setPublishedUrl("");
    setPromotion({ type: "none", rate: "12" });
    setStatus({ type: "idle", message: "" });
    setStep(0);
    setMascot("idle");
    setLoadingResults(false);
  };

  return (
    <main className="app-main">
      <div className="listing-tab">
        <StepProgress step={step} loading={status.type === "loading"} />

        {!listing ? (
          <>
            <UploadZone onImages={(imgs: any[]) => { addImages(imgs); if (imgs.length) setStep(0); }} />
            <ImagePreview images={images} onRemove={removeImage} />
            <StatusBar status={status} />
            {loadingResults && <SkeletonLoader />}
            {images.length > 0 && !loadingResults && (
              <div className="action-bar">
                <button className="btn-secondary" onClick={handleReset}>
                  Clear
                </button>
                <button className="btn-primary btn-generate" onClick={handleGenerate}>
                  Generate Listing
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="results-wrap">
            <StatusBar status={status} />

            <ResultCard title="Listing Title" copyValue={listing.title}>
              <EditableField
                label="Title (80 char max)"
                value={listing.title}
                onChange={(v: string) => updateListing("title", v)}
              />
              <div className="char-count">{(listing.title || "").length}/80</div>
            </ResultCard>

            <ResultCard title="Part Info" copyValue={listing.lean}>
              <EditableField label="OEM Part #" value={listing.lean?.oem} onChange={(v: string) => updateListing("lean.oem", v)} />
              <EditableField label="Interchange #" value={listing.lean?.interchange} onChange={(v: string) => updateListing("lean.interchange", v)} />
              <EditableField label="Placement" value={listing.lean?.placement} onChange={(v: string) => updateListing("lean.placement", v)} />
              <EditableField label="Fitment" value={listing.lean?.fitment} onChange={(v: string) => updateListing("lean.fitment", v)} />
              <EditableField label="Condition" value={listing.lean?.condition} onChange={(v: string) => updateListing("lean.condition", v)} />
              <EditableField label="Price ($)" value={listing.lean?.price} onChange={(v: string) => updateListing("lean.price", v)} />
            </ResultCard>

            <ResultCard title="eBay Details" copyValue={listing.ebay}>
              <EditableField label="Category ID" value={listing.ebay?.categoryId} onChange={(v: string) => updateListing("ebay.categoryId", v)} />
              <EditableField label="Condition ID (1000=New, 3000=Used)" value={listing.ebay?.conditionId} onChange={(v: string) => updateListing("ebay.conditionId", v)} />
            </ResultCard>

            <ResultCard title="Description" copyValue={listing.description}>
              <EditableField label="Description" value={listing.description} onChange={(v: string) => updateListing("description", v)} multiline />
            </ResultCard>

            <ResultCard title="Shipping">
              <div className="shipping-toggle">
                <button
                  className={`shipping-opt ${(listing.shipping?.type || "free") === "free" ? "active" : ""}`}
                  onClick={() => updateListing("shipping.type", "free")}
                >
                  Free Shipping
                </button>
                <button
                  className={`shipping-opt ${listing.shipping?.type === "flat" ? "active" : ""}`}
                  onClick={() => updateListing("shipping.type", "flat")}
                >
                  Flat Rate
                </button>
              </div>
              {listing.shipping?.type === "flat" && (
                <EditableField label="Shipping Cost ($)" value={listing.shipping?.cost} onChange={(v: string) => updateListing("shipping.cost", v)} />
              )}
              <EditableField label="Weight (lbs)" value={listing.shipping?.weight_lbs} onChange={(v: string) => updateListing("shipping.weight_lbs", v)} />
            </ResultCard>

            {listing.condition_flag && (
              <ResultCard title="Condition / Damage Notes" copyValue={listing.condition_flag}>
                <EditableField label="Notes" value={listing.condition_flag} onChange={(v: string) => updateListing("condition_flag", v)} multiline />
              </ResultCard>
            )}

            {ocrText && (
              <ResultCard title="OCR Source Text" copyValue={ocrText}>
                <pre className="ocr-text">{ocrText}</pre>
              </ResultCard>
            )}

            <PromotionPicker promotion={promotion} onChange={setPromotion} campaignId={config.campaignId} />

            <div className="action-bar">
              <button className="btn-secondary" onClick={handleReset}>
                Start Over
              </button>
              <button className="btn-primary" onClick={handlePublish}>
                Publish to eBay
              </button>
            </div>

            {publishedUrl && (
              <div className="published-banner">
                <span>
                  <span className="published-check">✓</span>{" "}
                  Listed successfully!
                </span>
                <a href={publishedUrl} target="_blank" rel="noreferrer">
                  View on eBay
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tiger mascot + chat launcher */}
      <div
        style={{
          position: "fixed", bottom: 20, right: 20, zIndex: 999,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
          cursor: "pointer",
        }}
        onClick={() => setChatOpen((o: boolean) => !o)}
        title="Listing Assistant"
      >
        <div style={{
          background: chatOpen ? "#007E8B" : "#009C4D",
          color: "#fff", fontSize: 10, fontWeight: 700,
          padding: "3px 9px", borderRadius: 10,
          letterSpacing: 0.5, whiteSpace: "nowrap" as const,
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          marginBottom: 4,
          transition: "background 0.2s",
        }}>
          {chatOpen ? "Close" : "AI Assistant"}
          {!chatOpen && listing && (
            <span style={{
              display: "inline-block", width: 7, height: 7, borderRadius: "50%",
              background: "#FABF00", marginLeft: 5, verticalAlign: "middle",
            }} />
          )}
        </div>
        <TigerMascot state={mascot} />
      </div>

      <ListingChatAgent
        listing={listing}
        onListingUpdate={(update: any) => {
          setListing((prev: any) => {
            const next = JSON.parse(JSON.stringify(prev));
            function deepMerge(target: any, source: any) {
              Object.keys(source).forEach((key) => {
                if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key]) && target[key] && typeof target[key] === "object") {
                  deepMerge(target[key], source[key]);
                } else {
                  target[key] = source[key];
                }
              });
            }
            deepMerge(next, update);
            return next;
          });
        }}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        proxyUrl={config.proxyUrl}
      />
    </main>
  );
}

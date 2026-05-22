"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MAKEUP_STYLES = [
  { key: "korean", label: "韩系清透", desc: "豆沙唇·卧蚕·空气感", emoji: "🌸" },
  { key: "sweet",  label: "甜美欧美", desc: "玫瑰唇·高光·卧蚕珠光", emoji: "💗" },
  { key: "vintage",label: "知性复古", desc: "正红唇·猫眼线·哑光", emoji: "🍷" },
  { key: "natural",label: "清纯素颜", desc: "零感底妆·润唇·自然眉", emoji: "🌿" },
];

const HAIR_STYLES = [
  { key: "hair_wave",  label: "韩系大波浪", desc: "中长卷发·八字刘海·温柔减龄", emoji: "🌊" },
  { key: "hair_bob",   label: "内扣波波头", desc: "锁骨长度·层次感·高级干净", emoji: "✨" },
  { key: "hair_long",  label: "长直发中分", desc: "自然黑·八字刘海·清冷感", emoji: "🖤" },
  { key: "hair_short", label: "短发wolf cut", desc: "深棕色·蓬松层次·率性活力", emoji: "⚡" },
];

export default function TryOnPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("korean");
  const [tab, setTab] = useState<"makeup" | "hair">("makeup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 尝试从 sessionStorage 读取首页上传的照片
    const saved = sessionStorage.getItem("uploadedImage");
    if (saved) setOriginalImage(saved);
  }, []);

  const handleFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setOriginalImage(base64);
      sessionStorage.setItem("uploadedImage", base64);
      setResultImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!originalImage) {
      setError("请先上传照片");
      return;
    }
    setError(null);
    setLoading(true);
    setResultImage(null);

    try {
      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: originalImage, style: selectedStyle }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "生成失败，请重试");
        setLoading(false);
        return;
      }

      setResultImage(data.imageUrl);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const currentStyles = tab === "makeup" ? MAKEUP_STYLES : HAIR_STYLES;

  return (
    <main className="page">
      <div className="blobs" aria-hidden="true">
        <div className="blob b1" /><div className="blob b2" />
        <div className="blob b3" /><div className="blob b4" />
      </div>
      <div className="noise-overlay" aria-hidden="true" />

      {/* 导航 */}
      <nav className="nav glass">
        <button className="back-btn" onClick={() => router.back()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          返回
        </button>
        <span className="logo">镜 我</span>
        <span style={{ width: 60 }} />
      </nav>

      <div className="content">
        <p className="page-title">虚拟换妆 · 换发型</p>
        <p className="page-sub">上传照片，选择风格，AI 直接在你脸上生成效果</p>

        {/* 上传区域 */}
        <div className="upload-row">
          <div
            className="img-slot glass"
            onClick={() => !originalImage && fileInputRef.current?.click()}
            style={{ cursor: originalImage ? "default" : "pointer" }}
          >
            {originalImage ? (
              <img src={originalImage} alt="原图" className="slot-img" />
            ) : (
              <div className="slot-empty">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(100,75,190,0.5)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
                <span className="slot-label">点击上传照片</span>
              </div>
            )}
            <div className="slot-tag orig-tag">原图</div>
          </div>

          <div className="arrow-wrap" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>

          <div className="img-slot glass result-slot">
            {loading ? (
              <div className="slot-empty">
                <div className="spinner" aria-label="生成中" />
                <span className="slot-label">AI 生成中…</span>
              </div>
            ) : resultImage ? (
              <img src={resultImage} alt="效果图" className="slot-img" />
            ) : (
              <div className="slot-empty">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(100,75,190,0.35)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                </svg>
                <span className="slot-label">效果图将出现在这里</span>
              </div>
            )}
            <div className="slot-tag result-tag">效果</div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        {originalImage && (
          <button className="reupload-btn" onClick={() => fileInputRef.current?.click()}>
            重新上传照片
          </button>
        )}

        {/* Tab 切换 */}
        <div className="tab-row">
          <button
            className={`tab-btn${tab === "makeup" ? " active" : ""}`}
            onClick={() => { setTab("makeup"); setSelectedStyle("korean"); setResultImage(null); }}
          >
            💄 换妆容
          </button>
          <button
            className={`tab-btn${tab === "hair" ? " active" : ""}`}
            onClick={() => { setTab("hair"); setSelectedStyle("hair_wave"); setResultImage(null); }}
          >
            💇 换发型
          </button>
        </div>

        {/* 风格选择 */}
        <div className="styles-grid">
          {currentStyles.map((s) => (
            <div
              key={s.key}
              className={`style-card glass${selectedStyle === s.key ? " active" : ""}`}
              onClick={() => { setSelectedStyle(s.key); setResultImage(null); }}
            >
              <div className="style-emoji">{s.emoji}</div>
              <div className="style-name">{s.label}</div>
              <div className="style-desc">{s.desc}</div>
              {selectedStyle === s.key && <div className="check-dot" aria-hidden="true" />}
            </div>
          ))}
        </div>

        {/* 错误提示 */}
        {error && <p className="error-msg">{error}</p>}

        {/* 生成按钮 */}
        <button
          className="gen-btn"
          onClick={handleGenerate}
          disabled={loading || !originalImage}
        >
          {loading ? "AI 生成中，约需15-30秒…" : `生成${tab === "makeup" ? "试妆" : "发型"}效果 →`}
        </button>

        {/* 结果区 */}
        {resultImage && (
          <div className="result-area glass">
            <p className="result-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7B6CC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
              前后对比
            </p>
            <div className="compare-row">
              <div className="compare-img-wrap">
                <img src={originalImage!} alt="原图" className="compare-img" />
                <span className="compare-label before-label">原图</span>
              </div>
              <div className="compare-img-wrap">
                <img src={resultImage} alt="效果图" className="compare-img" />
                <span className="compare-label after-label">效果</span>
              </div>
            </div>
            <div className="result-actions">
              <a href={resultImage} download="mirror-me-result.jpg" className="action-btn primary">
                保存效果图
              </a>
              <button className="action-btn secondary" onClick={() => { setResultImage(null); }}>
                再换一个
              </button>
            </div>
          </div>
        )}

        <div style={{ height: 40 }} />
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .page { font-family: 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif; background:#C4BCEA; min-height:100vh; position:relative; overflow-x:hidden; }
        .blobs { position:fixed; inset:0; pointer-events:none; z-index:0; }
        .blob { position:absolute; border-radius:50%; filter:blur(72px); opacity:0.78; }
        .b1 { width:420px; height:420px; background:#A988D8; top:-100px; left:-80px; }
        .b2 { width:320px; height:320px; background:#E8A8C8; top:180px; right:-70px; }
        .b3 { width:300px; height:300px; background:#94B8E8; bottom:80px; left:30px; }
        .b4 { width:240px; height:240px; background:#D0C0F4; bottom:-20px; right:10px; }
        .noise-overlay { position:fixed; inset:0; z-index:1; pointer-events:none; opacity:0.048;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:180px 180px; }
        .glass { background:rgba(255,255,255,0.2); backdrop-filter:blur(32px) saturate(180%); -webkit-backdrop-filter:blur(32px) saturate(180%); border:1px solid rgba(255,255,255,0.42); position:relative; overflow:hidden; }
        .glass::before { content:''; position:absolute; inset:0; pointer-events:none;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
          background-size:140px 140px; opacity:0.042; }
        .glass::after { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.75),transparent); pointer-events:none; }
        .nav { display:flex; justify-content:space-between; align-items:center; padding:16px 20px; position:relative; z-index:10; border-radius:0; border-left:none; border-right:none; border-top:none; }
        .logo { font-size:19px; font-weight:500; color:#1E1440; letter-spacing:4px; }
        .back-btn { display:flex; align-items:center; gap:5px; font-size:13px; color:#2D1F5E; background:rgba(255,255,255,0.22); border:1px solid rgba(255,255,255,0.4); border-radius:20px; padding:6px 14px; cursor:pointer; backdrop-filter:blur(8px); }
        .content { position:relative; z-index:2; padding:24px 16px 24px; max-width:480px; margin:0 auto; }
        .page-title { font-size:20px; font-weight:500; color:#1E1440; margin-bottom:5px; }
        .page-sub { font-size:13px; color:rgba(45,31,94,0.6); margin-bottom:20px; }
        .upload-row { display:flex; gap:10px; align-items:center; margin-bottom:10px; }
        .img-slot { border-radius:20px; flex:1; aspect-ratio:3/4; overflow:hidden; }
        .result-slot { background:rgba(255,255,255,0.15) !important; }
        .slot-img { width:100%; height:100%; object-fit:cover; display:block; }
        .slot-empty { width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:20px; }
        .slot-label { font-size:12px; color:rgba(45,31,94,0.5); text-align:center; }
        .slot-tag { position:absolute; top:8px; left:8px; font-size:10px; font-weight:500; padding:3px 10px; border-radius:20px; z-index:3; }
        .orig-tag { background:rgba(175,150,225,0.45); color:#3C2A8A; }
        .result-tag { background:rgba(75,52,165,0.5); color:rgba(255,255,255,0.95); }
        .arrow-wrap { flex-shrink:0; display:flex; align-items:center; justify-content:center; width:28px; }
        .spinner { width:28px; height:28px; border-radius:50%; border:2.5px solid rgba(100,75,190,0.2); border-top-color:rgba(100,75,190,0.8); animation:spin 0.8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .reupload-btn { font-size:12px; color:rgba(45,31,94,0.55); background:none; border:none; cursor:pointer; margin-bottom:16px; text-decoration:underline; padding:0; }
        .tab-row { display:flex; gap:8px; margin-bottom:14px; }
        .tab-btn { flex:1; padding:10px; border-radius:50px; font-size:13px; font-weight:500; cursor:pointer; border:1px solid rgba(255,255,255,0.35); background:rgba(255,255,255,0.18); color:rgba(45,31,94,0.65); backdrop-filter:blur(8px); transition:all 0.18s; }
        .tab-btn.active { background:rgba(75,52,165,0.75); color:rgba(255,255,255,0.95); border-color:rgba(255,255,255,0.3); }
        .styles-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:16px; }
        .style-card { border-radius:18px; padding:14px 12px 12px; cursor:pointer; border:2px solid transparent !important; transition:border-color 0.18s; }
        .style-card.active { border:2px solid rgba(100,75,190,0.7) !important; }
        .style-emoji { font-size:22px; margin-bottom:6px; }
        .style-name { font-size:13px; font-weight:500; color:#1E1440; margin-bottom:3px; }
        .style-desc { font-size:11px; color:rgba(45,31,94,0.55); line-height:1.5; }
        .check-dot { position:absolute; top:10px; right:10px; width:16px; height:16px; border-radius:50%; background:rgba(75,52,165,0.8); border:2px solid rgba(255,255,255,0.6); }
        .error-msg { font-size:12px; color:#c0392b; background:rgba(255,255,255,0.55); padding:8px 14px; border-radius:12px; margin-bottom:12px; }
        .gen-btn { width:100%; padding:14px; border-radius:50px; background:rgba(75,52,165,0.82); border:1px solid rgba(255,255,255,0.28); color:rgba(255,255,255,0.96); font-size:14px; font-weight:500; cursor:pointer; margin-bottom:20px; letter-spacing:0.5px; transition:background 0.18s, transform 0.1s; backdrop-filter:blur(10px); }
        .gen-btn:hover:not(:disabled) { background:rgba(90,65,185,0.9); }
        .gen-btn:active:not(:disabled) { transform:scale(0.98); }
        .gen-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .result-area { border-radius:24px; padding:18px; }
        .result-title { font-size:14px; font-weight:500; color:#2D1F5E; margin-bottom:14px; display:flex; align-items:center; gap:7px; }
        .compare-row { display:flex; gap:10px; margin-bottom:14px; }
        .compare-img-wrap { flex:1; position:relative; border-radius:14px; overflow:hidden; }
        .compare-img { width:100%; aspect-ratio:3/4; object-fit:cover; display:block; }
        .compare-label { position:absolute; bottom:8px; left:50%; transform:translateX(-50%); font-size:11px; font-weight:500; padding:3px 12px; border-radius:20px; white-space:nowrap; }
        .before-label { background:rgba(175,150,225,0.6); color:#3C2A8A; }
        .after-label { background:rgba(75,52,165,0.7); color:rgba(255,255,255,0.95); }
        .result-actions { display:flex; gap:8px; }
        .action-btn { flex:1; padding:12px; border-radius:50px; font-size:13px; font-weight:500; cursor:pointer; text-align:center; text-decoration:none; border:1px solid rgba(255,255,255,0.35); backdrop-filter:blur(8px); transition:transform 0.1s; }
        .action-btn.primary { background:rgba(75,52,165,0.8); color:rgba(255,255,255,0.95); }
        .action-btn.secondary { background:rgba(255,255,255,0.25); color:#2D1F5E; }
        .action-btn:active { transform:scale(0.98); }
      `}</style>
    </main>
  );
}

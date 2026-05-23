"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MAKEUP_STYLES = [
  { key: "korean",  label: "韩系清透", desc: "豆沙唇·卧蚕·空气感",   tag: "人气首选" },
  { key: "sweet",   label: "甜美欧美", desc: "玫瑰唇·高光·卧蚕珠光", tag: "减龄系" },
  { key: "vintage", label: "知性复古", desc: "正红唇·猫眼线·哑光",   tag: "御姐风" },
  { key: "natural", label: "清纯素颜", desc: "零感底妆·润唇·自然眉", tag: "日常款" },
];

const HAIR_STYLES = [
  { key: "hair_wave",  label: "韩系大波浪",   desc: "中长卷发·八字刘海·温柔减龄", tag: "最受欢迎" },
  { key: "hair_bob",   label: "内扣波波头",   desc: "锁骨长度·层次感·高级干净",   tag: "日系精选" },
  { key: "hair_long",  label: "长直发中分",   desc: "自然黑·八字刘海·清冷感",     tag: "清冷系" },
  { key: "hair_short", label: "短发wolf cut", desc: "深棕色·蓬松层次·率性活力",   tag: "时尚推荐" },
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
    if (!originalImage) { setError("请先上传照片"); return; }
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
      if (!res.ok || data.error) { setError(data.error ?? "生成失败，请重试"); setLoading(false); return; }
      setResultImage(data.imageUrl);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const currentStyles = tab === "makeup" ? MAKEUP_STYLES : HAIR_STYLES;

  return (
    <main className="hime-page">
      <style>{baseStyle}</style>

      {/* NAV */}
      <nav className="hime-nav">
        <button className="back-btn" onClick={() => router.back()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          返回
        </button>
        <span className="hime-logo">镜 我</span>
        <span style={{ width: 60 }} />
      </nav>

      <div className="hime-content">

        {/* 标题 */}
        <div className="hime-header">
          <div className="gold-deco">✦ ✦ ✦</div>
          <h1 className="hime-main-title">虚 拟 试 妆</h1>
          <div className="hime-sub-title">选择风格 · AI 直接在你脸上呈现效果</div>
        </div>

        {/* 上传 + 对比展示区 */}
        <div className="compare-section">
          <span className="corner-gold tl">✦</span><span className="corner-gold tr">✦</span>
          <span className="corner-gold bl">✦</span><span className="corner-gold br">✦</span>

          <div className="compare-row">
            {/* 原图 */}
            <div
              className="img-slot"
              onClick={() => !originalImage && fileInputRef.current?.click()}
              style={{ cursor: originalImage ? "default" : "pointer" }}
            >
              {originalImage
                ? <img src={originalImage} alt="原图" className="slot-img" />
                : <div className="slot-empty">
                    <div className="upload-icon-ring">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d08098" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                    </div>
                    <div className="slot-hint">点击上传照片</div>
                  </div>
              }
              <div className="slot-badge orig-badge">原 图</div>
            </div>

            <div className="arrow-center">
              <div className="gold-deco" style={{ fontSize: 11, letterSpacing: 4 }}>→</div>
            </div>

            {/* 效果图 */}
            <div className="img-slot result-slot">
              {loading
                ? <div className="slot-empty">
                    <div className="img-spinner" />
                    <div className="slot-hint">AI 生成中…</div>
                  </div>
                : resultImage
                  ? <img src={resultImage} alt="效果图" className="slot-img" />
                  : <div className="slot-empty">
                      <div className="empty-star">✦</div>
                      <div className="slot-hint">效果图将出现在这里</div>
                    </div>
              }
              <div className="slot-badge result-badge">效 果</div>
            </div>
          </div>

          {originalImage && (
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <button className="reupload-btn" onClick={() => fileInputRef.current?.click()}>
                重新上传照片
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        <div className="gold-divider">· · · ✦ ✦ ✦ · · ·</div>

        {/* Tab 切换 */}
        <div className="tab-header">
          <div className="gold-deco" style={{ fontSize: 11, marginBottom: 10 }}>✦ ✦ ✦</div>
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
              ✂ 换发型
            </button>
          </div>
        </div>

        {/* 风格选择卡片 */}
        <div className="styles-grid">
          {currentStyles.map((s) => (
            <div
              key={s.key}
              className={`style-card${selectedStyle === s.key ? " active" : ""}`}
              onClick={() => { setSelectedStyle(s.key); setResultImage(null); }}
            >
              {selectedStyle === s.key && (
                <>
                  <span className="corner-gold tl" style={{ fontSize: 10 }}>✦</span>
                  <span className="corner-gold tr" style={{ fontSize: 10 }}>✦</span>
                  <span className="corner-gold bl" style={{ fontSize: 10 }}>✦</span>
                  <span className="corner-gold br" style={{ fontSize: 10 }}>✦</span>
                </>
              )}
              <div className="style-tag-pill">{s.tag}</div>
              <div className="style-name">{s.label}</div>
              <div className="style-desc">{s.desc}</div>
              {selectedStyle === s.key && <div className="check-mark">♛</div>}
            </div>
          ))}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="error-card">
            <span>✦ {error}</span>
          </div>
        )}

        {/* 生成按钮 */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            className="cta-btn"
            onClick={handleGenerate}
            disabled={loading || !originalImage}
          >
            {loading
              ? "✨ AI 生成中，约需 15–30 秒…"
              : `✨ 生成${tab === "makeup" ? "试妆" : "发型"}效果 →`}
          </button>
        </div>

        {/* 对比结果区 */}
        {resultImage && (
          <>
            <div className="gold-divider">· · · ✦ ✦ ✦ · · ·</div>
            <div className="result-section royal-card">
              <span className="corner-gold tl">✦</span><span className="corner-gold tr">✦</span>
              <span className="corner-gold bl">✦</span><span className="corner-gold br">✦</span>
              <div className="section-title-row">
                <div className="gold-deco" style={{ fontSize: 11, marginBottom: 4 }}>✦ ✦ ✦</div>
                <div className="hime-main-title" style={{ fontSize: 16, marginBottom: 2 }}>前 后 对 比</div>
              </div>
              <div className="compare-row" style={{ marginTop: 12 }}>
                <div className="img-slot">
                  <img src={originalImage!} alt="原图" className="slot-img" />
                  <div className="slot-badge orig-badge">原 图</div>
                </div>
                <div className="arrow-center">
                  <div className="gold-deco" style={{ fontSize: 11, letterSpacing: 4 }}>→</div>
                </div>
                <div className="img-slot">
                  <img src={resultImage} alt="效果图" className="slot-img" />
                  <div className="slot-badge result-badge">效 果</div>
                </div>
              </div>
              <div className="action-row">
                <a href={resultImage} download="mirror-me-result.jpg" className="action-btn primary-btn">
                  保存效果图
                </a>
                <button className="action-btn ghost-btn" onClick={() => setResultImage(null)}>
                  再换一个
                </button>
              </div>
            </div>
          </>
        )}

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button className="back-link" onClick={() => router.push("/")}>重新分析</button>
        </div>

        <div style={{ height: 48 }} />
      </div>
    </main>
  );
}

const baseStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .hime-page { font-family: 'Noto Serif SC','PingFang SC',serif; background:#FFF8F8; min-height:100vh; }

  .hime-nav { display:flex; justify-content:space-between; align-items:center; padding:14px 20px; background:rgba(255,248,248,0.9); border-bottom:0.5px solid #f0d8d8; position:sticky; top:0; z-index:10; }
  .hime-logo { font-size:18px; font-weight:600; color:#2a1820; letter-spacing:4px; }
  .back-btn { display:flex; align-items:center; gap:5px; font-size:12px; color:#8a5060; background:rgba(232,192,192,0.2); border:0.5px solid #e8c0c8; border-radius:20px; padding:5px 12px; cursor:pointer; font-family:'Noto Serif SC',serif; }

  .hime-content { max-width:700px; margin:0 auto; padding:24px 16px 60px; }

  .hime-header { text-align:center; margin-bottom:20px; }
  .gold-deco { color:#c8a060; font-size:13px; letter-spacing:8px; margin-bottom:4px; }
  .hime-main-title { font-family:'Noto Serif SC',serif; font-size:22px; font-weight:600; color:#2a1820; letter-spacing:6px; margin-bottom:4px; }
  .hime-sub-title { font-size:11px; color:#b08888; letter-spacing:3px; margin-bottom:14px; }

  .gold-divider { text-align:center; color:#c8a060; font-size:11px; letter-spacing:8px; margin:20px 0; }

  .corner-gold { position:absolute; color:#c8a060; font-size:12px; line-height:1; }
  .tl{top:5px;left:7px;} .tr{top:5px;right:7px;} .bl{bottom:5px;left:7px;} .br{bottom:5px;right:7px;}

  /* 上传对比区 */
  .compare-section { background:#fff9f9; border:1px solid #e8c8c8; border-radius:14px; padding:16px; position:relative; margin-bottom:4px; }
  .compare-section::before { content:''; position:absolute; inset:4px; border:0.5px solid #f0d8c0; border-radius:10px; pointer-events:none; }

  .compare-row { display:flex; gap:10px; align-items:center; }
  .arrow-center { flex-shrink:0; width:24px; text-align:center; }

  .img-slot { flex:1; aspect-ratio:3/4; background:linear-gradient(160deg,#fff8f0,#fff2f5); border:0.5px solid #e8c8d0; border-radius:10px; overflow:hidden; position:relative; }
  .result-slot { background:linear-gradient(160deg,#fff2f5,#fff8f0); }
  .slot-img { width:100%; height:100%; object-fit:cover; display:block; }
  .slot-empty { width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:16px; }
  .upload-icon-ring { width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg,#fce8ec,#f5d8e8); border:0.5px solid #e8b8c4; display:flex; align-items:center; justify-content:center; }
  .empty-star { font-size:22px; color:rgba(200,160,140,0.4); }
  .slot-hint { font-size:11px; color:#b08888; letter-spacing:0.08em; text-align:center; }
  .slot-badge { position:absolute; bottom:8px; left:50%; transform:translateX(-50%); font-size:10px; padding:3px 14px; border-radius:20px; letter-spacing:2px; white-space:nowrap; }
  .orig-badge { background:rgba(232,192,192,0.5); color:#5a2838; border:0.5px solid #e8c0c8; }
  .result-badge { background:linear-gradient(90deg,#e8a0b8,#d08098); color:white; }

  .reupload-btn { background:none; border:none; font-size:11px; color:#b08888; cursor:pointer; text-decoration:underline; font-family:'Noto Serif SC',serif; letter-spacing:0.06em; }

  /* Tab */
  .tab-header { text-align:center; margin-bottom:12px; }
  .tab-row { display:inline-flex; gap:0; border:1px solid #e8c8c8; border-radius:20px; overflow:hidden; background:#fff9f9; }
  .tab-btn { padding:8px 24px; font-size:12px; letter-spacing:2px; color:#b08888; background:transparent; border:none; cursor:pointer; font-family:'Noto Serif SC',serif; font-weight:400; transition:all 0.2s; }
  .tab-btn.active { background:linear-gradient(90deg,#e8a0b8,#d08098); color:white; }

  /* 风格卡片 */
  .styles-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:4px; }
  .style-card { background:#fff9f9; border:1px solid #e8c8c8; border-radius:12px; padding:12px; position:relative; cursor:pointer; transition:border-color 0.2s, background 0.2s; }
  .style-card::before { content:''; position:absolute; inset:4px; border:0.5px solid #f0d8c0; border-radius:8px; pointer-events:none; }
  .style-card.active { background:linear-gradient(160deg,#fff8f0,#fff2f5); border:1.5px solid #e0c080; }
  .style-tag-pill { display:inline-block; font-size:9px; letter-spacing:2px; color:#c8a060; border:0.5px solid #e8c8b0; border-radius:20px; padding:2px 8px; margin-bottom:6px; }
  .style-name { font-size:13px; font-weight:600; color:#2a1820; letter-spacing:2px; margin-bottom:4px; }
  .style-desc { font-size:10px; color:#7a5058; line-height:1.6; letter-spacing:0.5px; }
  .check-mark { position:absolute; top:8px; right:10px; font-size:12px; color:#c8a060; }

  /* 错误 */
  .error-card { background:#fff5f5; border:0.5px solid #e8c0c0; border-radius:10px; padding:10px 16px; margin-top:12px; font-size:12px; color:#a05060; text-align:center; letter-spacing:1px; }

  /* 生成按钮 */
  .cta-btn { background:linear-gradient(135deg,#e8a0b8,#d08098,#c87090); border:none; border-radius:50px; padding:14px 40px; color:white; font-size:14px; font-family:'Noto Serif SC',serif; letter-spacing:3px; cursor:pointer; box-shadow:0 4px 16px rgba(200,100,128,0.35); transition:opacity 0.2s, transform 0.1s; }
  .cta-btn:hover:not(:disabled) { opacity:0.9; }
  .cta-btn:active:not(:disabled) { transform:scale(0.98); }
  .cta-btn:disabled { opacity:0.55; cursor:not-allowed; }

  /* 结果区 */
  .result-section { padding:16px; }
  .royal-card { background:#fff9f9; border:1px solid #e8c8c8; border-radius:12px; padding:12px; position:relative; }
  .royal-card::before { content:''; position:absolute; inset:4px; border:0.5px solid #f0d8c0; border-radius:8px; pointer-events:none; }
  .section-title-row { text-align:center; }

  .action-row { display:flex; gap:10px; margin-top:14px; }
  .action-btn { flex:1; padding:12px; border-radius:50px; font-size:12px; letter-spacing:2px; cursor:pointer; text-align:center; text-decoration:none; font-family:'Noto Serif SC',serif; font-weight:400; transition:opacity 0.2s; }
  .primary-btn { background:linear-gradient(135deg,#e8a0b8,#d08098,#c87090); color:white; border:none; box-shadow:0 3px 10px rgba(200,100,128,0.3); }
  .ghost-btn { background:rgba(232,192,192,0.15); color:#8a5060; border:0.5px solid #e8c0c8; }
  .action-btn:hover { opacity:0.85; }

  .back-link { background:none; border:none; font-size:12px; color:#b08888; cursor:pointer; text-decoration:underline; font-family:'Noto Serif SC',serif; }

  .img-spinner { width:28px; height:28px; border-radius:50%; border:2px solid rgba(200,160,160,0.2); border-top-color:#d08098; animation:spin 0.8s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }

  @media (max-width:480px) {
    .styles-grid { grid-template-columns:1fr 1fr; }
    .tab-btn { padding:8px 16px; font-size:11px; }
  }
`;

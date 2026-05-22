"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface MirrorResult {
  styleType: string;
  keywords: string[];
  description: string;
  makeupTips: {
    daily: string;
    date: string;
    work: string;
    party: string;
  };
  colorPalette: string[];
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<MirrorResult | null>(null);
  const [activeScene, setActiveScene] = useState<"daily" | "date" | "work" | "party">("daily");

  useEffect(() => {
    const raw = sessionStorage.getItem("mirrorResult");
    if (!raw) {
      router.replace("/");
      return;
    }
    setResult(JSON.parse(raw));
  }, [router]);

  if (!result) {
    return (
      <main className="page center">
        <div className="spinner" />
        <style>{pageStyle}</style>
      </main>
    );
  }

  const scenes: { key: "daily" | "date" | "work" | "party"; label: string }[] = [
    { key: "daily", label: "日常" },
    { key: "date", label: "约会" },
    { key: "work", label: "职场" },
    { key: "party", label: "派对" },
  ];

  return (
    <main className="page">
      <div className="blobs" aria-hidden="true">
        <div className="blob b1" /><div className="blob b2" />
        <div className="blob b3" /><div className="blob b4" />
      </div>
      <div className="noise-overlay" aria-hidden="true" />

      {/* 导航 */}
      <nav className="nav glass">
        <button className="back-btn" onClick={() => router.push("/")} aria-label="返回首页">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          返回
        </button>
        <span className="logo">镜 我</span>
        <span style={{ width: 60 }} />
      </nav>

      <div className="content">

        {/* 风格类型 */}
        <div className="style-hero">
          <div className="style-icon glass">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
              <path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <p className="style-label">你的专属风格</p>
          <h1 className="style-type">{result.styleType}</h1>
          <div className="keywords">
            {result.keywords.map((k) => (
              <span key={k} className="keyword-tag">{k}</span>
            ))}
          </div>
        </div>

        {/* 风格描述 */}
        <div className="card glass desc-card">
          <div className="card-title-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B6CC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            <span className="card-title">风格解读</span>
          </div>
          <p className="desc-text">{result.description}</p>
        </div>

        {/* 色彩档案 */}
        <div className="card glass">
          <div className="card-title-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B6CC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="13.5" cy="6.5" r="2.5"/><circle cx="19" cy="14" r="2"/><circle cx="6" cy="14" r="3"/><circle cx="13" cy="17" r="2.5"/>
            </svg>
            <span className="card-title">专属色彩</span>
          </div>
          <div className="palette">
            {result.colorPalette.map((color) => (
              <div key={color} className="palette-item">
                <div className="color-dot" style={{ background: color }} />
                <span className="color-name">{color}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 妆容建议 */}
        <div className="card glass">
          <div className="card-title-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B6CC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
            </svg>
            <span className="card-title">妆容建议</span>
          </div>
          <div className="scene-tabs">
            {scenes.map((s) => (
              <button
                key={s.key}
                className={`scene-tab${activeScene === s.key ? " active" : ""}`}
                onClick={() => setActiveScene(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="makeup-tip">{result.makeupTips[activeScene]}</p>
        </div>

        {/* 按钮区 */}
        <div className="action-row">
          <button className="action-btn primary" onClick={() => router.push("/")}>
            重新分析
          </button>
          <button className="action-btn secondary" onClick={() => router.push("/tryon")}>
            虚拟试妆 →
          </button>
        </div>

      </div>

      <style>{pageStyle}</style>
    </main>
  );
}

const pageStyle = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .page { font-family: 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif; background:#C4BCEA; min-height:100vh; position:relative; overflow-x:hidden; }
  .page.center { display:flex; align-items:center; justify-content:center; }
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
  .back-btn { display:flex; align-items:center; gap:5px; font-size:13px; color:#2D1F5E; background:rgba(255,255,255,0.22); border:1px solid rgba(255,255,255,0.4); border-radius:20px; padding:6px 14px; cursor:pointer; backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); }
  .content { position:relative; z-index:2; padding:24px 16px 48px; max-width:480px; margin:0 auto; display:flex; flex-direction:column; gap:14px; }
  .style-hero { text-align:center; padding:10px 0 6px; }
  .style-icon { width:64px; height:64px; border-radius:20px; background:rgba(90,65,175,0.55) !important; border:1px solid rgba(255,255,255,0.45) !important; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; }
  .style-label { font-size:12px; color:rgba(45,31,94,0.6); margin-bottom:6px; }
  .style-type { font-size:30px; font-weight:500; color:#1E1440; margin-bottom:14px; letter-spacing:2px; }
  .keywords { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; }
  .keyword-tag { font-size:13px; font-weight:500; color:#3C2A8A; background:rgba(175,150,225,0.35); border:1px solid rgba(175,150,225,0.45); padding:5px 16px; border-radius:20px; }
  .card { border-radius:24px; padding:18px 20px; }
  .card-title-row { display:flex; align-items:center; gap:7px; margin-bottom:12px; }
  .card-title { font-size:14px; font-weight:500; color:#2D1F5E; }
  .desc-text { font-size:14px; color:rgba(45,31,94,0.78); line-height:1.8; }
  .palette { display:flex; gap:10px; flex-wrap:wrap; }
  .palette-item { display:flex; align-items:center; gap:7px; }
  .color-dot { width:24px; height:24px; border-radius:50%; border:1.5px solid rgba(255,255,255,0.6); flex-shrink:0; }
  .color-name { font-size:12px; color:rgba(45,31,94,0.7); }
  .scene-tabs { display:flex; gap:6px; margin-bottom:14px; flex-wrap:wrap; }
  .scene-tab { font-size:12px; font-weight:500; padding:6px 16px; border-radius:20px; border:1px solid rgba(255,255,255,0.38); background:rgba(255,255,255,0.18); color:rgba(45,31,94,0.65); cursor:pointer; transition:all 0.18s; backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); }
  .scene-tab.active { background:rgba(75,52,165,0.75); color:rgba(255,255,255,0.95); border-color:rgba(255,255,255,0.3); }
  .makeup-tip { font-size:14px; color:rgba(45,31,94,0.78); line-height:1.8; }
  .action-row { display:flex; gap:10px; padding-top:4px; }
  .action-btn { flex:1; padding:14px 0; border-radius:50px; font-size:14px; font-weight:500; cursor:pointer; border:1px solid rgba(255,255,255,0.35); transition:transform 0.1s, background 0.18s; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); }
  .action-btn.primary { background:rgba(255,255,255,0.28); color:#2D1F5E; }
  .action-btn.secondary { background:rgba(75,52,165,0.8); color:rgba(255,255,255,0.95); }
  .action-btn:hover { opacity:0.9; }
  .action-btn:active { transform:scale(0.98); }
  .spinner { width:36px; height:36px; border-radius:50%; border:3px solid rgba(45,31,94,0.2); border-top-color:#5B4DB5; animation:spin 0.8s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
`;

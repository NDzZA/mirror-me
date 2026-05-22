"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const base64 = await toBase64(file);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "分析失败，请重试");
        setLoading(false);
        return;
      }
      sessionStorage.setItem("uploadedImage", base64);
      sessionStorage.setItem("mirrorResult", JSON.stringify(data));
      router.push("/result");
    } catch {
      setError("网络错误，请检查连接后重试");
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="blobs" aria-hidden="true">
        <div className="blob b1" /><div className="blob b2" />
        <div className="blob b3" /><div className="blob b4" />
      </div>
      <div className="noise-overlay" aria-hidden="true" />

      <nav className="nav glass">
        <span className="logo">镜 我</span>
        <span className="nav-pill">AI 形象顾问</span>
      </nav>

      <section className="hero">
        <div className="hero-badge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
          </svg>
          上传照片，解锁专属风格
        </div>
        <h1>你的五官<br />藏着独一无二的美</h1>
        <p>AI 深度分析面部特征<br />生成专属风格档案 · 妆容建议 · 虚拟试妆</p>

        <div
          className={`upload-card glass${dragging ? " drag-over" : ""}${loading ? " loading" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0] ?? null); }}
        >
          <div className="upload-icon-wrap">
            {loading ? (
              <div className="spinner" aria-label="分析中" />
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            )}
          </div>
          <p className="upload-title">{loading ? "AI 分析中，请稍候…" : "上传一张正脸照片"}</p>
          <p className="upload-sub">{loading ? "正在解读你的专属风格特征" : "建议光线均匀、正脸清晰\n照片仅用于分析，不会保存"}</p>
          {error && <p className="error-msg">{error}</p>}
          <label
            className="upload-btn"
            style={{
              display: "block",
              textAlign: "center",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "分析中…" : "选择照片 →"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={(e) => !loading && handleFile(e.target.files?.[0] ?? null)}
              disabled={loading}
            />
          </label>
        </div>
        <p className="hint">支持 JPG / PNG · 建议正面 · 光线均匀</p>
      </section>

      <div className="steps" role="list">
        {["上传照片", "AI 分析", "风格档案", "试妆建议"].map((label, i) => (
          <div key={label} className="step-wrap" role="listitem">
            <div className="step">
              <div className="step-num">{i + 1}</div>
              <div className="step-label">{label}</div>
            </div>
            {i < 3 && <span className="step-arr" aria-hidden="true">›</span>}
          </div>
        ))}
      </div>

      <div className="sec-hd"><span>看看其他人的风格档案</span></div>

      <div className="cards">
        {[
          { icon: "moon", topClass: "top-a", topLabel: "清冷少女型", name: "清冷少女", tags: ["冷白皮", "高级感", "极简"], tagClass: "tag-p" },
          { icon: "leaf", topClass: "top-b", topLabel: "知性优雅型", name: "知性优雅", tags: ["温柔", "大气", "职场"], tagClass: "tag-g" },
          { icon: "heart", topClass: "top-c", topLabel: "甜美活力型", name: "甜美活力", tags: ["元气", "可爱", "减龄"], tagClass: "tag-r" },
        ].map((card) => (
          <div key={card.name} className="card glass">
            <div className={`card-top ${card.topClass}`}>
              <CardIcon type={card.icon} />
              <span className="card-top-label">{card.topLabel}</span>
            </div>
            <div className="card-body">
              <p className="card-name">{card.name}</p>
              <div className="tags">
                {card.tags.map((t) => <span key={t} className={`tag ${card.tagClass}`}>{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .page { font-family: 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif; background: #C4BCEA; min-height: 100vh; position: relative; overflow-x: hidden; }
        .blobs { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .blob { position: absolute; border-radius: 50%; filter: blur(72px); opacity: 0.78; }
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
        .nav { display:flex; justify-content:space-between; align-items:center; padding:16px 28px; position:relative; z-index:10; border-radius:0; border-left:none; border-right:none; border-top:none; }
        .logo { font-size:19px; font-weight:500; color:#1E1440; letter-spacing:4px; }
        .nav-pill { font-size:12px; font-weight:500; color:rgba(255,255,255,0.92); background:rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.38); padding:5px 14px; border-radius:20px; }
        .hero { position:relative; z-index:2; text-align:center; padding:38px 24px 22px; }
        .hero-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.22); border:1px solid rgba(255,255,255,0.4); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border-radius:20px; padding:5px 14px; margin-bottom:18px; font-size:12px; color:rgba(255,255,255,0.95); }
        .hero h1 { font-size:27px; font-weight:500; color:#1E1440; line-height:1.45; margin-bottom:10px; }
        .hero p { font-size:14px; color:rgba(45,31,94,0.68); line-height:1.75; margin-bottom:26px; }
        .upload-card { border-radius:28px; padding:28px 24px; margin:0 auto 10px; max-width:360px; display:flex; flex-direction:column; align-items:center; gap:13px; transition:border-color 0.2s; }
        .upload-card.drag-over { border-color:rgba(140,110,220,0.7); }
        .upload-card.loading { opacity:0.85; }
        .upload-icon-wrap { width:64px; height:64px; border-radius:18px; background:rgba(90,65,175,0.55); border:1px solid rgba(255,255,255,0.45); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; }
        .spinner { width:26px; height:26px; border-radius:50%; border:2.5px solid rgba(255,255,255,0.3); border-top-color:rgba(255,255,255,0.95); animation:spin 0.8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .upload-title { font-size:15px; font-weight:500; color:#1E1440; }
        .upload-sub { font-size:12px; color:rgba(45,31,94,0.62); text-align:center; line-height:1.7; white-space:pre-line; }
        .error-msg { font-size:12px; color:#c0392b; background:rgba(255,255,255,0.5); padding:6px 14px; border-radius:12px; }
        .upload-btn { background:rgba(75,52,165,0.82); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.28); color:rgba(255,255,255,0.96); border-radius:50px; padding:13px 0; font-size:14px; font-weight:500; width:100%; letter-spacing:0.5px; transition:background 0.2s,transform 0.1s; }
        .upload-btn:hover { background:rgba(90,65,185,0.9); }
        .upload-btn:active { transform:scale(0.98); }
        .hint { font-size:12px; color:rgba(45,31,94,0.48); text-align:center; margin-bottom:28px; }
        .steps { position:relative; z-index:2; display:flex; align-items:center; justify-content:center; padding:0 20px 26px; }
        .step-wrap { display:flex; align-items:center; }
        .step { text-align:center; width:68px; }
        .step-num { width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.26); border:1px solid rgba(255,255,255,0.48); color:#2D1F5E; font-size:13px; font-weight:500; display:flex; align-items:center; justify-content:center; margin:0 auto 6px; backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); }
        .step-label { font-size:11px; color:rgba(45,31,94,0.68); line-height:1.4; }
        .step-arr { color:rgba(255,255,255,0.55); font-size:18px; margin:0 2px 16px; flex-shrink:0; }
        .sec-hd { position:relative; z-index:2; display:flex; align-items:center; justify-content:center; gap:10px; margin:0 20px 14px; }
        .sec-hd span { font-size:12px; color:rgba(45,31,94,0.58); white-space:nowrap; }
        .sec-hd::before,.sec-hd::after { content:''; flex:1; height:0.5px; background:rgba(255,255,255,0.42); }
        .cards { position:relative; z-index:2; display:flex; gap:10px; padding:0 14px 48px; justify-content:center; flex-wrap:wrap; }
        .card { border-radius:20px; width:160px; overflow:hidden; }
        .card-top { height:96px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; border-bottom:1px solid rgba(255,255,255,0.25); }
        .top-a { background:rgba(185,160,235,0.28); }
        .top-b { background:rgba(155,210,185,0.28); }
        .top-c { background:rgba(235,170,170,0.28); }
        .card-top-label { font-size:11px; font-weight:500; }
        .top-a .card-top-label { color:#3C2A8A; }
        .top-b .card-top-label { color:#1A6545; }
        .top-c .card-top-label { color:#8A2828; }
        .card-body { padding:10px 10px 13px; }
        .card-name { font-size:13px; font-weight:500; color:#1E1440; margin-bottom:6px; }
        .tags { display:flex; gap:4px; flex-wrap:wrap; }
        .tag { font-size:10px; font-weight:500; padding:3px 8px; border-radius:20px; }
        .tag-p { background:rgba(175,150,225,0.32); color:#3C2A8A; border:1px solid rgba(175,150,225,0.38); }
        .tag-g { background:rgba(145,205,178,0.32); color:#1A6545; border:1px solid rgba(145,205,178,0.38); }
        .tag-r { background:rgba(225,165,165,0.32); color:#8A2828; border:1px solid rgba(225,165,165,0.38); }
      `}</style>
    </main>
  );
}

function CardIcon({ type }: { type: string }) {
  const props = { width:22, height:22, fill:"none", stroke:"currentColor", strokeWidth:1.8, strokeLinecap:"round" as const, strokeLinejoin:"round" as const, "aria-hidden":true, style:{ opacity:0.75 } };
  if (type === "moon") return <svg {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" /></svg>;
  if (type === "leaf") return <svg {...props}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>;
  return <svg {...props}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface HairRecommend {
  best: { name: string; reasons: string[] };
  good: string[];
  notGood: string[];
}

interface MakeupDetail {
  eye: string;
  blush: string;
  lip: string;
  base: string;
  nose: string;
}

interface ColorPalette {
  eyeshadow: string[];
  blush: string[];
  lip: string[];
}

interface MirrorResult {
  styleType: string;
  keywords: string[];
  description: string;
  faceType: string;
  faceFeatures: string[];
  faceDescription: string;
  hairRecommend: HairRecommend;
  makeupDetail: MakeupDetail;
  makeupPoints: string[];
  colorPalette: ColorPalette;
}

const colorMap: Record<string, string> = {
  "玫瑰粉": "#e8a0b0", "豆沙": "#c87880", "裸粉": "#e8c0b0", "珊瑚橙": "#e89070",
  "棕红": "#b06060", "奶茶棕": "#c8956c", "香槟金": "#e8d090", "莫兰迪粉": "#d8a8b0",
  "杏粉": "#f0b898", "玫红": "#d06080", "正红": "#c84050", "砖红": "#c06050",
  "橘粉": "#f0a080", "裸橘": "#e8b090", "浅粉": "#f8d0d8", "深玫瑰": "#b85870",
};
function getColor(name: string): string { return colorMap[name] ?? "#e8b0b8"; }

async function generateImage(image: string, prompt: string): Promise<string | null> {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image, prompt }),
    });
    const data = await res.json();
    return data.imageUrl ?? null;
  } catch { return null; }
}

function hairPrompt(hairName: string): string {
  return `这是一张真实人物照片。请保持照片的真实感，保持人物的脸型、五官、妆容、肤色完全不变，仅将发型改为${hairName}。发丝要有真实质感，像真实发型照片，不要卡通化，不要过度美颜。`;
}

function makeupPrompt(part: string, desc: string): string {
  const partMap: Record<string, string> = {
    eye: "眼部区域特写，放大眼睛部分",
    blush: "脸颊腮红区域特写",
    lip: "嘴唇特写",
    base: "肌肤底妆质感特写，脸部局部",
    nose: "鼻部鼻影特写",
  };
  const area = partMap[part] ?? "面部特写";
  return `这是一张真实人物照片。请裁取并放大人物的${area}，在该部位画上${desc}，效果自然真实，像专业美妆教程的局部特写图，保持照片质感，不要卡通化。`;
}

function ImgSlot({ src, alt, className, loading }: { src: string | null; alt: string; className: string; loading: boolean }) {
  if (loading) return (
    <div className={`${className} img-loading`}>
      <div className="img-spinner" />
      <span>生成中…</span>
    </div>
  );
  if (!src) return <div className={`${className} img-error`}>生成失败</div>;
  return <img src={src} alt={alt} className={className} />;
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<MirrorResult | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);

  const [hairImgs, setHairImgs] = useState<(string | null)[]>([null, null, null, null]);
  const [hairLoading, setHairLoading] = useState([true, true, true, true]);

  const [makeupImgs, setMakeupImgs] = useState<(string | null)[]>([null, null, null, null, null]);
  const [makeupLoading, setMakeupLoading] = useState([false, false, false, false, false]);
  const makeupStarted = useRef(false);
  const makeupSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("mirrorResult");
    const img = sessionStorage.getItem("uploadedImage");
    if (!raw) { router.replace("/"); return; }
    const parsed = JSON.parse(raw) as MirrorResult;
    setResult(parsed);
    if (img) setUserImage(img);
  }, [router]);

  // 串行生成发型图，一张完成再生成下一张
  useEffect(() => {
    if (!result || !userImage) return;
    const best = result.hairRecommend?.best?.name ?? "";
    const good = result.hairRecommend?.good ?? [];
    const targets = [best, good[0] ?? "", good[1] ?? "", good[2] ?? ""];

    const generateSequentially = async () => {
      for (let i = 0; i < targets.length; i++) {
        const url = await generateImage(userImage, hairPrompt(targets[i]));
        setHairImgs((prev) => { const n = [...prev]; n[i] = url; return n; });
        setHairLoading((prev) => { const n = [...prev]; n[i] = false; return n; });
      }
    };

    generateSequentially();
  }, [result, userImage]);

  // 串行生成妆容特写图，滚动到妆容区域时触发
  useEffect(() => {
    if (!result || !userImage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !makeupStarted.current) {
          makeupStarted.current = true;
          setMakeupLoading([true, true, true, true, true]);

          const parts = ["eye", "blush", "lip", "base", "nose"] as const;
          const descs = [
            result.makeupDetail?.eye ?? "",
            result.makeupDetail?.blush ?? "",
            result.makeupDetail?.lip ?? "",
            result.makeupDetail?.base ?? "",
            result.makeupDetail?.nose ?? "",
          ];

          const generateSequentially = async () => {
            for (let i = 0; i < parts.length; i++) {
              const url = await generateImage(userImage, makeupPrompt(parts[i], descs[i]));
              setMakeupImgs((prev) => { const n = [...prev]; n[i] = url; return n; });
              setMakeupLoading((prev) => { const n = [...prev]; n[i] = false; return n; });
            }
          };

          generateSequentially();
        }
      },
      { threshold: 0.1 }
    );
    if (makeupSectionRef.current) observer.observe(makeupSectionRef.current);
    return () => observer.disconnect();
  }, [result, userImage]);

  if (!result) {
    return (
      <main style={{ minHeight: "100vh", background: "#FFF8F8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
        <style>{baseStyle}</style>
      </main>
    );
  }

  const {
    hairRecommend,
    makeupDetail,
    makeupPoints = [],
    colorPalette = { eyeshadow: [], blush: [], lip: [] },
    faceType = "",
    faceFeatures = [],
    faceDescription = "",
    keywords = [],
  } = result;

  const safeHairRecommend = {
    best: {
      name: hairRecommend?.best?.name ?? "",
      reasons: hairRecommend?.best?.reasons ?? [],
    },
    good: hairRecommend?.good ?? [],
    notGood: hairRecommend?.notGood ?? [],
  };

  const safeMakeupDetail = {
    eye: makeupDetail?.eye ?? "",
    blush: makeupDetail?.blush ?? "",
    lip: makeupDetail?.lip ?? "",
    base: makeupDetail?.base ?? "",
    nose: makeupDetail?.nose ?? "",
  };

  const safeColorPalette = {
    eyeshadow: colorPalette?.eyeshadow ?? [],
    blush: colorPalette?.blush ?? [],
    lip: colorPalette?.lip ?? [],
  };

  return (
    <main className="hime-page">
      <style>{baseStyle}</style>

      <nav className="hime-nav">
        <button className="back-btn" onClick={() => router.push("/")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          返回
        </button>
        <span className="hime-logo">镜 我</span>
        <span style={{ width: 60 }} />
      </nav>

      <div className="hime-content">

        <div className="hime-header">
          <div className="gold-deco">✦ ✦ ✦</div>
          <h1 className="hime-main-title">发 型 风 格 诊 断</h1>
          <div className="hime-sub-title">最适合你的发型是？</div>
          {keywords.length > 0 && (
            <div className="diagnosis-card">
              <div className="diag-title">✦ 诊断要点</div>
              {keywords.map((k) => <div key={k} className="check-pt">{k}</div>)}
            </div>
          )}
        </div>

        <div className="hair-grid">
          <div className="crown-card">
            <div className="crown-label"><span className="crown-icon">♛</span> 最 适 合 你</div>
            <ImgSlot
              src={hairImgs[0]}
              alt="最适合你的发型"
              className="hair-portrait"
              loading={hairLoading[0]}
            />
            <div className="hair-best-name">{safeHairRecommend.best.name}</div>
            {safeHairRecommend.best.reasons.map((r) => <div key={r} className="heart-pt">{r}</div>)}
          </div>

          <div className="royal-card">
            <span className="corner-gold tl">✦</span><span className="corner-gold tr">✦</span>
            <span className="corner-gold bl">✦</span><span className="corner-gold br">✦</span>
            <div className="section-label gold">GOOD · 普通推荐</div>
            <div className="good-grid">
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <ImgSlot
                    src={hairImgs[i + 1]}
                    alt={safeHairRecommend.good[i] ?? ""}
                    className="hair-thumb"
                    loading={hairLoading[i + 1]}
                  />
                  <div className="hair-thumb-label">{safeHairRecommend.good[i] ?? ""}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="not-rec-card">
            <span className="corner-pink tl">✦</span><span className="corner-pink tr">✦</span>
            <span className="corner-pink bl">✦</span><span className="corner-pink br">✦</span>
            <div className="section-label muted">NOT RECOMMENDED</div>
            <div className="hair-tag-grid">
              {safeHairRecommend.notGood.map((h) => (
                <div key={h} className="hair-tag not">{h}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="gold-divider">· · · ✦ ✦ ✦ · · ·</div>

        <div ref={makeupSectionRef}>
          <div className="makeup-section-title">妆 容 分 析 指 南</div>
          <div className="makeup-section-sub">让你魅力全开的妆容平衡</div>

          <div className="makeup-grid">
            <div className="makeup-left">
              {([
                { key: "eye", label: "✦ 眼妆", text: safeMakeupDetail.eye, idx: 0 },
                { key: "blush", label: "✦ 腮红", text: safeMakeupDetail.blush, idx: 1 },
                { key: "lip", label: "✦ 唇妆", text: safeMakeupDetail.lip, idx: 2 },
              ] as const).map((item) => (
                <div key={item.key} className="feat-card">
                  <div className="flabel">{item.label}</div>
                  <ImgSlot src={makeupImgs[item.idx]} alt={item.label} className="makeup-thumb" loading={makeupLoading[item.idx]} />
                  <div className="fdesc">{item.text}</div>
                </div>
              ))}
            </div>

            <div className="makeup-center">
              {userImage
                ? <img src={userImage} alt="面部大图" className="face-portrait" />
                : <div className="face-placeholder">面部大图</div>
              }
            </div>

            <div className="makeup-right">
              <div className="feat-card">
                <div className="flabel">✦ 脸型诊断</div>
                <div className="face-tags">
                  {faceType && <span className="tag-pill">{faceType}</span>}
                  {faceFeatures.map((f) => <span key={f} className="tag-pill">{f}</span>)}
                </div>
                {faceDescription && <div className="fdesc" style={{ marginTop: 6 }}>{faceDescription}</div>}
              </div>
              {([
                { key: "base", label: "✦ 底妆", text: safeMakeupDetail.base, idx: 3 },
                { key: "nose", label: "✦ 鼻影", text: safeMakeupDetail.nose, idx: 4 },
              ] as const).map((item) => (
                <div key={item.key} className="feat-card">
                  <div className="flabel">{item.label}</div>
                  <ImgSlot src={makeupImgs[item.idx]} alt={item.label} className="makeup-thumb" loading={makeupLoading[item.idx]} />
                  <div className="fdesc">{item.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bottom-row">
            <div className="royal-card" style={{ flex: 1 }}>
              <span className="corner-gold tl">✦</span><span className="corner-gold tr">✦</span>
              <span className="corner-gold bl">✦</span><span className="corner-gold br">✦</span>
              <div className="bottom-title">🌸 妆容要点</div>
              {makeupPoints.map((p) => <div key={p} className="check-pt">{p}</div>)}
            </div>
            <div className="royal-card" style={{ flex: 1 }}>
              <span className="corner-gold tl">✦</span><span className="corner-gold tr">✦</span>
              <span className="corner-gold bl">✦</span><span className="corner-gold br">✦</span>
              <div className="bottom-title">✦ 推荐色彩</div>
              <div className="color-row">
                {([
                  { label: "眼影", colors: safeColorPalette.eyeshadow },
                  { label: "腮红", colors: safeColorPalette.blush },
                  { label: "唇色", colors: safeColorPalette.lip },
                ]).map((col) => (
                  <div key={col.label} className="color-col">
                    <div className="color-label">{col.label}</div>
                    <div className="color-dots">
                      {col.colors.map((c) => <div key={c} className="cdot" style={{ background: getColor(c) }} title={c} />)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button className="cta-btn" onClick={() => router.push("/tryon")}>
            ✨ 看看我化妆后的样子 →
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button className="back-link" onClick={() => router.push("/")}>重新分析</button>
        </div>

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
  .diagnosis-card { display:inline-block; background:white; border:0.5px solid #e8c8b0; border-radius:10px; padding:8px 16px; text-align:left; }
  .diag-title { font-size:10px; color:#c8a060; letter-spacing:2px; margin-bottom:4px; }

  .hair-grid { display:grid; grid-template-columns:160px 1fr 1fr; gap:10px; margin-bottom:10px; }

  .crown-card { background:linear-gradient(160deg,#fff8f0,#fff2f5); border:1.5px solid #e0c080; border-radius:14px; padding:12px; position:relative; }
  .crown-card::before { content:''; position:absolute; inset:4px; border:0.5px dashed rgba(210,180,100,0.35); border-radius:10px; pointer-events:none; }
  .crown-card::after { content:'🎀'; position:absolute; top:-11px; right:-6px; font-size:20px; }
  .crown-label { background:linear-gradient(90deg,#e8a0b8,#d08098,#e8a0b8); color:white; font-size:11px; padding:3px 12px; border-radius:20px; display:inline-flex; align-items:center; gap:4px; margin-bottom:8px; letter-spacing:1px; }
  .crown-icon { color:#f0d060; font-size:12px; }

  .hair-portrait { width:100%; aspect-ratio:3/4; object-fit:cover; border-radius:8px; border:0.5px solid #e8c8d0; margin-bottom:8px; }
  .hair-best-name { font-size:12px; font-weight:600; color:#5a2838; text-align:center; margin-bottom:6px; letter-spacing:2px; }
  .heart-pt { font-size:11px; color:#7a4050; margin:3px 0; display:flex; align-items:flex-start; gap:4px; line-height:1.5; }
  .heart-pt::before { content:'❤'; color:#e07888; font-size:9px; margin-top:2px; flex-shrink:0; }

  .royal-card { background:#fff9f9; border:1px solid #e8c8c8; border-radius:12px; padding:12px; position:relative; }
  .royal-card::before { content:''; position:absolute; inset:4px; border:0.5px solid #f0d8c0; border-radius:8px; pointer-events:none; }
  .not-rec-card { background:#fdf7f7; border:0.5px solid #eed8d8; border-radius:12px; padding:12px; position:relative; }

  .corner-gold { position:absolute; color:#c8a060; font-size:12px; line-height:1; }
  .corner-pink { position:absolute; color:#d0a0b0; font-size:12px; line-height:1; }
  .tl{top:5px;left:7px;} .tr{top:5px;right:7px;} .bl{bottom:5px;left:7px;} .br{bottom:5px;right:7px;}

  .section-label { font-size:10px; text-align:center; margin-bottom:10px; letter-spacing:2px; }
  .section-label.gold { color:#c8a060; }
  .section-label.muted { color:#c0a0a0; }

  .good-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; }
  .hair-thumb { width:100%; aspect-ratio:3/4; object-fit:cover; border-radius:6px; border:0.5px solid #e8c8d0; margin-bottom:3px; }
  .hair-thumb-label { font-size:10px; color:#7a5058; text-align:center; }

  .hair-tag-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
  .hair-tag { font-size:10px; text-align:center; padding:6px 4px; border-radius:8px; line-height:1.4; }
  .hair-tag.not { background:#f5f0f0; border:0.5px solid #e8d8d8; color:#a09090; opacity:0.75; }

  .gold-divider { text-align:center; color:#c8a060; font-size:11px; letter-spacing:8px; margin:16px 0; }

  .makeup-section-title { font-family:'Noto Serif SC',serif; font-size:20px; font-weight:600; color:#2a1820; text-align:center; letter-spacing:5px; margin-bottom:3px; }
  .makeup-section-sub { text-align:center; font-size:11px; color:#b08888; letter-spacing:2px; margin-bottom:14px; display:flex; align-items:center; justify-content:center; gap:8px; }
  .makeup-section-sub::before,.makeup-section-sub::after { content:''; flex:1; max-width:60px; height:0.5px; background:linear-gradient(90deg,transparent,#c8a060,transparent); }

  .makeup-grid { display:grid; grid-template-columns:120px 1fr 120px; gap:10px; align-items:start; margin-bottom:12px; }
  .makeup-left,.makeup-right { display:flex; flex-direction:column; gap:7px; }
  .makeup-center { text-align:center; }
  .face-portrait { width:100%; aspect-ratio:3/4; object-fit:cover; border-radius:10px; border:0.5px solid #e8c8d0; }
  .face-placeholder { width:100%; height:220px; background:linear-gradient(160deg,#f5e5e8,#ead8dc); border-radius:10px; border:0.5px solid #e8c8d0; display:flex; align-items:center; justify-content:center; color:#c09098; font-size:11px; }

  .feat-card { background:white; border:0.5px solid #f0d0d8; border-radius:10px; padding:9px; position:relative; }
  .feat-card::before { content:''; position:absolute; inset:3px; border:0.5px dashed rgba(200,160,96,0.25); border-radius:7px; pointer-events:none; }
  .flabel { font-size:10px; color:#a07060; letter-spacing:1px; margin-bottom:4px; }
  .fdesc { font-size:10px; color:#7a5058; line-height:1.6; }
  .makeup-thumb { width:100%; height:54px; object-fit:cover; border-radius:6px; border:0.5px solid #e8c8d0; margin-bottom:4px; }

  .face-tags { display:flex; flex-wrap:wrap; gap:3px; margin-bottom:2px; }
  .tag-pill { display:inline-block; background:#fde8ee; border:0.5px solid #e8c0cc; border-radius:20px; padding:2px 8px; font-size:10px; color:#9a5060; }

  .bottom-row { display:flex; gap:10px; margin-bottom:4px; }
  .bottom-title { font-size:12px; color:#c8a060; margin-bottom:8px; letter-spacing:2px; }
  .check-pt { font-size:11px; color:#7a4050; margin:3px 0; display:flex; align-items:flex-start; gap:5px; }
  .check-pt::before { content:'☑'; color:#c8a060; font-size:11px; flex-shrink:0; }

  .color-row { display:flex; gap:8px; }
  .color-col { flex:1; text-align:center; }
  .color-label { font-size:10px; color:#b07878; margin-bottom:5px; letter-spacing:1px; }
  .color-dots { display:flex; gap:3px; justify-content:center; }
  .cdot { width:22px; height:22px; border-radius:5px; border:0.5px solid rgba(0,0,0,0.08); }

  .cta-btn { background:linear-gradient(135deg,#e8a0b8,#d08098,#c87090); border:none; border-radius:50px; padding:14px 40px; color:white; font-size:15px; font-family:'Noto Serif SC',serif; letter-spacing:3px; cursor:pointer; box-shadow:0 4px 16px rgba(200,100,128,0.35); }
  .back-link { background:none; border:none; font-size:12px; color:#b08888; cursor:pointer; text-decoration:underline; font-family:'Noto Serif SC',serif; }

  .img-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; background:linear-gradient(160deg,#f5e5e8,#ead8dc); border-radius:8px; border:0.5px solid #e8c8d0; font-size:10px; color:#c09098; }
  .img-error { display:flex; align-items:center; justify-content:center; background:#f5f0f0; border-radius:8px; border:0.5px solid #e8d8d8; font-size:10px; color:#c0a0a0; }
  .img-spinner { width:18px; height:18px; border-radius:50%; border:2px solid rgba(200,160,160,0.2); border-top-color:#d08098; animation:spin 0.8s linear infinite; }

  .spinner { width:36px; height:36px; border-radius:50%; border:3px solid rgba(200,160,160,0.2); border-top-color:#d08098; animation:spin 0.8s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }

  @media (max-width:480px) {
    .hair-grid { grid-template-columns:1fr; }
    .good-grid { grid-template-columns:1fr 1fr 1fr; }
    .makeup-grid { grid-template-columns:1fr; }
    .makeup-left,.makeup-right { flex-direction:row; flex-wrap:wrap; }
    .makeup-left .feat-card,.makeup-right .feat-card { flex:1; min-width:140px; }
    .bottom-row { flex-direction:column; }
  }
`;

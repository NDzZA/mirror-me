'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('正在分析五官特征…')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const loadingSteps = [
    '正在分析五官特征…',
    '识别脸型轮廓…',
    '生成专属风格档案…',
    '匹配发型推荐…',
  ]

  const handleFile = async (file: File) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1]
      const dataUrl = e.target?.result as string
      sessionStorage.setItem('uploadedImage', dataUrl)

      setIsLoading(true)
      let step = 0
      const interval = setInterval(() => {
        step = (step + 1) % loadingSteps.length
        setLoadingText(loadingSteps[step])
      }, 2200)

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        })
        const data = await res.json()
        clearInterval(interval)
        sessionStorage.setItem('mirrorResult', JSON.stringify(data))
        router.push('/result')
      } catch {
        clearInterval(interval)
        setIsLoading(false)
        alert('分析失败，请重试')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #fdf8f4;
          font-family: 'Noto Serif SC', 'SimSun', serif;
        }

        .page {
          min-height: 100vh;
          background: #fdf8f4;
          position: relative;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* decorative bg circles */
        .deco-l {
          position: fixed; left: -120px; top: 80px;
          width: 420px; height: 420px; border-radius: 50%;
          background: radial-gradient(circle, #f5d0d8 0%, #fce8ec 55%, transparent 78%);
          opacity: 0.45; pointer-events: none; z-index: 0;
        }
        .deco-r {
          position: fixed; right: -80px; bottom: 100px;
          width: 340px; height: 340px; border-radius: 50%;
          background: radial-gradient(circle, #e8d0b0 0%, #f5e8d0 55%, transparent 78%);
          opacity: 0.35; pointer-events: none; z-index: 0;
        }
        .deco-sm {
          position: fixed; right: 15%; top: 20%;
          width: 120px; height: 120px; border-radius: 50%;
          background: radial-gradient(circle, #f0d4e8 0%, transparent 70%);
          opacity: 0.3; pointer-events: none; z-index: 0;
        }

        /* paper grid lines */
        .paper-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(200,170,140,0.08) 48px),
            repeating-linear-gradient(90deg, transparent, transparent 47px, rgba(200,170,140,0.06) 48px);
        }

        /* NAV */
        .nav {
          width: 100%; max-width: 900px;
          display: flex; justify-content: space-between; align-items: center;
          padding: 24px 40px 0;
          position: relative; z-index: 10;
        }
        .nav-logo {
          font-size: 13px; letter-spacing: 0.28em; color: #b8917a;
          font-weight: 300; text-transform: uppercase;
        }
        .nav-links { display: flex; gap: 28px; }
        .nav-links a {
          font-size: 11px; letter-spacing: 0.2em; color: #9e7e6a;
          text-decoration: none; font-weight: 300;
          padding-bottom: 2px;
          border-bottom: 0.5px solid transparent;
          transition: border-color 0.25s, color 0.25s;
        }
        .nav-links a:hover { border-color: #c9a080; color: #5a3d2b; }

        /* divider line */
        .divider {
          width: calc(100% - 80px); max-width: 820px; height: 0.5px;
          background: linear-gradient(90deg, transparent 0%, #d4b08a 25%, #e8c5b0 60%, transparent 100%);
          margin: 16px 40px 0;
          position: relative; z-index: 10;
        }

        /* HERO */
        .hero {
          position: relative; z-index: 10;
          display: flex; flex-direction: column; align-items: center;
          padding: 44px 40px 0;
          text-align: center;
        }
        .issue-badge {
          display: inline-block;
          font-size: 10px; letter-spacing: 0.32em; color: #b8917a;
          border: 0.5px solid #d4b08a; border-radius: 2px;
          padding: 5px 18px; margin-bottom: 24px;
          background: rgba(255,255,255,0.55);
          font-weight: 300;
          animation: fadeUp 0.6s ease both;
        }
        .hero-title {
          font-size: 52px; font-weight: 600; color: #1e1208;
          letter-spacing: 0.18em; line-height: 1;
          margin-bottom: 8px;
          animation: fadeUp 0.7s ease 0.1s both;
        }
        .hero-subtitle-en {
          font-size: 12px; letter-spacing: 0.45em; color: #b8917a;
          font-weight: 300; text-transform: uppercase;
          margin-bottom: 24px;
          animation: fadeUp 0.7s ease 0.15s both;
        }
        .hero-desc {
          font-size: 13px; color: #7a5a44; line-height: 2.0;
          letter-spacing: 0.08em; font-weight: 300;
          max-width: 360px; margin-bottom: 40px;
          animation: fadeUp 0.7s ease 0.2s both;
        }

        /* UPLOAD CARD */
        .upload-card {
          width: 300px;
          background: rgba(255,255,255,0.75);
          border: 0.5px solid #d4b08a;
          border-radius: 4px;
          padding: 32px 28px 28px;
          display: flex; flex-direction: column;
          align-items: center; gap: 14px;
          cursor: pointer;
          transition: background 0.25s, border-color 0.25s, transform 0.2s;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          animation: fadeUp 0.8s ease 0.25s both;
          position: relative;
        }
        .upload-card:hover {
          background: rgba(255,255,255,0.92);
          border-color: #c0906a;
          transform: translateY(-2px);
        }
        .upload-card.dragging {
          background: rgba(255,240,235,0.92);
          border-color: #c9806a;
          border-style: dashed;
        }
        .upload-icon-ring {
          width: 60px; height: 60px; border-radius: 50%;
          background: linear-gradient(135deg, #fce8ec, #f5d8e8);
          display: flex; align-items: center; justify-content: center;
          border: 0.5px solid #e8b8c4;
          transition: transform 0.2s;
        }
        .upload-card:hover .upload-icon-ring { transform: scale(1.05); }
        .upload-icon-ring svg {
          width: 24px; height: 24px; stroke: #c97890; fill: none;
          stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round;
        }
        .upload-main { font-size: 14px; color: #2d1f14; font-weight: 400; letter-spacing: 0.1em; }
        .upload-sub { font-size: 11px; color: #9e7e6a; font-weight: 300; letter-spacing: 0.08em; }
        .upload-cta {
          font-size: 10px; letter-spacing: 0.24em; color: #b8917a;
          border: 0.5px dashed #d4b08a; padding: 4px 14px;
          border-radius: 2px; transition: background 0.2s, color 0.2s;
        }
        .upload-card:hover .upload-cta { background: rgba(212,176,138,0.15); color: #8a6040; }

        /* FEATURES */
        .features {
          position: relative; z-index: 10;
          width: calc(100% - 80px); max-width: 820px;
          display: grid; grid-template-columns: repeat(4, 1fr);
          border: 0.5px solid #d4b08a; border-radius: 2px;
          overflow: hidden;
          margin: 44px 40px 0;
          background: rgba(255,255,255,0.45);
          backdrop-filter: blur(4px);
          animation: fadeUp 0.9s ease 0.3s both;
        }
        .feat {
          padding: 20px 16px;
          display: flex; flex-direction: column;
          align-items: center; gap: 8px;
          border-right: 0.5px solid #e8d0c0;
          transition: background 0.2s;
        }
        .feat:last-child { border-right: none; }
        .feat:hover { background: rgba(255,255,255,0.7); }
        .feat-icon {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .feat-icon svg {
          width: 18px; height: 18px; stroke: #c97890; fill: none;
          stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round;
        }
        .feat-label { font-size: 12px; color: #3a2518; letter-spacing: 0.1em; font-weight: 400; }
        .feat-sub { font-size: 10px; color: #9e7e6a; font-weight: 300; letter-spacing: 0.06em; }

        /* MARQUEE BAND */
        .band {
          position: relative; z-index: 10;
          width: 100%; margin: 36px 0 0;
          padding: 14px 0;
          background: rgba(212, 176, 138, 0.10);
          border-top: 0.5px solid #d4b08a;
          border-bottom: 0.5px solid #d4b08a;
          overflow: hidden;
          animation: fadeUp 0.9s ease 0.35s both;
        }
        .band-inner {
          display: flex; gap: 40px;
          white-space: nowrap;
          animation: marquee 18s linear infinite;
        }
        .band-item {
          font-size: 11px; letter-spacing: 0.22em; color: #9e7e6a;
          font-weight: 300; display: flex; align-items: center; gap: 16px;
          flex-shrink: 0;
        }
        .band-dot { width: 3px; height: 3px; border-radius: 50%; background: #c9a080; flex-shrink: 0; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* SAMPLE CARDS */
        .samples {
          position: relative; z-index: 10;
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
          padding: 28px 40px 0;
          width: 100%; max-width: 900px; box-sizing: border-box;
          animation: fadeUp 1s ease 0.4s both;
        }
        .sample-card {
          background: rgba(255,255,255,0.58);
          border: 0.5px solid #d4b08a; border-radius: 2px;
          overflow: hidden;
          transition: transform 0.25s, box-shadow 0.25s;
          cursor: default;
        }
        .sample-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(180,130,100,0.12);
        }
        .sample-img {
          height: 100px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; color: rgba(200,160,140,0.6);
        }
        .sample-body { padding: 10px 14px 14px; border-top: 0.5px solid #e8d0c0; }
        .sample-title { font-size: 12px; color: #3a2518; letter-spacing: 0.1em; font-weight: 400; }
        .sample-desc { font-size: 10px; color: #9e7e6a; font-weight: 300; letter-spacing: 0.06em; margin-top: 3px; }
        .sample-tag {
          display: inline-block; margin-top: 8px;
          font-size: 9px; letter-spacing: 0.18em; color: #b8917a;
          border: 0.5px solid #d4b08a; padding: 2px 8px; border-radius: 2px;
        }

        /* FOOTER */
        .footer {
          position: relative; z-index: 10;
          width: 100%; margin-top: 36px;
          padding: 16px 40px 28px;
          border-top: 0.5px solid #e8d0c0;
          display: flex; justify-content: space-between; align-items: center;
        }
        .footer-left { font-size: 10px; letter-spacing: 0.22em; color: #b8917a; font-weight: 300; }
        .footer-right { font-size: 10px; letter-spacing: 0.16em; color: #c4a080; font-weight: 300; }

        /* LOADING OVERLAY */
        .loading-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(253, 248, 244, 0.96);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 24px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .loading-spinner {
          width: 44px; height: 44px;
          border: 1px solid #e8d0c0;
          border-top-color: #c9806a;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .loading-title {
          font-size: 20px; font-weight: 600; letter-spacing: 0.18em; color: #2d1f14;
        }
        .loading-sub {
          font-size: 13px; letter-spacing: 0.12em; color: #9e7e6a;
          font-weight: 300; transition: opacity 0.4s;
        }
        .loading-progress {
          display: flex; gap: 8px;
        }
        .progress-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #e8d0c0;
          animation: pulse 1.4s ease-in-out infinite;
        }
        .progress-dot:nth-child(2) { animation-delay: 0.2s; }
        .progress-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { background: #e8d0c0; transform: scale(1); }
          50% { background: #c9806a; transform: scale(1.4); }
        }

        @media (max-width: 640px) {
          .nav { padding: 20px 24px 0; }
          .divider { width: calc(100% - 48px); margin: 14px 24px 0; }
          .hero { padding: 36px 24px 0; }
          .hero-title { font-size: 40px; }
          .features { grid-template-columns: repeat(2, 1fr); margin: 36px 24px 0; width: calc(100% - 48px); }
          .feat { border-bottom: 0.5px solid #e8d0c0; }
          .samples { grid-template-columns: 1fr; padding: 24px 24px 0; }
          .footer { padding: 16px 24px 24px; }
        }
      `}</style>

      <div className="page">
        <div className="deco-l" />
        <div className="deco-r" />
        <div className="deco-sm" />
        <div className="paper-grid" />

        {/* NAV */}
        <nav className="nav">
          <span className="nav-logo">Mirror Me</span>
          <div className="nav-links">
            <a href="#">关于</a>
            <a href="#">示例</a>
            <a href="#" onClick={(e) => { e.preventDefault(); fileInputRef.current?.click() }}>开始诊断</a>
          </div>
        </nav>
        <div className="divider" />

        {/* HERO */}
        <section className="hero">
          <div className="issue-badge">VOL.01 · AI 形象诊断</div>
          <h1 className="hero-title">镜 我</h1>
          <div className="hero-subtitle-en">Mirror Me · Style Archive</div>
          <p className="hero-desc">
            上传一张素颜照<br />
            AI 分析五官轮廓，生成专属风格档案<br />
            发型推荐 · 妆容配色 · 虚拟试妆
          </p>

          {/* UPLOAD */}
          <label
            className={`upload-card${isDragging ? ' dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="upload-icon-ring">
              <svg viewBox="0 0 24 24">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div className="upload-main">上传你的照片</div>
            <div className="upload-sub">支持 JPG / PNG · 点击或拖入</div>
            <div className="upload-cta">开始五官诊断 →</div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
          </label>
        </section>

        {/* FEATURES */}
        <div className="features">
          {[
            { icon: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>, label: '五官分析', sub: '脸型 · 气质识别' },
            { icon: <><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></>, label: '发型推荐', sub: 'AI 生成效果图' },
            { icon: <><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></>, label: '妆容配色', sub: '专属色卡生成' },
            { icon: <><path d="M15 12c0 1.654-1.346 3-3 3s-3-1.346-3-3 1.346-3 3-3 3 1.346 3 3z"/><path d="M12.001 3.682c-3.306-.145-6.064 1.647-7.431 4.388a8.892 8.892 0 0 0-.569 6.227C5.047 17.386 7.545 19.593 10.5 19.933c.5.057 1.002.067 1.5.067 3.418 0 6.532-1.897 8.08-4.903a9.097 9.097 0 0 0 .42-7.218C19.104 5.11 16.44 3.246 13.5 3.03"/></>, label: '虚拟试妆', sub: 'AI 上脸预览' },
          ].map((f, i) => (
            <div key={i} className="feat">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24">{f.icon}</svg>
              </div>
              <div className="feat-label">{f.label}</div>
              <div className="feat-sub">{f.sub}</div>
            </div>
          ))}
        </div>

        {/* BAND */}
        <div className="band">
          <div className="band-inner">
            {[...Array(2)].map((_, ri) => (
              ['清冷少女系', '甜系公主风', '复古优雅型', '自然清透感', '知性大人系', '气质御姐风'].map((t, i) => (
                <div key={`${ri}-${i}`} className="band-item">
                  {t}
                  <div className="band-dot" />
                </div>
              ))
            ))}
          </div>
        </div>

        {/* SAMPLES */}
        <div className="samples">
          {[
            { bg: 'linear-gradient(135deg, #f5d0d8 0%, #ecddc8 50%, #f0d4e0 100%)', title: '清冷少女', desc: '中长微卷 · 豆沙唇色', tag: '最受欢迎' },
            { bg: 'linear-gradient(135deg, #f0d4e0 0%, #f8e8d8 60%, #f5d0d8 100%)', title: '甜系公主', desc: '空气刘海 · 裸粉唇色', tag: '日系精选' },
            { bg: 'linear-gradient(135deg, #e8d8c0 0%, #f0e0c8 50%, #e0d0b8 100%)', title: '复古优雅', desc: '侧分长发 · 复古红唇', tag: '时尚推荐' },
          ].map((s, i) => (
            <div key={i} className="sample-card">
              <div className="sample-img" style={{ background: s.bg }}>✦</div>
              <div className="sample-body">
                <div className="sample-title">{s.title}</div>
                <div className="sample-desc">{s.desc}</div>
                <div className="sample-tag">{s.tag}</div>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-left">MIRROR ME · AI 形象顾问</div>
          <div className="footer-right">© 2026 · mirror-me.top</div>
        </footer>
      </div>

      {/* LOADING */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-title">镜 我</div>
          <div className="loading-spinner" />
          <div className="loading-sub">{loadingText}</div>
          <div className="loading-progress">
            <div className="progress-dot" />
            <div className="progress-dot" />
            <div className="progress-dot" />
          </div>
        </div>
      )}
    </>
  )
}

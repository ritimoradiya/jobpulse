import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const companies = [
  { n: 'Google', c: '#4285f4' }, { n: 'Netflix', c: '#e50914' },
  { n: 'Airbnb', c: '#ff385c' }, { n: 'Nvidia', c: '#76b900' },
  { n: 'Salesforce', c: '#00a1e0' }, { n: 'Adobe', c: '#ff0000' },
  { n: 'Fidelity', c: '#4caf50' }, { n: 'Athena Health', c: '#6366f1' },
]

const words = ['Google', 'Netflix', 'Airbnb', 'Nvidia', 'Salesforce', 'Adobe']

export default function LandingPage() {
  const navigate = useNavigate()
  const twRef = useRef<HTMLSpanElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)

  // Typewriter
  useEffect(() => {
    let wi = 0, ci = 0, del = false
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      const w = words[wi]
      if (!del) {
        if (twRef.current) twRef.current.textContent = w.slice(0, ci + 1)
        ci++
        if (ci === w.length) { del = true; timer = setTimeout(tick, 1800); return }
      } else {
        if (twRef.current) twRef.current.textContent = w.slice(0, ci - 1)
        ci--
        if (ci === 0) { del = false; wi = (wi + 1) % words.length }
      }
      timer = setTimeout(tick, del ? 50 : 90)
    }
    tick()
    return () => clearTimeout(timer)
  }, [])

  // Marquee
  useEffect(() => {
    const el = marqueeRef.current
    if (!el) return
    ;[...companies, ...companies].forEach(c => {
      const d = document.createElement('div')
      d.className = 'chip'
      d.innerHTML = `<span class="cdot" style="background:${c.c}"></span>${c.n}`
      el.appendChild(d)
    })
  }, [])

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) setTimeout(() => e.target.classList.add('vis'), i * 80)
      })
    }, { threshold: 0.1 })
    document.querySelectorAll('.fcard, .step, .reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .lp *{box-sizing:border-box;margin:0;padding:0}
        .lp{font-family:'Inter',sans-serif;background:#03030a;color:#fff;overflow-x:hidden}

        /* NAV */
        .lp-nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 52px;height:60px;background:rgba(3,3,10,0.75);border-bottom:1px solid rgba(255,255,255,0.05);backdrop-filter:blur(20px)}
        .lp-logo{font-size:16px;font-weight:900;background:linear-gradient(135deg,#818cf8,#c084fc,#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .lp-nav-r{display:flex;align-items:center;gap:28px}
        .lp-nl{font-size:13px;color:#334155;text-decoration:none;transition:color .2s;cursor:pointer}.lp-nl:hover{color:#94a3b8}
        .lp-ncta{padding:8px 20px;border-radius:8px;font-size:13px;font-weight:600;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border:none;cursor:pointer;box-shadow:0 0 18px rgba(99,102,241,0.3);transition:all .2s}.lp-ncta:hover{transform:translateY(-1px)}

        /* HERO */
        .lp-hero{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;padding-top:60px}
        .lp-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 50% 55%,rgba(99,102,241,0.1),transparent 70%);pointer-events:none}
        .lp-headline{text-align:center;position:relative;z-index:10;margin-bottom:28px}
        .lp-badge{display:inline-flex;align-items:center;gap:7px;padding:5px 13px;border-radius:99px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);font-size:11px;font-weight:600;color:#818cf8;margin-bottom:18px}
        .lp-ldot{width:6px;height:6px;border-radius:50%;background:#4ade80;animation:lp-lp 1.8s infinite;flex-shrink:0}
        @keyframes lp-lp{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(74,222,128,.5)}60%{box-shadow:0 0 0 5px rgba(74,222,128,0)}}
        .lp-h1{font-size:clamp(28px,3.8vw,52px);font-weight:900;letter-spacing:-2px;line-height:1.0}
        .lp-gr{background:linear-gradient(135deg,#818cf8,#c084fc,#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .lp-tw{background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .lp-cur{display:inline-block;width:3px;height:.8em;background:#818cf8;margin-left:2px;vertical-align:middle;animation:lp-bc .75s step-end infinite}
        @keyframes lp-bc{0%,100%{opacity:1}50%{opacity:0}}
        .lp-cta-row{display:flex;gap:12px;justify-content:center;position:relative;z-index:10;margin-bottom:36px}
        .lp-bp{padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border:none;cursor:pointer;box-shadow:0 0 26px rgba(99,102,241,0.4);transition:all .2s}.lp-bp:hover{transform:translateY(-2px);box-shadow:0 0 44px rgba(99,102,241,0.65)}
        .lp-bs{padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600;background:transparent;border:1px solid rgba(255,255,255,0.08);color:#475569;cursor:pointer;transition:all .2s}.lp-bs:hover{border-color:rgba(255,255,255,0.15);color:#94a3b8}

        /* RADAR */
        .lp-radar-wrap{width:min(460px,80vw);height:min(460px,80vw);position:relative;z-index:5}
        .lp-radar-wrap svg{width:100%;height:100%;overflow:visible}

        /* SCROLL HINT */
        .lp-scroll-hint{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:5px;z-index:10;animation:lp-fi 1s ease 2s both}
        @keyframes lp-fi{from{opacity:0}to{opacity:1}}
        .lp-scroll-hint span{font-size:9px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:2px}
        .lp-mouse{width:20px;height:30px;border:1.5px solid rgba(99,102,241,0.3);border-radius:10px;display:flex;justify-content:center;padding-top:5px}
        .lp-wheel{width:2px;height:5px;background:#818cf8;border-radius:2px;animation:lp-ws 1.8s ease-in-out infinite}
        @keyframes lp-ws{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(8px)}}

        /* MARQUEE */
        .lp-mstrip{border-top:1px solid rgba(255,255,255,0.04);padding:13px 0;overflow:hidden;background:rgba(3,3,10,0.5)}
        .lp-mlabel{text-align:center;font-size:9px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px}
        .lp-mtrack{display:flex;gap:12px;animation:lp-ms 22s linear infinite;width:max-content}
        @keyframes lp-ms{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .chip{display:flex;align-items:center;gap:6px;padding:5px 14px;border-radius:7px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);font-size:11px;font-weight:600;color:#334155;white-space:nowrap}
        .cdot{width:5px;height:5px;border-radius:50%;flex-shrink:0}

        /* FEATURES */
        .lp-features{padding:100px 56px;max-width:1100px;margin:0 auto}
        .lp-sec-eye{text-align:center;font-size:10px;font-weight:700;color:#334155;text-transform:uppercase;letter-spacing:2.5px;margin-bottom:12px}
        .lp-sec-h{text-align:center;font-size:clamp(28px,3.5vw,42px);font-weight:800;letter-spacing:-1.5px;line-height:1.1;margin-bottom:52px}
        .lp-fgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        .fcard{padding:26px;border-radius:14px;background:rgba(255,255,255,0.015);border:1px solid rgba(255,255,255,0.05);transition:all .3s;opacity:0;transform:translateY(20px)}
        .fcard.vis{opacity:1;transform:none}
        .fcard:hover{background:rgba(99,102,241,0.04);border-color:rgba(99,102,241,0.15);transform:translateY(-4px)}
        .lp-ficon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:14px}
        .lp-ft{font-size:13px;font-weight:700;color:#e2e8f0;margin-bottom:5px}
        .lp-fd{font-size:12px;color:#334155;line-height:1.6}

        /* HOW */
        .lp-how{padding:80px 56px;max-width:660px;margin:0 auto}
        .lp-steps{position:relative}
        .lp-steps::before{content:'';position:absolute;left:18px;top:20px;bottom:20px;width:1px;background:linear-gradient(to bottom,rgba(99,102,241,0.5),rgba(124,58,237,0.15),transparent)}
        .step{display:flex;gap:18px;padding:16px 0;opacity:0;transform:translateX(-12px);transition:all .5s}
        .step.vis{opacity:1;transform:none}
        .lp-snum{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#4f46e5,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;flex-shrink:0;z-index:1;box-shadow:0 0 14px rgba(99,102,241,0.35)}
        .lp-sc{padding-top:8px}.lp-st{font-size:13px;font-weight:700;color:#e2e8f0;margin-bottom:2px}.lp-sd{font-size:12px;color:#334155;line-height:1.6}

        /* CTA */
        .lp-cta{padding:80px 48px 120px;text-align:center}
        .lp-cta-box{max-width:520px;margin:0 auto;padding:50px 44px;border-radius:20px;background:rgba(99,102,241,0.04);border:1px solid rgba(99,102,241,0.1);position:relative;overflow:hidden}
        .lp-cta-box::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(99,102,241,0.08),transparent 55%);pointer-events:none}
        .lp-ct{font-size:clamp(24px,3vw,34px);font-weight:800;letter-spacing:-1.5px;margin-bottom:8px}
        .lp-cs{font-size:14px;color:#334155;margin-bottom:26px}

        .lp-footer{text-align:center;padding:22px;border-top:1px solid rgba(255,255,255,0.04);font-size:12px;color:#1e3a5f}

        .reveal{opacity:0;transform:translateY(20px);transition:opacity .7s,transform .7s}
        .reveal.vis{opacity:1;transform:none}

        @media(max-width:768px){.lp-nav{padding:0 20px}.lp-features,.lp-how{padding:80px 24px}.lp-fgrid{grid-template-columns:1fr 1fr}}
      `}</style>

      <div className="lp">
        {/* NAV */}
        <nav className="lp-nav">
          <div className="lp-logo">JobPulse ⚡</div>
          <div className="lp-nav-r">
            <a href="#features" className="lp-nl">Features</a>
            <a href="#how" className="lp-nl">How it works</a>
            <button className="lp-ncta" onClick={() => navigate('/login')}>Sign In</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="lp-hero">
          <div className="lp-headline">
            <div className="lp-badge"><span className="lp-ldot"></span>Scraping live right now</div>
            <h1 className="lp-h1">
              Find jobs at <span ref={twRef} className="lp-tw"></span><span className="lp-cur"></span>
            </h1>
          </div>

          <div className="lp-cta-row">
            <button className="lp-bp" onClick={() => navigate('/register')}>Get Started Free →</button>
          </div>

          {/* RADAR SVG */}
          <div className="lp-radar-wrap">
            <svg viewBox="-10 -10 620 620" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="lp-bggrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity=".1"/>
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0"/>
                </radialGradient>
                <filter id="lp-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="lp-softglow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <path id="lp-pg"  d="M300,75  L300,265"/>
                <path id="lp-pn"  d="M487,188 L323,278"/>
                <path id="lp-pa"  d="M487,413 L323,322"/>
                <path id="lp-pnv" d="M300,525 L300,335"/>
                <path id="lp-ps"  d="M113,413 L277,322"/>
                <path id="lp-pad" d="M113,188 L277,278"/>
              </defs>

              <circle cx="300" cy="300" r="260" fill="url(#lp-bggrad)"/>
              <circle cx="300" cy="300" r="80"  fill="none" stroke="rgba(99,102,241,0.1)"  strokeWidth="1"/>
              <circle cx="300" cy="300" r="145" fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth="1" strokeDasharray="3 5"/>
              <circle cx="300" cy="300" r="215" fill="none" stroke="rgba(99,102,241,0.06)" strokeWidth="1" strokeDasharray="3 7"/>
              <circle cx="300" cy="300" r="255" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>

              {/* Pulse rings */}
              {[0,1,2].map(i => (
                <circle key={i} cx="300" cy="300" fill="none" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5">
                  <animate attributeName="r" values="55;260" dur="3s" repeatCount="indefinite" begin={`${i}s`}/>
                  <animate attributeName="opacity" values=".5;0" dur="3s" repeatCount="indefinite" begin={`${i}s`}/>
                </circle>
              ))}

              {/* Radar sweep */}
              <line x1="300" y1="300" x2="300" y2="55" stroke="rgba(129,140,248,0.5)" strokeWidth="1.5" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 300 300" to="360 300 300" dur="5s" repeatCount="indefinite"/>
              </line>
              <path d="M300,55 A245,245 0 0,1 517,178" fill="none" stroke="rgba(129,140,248,0.06)" strokeWidth="50">
                <animateTransform attributeName="transform" type="rotate" from="0 300 300" to="360 300 300" dur="5s" repeatCount="indefinite"/>
              </path>

              {/* Google */}
              <g filter="url(#lp-glow)">
                <circle cx="300" cy="75" r="26" fill="rgba(66,133,244,0.07)" stroke="#4285f4" strokeWidth="1.2"/>
                <circle cx="300" cy="75" r="7" fill="#4285f4"/>
                <text x="300" y="115" fontSize="10" fontWeight="700" fill="#4285f4" textAnchor="middle" fontFamily="Inter,sans-serif" opacity=".8">GOOGLE</text>
              </g>
              {/* Netflix */}
              <g filter="url(#lp-glow)">
                <circle cx="487" cy="188" r="26" fill="rgba(229,9,20,0.07)" stroke="#e50914" strokeWidth="1.2"/>
                <circle cx="487" cy="188" r="7" fill="#e50914"/>
                <text x="519" y="222" fontSize="10" fontWeight="700" fill="#e50914" textAnchor="middle" fontFamily="Inter,sans-serif" opacity=".8">NETFLIX</text>
              </g>
              {/* Airbnb */}
              <g filter="url(#lp-glow)">
                <circle cx="487" cy="413" r="26" fill="rgba(255,56,92,0.07)" stroke="#ff385c" strokeWidth="1.2"/>
                <circle cx="487" cy="413" r="7" fill="#ff385c"/>
                <text x="519" y="447" fontSize="10" fontWeight="700" fill="#ff385c" textAnchor="middle" fontFamily="Inter,sans-serif" opacity=".8">AIRBNB</text>
              </g>
              {/* Nvidia */}
              <g filter="url(#lp-glow)">
                <circle cx="300" cy="525" r="26" fill="rgba(118,185,0,0.07)" stroke="#76b900" strokeWidth="1.2"/>
                <circle cx="300" cy="525" r="7" fill="#76b900"/>
                <text x="300" y="562" fontSize="10" fontWeight="700" fill="#76b900" textAnchor="middle" fontFamily="Inter,sans-serif" opacity=".8">NVIDIA</text>
              </g>
              {/* Salesforce */}
              <g filter="url(#lp-glow)">
                <circle cx="113" cy="413" r="26" fill="rgba(0,161,224,0.07)" stroke="#00a1e0" strokeWidth="1.2"/>
                <circle cx="113" cy="413" r="7" fill="#00a1e0"/>
                <text x="75" y="447" fontSize="10" fontWeight="700" fill="#00a1e0" textAnchor="middle" fontFamily="Inter,sans-serif" opacity=".8">SALESFORCE</text>
              </g>
              {/* Adobe */}
              <g filter="url(#lp-glow)">
                <circle cx="113" cy="188" r="26" fill="rgba(255,0,0,0.07)" stroke="#ff4444" strokeWidth="1.2"/>
                <circle cx="113" cy="188" r="7" fill="#ff4444"/>
                <text x="75" y="222" fontSize="10" fontWeight="700" fill="#ff4444" textAnchor="middle" fontFamily="Inter,sans-serif" opacity=".8">ADOBE</text>
              </g>

              {/* Lines */}
              <line x1="300" y1="75"  x2="300" y2="265" stroke="rgba(66,133,244,0.15)"  strokeWidth="1"/>
              <line x1="487" y1="188" x2="323" y2="278" stroke="rgba(229,9,20,0.15)"   strokeWidth="1"/>
              <line x1="487" y1="413" x2="323" y2="322" stroke="rgba(255,56,92,0.15)"  strokeWidth="1"/>
              <line x1="300" y1="525" x2="300" y2="335" stroke="rgba(118,185,0,0.15)"  strokeWidth="1"/>
              <line x1="113" y1="413" x2="277" y2="322" stroke="rgba(0,161,224,0.15)"  strokeWidth="1"/>
              <line x1="113" y1="188" x2="277" y2="278" stroke="rgba(255,68,68,0.15)"  strokeWidth="1"/>

              {/* Packets */}
              {[
                { fill:'#4285f4', href:'#lp-pg',  dur:'2.4s', begin:'0s'   },
                { fill:'#e50914', href:'#lp-pn',  dur:'2.7s', begin:'.5s'  },
                { fill:'#ff385c', href:'#lp-pa',  dur:'2.9s', begin:'1s'   },
                { fill:'#76b900', href:'#lp-pnv', dur:'2.6s', begin:'1.5s' },
                { fill:'#00a1e0', href:'#lp-ps',  dur:'3s',   begin:'2s'   },
                { fill:'#ff4444', href:'#lp-pad', dur:'2.5s', begin:'.8s'  },
              ].map((p, i) => (
                <circle key={i} r="3.5" fill={p.fill} filter="url(#lp-glow)">
                  <animateMotion dur={p.dur} repeatCount="indefinite" begin={p.begin}>
                    <mpath href={p.href}/>
                  </animateMotion>
                </circle>
              ))}

              {/* Center */}
              <circle cx="300" cy="300" r="52" fill="rgba(99,102,241,0.1)" filter="url(#lp-softglow)"/>
              <circle cx="300" cy="300" r="52" fill="none" stroke="rgba(129,140,248,0.35)" strokeWidth="1.5"/>
              <circle cx="300" cy="300" r="42" fill="none" stroke="rgba(129,140,248,0.12)" strokeWidth="1"/>
              <text x="300" y="295" fontSize="11" fontWeight="800" fill="#818cf8" textAnchor="middle" dominantBaseline="middle" fontFamily="Inter,sans-serif" letterSpacing="1">JOB</text>
              <text x="300" y="310" fontSize="11" fontWeight="800" fill="#818cf8" textAnchor="middle" dominantBaseline="middle" fontFamily="Inter,sans-serif" letterSpacing="1">PULSE</text>
            </svg>
          </div>


        </section>

        {/* MARQUEE */}
        <div className="lp-mstrip">
          <div className="lp-mlabel">Monitoring career portals at</div>
          <div style={{overflow:'hidden'}}><div className="lp-mtrack" ref={marqueeRef}></div></div>
        </div>

        {/* FEATURES */}
        <section className="lp-features" id="features">
          <div className="lp-sec-eye reveal">Why JobPulse</div>
          <h2 className="lp-sec-h reveal">Built to get you hired <span className="lp-gr">faster</span></h2>
          <div className="lp-fgrid">
            {[
              { color:'#818cf8', bg:'rgba(99,102,241,0.1)', icon:<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>, title:'Real-Time Scraping', desc:'Every 10 minutes.' },
              { color:'#c084fc', bg:'rgba(192,132,252,0.1)', icon:<><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></>, title:'AI Resume Matcher', desc:'Claude-powered ATS scoring' },
              { color:'#60a5fa', bg:'rgba(96,165,250,0.1)', icon:<><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>, title:'Smart Email Alerts', desc:'Instant notifications the moment a matching role is posted.' },
              { color:'#4ade80', bg:'rgba(74,222,128,0.1)', icon:<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>, title:'Analytics Dashboard', desc:'Hiring trends, company breakdowns, and activity tracking.' },
              { color:'#fbbf24', bg:'rgba(251,191,36,0.1)', icon:<polyline points="20 6 9 17 4 12"/>, title:'Application Tracker', desc:'Mark, track, and analyze every role you\'ve applied to.' },
              { color:'#f87171', bg:'rgba(239,68,68,0.1)', icon:<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>, title:'Secure Auth', desc:'Your data stays private and encrypted.' },
            ].map((f, i) => (
              <div key={i} className="fcard">
                <div className="lp-ficon" style={{background:f.bg}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="2">{f.icon}</svg>
                </div>
                <div className="lp-ft">{f.title}</div>
                <div className="lp-fd">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW */}
        <section className="lp-how" id="how">
          <div className="lp-sec-eye reveal" style={{textAlign:'center'}}>Process</div>
          <h2 className="lp-sec-h reveal">How it <span className="lp-gr">works</span></h2>
          <div className="lp-steps">
            {[
              { t:'Set your targets',      d:'Choose companies, keywords, upload your resume.' },
              { t:'We scrape 24/7',        d:'JobPulse monitors company portals every 10 minutes.' },
              { t:'Get alerted instantly', d:'Email push the moment a match is found.' },
              { t:'Apply first',           d:'Apply Earlier' },
            ].map((s, i) => (
              <div key={i} className="step">
                <div className="lp-snum">{i+1}</div>
                <div className="lp-sc"><div className="lp-st">{s.t}</div><div className="lp-sd">{s.d}</div></div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="lp-cta">
          <div className="lp-cta-box reveal">
            <div className="lp-ct">Apply <span className="lp-gr">earlier.</span> Get hired faster.</div>
            <p className="lp-cs">Apply in the first hour when it matters most.</p>
            <button className="lp-bp" onClick={() => navigate('/register')}>Create Free Account →</button>
          </div>
        </section>

        <footer className="lp-footer">© 2026 JobPulse ⚡ · Built by Riti Moradiya</footer>
      </div>
    </>
  )
}
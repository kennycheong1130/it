/* ============================================================
   Python 勇者大冒險 — 精美 SVG 角色與魔王圖
   （以向量圖取代 emoji，色彩漸層 + 陰影，適合小學生）
   ============================================================ */
'use strict';

const GROUND = '<ellipse cx="60" cy="110" rx="34" ry="6" fill="rgba(0,0,0,.18)"/>';

/* -------------------- 四種職業勇者 -------------------- */
const CLASS_SVG = {
  /* 🛡️ 鐵壁騎士 */
  knight: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    ${GROUND}
    <defs><linearGradient id="kn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd9ff"/><stop offset="1" stop-color="#3a6fd8"/></linearGradient></defs>
    <ellipse cx="60" cy="74" rx="30" ry="32" fill="url(#kn)" stroke="#2a4fa0" stroke-width="3"/>
    <path d="M42 44 Q60 18 78 44 L78 58 Q60 72 42 58 Z" fill="#dcebff" stroke="#2a4fa0" stroke-width="3"/>
    <rect x="48" y="46" width="24" height="9" rx="4" fill="#16357a"/>
    <circle cx="53" cy="66" r="4.5" fill="#10224d"/><circle cx="67" cy="66" r="4.5" fill="#10224d"/>
    <path d="M88 56 l9 -12 l4 2 l-7 14 Z" fill="#cdd6e6" stroke="#7a8aa8" stroke-width="2"/>
    <rect x="90" y="44" width="6" height="38" rx="3" fill="#e8eef7" stroke="#7a8aa8" stroke-width="2"/>
    <path d="M28 64 q-10 4 -6 18 q6 4 10 -6 Z" fill="#ffd93d" stroke="#b8860b" stroke-width="2"/>
  </svg>`,

  /* ⚔️ 狂戰勇士 */
  warrior: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    ${GROUND}
    <defs><linearGradient id="wr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a8a"/><stop offset="1" stop-color="#c0341f"/></linearGradient></defs>
    <ellipse cx="60" cy="76" rx="30" ry="30" fill="url(#wr)" stroke="#7a1d10" stroke-width="3"/>
    <path d="M40 46 Q60 22 80 46 L80 60 Q60 74 40 60 Z" fill="#5a2a22" stroke="#7a1d10" stroke-width="3"/>
    <path d="M44 50 l16 6 M44 58 l16 -6" stroke="#ffd2c2" stroke-width="3" stroke-linecap="round"/>
    <circle cx="53" cy="66" r="4.5" fill="#fff"/><circle cx="67" cy="66" r="4.5" fill="#fff"/>
    <circle cx="53" cy="67" r="2" fill="#3a0f08"/><circle cx="67" cy="67" r="2" fill="#3a0f08"/>
    <path d="M84 30 l6 -22 l10 4 l-8 22 Z" fill="#d7dbe2" stroke="#8a8f9c" stroke-width="2"/>
    <rect x="88" y="26" width="7" height="40" rx="3" fill="#eef1f6" stroke="#8a8f9c" stroke-width="2"/>
    <rect x="82" y="22" width="22" height="12" rx="4" fill="#ffd93d" stroke="#b8860b" stroke-width="2"/>
  </svg>`,

  /* 🔥 炎爆法師 */
  mage: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    ${GROUND}
    <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc078"/><stop offset="1" stop-color="#e8590c"/></linearGradient></defs>
    <path d="M40 96 Q40 64 60 60 Q80 64 80 96 Z" fill="url(#mg)" stroke="#9c3d05" stroke-width="3"/>
    <circle cx="60" cy="48" r="18" fill="#ffe8cc" stroke="#9c3d05" stroke-width="3"/>
    <path d="M44 40 L60 10 L76 40 Z" fill="#e8590c" stroke="#9c3d05" stroke-width="3"/>
    <circle cx="60" cy="14" r="5" fill="#ffd93d"/>
    <circle cx="53" cy="50" r="4" fill="#5a230a"/><circle cx="67" cy="50" r="4" fill="#5a230a"/>
    <rect x="86" y="40" width="5" height="56" rx="2" fill="#8a5a2b"/>
    <path d="M88 40 q10 -14 0 -22 q-10 8 0 22Z" fill="#ff922b" stroke="#e8590c" stroke-width="2"/>
    <circle cx="88" cy="16" r="6" fill="#ffe066"/>
  </svg>`,

  /* 🌟 聖輝賢者 */
  sage: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    ${GROUND}
    <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9e5c0"/><stop offset="1" stop-color="#2b9e63"/></linearGradient></defs>
    <path d="M40 96 Q40 64 60 60 Q80 64 80 96 Z" fill="url(#sg)" stroke="#1c6b43" stroke-width="3"/>
    <circle cx="60" cy="48" r="18" fill="#e6fff0" stroke="#1c6b43" stroke-width="3"/>
    <path d="M44 40 L60 14 L76 40 Z" fill="#2b9e63" stroke="#1c6b43" stroke-width="3"/>
    <circle cx="60" cy="22" r="4" fill="#ffd93d"/>
    <circle cx="53" cy="50" r="4" fill="#0f5032"/><circle cx="67" cy="50" r="4" fill="#0f5032"/>
    <rect x="86" y="40" width="5" height="56" rx="2" fill="#3a7d5c"/>
    <circle cx="88" cy="34" r="11" fill="#d6f5e6" stroke="#2b9e63" stroke-width="2"/>
    <circle cx="88" cy="34" r="5" fill="#9be15d"/>
  </svg>`,
};

/* -------------------- 15 隻魔王（每階段 5 隻） -------------------- */
const BOSS_SVG = {
  1: [
    /* 史萊姆 */
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${GROUND}
      <path d="M22 90 Q16 50 60 48 Q104 50 98 90 Q98 100 60 100 Q22 100 22 90 Z" fill="#7ed957" stroke="#3f9e2e" stroke-width="3"/>
      <ellipse cx="60" cy="74" rx="22" ry="13" fill="#c7f5b0" opacity=".6"/>
      <circle cx="48" cy="70" r="7" fill="#fff" stroke="#3f9e2e" stroke-width="2"/><circle cx="72" cy="70" r="7" fill="#fff" stroke="#3f9e2e" stroke-width="2"/>
      <circle cx="48" cy="71" r="3" fill="#223"/><circle cx="72" cy="71" r="3" fill="#223"/>
      <path d="M52 84 Q60 90 68 84" stroke="#2c6b1f" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,
    /* 蝙蝠精 */
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${GROUND}
      <path d="M60 50 Q20 30 14 56 Q34 50 44 60 Q34 70 18 78 Q54 70 60 64 Q66 70 102 78 Q86 70 76 60 Q86 50 106 56 Q100 30 60 50 Z" fill="#8e7cc3" stroke="#5b4a91" stroke-width="3"/>
      <ellipse cx="60" cy="58" rx="18" ry="20" fill="#a692d8" stroke="#5b4a91" stroke-width="3"/>
      <path d="M50 42 l-6 -14 M70 42 l6 -14" stroke="#5b4a91" stroke-width="4" stroke-linecap="round"/>
      <circle cx="54" cy="56" r="5" fill="#fff"/><circle cx="66" cy="56" r="5" fill="#fff"/>
      <circle cx="54" cy="57" r="2.5" fill="#311"/><circle cx="66" cy="57" r="2.5" fill="#311"/>
      <path d="M56 66 l4 6 l4 -6 Z" fill="#fff"/>
    </svg>`,
    /* 蘑菇怪 */
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${GROUND}
      <path d="M30 60 Q60 18 90 60 Q60 74 30 60 Z" fill="#e7483b" stroke="#a3251b" stroke-width="3"/>
      <circle cx="46" cy="46" r="6" fill="#fff"/><circle cx="70" cy="42" r="5" fill="#fff"/><circle cx="60" cy="56" r="5" fill="#fff"/>
      <rect x="48" y="58" width="24" height="34" rx="10" fill="#f3e3c3" stroke="#c9a86a" stroke-width="3"/>
      <circle cx="54" cy="76" r="4" fill="#3a2a14"/><circle cx="66" cy="76" r="4" fill="#3a2a14"/>
      <path d="M52 84 Q60 90 68 84" stroke="#3a2a14" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M44 92 l-4 8 M76 92 l4 8" stroke="#c9a86a" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    /* 石龜獸 */
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${GROUND}
      <path d="M52 36 q8 -10 16 0" fill="#7bbf5a" stroke="#3f7a2a" stroke-width="3"/>
      <circle cx="56" cy="40" r="3" fill="#223"/><circle cx="68" cy="40" r="3" fill="#223"/>
      <path d="M26 70 Q26 46 60 46 Q94 46 94 70 Q94 92 60 92 Q26 92 26 70 Z" fill="#6fae4f" stroke="#3f7a2a" stroke-width="3"/>
      <path d="M40 56 h40 M32 70 h56 M40 84 h40 M60 46 v46" stroke="#3f7a2a" stroke-width="2" opacity=".6"/>
      <circle cx="40" cy="90" r="6" fill="#7bbf5a" stroke="#3f7a2a" stroke-width="3"/>
      <circle cx="80" cy="90" r="6" fill="#7bbf5a" stroke="#3f7a2a" stroke-width="3"/>
    </svg>`,
    /* 村莊守衛長 */
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${GROUND}
      <defs><linearGradient id="gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfd6e0"/><stop offset="1" stop-color="#8a93a3"/></linearGradient></defs>
      <ellipse cx="60" cy="84" rx="26" ry="30" fill="url(#gd)" stroke="#5a6275" stroke-width="3"/>
      <path d="M44 50 Q60 30 76 50 L76 62 Q60 74 44 62 Z" fill="#e9edf3" stroke="#5a6275" stroke-width="3"/>
      <rect x="50" y="52" width="20" height="8" rx="4" fill="#3a4254"/>
      <circle cx="54" cy="68" r="4" fill="#223"/><circle cx="66" cy="68" r="4" fill="#223"/>
      <path d="M30 70 q-8 6 -4 22 q6 2 8 -8 Z" fill="#ffd93d" stroke="#b8860b" stroke-width="2"/>
      <rect x="86" y="40" width="6" height="54" rx="3" fill="#e9edf3" stroke="#5a6275" stroke-width="2"/>
      <path d="M86 40 l16 6 l-16 8 Z" fill="#cfd6e0" stroke="#5a6275" stroke-width="2"/>
    </svg>`,
  ],
  2: [
    /* 洞窟蝙蝠王 */
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${GROUND}
      <path d="M60 48 Q14 24 8 54 Q32 48 44 60 Q32 72 14 82 Q56 72 60 66 Q64 72 106 82 Q88 72 76 60 Q88 48 112 54 Q106 24 60 48 Z" fill="#6a4fb0" stroke="#3f2d75" stroke-width="3"/>
      <ellipse cx="60" cy="58" rx="20" ry="22" fill="#8368cf" stroke="#3f2d75" stroke-width="3"/>
      <path d="M50 38 l-6 -14 M70 38 l6 -14" stroke="#3f2d75" stroke-width="4" stroke-linecap="round"/>
      <path d="M48 32 l12 4 l12 -4 l-4 8 l-8 2 l-8 -2 Z" fill="#ffd93d" stroke="#b8860b" stroke-width="2"/>
      <circle cx="53" cy="56" r="5" fill="#ffe14d"/><circle cx="67" cy="56" r="5" fill="#ffe14d"/>
      <circle cx="53" cy="57" r="2.5" fill="#311"/><circle cx="67" cy="57" r="2.5" fill="#311"/>
      <path d="M55 66 l5 7 l5 -7 Z" fill="#fff"/>
    </svg>`,
    /* 毒蛛 */
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${GROUND}
      <g stroke="#5b2d8a" stroke-width="4" stroke-linecap="round">
        <path d="M60 60 Q30 40 18 52 M60 60 Q90 40 102 52"/>
        <path d="M60 64 Q28 60 16 74 M60 64 Q92 60 104 74"/>
        <path d="M60 70 Q32 80 22 96 M60 70 Q88 80 98 96"/>
      </g>
      <ellipse cx="60" cy="64" rx="22" ry="20" fill="#9b59b6" stroke="#5b2d8a" stroke-width="3"/>
      <circle cx="52" cy="58" r="5" fill="#fff"/><circle cx="68" cy="58" r="5" fill="#fff"/>
      <circle cx="52" cy="59" r="2.5" fill="#311"/><circle cx="68" cy="59" r="2.5" fill="#311"/>
      <path d="M54 72 l3 6 l3 -6 M64 72 l3 6 l3 -6" stroke="#fff" stroke-width="3" fill="none"/>
    </svg>`,
    /* 骷髏兵 */
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${GROUND}
      <circle cx="60" cy="52" r="26" fill="#f2f2ee" stroke="#9a9a8c" stroke-width="3"/>
      <circle cx="50" cy="50" r="8" fill="#2b2b2b"/><circle cx="70" cy="50" r="8" fill="#2b2b2b"/>
      <path d="M52 66 l8 6 l8 -6" stroke="#9a9a8c" stroke-width="3" fill="none"/>
      <rect x="44" y="34" width="6" height="14" rx="3" fill="#cfcfc4" stroke="#9a9a8c" stroke-width="2" transform="rotate(-20 47 41)"/>
      <rect x="70" y="34" width="6" height="14" rx="3" fill="#cfcfc4" stroke="#9a9a8c" stroke-width="2" transform="rotate(20 73 41)"/>
      <path d="M40 84 l16 -10 l16 10 l-16 10 Z" fill="#f2f2ee" stroke="#9a9a8c" stroke-width="3"/>
    </svg>`,
    /* 石巨人 */
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${GROUND}
      <rect x="30" y="36" width="60" height="62" rx="12" fill="#9aa0a8" stroke="#5e646c" stroke-width="3"/>
      <rect x="40" y="46" width="40" height="26" rx="8" fill="#6f757d"/>
      <circle cx="52" cy="58" r="6" fill="#46e0ff"/><circle cx="68" cy="58" r="6" fill="#46e0ff"/>
      <path d="M50 80 h20" stroke="#5e646c" stroke-width="3" stroke-linecap="round"/>
      <path d="M44 36 l8 10 M76 36 l-8 10 M40 64 l-8 6 M80 64 l8 6" stroke="#5e646c" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    /* 洞窟魔眼 */
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${GROUND}
      <path d="M44 96 q-6 14 -16 10 M60 100 q-4 16 -14 14 M76 96 q6 14 16 10" stroke="#b06fd0" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="60" cy="58" r="30" fill="#fff" stroke="#8a4fb0" stroke-width="3"/>
      <circle cx="60" cy="58" r="14" fill="#b06fd0" stroke="#5b2d75" stroke-width="3"/>
      <circle cx="60" cy="58" r="6" fill="#311"/>
      <circle cx="54" cy="52" r="3" fill="#fff"/>
      <path d="M40 40 q20 -14 40 0 M40 76 q20 14 40 0" stroke="#5b2d75" stroke-width="3" fill="none"/>
    </svg>`,
  ],
  3: [
    /* 火龍兵 */
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${GROUND}
      <path d="M40 50 q-18 -6 -26 6 q14 4 22 12 Z" fill="#c0341f" stroke="#7a1d10" stroke-width="3"/>
      <path d="M80 50 q18 -6 26 6 q-14 4 -22 12 Z" fill="#c0341f" stroke="#7a1d10" stroke-width="3"/>
      <ellipse cx="60" cy="64" rx="30" ry="28" fill="#e8590c" stroke="#7a1d10" stroke-width="3"/>
      <path d="M46 40 l-6 -16 l10 6 Z M74 40 l6 -16 l-10 6 Z" fill="#ffd93d" stroke="#b8860b" stroke-width="2"/>
      <circle cx="50" cy="60" r="6" fill="#ffe066"/><circle cx="70" cy="60" r="6" fill="#ffe066"/>
      <circle cx="50" cy="61" r="3" fill="#311"/><circle cx="70" cy="61" r="3" fill="#311"/>
      <path d="M52 78 q8 8 16 0" stroke="#7a1d10" stroke-width="3" fill="none"/>
      <path d="M58 84 q2 10 4 0" fill="#fff"/>
    </svg>`,
    /* 冰巫妖 */
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${GROUND}
      <path d="M40 96 Q40 64 60 60 Q80 64 80 96 Z" fill="#7fd3e8" stroke="#2c7d96" stroke-width="3" opacity=".9"/>
      <circle cx="60" cy="48" r="18" fill="#d6f4fb" stroke="#2c7d96" stroke-width="3"/>
      <path d="M44 40 l6 -16 l8 6 l8 -6 l6 16 Z" fill="#46c8e8" stroke="#2c7d96" stroke-width="3"/>
      <circle cx="54" cy="48" r="4" fill="#0c4a5c"/><circle cx="66" cy="48" r="4" fill="#0c4a5c"/>
      <rect x="86" y="34" width="5" height="62" rx="2" fill="#3a8aa3"/>
      <path d="M88 34 q8 -12 -2 -18 q-2 10 2 18Z" fill="#bdeefb" stroke="#2c7d96" stroke-width="2"/>
      <circle cx="88" cy="14" r="6" fill="#fff"/>
    </svg>`,
    /* 暗影騎士 */
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${GROUND}
      <path d="M34 40 Q60 18 86 40 L86 100 L34 100 Z" fill="#3a2a5a" stroke="#1c1230" stroke-width="3"/>
      <ellipse cx="60" cy="56" rx="22" ry="24" fill="#4a3a6e" stroke="#1c1230" stroke-width="3"/>
      <path d="M44 44 Q60 28 76 44 L76 56 Q60 70 44 56 Z" fill="#241836" stroke="#1c1230" stroke-width="3"/>
      <circle cx="52" cy="56" r="5" fill="#b06bff"/><circle cx="68" cy="56" r="5" fill="#b06bff"/>
      <rect x="86" y="36" width="6" height="56" rx="3" fill="#2a1d44" stroke="#1c1230" stroke-width="2"/>
      <path d="M86 36 l16 8 l-16 8 Z" fill="#6a4fb0" stroke="#1c1230" stroke-width="2"/>
    </svg>`,
    /* 巨型傀儡 */
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${GROUND}
      <rect x="32" y="34" width="56" height="56" rx="10" fill="#b8c0cc" stroke="#6b7480" stroke-width="3"/>
      <rect x="42" y="44" width="36" height="22" rx="6" fill="#2b2b33"/>
      <circle cx="53" cy="55" r="5" fill="#46e0ff"/><circle cx="67" cy="55" r="5" fill="#46e0ff"/>
      <circle cx="60" cy="76" r="6" fill="#ff5a5a" stroke="#a33030" stroke-width="2"/>
      <rect x="56" y="22" width="8" height="14" rx="3" fill="#8a93a3" stroke="#6b7480" stroke-width="2"/>
      <circle cx="60" cy="20" r="4" fill="#ffd93d"/>
      <circle cx="38" cy="62" r="4" fill="#6b7480"/><circle cx="82" cy="62" r="4" fill="#6b7480"/>
    </svg>`,
    /* Python 大帝 */
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      ${GROUND}
      <path d="M30 96 q30 24 60 0 q6 -20 -10 -28 q-8 8 -16 2 q-6 10 -16 2 q-12 8 -18 24 Z" fill="#2e9e54" stroke="#1c6b43" stroke-width="3"/>
      <circle cx="60" cy="50" r="22" fill="#3fbf6a" stroke="#1c6b43" stroke-width="3"/>
      <path d="M44 34 l8 -4 l4 8 l8 -4 l4 8 l8 -4 l-2 12 q-18 -12 -38 0 Z" fill="#ffd93d" stroke="#b8860b" stroke-width="2"/>
      <circle cx="52" cy="48" r="5" fill="#0f3a22"/><circle cx="68" cy="48" r="5" fill="#0f3a22"/>
      <circle cx="53" cy="46" r="2" fill="#fff"/><circle cx="69" cy="46" r="2" fill="#fff"/>
      <path d="M54 62 q6 6 12 0" stroke="#0f3a22" stroke-width="3" fill="none"/>
      <path d="M58 64 l2 8 l4 0 l-2 -8Z" fill="#e7483b"/>
    </svg>`,
  ],
};

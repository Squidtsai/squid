// 可疑連結 / 簡訊分析器：完全在本機執行，不會把內容傳到任何地方。
// 這只是啟發式檢查。「沒有發現問題」不代表這個連結一定安全。

const MULTI_PART_TLDS = new Set([
  'com.tw', 'net.tw', 'org.tw', 'gov.tw', 'edu.tw', 'idv.tw', 'game.tw', 'ebiz.tw', 'club.tw',
  'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'co.jp', 'ne.jp', 'or.jp', 'go.jp', 'ac.jp',
  'com.cn', 'net.cn', 'org.cn', 'gov.cn', 'com.hk', 'org.hk', 'gov.hk', 'edu.hk',
  'com.au', 'net.au', 'org.au', 'com.sg', 'gov.sg', 'co.kr', 'or.kr', 'com.my', 'com.br',
]);

// 品牌關鍵字 → 官方網域（registrable domain）
const BRANDS = [
  { key: 'apple', name: 'Apple', domains: ['apple.com', 'icloud.com', 'apple.co', 'me.com'] },
  { key: 'icloud', name: 'iCloud', domains: ['icloud.com', 'apple.com'] },
  { key: 'appleid', name: 'Apple 帳號', domains: ['apple.com'] },
  { key: 'post', name: '中華郵政', domains: ['post.gov.tw'], tw: true },
  { key: 'fetc', name: '遠通電收 ETC', domains: ['fetc.net.tw'] },
  { key: 'etc', name: 'ETC 通行費', domains: ['fetc.net.tw'] },
  { key: 'mvdis', name: '監理服務網', domains: ['mvdis.gov.tw'] },
  { key: 'nhi', name: '健保署', domains: ['nhi.gov.tw'] },
  { key: 'shopee', name: '蝦皮', domains: ['shopee.tw', 'shopee.com', 'shp.ee'] },
  { key: 'line', name: 'LINE', domains: ['line.me', 'line-apps.com', 'naver.jp', 'linecorp.com', 'line.biz'] },
  { key: 'paypal', name: 'PayPal', domains: ['paypal.com', 'paypal.me'] },
  { key: 'google', name: 'Google', domains: ['google.com', 'google.com.tw', 'goo.gl', 'youtube.com', 'g.co'] },
  { key: 'amazon', name: 'Amazon', domains: ['amazon.com', 'amazon.co.jp', 'amzn.to'] },
  { key: 'netflix', name: 'Netflix', domains: ['netflix.com'] },
  { key: 'momo', name: 'momo 購物', domains: ['momoshop.com.tw'] },
  { key: 'tcat', name: '黑貓宅急便', domains: ['t-cat.com.tw'] },
  { key: 'dhl', name: 'DHL', domains: ['dhl.com', 'dhl.com.tw'] },
  { key: 'fedex', name: 'FedEx', domains: ['fedex.com'] },
  { key: 'microsoft', name: 'Microsoft', domains: ['microsoft.com', 'live.com', 'office.com', 'outlook.com'] },
  { key: 'facebook', name: 'Facebook', domains: ['facebook.com', 'fb.com', 'fb.me'] },
  { key: 'instagram', name: 'Instagram', domains: ['instagram.com'] },
  { key: 'taiwanpay', name: '台灣 Pay', domains: ['taiwanpay.com.tw'] },
  { key: 'jkopay', name: '街口支付', domains: ['jkopay.com'] },
  { key: 'mof', name: '財政部', domains: ['mof.gov.tw'] },
];

const SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'ow.ly', 'buff.ly', 'rebrand.ly', 'cutt.ly',
  'reurl.cc', 'lihi.cc', 'lihi1.cc', 'lihi2.cc', 'lihi3.cc', 'ppt.cc', 'pse.is', '0rz.tw', 'shorturl.at',
  'tiny.cc', 'rb.gy', 'v.gd', 'x.gd', 's.id', 'bitly.com', 'short.io', 'u.nu', 'gg.gg',
]);

const RISKY_TLDS = new Set([
  'top', 'xyz', 'icu', 'cyou', 'sbs', 'cfd', 'click', 'buzz', 'rest', 'vip', 'live', 'online', 'site',
  'club', 'monster', 'lol', 'bond', 'tk', 'ml', 'ga', 'cf', 'gq', 'work', 'support', 'help', 'win',
  'loan', 'cam', 'quest', 'mom', 'skin', 'hair', 'zip', 'mov', 'shop', 'store', 'fun', 'today', 'life',
]);

// 詐騙常見話術：[正規表示式, 說明, 權重]
const SCAM_PHRASES = [
  [/包裹|郵件|快遞|配送|投遞|地址(不完整|有誤|錯誤)|無法(配送|投遞)/, '包裹或配送異常的話術（假冒物流）', 2],
  [/(欠費|未繳|補繳|逾期|滯納|通行費|罰單|罰鍰|違規)/, '欠費、罰單、補繳的話術（假冒 ETC、監理站、電信）', 2],
  [/(帳戶|帳號|賬戶|卡片).{0,6}(異常|凍結|停用|停權|鎖定|暫停|到期)/, '恐嚇你帳號被凍結或停用', 3],
  [/(驗證|認證|核實|確認).{0,6}(身分|身份|資料|帳戶|帳號)/, '要你「驗證身分」或「確認資料」', 2],
  [/(立即|立刻|馬上|盡快|今日|24\s*小時|48\s*小時|限時|最後期限|逾時)/, '製造急迫感，要你馬上處理', 1],
  [/(中獎|得獎|抽中|獎金|贈品|免費領取|紅包|退款|退稅|補助|津貼|普發)/, '中獎、退款、補助的誘餌', 2],
  [/(保證獲利|穩賺|飆股|老師帶單|內線|翻倍|高報酬|投資群組|加入群組|虛擬貨幣|USDT|出金)/i, '投資詐騙的常見話術', 3],
  [/(加\s*(LINE|賴|line)|LINE\s*ID|@[a-z0-9_]{4,})/i, '要你加 LINE 私下聯絡', 1],
  [/(檢察官|地檢署|法院|警察局|刑事局|洗錢|監管帳戶|偵查不公開|通緝)/, '假冒檢警或司法人員（真的檢警不會用簡訊、電話要你轉帳）', 3],
  [/(解除分期|重複扣款|設定錯誤|誤設.{0,4}(會員|批發商))/, '「解除分期付款」詐騙話術', 3],
  [/(ATM|網銀|網路銀行).{0,8}(操作|設定|解除)/i, '要你操作 ATM 或網銀（ATM 不可能用來「解除設定」）', 3],
  [/(信用卡|卡號|安全碼|CVV|驗證碼|OTP|一次性密碼)/i, '要你提供卡號、驗證碼或 OTP', 3],
  [/(Apple\s*ID|iCloud).{0,10}(鎖定|停用|過期|到期|異常|付款)/i, '假冒 Apple 的帳號警告', 3],
  [/(描述檔|設定檔|安裝.{0,4}憑證|信任.{0,4}(開發者|企業))/, '要你安裝描述檔或信任開發者（可能讓手機被監控）', 3],
];

export function extractUrls(text) {
  // 只允許拉丁擴充、希臘、西里爾字母當作 IDN 字元，避免把中文字黏進網址
  const L = 'a-z0-9\\u00c0-\\u024f\\u0370-\\u03ff\\u0400-\\u04ff';
  const re = new RegExp(
    '((?:https?:\\/\\/)(?:[^\\s<>"\'\\u3000-\\u9fff\\uff00-\\uffef]+)' +
      '|(?:[' + L + '](?:[' + L + '-]{0,61}[' + L + '])?\\.)+(?:[a-z]{2,24}|xn--[a-z0-9-]+)' +
      '(?::\\d{2,5})?(?:[/?#][^\\s<>"\'\\u3000-\\u9fff\\uff00-\\uffef]*)?)',
    'gi',
  );
  const found = [];
  for (const m of text.matchAll(re)) {
    let u = m[1].replace(/[.,;:!?)\]]+$/, '');
    // 排除 email 的網域部分
    const before = text[m.index - 1];
    const after = text[m.index + m[0].length];
    if (before === '@' || after === '@') continue;
    found.push(u);
  }
  return [...new Set(found)];
}

export function registrableDomain(host) {
  const labels = host.toLowerCase().replace(/\.$/, '').split('.');
  if (labels.length <= 2) return labels.join('.');
  const lastTwo = labels.slice(-2).join('.');
  if (MULTI_PART_TLDS.has(lastTwo)) return labels.slice(-3).join('.');
  return lastTwo;
}

function normalizeLookalike(s) {
  return s
    .replace(/rn/g, 'm')
    .replace(/vv/g, 'w')
    .replace(/0/g, 'o')
    .replace(/1/g, 'l')
    .replace(/3/g, 'e')
    .replace(/5/g, 's')
    .replace(/4/g, 'a')
    .replace(/7/g, 't')
    .replace(/i/g, 'l');
}

function isOfficial(regDomain, brand) {
  return brand.domains.some((d) => regDomain === d || regDomain.endsWith('.' + d));
}

const SEVERITY = { high: 3, medium: 2, low: 1 };

export function analyzeUrl(raw) {
  const reasons = [];
  const add = (level, msg) => reasons.push({ level, msg });

  let input = raw.trim();
  if (!/^[a-z][a-z0-9+.-]*:/i.test(input)) input = 'http://' + input;
  let url;
  try {
    url = new URL(input);
  } catch {
    return { url: raw, host: '', level: 'medium', reasons: [{ level: 'medium', msg: '無法解析的網址格式' }] };
  }

  const host = url.hostname.toLowerCase();
  const reg = registrableDomain(host);
  const labels = host.split('.');
  const tld = labels[labels.length - 1];

  if (!['http:', 'https:'].includes(url.protocol)) {
    add('high', `不尋常的協定「${url.protocol}」`);
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith('[')) {
    add('high', '網址直接用 IP 位址，不是網域名稱（正規服務幾乎不會這樣做）');
  }
  if (host.split('.').some((l) => l.startsWith('xn--'))) {
    add('high', '網域含有國際化字元（Punycode），可能用長得很像的字母假冒其他網站');
  }
  if (url.username || /^[^/]*\/\/[^/]*@/.test(input)) {
    add('high', '網址含有「@」，瀏覽器實際會連到 @ 後面的網站，這是常見的偽裝手法');
  }
  if (SHORTENERS.has(reg) || SHORTENERS.has(host)) {
    add('medium', `這是縮網址服務（${host}），看不出真正的目的地。官方單位很少用縮網址寄簡訊`);
  }
  if (RISKY_TLDS.has(tld)) {
    add('medium', `頂級網域「.${tld}」很便宜，常被拿來大量註冊詐騙網站`);
  }
  if (url.protocol === 'http:' && /^https?:\/\//i.test(raw.trim())) {
    add('low', '沒有使用 HTTPS 加密連線');
  }
  if (labels.length >= 5) {
    add('low', '子網域層數很多，可能想把真正的網域藏起來');
  }
  if (raw.length > 120) {
    add('low', '網址非常長');
  }
  if (url.port && !['80', '443'].includes(url.port)) {
    add('low', `使用非標準連接埠 ${url.port}`);
  }
  if ((host.match(/-/g) || []).length >= 3) {
    add('low', '網域裡有很多連字號，常見於假冒網址（例如 apple-id-verify-login）');
  }

  // 品牌冒用
  const hostNoReg = host;
  const flat = hostNoReg.replace(/[.-]/g, '');
  const flatNorm = normalizeLookalike(flat);
  const flagged = new Set();
  for (const brand of BRANDS) {
    if (isOfficial(reg, brand)) continue;
    const key = brand.key;
    // 太短的關鍵字（etc、nhi、post、line）只比對完整標籤或用連字號分隔的片段，避免誤判
    const tokens = host.split(/[.-]/);
    const short = key.length <= 4;
    const hit = short ? tokens.includes(key) : flat.includes(key);
    if (hit) {
      if (!flagged.has(brand.name)) {
        add('high', `網址含有「${key}」，但不是${brand.name}的官方網域（官方：${brand.domains[0]}）`);
        flagged.add(brand.name);
      }
      continue;
    }
    if (!short && flatNorm.includes(normalizeLookalike(key)) && !flagged.has(brand.name)) {
      add('high', `網域看起來像「${brand.name}」，但用了相似字元假冒（例如 1→l、0→o、rn→m）`);
      flagged.add(brand.name);
    }
  }

  // 政府網域
  if (/gov/.test(host) && !host.endsWith('.gov.tw') && !host.endsWith('.gov') && !/\.gov\.[a-z]{2}$/.test(host)) {
    add('high', '網址裡有「gov」，但不是真正的政府網域（台灣政府網站一律以 .gov.tw 結尾）');
  }

  const level = reasons.reduce((max, r) => (SEVERITY[r.level] > SEVERITY[max] ? r.level : max), 'low');
  return {
    url: raw,
    host,
    domain: reg,
    level: reasons.length ? level : 'none',
    reasons,
  };
}

export function analyzeText(text) {
  const urls = extractUrls(text).map(analyzeUrl);
  const phrases = [];
  let phraseScore = 0;
  for (const [re, msg, w] of SCAM_PHRASES) {
    if (re.test(text)) {
      phrases.push(msg);
      phraseScore += w;
    }
  }

  const urlMax = urls.reduce((m, u) => Math.max(m, SEVERITY[u.level] || 0), 0);
  let score = urlMax * 2 + phraseScore;
  // 有連結又搭配詐騙話術，風險大增
  if (urls.length && phraseScore >= 2) score += 2;

  let verdict;
  if (score >= 7 || (urlMax === 3 && phraseScore >= 1)) verdict = 'high';
  else if (score >= 3) verdict = 'medium';
  else if (score >= 1) verdict = 'low';
  else verdict = 'none';

  return { verdict, score, urls, phrases };
}

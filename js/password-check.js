// 密碼檢查
// 外洩查詢使用 Have I Been Pwned 的 k-匿名 API：
// 只會送出密碼 SHA-1 雜湊值的「前 5 個字元」，完整密碼與完整雜湊值都不會離開你的手機。

const COMMON = new Set([
  '123456', '12345678', '123456789', '1234567890', '000000', '111111', '666666', '888888', '123123',
  'password', 'password1', 'qwerty', 'qwerty123', 'abc123', 'iloveyou', 'a123456', 'aa123456',
  'a12345678', '1qaz2wsx', 'zxcvbnm', 'asdfghjkl', 'admin', 'welcome', '520520', '5201314', '147258',
  '147258369', '987654321', 'qazwsx', 'taiwan', 'apple', 'iphone',
]);

export async function sha1Hex(str) {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** 回傳這組密碼在外洩資料中出現的次數（0 = 沒有找到） */
export async function pwnedCount(password, fetchImpl = fetch) {
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  const res = await fetchImpl(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { 'Add-Padding': 'true' },
  });
  if (!res.ok) throw new Error(`查詢服務回應錯誤 (${res.status})`);
  const body = await res.text();
  for (const line of body.split('\n')) {
    const [suf, count] = line.trim().split(':');
    if (suf === suffix) return parseInt(count, 10) || 0;
  }
  return 0;
}

/** 簡易強度評估：回傳 0–4 分與建議 */
export function strength(pw) {
  const tips = [];
  if (!pw) return { score: 0, label: '—', tips };
  const lower = pw.toLowerCase();
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/\d/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
  let bits = pw.length * Math.log2(pool || 1);

  const base = lower.replace(/[^a-z]+$/, '').replace(/^[^a-z]+/, '');
  if (COMMON.has(lower) || (base.length >= 4 && COMMON.has(base))) {
    bits = 0;
    tips.push('這是最常見的密碼之一，會第一個被試');
  }
  if (/^(\d)\1+$/.test(pw) || /(.)\1{3,}/.test(pw)) {
    bits *= 0.5;
    tips.push('避免同一個字元重複');
  }
  if (/(0123|1234|2345|3456|4567|5678|6789|abcd|qwer|asdf|zxcv)/i.test(pw)) {
    bits *= 0.7;
    tips.push('避免連續的數字或鍵盤排列');
  }
  if (/(19|20)\d{2}[01]\d[0-3]\d/.test(pw) || /^\d{6,8}$/.test(pw)) {
    bits *= 0.6;
    tips.push('純數字或日期格式（例如生日）很容易被猜到');
  }
  if (pw.length < 12) tips.push('長度至少 12 個字元，或用 4 個以上的隨機詞組合');
  if (pool < 36) tips.push('混合大小寫、數字與符號');

  const score = bits < 28 ? 0 : bits < 40 ? 1 : bits < 60 ? 2 : bits < 80 ? 3 : 4;
  const label = ['非常弱', '弱', '普通', '強', '非常強'][score];
  return { score, label, tips };
}

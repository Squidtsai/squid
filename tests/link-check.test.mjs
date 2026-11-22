import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractUrls, analyzeUrl, analyzeText, registrableDomain } from '../js/link-check.js';

test('extractUrls 從中文簡訊抓出網址，不黏中文字', () => {
  const urls = extractUrls('您的包裹地址不完整，請點擊post-tw.top/abc補填。');
  assert.deepEqual(urls, ['post-tw.top/abc']);
});

test('extractUrls 忽略 Email', () => {
  assert.deepEqual(extractUrls('寄信到 john.doe@gmail.com 謝謝'), []);
});

test('registrableDomain 處理 .com.tw / .gov.tw', () => {
  assert.equal(registrableDomain('www.momoshop.com.tw'), 'momoshop.com.tw');
  assert.equal(registrableDomain('a.b.post.gov.tw'), 'post.gov.tw');
  assert.equal(registrableDomain('support.apple.com'), 'apple.com');
});

test('官方網域沒有警告', () => {
  for (const u of ['https://support.apple.com/zh-tw', 'https://www.post.gov.tw', 'https://www.fetc.net.tw/', 'https://line.me/R/ti/p/x']) {
    assert.equal(analyzeUrl(u).level, 'none', u);
  }
});

test('冒用品牌網域', () => {
  assert.equal(analyzeUrl('https://apple-id-verify.com/login').level, 'high');
  assert.equal(analyzeUrl('https://icloud.com.secure-login.xyz').level, 'high');
  assert.equal(analyzeUrl('https://app1e.com').level, 'high');
  assert.equal(analyzeUrl('fetc-pay.top/x').level, 'high');
});

test('IP、Punycode、@ 偽裝', () => {
  assert.equal(analyzeUrl('http://192.168.3.4/pay').level, 'high');
  assert.equal(analyzeUrl('https://аpple.com').level, 'high'); // 西里爾 а
  assert.equal(analyzeUrl('https://www.google.com@evil.example/').level, 'high');
});

test('縮網址為中風險', () => {
  assert.equal(analyzeUrl('https://reurl.cc/abc').level, 'medium');
});

test('假政府網域', () => {
  assert.equal(analyzeUrl('https://mvdis-gov.cc/pay').level, 'high');
});

test('典型 ETC 詐騙簡訊判定高風險', () => {
  const r = analyzeText('【遠通電收】您的ETC通行費已逾期未繳，請於24小時內至 https://fetc-tw.vip/pay 補繳，以免罰鍰。');
  assert.equal(r.verdict, 'high');
  assert.ok(r.phrases.length >= 2);
});

test('假檢警話術即使沒有連結也有風險', () => {
  const r = analyzeText('這裡是台北地檢署，您的帳戶涉及洗錢，需將資金轉入監管帳戶，偵查不公開。');
  assert.ok(['medium', 'high'].includes(r.verdict));
});

test('一般訊息不誤判', () => {
  const r = analyzeText('晚上七點在老地方吃飯，記得帶傘喔');
  assert.equal(r.verdict, 'none');
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sha1Hex, pwnedCount, strength } from '../js/password-check.js';

test('sha1Hex', async () => {
  assert.equal(await sha1Hex('password'), '5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8');
});

test('pwnedCount 只送出前 5 碼並比對後綴', async () => {
  let requested;
  const fakeFetch = async (url) => {
    requested = url;
    return { ok: true, text: async () => '0000000000000000000000000000000000A:0\r\n1E4C9B93F3F0682250B6CF8331B7EE68FD8:3861493\r\n' };
  };
  const n = await pwnedCount('password', fakeFetch);
  assert.equal(requested, 'https://api.pwnedpasswords.com/range/5BAA6');
  assert.equal(n, 3861493);
});

test('pwnedCount 找不到時回傳 0', async () => {
  const n = await pwnedCount('x', async () => ({ ok: true, text: async () => 'ABC:1' }));
  assert.equal(n, 0);
});

test('strength', () => {
  assert.equal(strength('123456').score, 0);
  assert.equal(strength('password123').score, 0);
  assert.ok(strength('19900101').score <= 1);
  assert.ok(strength('藍色-火車-香蕉-跳舞-27').score >= 3);
  assert.ok(strength('kT9#vQ2!mZ7$wL4p').score >= 3);
});

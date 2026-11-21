const RECIPIENT = 'edusim71@gmail.com';
const SITE = 'https://wanjunsim3-droid.github.io/cheongna-theliv-tiamo/#consult';

function doGet() {
  return resultPage('상담 신청', '홈페이지에서 상담을 신청해 주세요.');
}

function doPost(event) {
  const form = event && event.parameter ? event.parameter : {};
  const name = String(form.name || '').trim();
  const phoneInput = String(form.phone || '').trim();
  const phone = phoneInput.replace(/[ -]/g, '');

  if (form.website || form.consent !== 'yes' || !name || name.length > 60 ||
      /[\r\n]/.test(name) || !/^0[0-9 -]+$/.test(phoneInput) ||
      !/^0[0-9]{8,10}$/.test(phone)) {
    return resultPage('입력 내용을 확인해 주세요', '이름과 전화번호를 입력하고 개인정보 수집·이용에 동의해 주세요.');
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(3000)) return temporaryError();
  try {
    const cache = CacheService.getScriptCache();
    const key = 'callback-minute-' + Math.floor(Date.now() / 60000);
    const count = Number(cache.get(key) || 0);
    if (count >= 12 || MailApp.getRemainingDailyQuota() < 1) return temporaryError();
    MailApp.sendEmail({
      to: RECIPIENT,
      subject: '[청라 더리브 티아모 까사] 새 상담 신청',
      body: '이름: ' + name + '\n전화번호: ' + phone + '\n개인정보 수집·이용 동의: 동의'
    });
    cache.put(key, String(count + 1), 90);
    return resultPage('상담 신청을 접수했습니다', '3B에쿼티에서 남겨주신 번호로 연락드리겠습니다.');
  } catch (_) {
    return temporaryError();
  } finally {
    lock.releaseLock();
  }
}

function temporaryError() {
  return resultPage('상담 신청을 완료하지 못했습니다', '잠시 후 다시 시도하거나 1666-5984로 전화해 주세요.');
}

function resultPage(title, detail) {
  return HtmlService.createHtmlOutput(
    '<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>' + title +
    '</title></head><body style="margin:0;padding:32px;color:#10222d;font:16px/1.7 system-ui">' +
    '<main style="max-width:34rem;margin:auto"><h1>' + title + '</h1><p>' + detail +
    '</p><a href="' + SITE + '" target="_top">홈페이지로 돌아가기</a></main></body></html>'
  ).setTitle(title).addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

(() => {
  'use strict';
  const ADDRESS = '3sunsmile3@gmail.com';
  const navToggle = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const form = document.getElementById('inquiryForm');
  const copyButton = document.getElementById('copyInquiry');
  const mailAppButton = document.getElementById('openMailApp');
  const status = document.getElementById('inquiryStatus');
  const directCopyButton = document.getElementById('copyAddress');
  const directStatus = document.getElementById('directEmailStatus');

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return true; } catch (_) { /* fallback */ }
    }
    const tmp = document.createElement('textarea');
    tmp.value = text;
    tmp.setAttribute('readonly', '');
    tmp.style.position = 'fixed';
    tmp.style.opacity = '0';
    document.body.appendChild(tmp);
    tmp.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) { /* unsupported */ }
    tmp.remove();
    return ok;
  }

  if (directCopyButton && directStatus) {
    directCopyButton.addEventListener('click', async () => {
      const ok = await copyText(ADDRESS);
      directStatus.textContent = ok ? 'メールアドレスをコピーしました。メールを開いて宛先に貼り付けてください。' : `コピーできない場合は、${ADDRESS} を選択してコピーしてください。`;
    });
  }
  if (!form || !copyButton || !status || !mailAppButton) return;

  const buildMessage = () => {
    const data = new FormData(form);
    const get = key => String(data.get(key) || '').trim() || '未記入';
    return {
      subject: `【sun smile 出店相談】${get('kind')}／${get('person')}`,
      body: [
        'sun smile ご担当者様', '',
        'ホームページを拝見し、以下の内容でご相談いたします。', '',
        `■ お名前：${get('person')}`,
        `■ 会社・団体名：${get('organization')}`,
        `■ ご連絡先メールアドレス：${get('replyEmail')}`,
        `■ ご相談内容：${get('kind')}`,
        `■ 開催日・期間：${get('date')}`,
        `■ 開催場所・地域：${get('place')}`,
        '■ イベントの概要・来場予定人数・出店条件など：',
        get('details'), '',
        'どうぞよろしくお願いいたします。'
      ].join('\n')
    };
  };
  const valid = () => {
    if (form.reportValidity()) return true;
    status.textContent = '必須項目を入力してください。';
    return false;
  };
  function makeMailto(message) {
    return `mailto:${ADDRESS}?subject=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(message.body)}`;
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!valid()) return;
    const message = buildMessage();
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(ADDRESS)}&su=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(message.body)}`;
    status.textContent = 'Gmailの画面に移動します。内容をご確認のうえ、メールの「送信」を押してください。';
    // ブラウザのメールアプリ設定に依存しない。ログインが必要な場合はGmailが案内する。
    window.location.assign(gmailUrl);
  });
  mailAppButton.addEventListener('click', () => {
    if (!valid()) return;
    status.textContent = 'メールアプリが開かない場合は、Gmailか「入力内容をコピー」をご利用ください。';
    window.location.href = makeMailto(buildMessage());
  });
  copyButton.addEventListener('click', async () => {
    if (!valid()) return;
    const message = buildMessage();
    const composed = `宛先：${ADDRESS}\n件名：${message.subject}\n\n${message.body}`;
    const ok = await copyText(composed);
    status.textContent = ok ? '入力内容をコピーしました。メールの宛先・件名・本文に貼り付け、送信してください。' : 'コピーできませんでした。入力欄から内容を選択してコピーしてください。';
  });
})();

(() => {
  'use strict';
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
  const status = document.getElementById('inquiryStatus');
  if (!form || !copyButton || !status) return;

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

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!valid()) return;
    const message = buildMessage();
    const url = `mailto:3sunsmile3@gmail.com?subject=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(message.body)}`;
    status.textContent = 'メール作成画面が開いたら内容をご確認のうえ、「送信」を押してください。自動送信ではありません。';
    window.location.href = url;
  });

  copyButton.addEventListener('click', async () => {
    if (!valid()) return;
    const message = buildMessage();
    const text = `宛先：3sunsmile3@gmail.com\n件名：${message.subject}\n\n${message.body}`;
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = '入力内容をコピーしました。メールアプリに貼り付け、送信してください。';
    } catch (_) {
      status.textContent = '自動コピーができませんでした。右側のメールアドレスから直接ご連絡ください。';
    }
  });
})();

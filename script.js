"use strict";
// Pages CMS が書き出す posts.json を、すべてのお客様の端末で共通表示するブログ機能。
// 従来のブラウザ内の管理画面・localStorageには依存しません。
const $ = s => document.querySelector(s);
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));
const categories = ["出店情報", "イベント報告", "お知らせ", "日記"];
let posts = [];
let selectedCategory = "すべて";
function safeImageUrl(value) {
  const url = String(value ?? "").trim();
  if (!url) return "";
  // Pages CMS は /assets/blog/… のURLを保存します。
  if (/^\/?assets\/[a-zA-Z0-9_./%\-]+(?:\?[a-zA-Z0-9_=&%\-]+)?$/.test(url) &&
      !url.split("/").includes("..") && !/%2e/i.test(url)) return url;
  // 過去の記事にすでに登録したHTTPS写真も利用できます。
  if (/^https:\/\/[^\s<>"']+$/i.test(url)) return url;
  return "";
}
function normalizePost(p, idx) {
  if (!p || typeof p !== "object") return null;
  const title = String(p.title ?? "").trim();
  const content = String(p.content ?? "").trim();
  const date = String(p.date ?? "").slice(0, 10);
  if (!title || title.length > 180 || !content || content.length > 25000 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return {
    // 管理画面で記事IDの入力は不要です。内部では一覧の位置を識別子に使います。
    id: String(idx), date, title, content,
    category: categories.includes(p.category) ? p.category : "お知らせ",
    image: safeImageUrl(p.image)
  };
}
function render() {
  const shown = posts.filter(p => selectedCategory === "すべて" || p.category === selectedCategory)
    .slice().sort((a,b) => b.date.localeCompare(a.date));
  const list = $("#postList");
  list.innerHTML = shown.map(p => {
    const img = p.image;
    const excerpt = p.content.slice(0, 92).replace(/\s+/g, " ");
    return `<article class="post-card" data-id="${escapeHtml(p.id)}" tabindex="0" role="button" aria-label="記事を読む：${escapeHtml(p.title)}">
      <div class="post-cover">${img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(p.title)}の写真" loading="lazy" decoding="async">` : '🚚'}</div>
      <div class="post-card-body"><div class="post-meta">${escapeHtml(p.date)} <span>${escapeHtml(p.category)}</span></div>
      <h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(excerpt)}${p.content.length > 92 ? '…' : ''}</p>
      <div class="post-link">記事を読む ↗</div></div></article>`;
  }).join("");
  $("#emptyState").textContent = "このカテゴリーにはまだ記事がありません。";
  $("#emptyState").hidden = shown.length > 0;
}
function openPost(id) {
  const p = posts.find(item => item.id === id);
  if (!p) return;
  $("#postDetail").innerHTML = `<div class="post-meta">${escapeHtml(p.date)} <span>${escapeHtml(p.category)}</span></div>
    <h2>${escapeHtml(p.title)}</h2>
    ${p.image ? `<img class="post-image" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}の写真" loading="lazy">` : ""}
    <div class="post-body">${escapeHtml(p.content)}</div>`;
  $("#postDialog").showModal();
}
async function loadPosts() {
  try {
    const res = await fetch("posts.json", {cache: "no-store"});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("記事データが配列ではありません");
    posts = data.map(normalizePost).filter(Boolean);
    render();
  } catch (err) {
    console.error("ブログの記事を読み込めませんでした", err);
    $("#postList").innerHTML = "";
    $("#emptyState").textContent = "記事を読み込めませんでした。少し後でページを更新してください。";
    $("#emptyState").hidden = false;
  }
}
$("#filters").addEventListener("click", event => {
  const button = event.target.closest("button[data-filter]");
  if (!button || !["すべて", ...categories].includes(button.dataset.filter)) return;
  selectedCategory = button.dataset.filter;
  document.querySelectorAll("#filters button").forEach(b => b.classList.toggle("active", b === button));
  render();
});
$("#postList").addEventListener("click", event => {
  const card = event.target.closest(".post-card[data-id]");
  if (card) openPost(card.dataset.id);
});
$("#postList").addEventListener("keydown", event => {
  const card = event.target.closest(".post-card[data-id]");
  if (card && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault(); openPost(card.dataset.id);
  }
});
$("#postClose").addEventListener("click", () => $("#postDialog").close());
$("#postDialog").addEventListener("click", e => {
  if (e.target === $("#postDialog")) $("#postDialog").close();
});
$("#menuBtn").addEventListener("click", () => $("#nav").classList.toggle("open"));
document.querySelectorAll("#nav a").forEach(link => link.addEventListener("click", () => $("#nav").classList.remove("open")));
$("#year").textContent = new Date().getFullYear();
loadPosts();

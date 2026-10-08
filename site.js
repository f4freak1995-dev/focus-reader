/* Copyright 2026 Focus Reader project rights holders. See LICENSE.txt.
 * This is a public website demonstration, not the reader's parsing/timing engine. */
const root = document.documentElement;
const scriptUrl = new URL(document.currentScript.src);
const siteBase = new URL(scriptUrl.pathname.includes('/assets/') ? '../' : './', scriptUrl);
const english = root.lang === 'en';
const themeButton = document.querySelector('#theme-toggle');
try { if (localStorage.getItem('focus-reader-site-theme') === 'dark') root.dataset.theme = 'dark'; } catch {}
function themeLabel() {
  const dark = root.dataset.theme === 'dark';
  themeButton?.setAttribute('aria-pressed', String(dark));
  themeButton?.setAttribute('aria-label', english ? (dark ? 'Switch to light appearance' : 'Switch to dark appearance') : (dark ? '切换浅色外观' : '切换深色外观'));
}
themeLabel();
themeButton?.addEventListener('click', () => {
  const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = theme;
  try { localStorage.setItem('focus-reader-site-theme', theme); } catch {}
  themeLabel();
});

const tabs = [...document.querySelectorAll('[role=tab][data-mode]')];
const panel = document.querySelector('#reading-panel');
const sample = panel?.querySelector('.sample');
const bookViewport = panel?.querySelector('.book-viewport');
const pageControls = document.querySelector('#page-controls');
const pageStatus = document.querySelector('#page-status');
const previousPageButtons = ['#page-prev','#page-back'].map(selector => document.querySelector(selector)).filter(Boolean);
const nextPageButtons = ['#page-next','#page-forward'].map(selector => document.querySelector(selector)).filter(Boolean);
const stage = panel?.querySelector('.word-stage');
const focusLine = panel?.querySelector('.focus-line');
const playButton = document.querySelector('#play-demo');
const controls = document.querySelector('.demo-controls');
const demoProgress = document.querySelector('.demo-progress');
const seek = document.querySelector('#demo-seek');
const speed = document.querySelector('#demo-speed');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const captions = english ? {
  normal:'Turn the pages with the arrows or your keyboard. Switch modes without losing your place.',
  color:'Sentence colors keep the boundaries visible as you read.',
  arsvp:'One word at a time. Pause, change speed, or choose a new position.',
  focus:'Follow the enlarged word. Click any word to choose your starting point.'
} : {
  normal:'点击书页两侧或按方向键翻页；切换模式，继续同一个位置。',
  color:'用颜色辨认句子边界，保留完整原文。',
  arsvp:'逐词显示，可暂停、调速或拖动进度。',
  focus:'跟随放大的词阅读；点选任意词，选择起点。'
};
// This public illustration uses a simple display rhythm, not the private engine.
const chineseWords = ["我的", "故事", "总是", "在", "夏天", "开始", "的。", "夏天", "在", "我", "看来", "是", "个", "危险", "的", "季节，", "炎热", "的", "天气", "使", "人群", "比", "其他", "季节", "裸露", "得", "多，", "因此", "很难", "掩饰", "欲望。"];
const paragraphNodes = sample ? [...sample.querySelectorAll('.sample-paragraph')] : [];
const paragraphs = sample ? (paragraphNodes.length ? paragraphNodes : [sample]) : [];
const chineseSegmenter = !english && typeof Intl.Segmenter === 'function'
  ? new Intl.Segmenter('zh-CN',{granularity:'word'}) : null;
function chineseDemoWords(text) {
  if (text === chineseWords.join('')) return chineseWords;
  const result = [];
  const segments = chineseSegmenter ? [...chineseSegmenter.segment(text)].map(part => part.segment) : Array.from(text);
  let opening = '';
  segments.forEach(segment => {
    if (/^[“‘「『（([{《〈]+$/u.test(segment)) { opening += segment; return; }
    if (/^[\p{P}\p{Z}\s]+$/u.test(segment) && result.length && !opening) {
      result[result.length - 1] += segment;
    } else { result.push(opening + segment); opening = ''; }
  });
  if (opening) { if (result.length) result[result.length - 1] += opening; else result.push(opening); }
  return result;
}
const records = [];
paragraphs.forEach((paragraph, paragraphIndex) => {
  const original = paragraph.textContent;
  const text = original.trim();
  const words = english ? text.match(/\S+\s*/g) || [] : chineseDemoWords(text);
  let offset = original.indexOf(text);
  words.forEach(text => {
    records.push({text, paragraphIndex, start:offset, end:offset + text.length});
    offset += text.length;
  });
});
const focusTokens = [];
paragraphs.forEach((_, paragraphIndex) => {
  const paragraph = document.createElement('p');
  paragraph.className = 'focus-paragraph';
  records.forEach((record, n) => {
    if (record.paragraphIndex !== paragraphIndex) return;
    const slot = document.createElement('button');
    slot.type = 'button'; slot.className = 'focus-token'; slot.tabIndex = -1;
    slot.dataset.index = String(n);
    const glyph = document.createElement('span');
    glyph.className = 'focus-glyph'; glyph.textContent = record.text;
    slot.append(glyph); paragraph.append(slot); focusTokens.push(slot);
  });
  focusLine?.append(paragraph);
});
let timer = null, index = 0, playing = false, activeMode = 'normal', paintedIndex = -1;
// Preserve the original sentence markup and selectable text. DOM Ranges map the
// same UTF-16 word offsets used by timed modes to the browser's column layout.
const pageRanges = records.map(record => {
  const paragraph = paragraphs[record.paragraphIndex];
  const walker = document.createTreeWalker(paragraph,NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let node, offset = 0, hasStart = false;
  while ((node = walker.nextNode())) {
    const end = offset + node.textContent.length;
    if (!hasStart && record.start < end) {
      range.setStart(node,Math.max(0,record.start - offset)); hasStart = true;
    }
    if (hasStart && record.end <= end) {
      range.setEnd(node,Math.max(0,record.end - offset)); return range;
    }
    offset = end;
  }
  return null;
});
let pagesPerSpread = 1, pageCount = 1, spreadIndex = 0, spreadPitch = 0;
let wordPages = records.map(() => 0), paginationFrame = null, pageTurnAnimation = null;
function cancelPageTurn() { pageTurnAnimation?.cancel(); pageTurnAnimation = null; }
function animatePageTurn(direction) {
  cancelPageTurn();
  if (!reducedMotion.matches && typeof bookViewport?.animate === 'function') {
    pageTurnAnimation = bookViewport.animate([
      {opacity:.82,transform:`translateX(${direction * 6}px)`},
      {opacity:1,transform:'translateX(0)'}
    ],{duration:160,easing:'ease-out'});
  }
}
reducedMotion.addEventListener('change',() => { if (reducedMotion.matches) cancelPageTurn(); });
function isPageMode() { return activeMode === 'normal' || activeMode === 'color'; }
function renderPages() {
  if (!bookViewport || !sample || !isPageMode()) return;
  const spreadCount = Math.max(1,Math.ceil(pageCount / pagesPerSpread));
  spreadIndex = Math.max(0,Math.min(spreadCount - 1,spreadIndex));
  sample.style.transform = `translateX(${-spreadIndex * spreadPitch}px)`;
  const first = spreadIndex * pagesPerSpread + 1;
  const last = Math.min(pageCount,first + pagesPerSpread - 1);
  const visible = first === last ? String(first) : `${first}–${last}`;
  if (pageStatus) pageStatus.textContent = english ? `${first === last ? 'Page' : 'Pages'} ${visible} of ${pageCount}` : `第 ${visible} 页 · 共 ${pageCount} 页`;
  previousPageButtons.forEach(button => { button.disabled = spreadIndex === 0; });
  nextPageButtons.forEach(button => { button.disabled = spreadIndex === spreadCount - 1; });
  panel.dataset.pageStart = String(first);
  panel.dataset.pageEnd = String(last);
  panel.dataset.pageTotal = String(pageCount);
}
function layoutPages() {
  if (!bookViewport || !sample || !isPageMode()) return;
  cancelPageTurn();
  bookViewport.classList.add('is-paginated');
  const styles = getComputedStyle(sample);
  pagesPerSpread = Math.max(1,Math.min(2,parseInt(styles.columnCount,10) || 1));
  const width = sample.getBoundingClientRect().width;
  const gap = parseFloat(styles.columnGap) || 0;
  if (!width) return;
  spreadPitch = width + gap;
  const columnPitch = spreadPitch / pagesPerSpread;
  const origin = sample.getBoundingClientRect().left;
  let lastOccupiedPage = 0;
  const pageFor = rect => Math.max(0,Math.floor((rect.left - origin + .5) / columnPitch));
  wordPages = pageRanges.map(range => {
    const rects = range ? [...range.getClientRects()].filter(rect => rect.width > 0 && rect.height > 0) : [];
    rects.forEach(rect => { lastOccupiedPage = Math.max(lastOccupiedPage,pageFor(rect)); });
    return rects.length ? pageFor(rects[0]) : 0;
  });
  // Count every fragment: a CJK word can wrap over the final column boundary.
  pageCount = lastOccupiedPage + 1;
  spreadIndex = Math.floor((wordPages[index] || 0) / pagesPerSpread);
  renderPages();
}
function queuePagination() {
  cancelAnimationFrame(paginationFrame);
  paginationFrame = requestAnimationFrame(() => { paginationFrame = null; layoutPages(); });
}
function turnPage(direction) {
  if (!isPageMode()) return;
  const target = Math.max(0,Math.min(Math.ceil(pageCount / pagesPerSpread) - 1,spreadIndex + direction));
  if (target === spreadIndex) return;
  pause();
  if (selectedWordIndex() !== null) window.getSelection()?.removeAllRanges();
  spreadIndex = target;
  const firstWord = wordPages.findIndex(page => page >= spreadIndex * pagesPerSpread);
  if (firstWord >= 0) index = firstWord;
  renderPages(); renderPosition(false); animatePageTurn(direction);
}
function selectedWordIndex() {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || !selection.rangeCount) return null;
  const selected = selection.getRangeAt(0);
  const paragraphIndex = paragraphs.findIndex(paragraph => paragraph.contains(selected.startContainer));
  if (paragraphIndex < 0) return null;
  const before = document.createRange();
  before.selectNodeContents(paragraphs[paragraphIndex]);
  before.setEnd(selected.startContainer,selected.startOffset);
  const offset = before.toString().length;
  const selectedIndex = records.findIndex(record => record.paragraphIndex === paragraphIndex && record.end > offset);
  return selectedIndex < 0 ? null : selectedIndex;
}
previousPageButtons.forEach(button => button.addEventListener('click',() => turnPage(-1)));
nextPageButtons.forEach(button => button.addEventListener('click',() => turnPage(1)));
// A user can select a word in Pages, then switch to a paused timed mode there.
document.addEventListener('selectionchange',() => {
  if (!isPageMode()) return;
  const selected = selectedWordIndex();
  if (selected !== null) { pause(); index = selected; renderPosition(false); }
});
if (bookViewport && typeof ResizeObserver === 'function') new ResizeObserver(queuePagination).observe(bookViewport);
window.addEventListener('resize',queuePagination);
document.fonts?.ready.then(queuePagination);
function renderPosition(follow = true) {
  if (panel) panel.dataset.wordIndex = String(index);
  const current = document.querySelector('#current-word');
  if (current) current.textContent = records[index]?.text.trim() || '';
  const active = focusTokens[index];
  const activeTop = active?.offsetTop;
  const beforeSharesLine = focusTokens[index - 1]?.offsetTop === activeTop;
  const afterSharesLine = focusTokens[index + 1]?.offsetTop === activeTop;
  new Set([paintedIndex - 1,paintedIndex,paintedIndex + 1,index - 1,index,index + 1]).forEach(n => {
    const slot = focusTokens[n]; if (!slot) return;
    slot.classList.toggle('is-current',n === index);
    slot.classList.toggle('is-before',beforeSharesLine && n === index - 1);
    slot.classList.toggle('is-after',afterSharesLine && n === index + 1);
  });
  paintedIndex = index;
  if (follow && focusLine && !focusLine.hidden && active) {
    const bounds = focusLine.getBoundingClientRect(), word = active.getBoundingClientRect();
    if (word.top < bounds.top + 12 || word.bottom > bounds.top + bounds.height * .75) {
      const target = focusLine.scrollTop + word.top - bounds.top - bounds.height * .35;
      focusLine.scrollTo({top:Math.max(0,target),behavior:reducedMotion.matches || !playing ? 'instant' : 'smooth'});
    }
  }
  if (seek) {
    seek.value = String(index);
    seek.setAttribute('aria-valuetext',`${index + 1} / ${records.length}`);
  }
  const location = document.querySelector('#demo-location');
  if (location) location.textContent = `${index + 1} / ${records.length}`;
}
function pause() {
  clearTimeout(timer); timer = null; playing = false;
  playButton?.setAttribute('aria-pressed','false');
  if (playButton) playButton.textContent = english ? (index === records.length - 1 ? 'Read again' : index > 0 ? 'Continue' : 'Start reading') : (index === records.length - 1 ? '再读一次' : index > 0 ? '继续阅读' : '开始体验');
}
function schedule() {
  const punctuation = /[.!?。！？,，;；]["”’]*\s*$/.test(records[index]?.text || '');
  timer = setTimeout(() => {
    if (index >= records.length - 1) { pause(); return; }
    index += 1; renderPosition(); schedule();
  }, (320 + (punctuation ? 150 : 0)) / Number(speed?.value || 1));
}
function togglePlayback() {
  if (playing) { pause(); return; }
  if (!records.length) return;
  if (index === records.length - 1) index = 0;
  playing = true; playButton.textContent = english ? 'Pause' : '暂停';
  playButton.setAttribute('aria-pressed','true'); renderPosition(); schedule();
}
function setPosition(next) {
  pause(); index = Math.max(0,Math.min(records.length - 1,next)); renderPosition(); pause();
}
function activate(tab) {
  if (!tab || !panel) return;
  cancelPageTurn();
  if (isPageMode()) {
    const selected = selectedWordIndex();
    if (selected !== null) { index = selected; window.getSelection()?.removeAllRanges(); }
  }
  pause(); activeMode = tab.dataset.mode;
  tabs.forEach(t => { t.setAttribute('aria-selected',String(t === tab)); t.tabIndex = t === tab ? 0 : -1; });
  panel.className = `page-text ${activeMode}`; panel.setAttribute('aria-labelledby',tab.id);
  sample.hidden = !isPageMode();
  if (bookViewport) bookViewport.hidden = !isPageMode();
  if (pageControls) pageControls.hidden = !isPageMode();
  [...previousPageButtons,...nextPageButtons].forEach(button => { button.hidden = !isPageMode(); });
  stage.hidden = activeMode !== 'arsvp'; focusLine.hidden = activeMode !== 'focus';
  controls.hidden = isPageMode();
  if (demoProgress) demoProgress.hidden = isPageMode();
  if (seek) seek.disabled = isPageMode();
  document.querySelector('#mode-caption').textContent = captions[activeMode];
  layoutPages(); renderPosition();
}
tabs.forEach((tab,i) => {
  tab.addEventListener('click',() => activate(tab));
  tab.addEventListener('keydown',event => {
    let next;
    if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (i + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); activate(tabs[next]); tabs[next].focus(); }
  });
});
playButton?.addEventListener('click',togglePlayback);
document.querySelector('#restart-demo')?.addEventListener('click',() => setPosition(0));
speed?.addEventListener('change',() => { if (playing) { clearTimeout(timer); schedule(); } });
seek?.addEventListener('pointerdown',pause);
seek?.addEventListener('input',() => setPosition(Number(seek.value)));
focusLine?.addEventListener('click',event => {
  const token = event.target.closest('.focus-token');
  if (token) setPosition(Number(token.dataset.index));
});
function readingKeydown(event) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.target.closest('input,textarea,select,[contenteditable=true]')) return;
  if (isPageMode()) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); turnPage(event.key === 'ArrowRight' ? 1 : -1);
    }
    return;
  }
  if (activeMode !== 'focus' && activeMode !== 'arsvp') return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); setPosition(index + (event.key === 'ArrowRight' ? 1 : -1)); }
  if (event.code === 'Space' && event.target === panel) { event.preventDefault(); togglePlayback(); }
}
panel?.addEventListener('keydown',readingKeydown);
pageControls?.addEventListener('keydown',readingKeydown);
if (seek) { seek.disabled = false; seek.max = String(Math.max(0,records.length - 1)); }
if (panel) activate(document.querySelector('#tab-normal'));
// Deep links reveal the relevant platform instructions, without opening every
// troubleshooting section for everyone on the landing page.
function revealInstructions(){
 const target=location.hash?document.getElementById(location.hash.slice(1)):null;if(!target)return;
 let node=target;while(node){if(node instanceof HTMLDetailsElement)node.open=true;node=node.parentElement;}
}
window.addEventListener('hashchange',revealInstructions);revealInstructions();
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.addEventListener('pagehide',pause);

// Only verified public release assets may enable a download link.
async function loadRelease() {
  try {
    const response = await fetch(new URL('release-manifest.json',siteBase),{cache:'no-cache'});
    if(!response.ok)return;
    const release = await response.json();
    if(release.schemaVersion !== 1)return;
    const expectedPrefix='https://github.com/f4freak1995-dev/focus-reader/releases/download/';
    for (const [platform,label] of [['mac','macOS'],['windows','Windows']]) {
      const item=release[platform];
      if(item?.status !== 'published' || typeof item.url !== 'string' || !item.url.startsWith(expectedPrefix) || !/^[a-f0-9]{64}$/.test(item.sha256) || !/^\d+\.\d+\.\d+$/.test(item.version))continue;
      document.querySelectorAll(`[data-${platform}-download]`).forEach(link => { link.href=item.url; });
      const hash=document.querySelector(`#${platform}-hash`);
      if(hash)hash.textContent=item.sha256;
    }
  } catch { /* Static platform information remains readable offline. */ }
}
if(panel)void loadRelease();

// Local OS hint only: no IP lookup, high-entropy device query, or tracking.
const os=navigator.userAgentData?.platform || navigator.platform || '';
const preferred=/Mac/i.test(os)?'mac':/Win/i.test(os)?'windows':null;
if(preferred)document.querySelectorAll('.hero-actions .button').forEach(link=>{
 const match=link.hasAttribute(`data-${preferred}-download`);link.classList.toggle('primary',match);link.classList.toggle('secondary',!match);
});

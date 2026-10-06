/* Copyright 2026 Focus Reader project rights holders. See LICENSE.txt.
 * This is a public website demonstration, not the reader's parsing/timing engine. */
const root = document.documentElement;
const themeButton = document.querySelector('#theme-toggle');
try { if (localStorage.getItem('focus-reader-site-theme') === 'dark') root.dataset.theme = 'dark'; } catch {}
function themeLabel() {
  const dark = root.dataset.theme === 'dark';
  themeButton?.setAttribute('aria-pressed', String(dark));
  themeButton?.setAttribute('aria-label', dark ? '切换浅色外观' : '切换深色外观');
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
const captions = { normal:'像读纸书一样，按自己的节奏翻页。', color:'柔和色块，辅助辨认原句边界。', arsvp:'词组播放示意；实际候选时长由应用确定。', focus:'在原句里强调当前词，保留上下文。' };
const sample = panel?.querySelector('.sample');
const stage = panel?.querySelector('.word-stage');
const focusLine = panel?.querySelector('.focus-line');
const playButton = document.querySelector('#play-demo');
const words = ['窗外','的','光线','慢慢','移过','书桌。','合上','杂乱','的','念头，','把','目光','放在','眼前','的','一行','文字','上。'];
let timer = null, index = 0;
function pause() {
  if (timer !== null) clearInterval(timer);
  timer = null;
  playButton?.setAttribute('aria-pressed','false');
  if (playButton) playButton.textContent = '播放示意';
}
function activate(tab) {
  pause();
  const mode = tab.dataset.mode;
  tabs.forEach(t => { t.setAttribute('aria-selected',String(t === tab)); t.tabIndex = t === tab ? 0 : -1; });
  panel.className = `page-text ${mode}`;
  panel.setAttribute('aria-labelledby',tab.id);
  sample.hidden = mode === 'arsvp' || mode === 'focus';
  stage.hidden = mode !== 'arsvp';
  focusLine.hidden = mode !== 'focus';
  playButton.hidden = mode !== 'arsvp';
  document.querySelector('#mode-caption').textContent = captions[mode];
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click',()=>activate(tab));
  tab.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight') next=(i+1)%tabs.length;
    if(event.key==='ArrowLeft') next=(i+tabs.length-1)%tabs.length;
    if(event.key==='Home') next=0;
    if(event.key==='End') next=tabs.length-1;
    if(next !== undefined){event.preventDefault();activate(tabs[next]);tabs[next].focus();}
  });
});
playButton?.addEventListener('click',()=>{
  if(timer !== null){pause();return;}
  playButton.textContent='暂停示意';playButton.setAttribute('aria-pressed','true');
  timer=setInterval(()=>{index=(index+1)%words.length;document.querySelector('#current-word').textContent=words[index];},650);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.addEventListener('pagehide',pause);

// Only verified public release assets may enable a download link.
async function loadRelease() {
  try {
    const response = await fetch('release-manifest.json',{cache:'no-cache'});
    if(!response.ok)return;
    const release = await response.json();
    if(release.schemaVersion !== 1)return;
    const expectedPrefix='https://github.com/f4freak1995-dev/focus-reader/releases/download/';
    for (const [platform,label] of [['mac','macOS'],['windows','Windows']]) {
      const item=release[platform];
      if(item?.status !== 'published' || typeof item.url !== 'string' || !item.url.startsWith(expectedPrefix) || !/^[a-f0-9]{64}$/.test(item.sha256) || !/^\d+\.\d+\.\d+$/.test(item.version))continue;
      const slot=document.querySelector(`#${platform}-release`);
      if(!slot)continue;
      const link=document.createElement('a');link.className='button primary';link.href=item.url;
      link.textContent=`下载 ${label} ${item.version}`;
      slot.replaceChildren(link);
      document.querySelector(`#${platform}-status`).textContent=platform==='mac'?'公开测试版 · 尚未通过 Apple 公证':'公开测试版 · 尚未做 Windows 发布签名';
      document.querySelector(`#${platform}-hash`).textContent=item.sha256;
    }
  } catch { /* Static platform information remains readable offline. */ }
}
if(panel)void loadRelease();

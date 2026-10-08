/* Copyright 2026 Focus Reader project rights holders. See LICENSE.txt.
 * This is a public website demonstration, not the reader's parsing/timing engine. */
const root = document.documentElement;
const siteBase = new URL('./', document.currentScript.src);
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
const captions = english ? {normal:'Turn the pages at your own pace, as you would with a paper book.',color:'Soft colors mark the boundaries of each sentence.',arsvp:'A word-playback illustration. The app calculates actual candidate timings.',focus:'Emphasize the current word in its sentence, keeping the context.'} : { normal:'像读纸书一样，按自己的节奏翻页。', color:'柔和色块，辅助辨认原句边界。', arsvp:'词组播放示意；实际候选时长由应用确定。', focus:'在原句里强调当前词，保留上下文。' };
const sample = panel?.querySelector('.sample');
const stage = panel?.querySelector('.word-stage');
const focusLine = panel?.querySelector('.focus-line');
const playButton = document.querySelector('#play-demo');
// Each language uses one attributed literary sample across all four tabs.
// No reader dictionary, private timing engine, or book content is loaded here.
const chineseWords = ["我", "冒", "了", "严寒，", "回到", "相隔", "二千余里，", "别", "了", "二十余年", "的", "故乡", "去。", "时候", "既然", "是", "深冬；", "渐近", "故乡", "时，", "天气", "又", "阴晦", "了，", "冷风", "吹进", "船舱", "中，", "呜呜", "的", "响，", "从", "篷隙", "向外", "一望，", "苍黄", "的", "天底下，", "远近", "横着", "几个", "萧索", "的", "荒村，", "没有", "一些", "活气。", "我", "的", "心", "禁不住", "悲凉", "起来", "了。"];
if (sample && english) {
  [...sample.querySelectorAll(':scope > span')].slice(1).forEach(span => { if(!/\s$/.test(span.previousSibling?.textContent || '')) span.before(document.createTextNode(' ')); });
}
const words = english ? (sample?.textContent.trim().match(/\S+\s*/g) || []) : chineseWords;
const focusTokens = words.map((word,n) => {
  const span=document.createElement('span');span.className='focus-token';span.textContent=word;
  if(n===0)span.classList.add('is-current');focusLine?.append(span);return span;
});
let timer = null, index = 0;
function renderPosition() {
  const current=document.querySelector('#current-word');if(current)current.textContent=words[index]?.trim() || '';
  focusTokens.forEach((span,n)=>span.classList.toggle('is-current',n===index));
  if(focusLine && !focusLine.hidden && focusTokens[index]){
    const bounds=focusLine.getBoundingClientRect(), active=focusTokens[index].getBoundingClientRect();
    if(active.bottom>bounds.bottom-8)focusLine.scrollTop+=active.bottom-bounds.bottom+8;
    else if(active.top<bounds.top+8)focusLine.scrollTop+=active.top-bounds.top-8;
  }
  const fill=document.querySelector('#demo-progress-fill');fill?.setAttribute('width',String(Math.round(1000*(index+1)/Math.max(1,words.length))));
  const location=document.querySelector('#demo-location');if(location)location.textContent=english?`Demo group ${index+1} / ${words.length}`:`词组示意 ${index+1} / ${words.length}`;
}
function pause() {
  if(timer!==null)clearInterval(timer);timer=null;playButton?.setAttribute('aria-pressed','false');
  if(playButton)playButton.textContent=english?'Play demo':'播放示意';
}
function activate(tab) {
  pause();const mode=tab.dataset.mode;
  tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1;});
  panel.className=`page-text ${mode}`;panel.setAttribute('aria-labelledby',tab.id);
  sample.hidden=mode==='arsvp'||mode==='focus';stage.hidden=mode!=='arsvp';focusLine.hidden=mode!=='focus';
  playButton.hidden=mode!=='arsvp'&&mode!=='focus';document.querySelector('#mode-caption').textContent=captions[mode];renderPosition();
}
tabs.forEach((tab,i)=>{
 tab.addEventListener('click',()=>activate(tab));
 tab.addEventListener('keydown',event=>{
  let next;if(event.key==='ArrowRight')next=(i+1)%tabs.length;if(event.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;
  if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;
  if(next!==undefined){event.preventDefault();activate(tabs[next]);tabs[next].focus();}
 });
});
playButton?.addEventListener('click',()=>{
 if(timer!==null){pause();return;}if(!words.length)return;
 playButton.textContent=english?'Pause demo':'暂停示意';playButton.setAttribute('aria-pressed','true');
 timer=setInterval(()=>{index=(index+1)%words.length;renderPosition();},650);
});
renderPosition();
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

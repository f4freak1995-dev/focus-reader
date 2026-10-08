"""Generate static English pages from the Chinese website and reviewed translations.

No remote service or third-party dependency. Fail on untranslated Chinese strings.
Run from any directory: python scripts/build-english.py
"""
from html import escape
from html.parser import HTMLParser
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parent.parent
TRANSLATIONS = json.loads((ROOT / 'translations.en.json').read_text(encoding='utf-8'))
ASSETS = {'styles.css', 'site.js', 'language.js', 'icon.svg', 'LICENSE.txt',
          'THIRD_PARTY_NOTICES.md', 'DEPENDENCY_LICENSES.txt'}
CJK = re.compile(r'[\u3400-\u9fff]')

# Editorial examples differ by language; these are not translations of Lu Xun.
# Only the brief two-line dialogue is quoted, not the surrounding passage.
ENGLISH_SAMPLE = {
    'title': "The Hitchhiker's Guide to the Galaxy",
    'author': 'Douglas Adams',
    'edition': '1979 · Brief quotation',
    'source': 'About the book',
    'source_url': 'https://penguinrandomhousesecondaryeducation.com/book/?isbn=9780345418913',
    'text': ('\"OK computer, I want full manual control now.\"', '\"You got it,\" said the computer.'),
    'firstWord': '\"OK',
    'progress': 'Demo group 1 / 14',
}

def translate(value):
    key = value.strip()
    if key in TRANSLATIONS:
        prefix = value[:len(value) - len(value.lstrip())]
        suffix = value[len(value.rstrip()):]
        return prefix + TRANSLATIONS[key] + suffix
    if CJK.search(value):
        raise ValueError(f'Missing translation: {value!r}')
    return value

class EnglishPage(HTMLParser):
    def __init__(self, name):
        super().__init__(convert_charrefs=False)
        self.output = []
        self.name = name
        self.sample_depth = 0

    def start(self, tag, attrs, close):
        translated = []
        language = dict(attrs).get('data-language')
        slot = dict(attrs).get('data-sample-slot')
        for key, value in attrs:
            if value is not None:
                if slot == 'source' and key == 'href': value = ENGLISH_SAMPLE['source_url']
                elif tag == 'html' and key == 'lang': value = 'en'
                elif key == 'href' and language:
                    value = ('../' if language == 'zh' else '') + self.name + '?lang=' + language
                elif key in ('aria-label', 'title', 'alt') or (tag == 'meta' and key == 'content'):
                    value = translate(value)
                elif key in ('src', 'href') and value in ASSETS: value = '../' + value
                elif key == 'href' and value == 'https://support.apple.com/zh-cn/102445':
                    value = 'https://support.apple.com/en-us/102445'
            translated.append(key if value is None else f'{key}="{escape(value, quote=True)}"')
        self.output.append('<' + tag + (' ' + ' '.join(translated) if translated else '') + close)

    def handle_starttag(self, tag, attrs):
        if self.sample_depth:
            self.sample_depth += 1
            return
        self.start(tag, attrs, '>')
        slot = dict(attrs).get('data-sample-slot')
        if slot:
            if slot == 'text':
                value = ' '.join(f'<span class="s{n + 1}">{escape(sentence, quote=False)}</span>'
                                 for n, sentence in enumerate(ENGLISH_SAMPLE[slot]))
            else:
                value = escape(ENGLISH_SAMPLE[slot], quote=False)
            self.output.append(value)
            self.sample_depth = 1

    def handle_startendtag(self, tag, attrs):
        if not self.sample_depth: self.start(tag, attrs, '/>')

    def handle_endtag(self, tag):
        if self.sample_depth:
            self.sample_depth -= 1
            if self.sample_depth: return
        self.output.append(f'</{tag}>')

    def handle_data(self, value):
        if not self.sample_depth: self.output.append(escape(translate(value), quote=False))

    def handle_entityref(self, name):
        if not self.sample_depth: self.output.append(f'&{name};')

    def handle_charref(self, name):
        if not self.sample_depth: self.output.append(f'&#{name};')
    def handle_decl(self, decl): self.output.append(f'<!{decl}>')
    def handle_comment(self, text): self.output.append(f'<!--{text}-->')

def main():
    (ROOT / 'en').mkdir(exist_ok=True)
    for name in ('index.html', 'privacy.html', 'copyright.html', 'third-party.html'):
        page = EnglishPage(name)
        page.feed((ROOT / name).read_text(encoding='utf-8'))
        content = re.sub(r'(</span>)(<span class="s[123]">)', r'\1 \2', ''.join(page.output))
        (ROOT / 'en' / name).write_text(content, encoding='utf-8')
        print(f'Generated en/{name}')

if __name__ == '__main__': main()

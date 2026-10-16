'use strict';

// CSV is the editable source. A generated snapshot supports opening index.html locally.
const ChisenI18n = (() => {
  const languages = ['es', 'zh', 'en', 'ja'];
  let catalog = new Map();

  function parseCSV(source) {
    const rows = [];
    let row = [], field = '', quoted = false;
    const input = source.replace(/^\uFEFF/, '');
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      if (char === '"') {
        if (quoted && input[i + 1] === '"') { field += '"'; i++; }
        else if (quoted || field === '') quoted = !quoted;
        else throw new Error('Invalid CSV quote.');
      } else if (char === ',' && !quoted) {
        row.push(field); field = '';
      } else if ((char === '\r' || char === '\n') && !quoted) {
        if (char === '\r' && input[i + 1] === '\n') i++;
        row.push(field);
        if (row.some(value => value !== '')) rows.push(row);
        row = []; field = '';
      } else field += char;
    }
    if (quoted) throw new Error('Unclosed CSV quote.');
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  async function readCSV(path) {
    if (location.protocol === 'file:') {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = new URL('translations.generated.js', new URL(path, document.baseURI)).href;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Missing local translation snapshot.'));
        document.head.appendChild(script);
      });
      const encoded = window.CHISEN_LOCAL_CSV;
      delete window.CHISEN_LOCAL_CSV;
      if (typeof encoded !== 'string') throw new Error('Invalid local translation snapshot.');
      return new TextDecoder('utf-8', {fatal: true}).decode(Uint8Array.from(atob(encoded), char => char.charCodeAt(0)));
    }
    const response = await fetch(path, {cache: 'no-cache'});
    if (!response.ok) throw new Error(`Cannot load ${path}: HTTP ${response.status}`);
    return response.text();
  }

  async function load(path) {
    const [header, ...rows] = parseCSV(await readCSV(path));
    if (!header || header[0] !== 'text_id' || languages.some(lang => !header.includes(lang))) {
      throw new Error('CSV must contain text_id, es, zh, en, ja columns.');
    }
    const next = new Map();
    for (const row of rows) {
      const id = row[0];
      if (!id || next.has(id) || row.length !== header.length) throw new Error(`Invalid or duplicate CSV text_id: ${id}`);
      const entry = Object.fromEntries(languages.map(lang => [lang, row[header.indexOf(lang)]]));
      if (!entry.es || !entry.en) throw new Error(`Missing Spanish or English translation: ${id}`);
      const placeholders = value => [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort().join(',');
      for (const lang of languages) {
        if (entry[lang] && placeholders(entry[lang]) !== placeholders(entry.en)) throw new Error(`Inconsistent placeholders: ${id}/${lang}`);
      }
      next.set(id, entry);
    }
    catalog = next;
  }

  function text(id, language = 'en', variables = {}) {
    const entry = catalog.get(id);
    if (!entry) throw new Error(`Unknown text_id: ${id}`);
    return (entry[language] || entry.en || entry.es).replace(/\{(\w+)\}/g, (_, name) => variables[name] ?? `{${name}}`);
  }

  function localize(root, language) {
    for (const element of root.querySelectorAll('[data-i18n]')) {
      element.textContent = text(element.dataset.i18n, language);
    }
    for (const attribute of ['aria-label', 'title', 'placeholder', 'data-info', 'content']) {
      const marker = `data-i18n-${attribute}`;
      for (const element of root.querySelectorAll(`[${marker}]`)) {
        element.setAttribute(attribute, text(element.getAttribute(marker), language));
      }
    }
  }

  return {load, text, localize, parseCSV, has: id => catalog.has(id)};
})();

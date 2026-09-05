const namedEntities: Record<string, string> = {
  amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: '\u00a0',
  agrave: 'à', acirc: 'â', auml: 'ä', aelig: 'æ', ccedil: 'ç',
  egrave: 'è', eacute: 'é', ecirc: 'ê', euml: 'ë',
  icirc: 'î', iuml: 'ï', ocirc: 'ô', ouml: 'ö', oelig: 'œ',
  ugrave: 'ù', ucirc: 'û', uuml: 'ü', yuml: 'ÿ',
  Agrave: 'À', Acirc: 'Â', Auml: 'Ä', AElig: 'Æ', Ccedil: 'Ç',
  Egrave: 'È', Eacute: 'É', Ecirc: 'Ê', Euml: 'Ë',
  Icirc: 'Î', Iuml: 'Ï', Ocirc: 'Ô', Ouml: 'Ö', OElig: 'Œ',
  Ugrave: 'Ù', Ucirc: 'Û', Uuml: 'Ü', Yuml: 'Ÿ',
  rsquo: '’', lsquo: '‘', laquo: '«', raquo: '»', ndash: '–', mdash: '—', hellip: '…',
};

export function decodeTextEntities(text: string): string {
  // Bounded passes also handle double encoding such as &amp;#224;.
  for (let pass = 0; pass < 3; pass += 1) {
    const decoded = text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, name: string) => {
      if (!name.startsWith('#')) return namedEntities[name] ?? entity;
      const hex = name[1].toLowerCase() === 'x';
      const codePoint = Number.parseInt(name.slice(hex ? 2 : 1), hex ? 16 : 10);
      if (codePoint <= 0 || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) return entity;
      return String.fromCodePoint(codePoint);
    });
    if (decoded === text) break;
    text = decoded;
  }
  return text;
}

/** Decode text values only; JSON keys and non-text values remain unchanged. */
export function decodeResponseText(value: unknown): unknown {
  if (typeof value === 'string') return decodeTextEntities(value);
  if (Array.isArray(value)) return value.map(decodeResponseText);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, decodeResponseText(item)]));
  }
  return value;
}

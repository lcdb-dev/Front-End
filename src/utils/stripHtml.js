function decodeHtmlEntities(text) {
  const entities = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&hellip;': '…',
    '&mdash;': '—',
    '&ndash;': '–',
    '&lsquo;': ''',
    '&rsquo;': ''',
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&bull;': '•',
    '&deg;': '°',
    '&frac12;': '½',
    '&frac14;': '¼',
    '&frac34;': '¾',
  };

  return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    return entities[entity] || entity;
  });
}

export function stripHtml(html = "") {
  const text = html.replace(/<[^>]*>?/gm, "");
  return decodeHtmlEntities(text).trim();
}

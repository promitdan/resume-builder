const FONT_LINK = [
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">',
].join('\n')

export function capturePreviewHtml() {
  const cards = Array.from(document.querySelectorAll('[data-page-card]'))
  if (!cards.length) throw new Error('No page cards found — preview may not be rendered yet')

  const pageHtml = cards.map((card, i) => {
    const clone = card.cloneNode(true)
    clone.style.boxShadow = 'none'
    clone.style.marginBottom = '0'
    if (i < cards.length - 1) {
      clone.style.breakAfter = 'page'
      clone.style.pageBreakAfter = 'always'
    }
    return clone.outerHTML
  }).join('\n')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
${FONT_LINK}
<style>
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; padding: 0; }
  @page { size: 745px 1054px; margin: 0; }
  .ProseMirror { outline: none; }
  .ProseMirror p { margin: 0; }
  .ProseMirror a { color: #2563eb; text-decoration: underline; }
</style>
</head>
<body>
${pageHtml}
</body>
</html>`
}

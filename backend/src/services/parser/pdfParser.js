const pdfParse = require('pdf-parse')

async function extractFromPdf(buffer) {
  const collectedUrls = []

  const pagerender = (pageData) => {
    const annotPromise = pageData.getAnnotations()
      .then(annotations => {
        for (const ann of annotations) {
          if (ann.subtype === 'Link' && ann.url) collectedUrls.push(ann.url)
        }
      })
      .catch(() => {})

    const textPromise = pageData
      .getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false })
      .then(textContent => {
        let lastY, text = ''
        for (const item of textContent.items) {
          if (lastY === item.transform[5] || !lastY) {
            text += item.str
          } else {
            text += '\n' + item.str
          }
          lastY = item.transform[5]
        }
        return text
      })

    return Promise.all([annotPromise, textPromise]).then(([, text]) => text)
  }

  const data = await pdfParse(buffer, { pagerender })
  return {
    text: data.text || '',
    urls: [...new Set(collectedUrls)],
  }
}

// Legacy export for any callers that only need text
async function extractTextFromPdf(buffer) {
  const { text } = await extractFromPdf(buffer)
  return text
}

module.exports = { extractFromPdf, extractTextFromPdf }

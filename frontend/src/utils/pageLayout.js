export const CONTENT_HEIGHT   = 11 * 96             // 1056px
export const PAGE_CONTENT_MAX = CONTENT_HEIGHT - 48  // 1008px — 48px bottom buffer
export const PAGE_GAP         = 24

function measureSectionsInEl(el, containerEl) {
  const ref = containerEl.getBoundingClientRect()
  const sections = []
  for (const sEl of el.querySelectorAll('[data-section]')) {
    const sr = sEl.getBoundingClientRect()
    const sTop = sr.top - ref.top
    const items = []
    for (const iEl of sEl.querySelectorAll('[data-item]')) {
      const ir = iEl.getBoundingClientRect()
      items.push({
        id:     iEl.dataset.item,
        top:    ir.top    - ref.top,
        bottom: ir.bottom - ref.top,
        height: ir.height,
      })
    }
    sections.push({
      id:           sEl.dataset.section,
      top:          sTop,
      bottom:       sr.bottom - ref.top,
      height:       sr.height,
      headerHeight: items.length > 0 ? items[0].top - sTop : sr.height,
      items,
    })
  }
  return sections
}

export function distributePages(sections, firstPageAvail, subsequentPageAvail) {
  const pages   = []
  let current   = []
  let used      = 0
  let isFirst   = true
  const seen    = new Set()

  const avail = () => isFirst ? firstPageAvail : subsequentPageAvail
  const flush = () => {
    current.forEach(e => seen.add(e.sectionId))
    pages.push(current)
    current = []
    used    = 0
    isFirst = false
  }

  for (const sec of sections) {
    // Atomic section (no items — e.g. skills block, custom section)
    if (sec.items.length === 0) {
      if (used > 0 && used + sec.height > avail()) flush()
      current.push({ sectionId: sec.id, items: null, isContinuation: seen.has(sec.id) })
      used += sec.height
      continue
    }

    // Section with distributable items
    let entry = null
    for (const item of sec.items) {
      const hdr    = entry ? 0 : sec.headerHeight
      const needed = hdr + item.height
      if (used > 0 && used + needed > avail()) {
        flush()
        entry = null
      }
      if (!entry) {
        entry = { sectionId: sec.id, items: [], isContinuation: seen.has(sec.id) }
        current.push(entry)
        used += sec.headerHeight
      }
      entry.items.push(item.id)
      used += item.height
    }
  }

  if (current.length > 0) pages.push(current)
  return pages
}

const ARRAY_SECTIONS = [
  'experience', 'education', 'skills', 'projects',
  'certifications', 'languages', 'awards', 'custom',
]

export function sliceContent(fullContent, pageAssignment, pageIndex) {
  const slice       = { ...fullContent }
  const assignedIds = new Set(pageAssignment.map(a => a.sectionId))

  // Zero out all array sections; restore only what's assigned to this page
  ARRAY_SECTIONS.forEach(k => { slice[k] = [] })

  // Hide summary if not on this page
  if (!assignedIds.has('summary')) {
    slice.personal = { ...slice.personal, summary: '' }
  }

  for (const { sectionId, items, isContinuation } of pageAssignment) {
    if (sectionId === 'summary') continue

    if (items === null) {
      // Atomic section — include full array
      slice[sectionId] = fullContent[sectionId] ?? []
    } else {
      // Item-level slice
      const idSet    = new Set(items)
      const filtered = (fullContent[sectionId] ?? []).filter(item => idSet.has(item.id))
      slice[sectionId] = isContinuation && filtered.length > 0
        ? [{ ...filtered[0], _isContinuation: true }, ...filtered.slice(1)]
        : filtered
    }
  }

  return slice
}

export function measureAndDistribute(containerEl, isTwoColumn) {
  const hdrEl       = containerEl.querySelector('[data-page-header]')
  const headerHeight = hdrEl ? hdrEl.getBoundingClientRect().height : 0

  const firstPageAvail      = PAGE_CONTENT_MAX - headerHeight
  const subsequentPageAvail = PAGE_CONTENT_MAX

  if (!isTwoColumn) {
    const sections = measureSectionsInEl(containerEl, containerEl)
    const pages    = distributePages(sections, firstPageAvail, subsequentPageAvail)
    return { type: 'single', pages }
  }

  const colEls      = containerEl.querySelectorAll('[data-col]')
  const colSections = { left: [], right: [] }
  for (const colEl of colEls) {
    const side = colEl.dataset.col
    if (side === 'left' || side === 'right') {
      colSections[side] = measureSectionsInEl(colEl, containerEl)
    }
  }

  const leftPages  = distributePages(colSections.left,  firstPageAvail, subsequentPageAvail)
  const rightPages = distributePages(colSections.right, firstPageAvail, subsequentPageAvail)
  const totalPages = Math.max(leftPages.length, rightPages.length, 1)

  return { type: 'two-column', leftPages, rightPages, totalPages }
}

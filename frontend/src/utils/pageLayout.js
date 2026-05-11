export const PAGE_WIDTH       = 745
export const CONTENT_HEIGHT   = 1054
export const PAGE_CONTENT_MAX = CONTENT_HEIGHT - 48  // 1006px — 48px bottom buffer
export const PAGE_GAP         = 24

function measureSectionsInEl(el, containerEl) {
  const ref = containerEl.getBoundingClientRect()
  const sections = []
  for (const sEl of el.querySelectorAll('[data-section]')) {
    const sr   = sEl.getBoundingClientRect()
    const sTop = sr.top - ref.top
    const items = []
    for (const iEl of sEl.querySelectorAll('[data-item]')) {
      const ir      = iEl.getBoundingClientRect()
      const itemTop = ir.top - ref.top
      const subitems = []
      for (const siEl of iEl.querySelectorAll('[data-subitem]')) {
        const sir = siEl.getBoundingClientRect()
        subitems.push({
          id:     siEl.dataset.subitem,
          top:    sir.top    - ref.top,
          bottom: sir.bottom - ref.top,
          height: sir.height,
        })
      }
      items.push({
        id:           iEl.dataset.item,
        top:          itemTop,
        bottom:       ir.bottom - ref.top,
        height:       ir.height,
        headerHeight: subitems.length > 0 ? subitems[0].top - itemTop : ir.height,
        subitems,
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

// firstPageMaxBottom: max allowed sec.bottom / item.bottom on page 1 — uses actual DOM
//   positions so inter-section gaps and template padding are automatically accounted for.
// subsequentPageAvail: cumulative-height budget for pages 2+ (approximation, since we
//   can't measure exact positions without re-rendering every page).
export function distributePages(sections, firstPageMaxBottom, subsequentPageAvail) {
  const pages   = []
  let current   = []
  let used      = 0
  let isFirst   = true
  const seen    = new Set()

  const flush = () => {
    current.forEach(e => seen.add(e.sectionId))
    pages.push(current)
    current = []
    used    = 0
    isFirst = false
  }

  for (const sec of sections) {
    if (sec.items.length === 0) {
      // Atomic section — intentional: allow overflow rather than emitting an empty page
      const wouldFlush = isFirst
        ? sec.bottom > firstPageMaxBottom && current.length > 0
        : used > 0 && used + sec.height > subsequentPageAvail
      if (wouldFlush) flush()
      current.push({ sectionId: sec.id, items: null, isContinuation: seen.has(sec.id) })
      if (!isFirst) used += sec.height
      continue
    }

    // Section with distributable items
    let entry = null
    for (const item of sec.items) {
      if (item.subitems.length === 0) {
        // Atomic item — original behavior
        const hdr = entry ? 0 : sec.headerHeight
        const wouldFlush = isFirst
          ? item.bottom > firstPageMaxBottom && current.length > 0
          : used > 0 && used + hdr + item.height > subsequentPageAvail
        if (wouldFlush) {
          flush()
          entry = null
        }
        // intentional: if a single item exceeds a full page, it still goes on the
        // current (empty) page rather than looping forever
        if (!entry) {
          entry = { sectionId: sec.id, items: [], isContinuation: seen.has(sec.id) }
          current.push(entry)
          if (!isFirst) used += sec.headerHeight
        }
        entry.items.push({ id: item.id, subitems: null, isBulletContinuation: false })
        if (!isFirst) used += item.height
      } else {
        // Item with subitems — split at subitem boundary
        let itemEntry = null
        for (let si = 0; si < item.subitems.length; si++) {
          const subitem      = item.subitems[si]
          const needsSecHdr  = !entry
          const needsItemHdr = !itemEntry && si === 0
          const wouldFlush = isFirst
            ? subitem.bottom > firstPageMaxBottom && current.length > 0
            : used > 0 && used
                + (needsSecHdr  ? sec.headerHeight  : 0)
                + (needsItemHdr ? item.headerHeight : 0)
                + subitem.height > subsequentPageAvail
          if (wouldFlush) {
            flush()
            entry     = null
            itemEntry = null
          }
          if (!entry) {
            entry = { sectionId: sec.id, items: [], isContinuation: seen.has(sec.id) }
            current.push(entry)
            if (!isFirst) used += sec.headerHeight
          }
          if (!itemEntry) {
            const isBulletContinuation = si > 0
            itemEntry = { id: item.id, subitems: [], isBulletContinuation }
            entry.items.push(itemEntry)
            if (!isFirst && !isBulletContinuation) used += item.headerHeight
          }
          itemEntry.subitems.push(subitem.id)
          if (!isFirst) used += subitem.height
        }
      }
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
    if (!ARRAY_SECTIONS.includes(sectionId)) continue

    if (items === null) {
      // Atomic section — include full array
      slice[sectionId] = fullContent[sectionId] ?? []
    } else if (sectionId === 'skills') {
      // Skills: reconstruct nested group structure from sk-{gi}-{ii} IDs
      const assignedSkillIds = new Set(items.map(a => a.id))
      const reconstructed = (fullContent.skills ?? []).map((group, gi) => ({
        ...group,
        items: (group.items ?? []).filter((_, ii) => assignedSkillIds.has(`sk-${gi}-${ii}`)),
      })).filter(group => group.items.length > 0)
      if (isContinuation && reconstructed.length > 0) {
        reconstructed[0] = { ...reconstructed[0], _isContinuation: true }
      }
      slice.skills = reconstructed
    } else {
      // Sections with distributable items (experience, education, projects, etc.)
      const itemMap  = new Map(items.map(a => [a.id, a]))
      const fullArr  = fullContent[sectionId] ?? []
      const filtered = fullArr
        .filter(item => itemMap.has(item.id))
        .map(item => {
          const assignment = itemMap.get(item.id)
          if (assignment.subitems === null) return item
          const subitemSet = new Set(assignment.subitems)
          return {
            ...item,
            bullets: (item.bullets ?? []).filter((_, bi) => subitemSet.has(`bullet-${bi}`)),
            _bulletContinuation: assignment.isBulletContinuation,
          }
        })
      slice[sectionId] = isContinuation && filtered.length > 0
        ? [{ ...filtered[0], _isContinuation: true }, ...filtered.slice(1)]
        : filtered
    }
  }

  return slice
}

// containerScale: the CSS transform scale applied to an ancestor of containerEl.
// getBoundingClientRect() returns viewport-space coords that include ancestor transforms,
// so all measured positions are already multiplied by containerScale. We scale the
// PAGE_CONTENT_MAX threshold by the same factor so comparisons remain correct.
export function measureAndDistribute(containerEl, isTwoColumn, containerScale = 1) {
  const scaledMax    = PAGE_CONTENT_MAX * containerScale
  const containerTop = containerEl.getBoundingClientRect().top
  const hdrEl        = containerEl.querySelector('[data-page-header]')
  const headerBottom = hdrEl ? hdrEl.getBoundingClientRect().bottom - containerTop : 0

  const firstPageMaxBottom = scaledMax

  if (!isTwoColumn) {
    const sections = measureSectionsInEl(containerEl, containerEl)

    const firstSectionTop     = sections.length > 0 ? sections[0].top : headerBottom
    const topGap              = Math.max(0, firstSectionTop - headerBottom)
    const subsequentPageAvail = Math.max(scaledMax / 2, scaledMax - topGap)

    const pages = distributePages(sections, firstPageMaxBottom, subsequentPageAvail)
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

  const allSections     = [...colSections.left, ...colSections.right]
  const firstSectionTop = allSections.length > 0
    ? Math.min(...allSections.map(s => s.top))
    : headerBottom
  const topGap              = Math.max(0, firstSectionTop - headerBottom)
  const subsequentPageAvail = Math.max(scaledMax / 2, scaledMax - topGap)

  const leftPages  = distributePages(colSections.left,  firstPageMaxBottom, subsequentPageAvail)
  const rightPages = distributePages(colSections.right, firstPageMaxBottom, subsequentPageAvail)
  const totalPages = Math.max(leftPages.length, rightPages.length, 1)

  return { type: 'two-column', leftPages, rightPages, totalPages }
}

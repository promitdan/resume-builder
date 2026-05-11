import { useRef, useState } from 'react'
import { useResumeStore }   from '../../store/useResumeStore'
import { TEMPLATE_CONFIGS } from '../../registry/templateRegistry'

const SECTION_LABELS = {
  experience: 'Experience', education: 'Education', skills: 'Skills',
  projects: 'Projects', certifications: 'Certifications', languages: 'Languages',
  awards: 'Awards', custom: 'Custom',
}

const LockIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" width="12" height="12" style={{ flexShrink: 0 }}>
    <rect x="3" y="7" width="10" height="8" rx="1.5" fill="#cbd5e1" />
    <path d="M5 7V5a3 3 0 016 0v2" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

const DragHandle = () => (
  <span style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1, flexShrink: 0, cursor: 'grab' }}>⠿</span>
)

function LockedRow({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 8px', borderRadius: 6,
      background: '#f8fafc', border: '1px solid #e2e8f0',
      marginBottom: 4,
    }}>
      <LockIcon />
      <span style={{ fontSize: 12, color: '#94a3b8', flex: 1 }}>{label}</span>
    </div>
  )
}

function SectionRow({ id, col, dropTarget, onDragStart, onDragOver, onDragLeave, onDrop }) {
  const isDropTarget = dropTarget?.id === id && dropTarget?.col === col
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, id, col)}
      onDragOver={(e) => onDragOver(e, id, col)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, id, col)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 8px', borderRadius: 6,
        background: isDropTarget ? '#f0f2f8' : '#fff',
        border: `1px solid ${isDropTarget ? '#94a3b8' : '#e2e8f0'}`,
        marginBottom: 4, userSelect: 'none',
        transition: 'border-color 0.1s, background 0.1s',
      }}
    >
      <DragHandle />
      <span style={{ fontSize: 12, color: '#334155', flex: 1 }}>
        {SECTION_LABELS[id] ?? id}
      </span>
    </div>
  )
}

export default function SectionsPanel() {
  const templateId          = useResumeStore(s => s.templateId)
  const content             = useResumeStore(s => s.content)
  const leftColumnOrder     = useResumeStore(s => s.leftColumnOrder)
  const rightColumnOrder    = useResumeStore(s => s.rightColumnOrder)
  const setLeftColumnOrder  = useResumeStore(s => s.setLeftColumnOrder)
  const setRightColumnOrder = useResumeStore(s => s.setRightColumnOrder)
  const reorderSections     = useResumeStore(s => s.reorderSections)

  const isTwoColumn      = TEMPLATE_CONFIGS[templateId]?.layoutType === 'two-column'
  const moveableSections = (content.sectionOrder ?? []).filter(k => k !== 'personal')

  const dragRef                     = useRef({ id: null, col: null })
  const [dropTarget, setDropTarget] = useState(null)

  function handleDragStart(e, id, col) {
    dragRef.current = { id, col }
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, id, col) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTarget({ id, col })
  }

  function handleDragLeave() {
    setDropTarget(null)
  }

  function handleDrop(e, targetId, targetCol) {
    e.preventDefault()
    e.stopPropagation()
    setDropTarget(null)
    const { id: draggedId, col: sourceCol } = dragRef.current
    dragRef.current = { id: null, col: null }
    if (!draggedId || draggedId === targetId) return

    if (!isTwoColumn || sourceCol === targetCol) {
      const list = sourceCol === 'left'  ? [...leftColumnOrder]
                 : sourceCol === 'right' ? [...rightColumnOrder]
                 : [...moveableSections]
      const fromIdx = list.indexOf(draggedId)
      const toIdx   = list.indexOf(targetId)
      if (fromIdx < 0 || toIdx < 0) return
      list.splice(fromIdx, 1)
      list.splice(toIdx, 0, draggedId)
      if (sourceCol === 'left')        setLeftColumnOrder(list)
      else if (sourceCol === 'right')  setRightColumnOrder(list)
      else                             reorderSections(['personal', ...list])
    } else {
      const newLeft  = leftColumnOrder.filter(k => k !== draggedId)
      const newRight = rightColumnOrder.filter(k => k !== draggedId)
      if (targetCol === 'left') {
        const toIdx = newLeft.indexOf(targetId)
        if (toIdx < 0) return
        newLeft.splice(toIdx, 0, draggedId)
      } else {
        const toIdx = newRight.indexOf(targetId)
        if (toIdx < 0) return
        newRight.splice(toIdx, 0, draggedId)
      }
      setLeftColumnOrder(newLeft)
      setRightColumnOrder(newRight)
    }
  }

  function handleDropOnColumn(e, targetCol) {
    e.preventDefault()
    setDropTarget(null)
    const { id: draggedId, col: sourceCol } = dragRef.current
    dragRef.current = { id: null, col: null }
    if (!draggedId || sourceCol === targetCol) return
    const newLeft  = leftColumnOrder.filter(k => k !== draggedId)
    const newRight = rightColumnOrder.filter(k => k !== draggedId)
    if (targetCol === 'left') {
      setLeftColumnOrder([...newLeft, draggedId])
      setRightColumnOrder(newRight)
    } else {
      setLeftColumnOrder(newLeft)
      setRightColumnOrder([...newRight, draggedId])
    }
  }

  const rowProps = { dropTarget, onDragStart: handleDragStart, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop }

  if (!isTwoColumn) {
    return (
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', marginBottom: 9 }}>
          Sections
        </div>
        <LockedRow label="Personal" />
        {moveableSections.map(id => <SectionRow key={id} id={id} col={null} {...rowProps} />)}
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', marginBottom: 9 }}>
        Sections
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Left column</div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDropOnColumn(e, 'left')}
          style={{ minHeight: 36 }}
        >
          <LockedRow label="Personal" />
          {(leftColumnOrder ?? []).map(id => <SectionRow key={id} id={id} col="left" {...rowProps} />)}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Right column</div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDropOnColumn(e, 'right')}
          style={{ minHeight: 36 }}
        >
          {(rightColumnOrder ?? []).map(id => <SectionRow key={id} id={id} col="right" {...rowProps} />)}
        </div>
      </div>
    </div>
  )
}

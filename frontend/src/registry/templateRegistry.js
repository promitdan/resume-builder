import classicTpl          from '../templates/classic.json'
import classicAcademicTpl  from '../templates/classic-academic.json'
import classicFormalTpl    from '../templates/classic-formal.json'
import modernTpl           from '../templates/modern.json'
import modernSidebarTpl    from '../templates/modern-sidebar.json'
import modernBannerTpl     from '../templates/modern-banner.json'
import modernSplitTpl      from '../templates/modern-split.json'
import minimalTpl          from '../templates/minimal.json'
import minimalColumnsTpl   from '../templates/minimal-columns.json'
import minimalBoxedTpl     from '../templates/minimal-boxed.json'
import minimalSerifTpl     from '../templates/minimal-serif.json'
import executiveTpl        from '../templates/executive.json'
import executiveBandTpl    from '../templates/executive-band.json'
import executiveSidebarTpl from '../templates/executive-sidebar.json'
import creativeTpl         from '../templates/creative.json'
import creativeStarTpl    from '../templates/creative-star.json'
import creativeMinimalTpl from '../templates/creative-minimal.json'

export const TEMPLATE_CONFIGS = {
  'classic-traditional': classicTpl,
  'classic-academic':    classicAcademicTpl,
  'classic-formal':      classicFormalTpl,
  'modern':              modernTpl,
  'modern-sidebar':      modernSidebarTpl,
  'modern-banner':       modernBannerTpl,
  'modern-split':        modernSplitTpl,
  'minimal':             minimalTpl,
  'minimal-columns':    minimalColumnsTpl,
  'minimal-boxed':      minimalBoxedTpl,
  'minimal-serif':      minimalSerifTpl,
  'executive':           executiveTpl,
  'executive-band':      executiveBandTpl,
  'executive-sidebar':   executiveSidebarTpl,
  'creative':            creativeTpl,
  'creative-star':       creativeStarTpl,
  'creative-minimal':    creativeMinimalTpl,
}

export const CATEGORIES = [
  {
    id: 'classic', label: 'Classic',
    templates: [
      { id: 'classic-traditional', label: 'Traditional' },
      { id: 'classic-academic',    label: 'Academic'    },
      { id: 'classic-formal',      label: 'Formal'      },
    ],
  },
  {
    id: 'modern', label: 'Modern',
    templates: [
      { id: 'modern',         label: 'Classic'  },
      { id: 'modern-sidebar', label: 'Sidebar'  },
      { id: 'modern-banner',  label: 'Banner'   },
      { id: 'modern-split',   label: 'Split'    },
    ],
  },
  {
    id: 'minimal', label: 'Minimal',
    templates: [
      { id: 'minimal',         label: 'Classic' },
      { id: 'minimal-columns', label: 'Columns' },
      { id: 'minimal-boxed',   label: 'Boxed'   },
      { id: 'minimal-serif',   label: 'Serif'   },
    ],
  },
  {
    id: 'executive', label: 'Executive',
    templates: [
      { id: 'executive',          label: 'Classic' },
      { id: 'executive-band',     label: 'Band'    },
      { id: 'executive-sidebar',  label: 'Sidebar' },
    ],
  },
  {
    id: 'creative', label: 'Creative',
    templates: [
      { id: 'creative',         label: 'Classic' },
      { id: 'creative-star',    label: 'Star'    },
      { id: 'creative-minimal', label: 'Minimal' },
    ],
  },
]

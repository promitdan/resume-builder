import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import WizardLayout         from '../components/wizard/WizardLayout'
import PersonalInfoStep     from '../components/wizard/PersonalInfoStep'
import ExperienceStep       from '../components/wizard/ExperienceStep'
import EducationStep        from '../components/wizard/EducationStep'
import SkillsStep           from '../components/wizard/SkillsStep'
import OptionalSectionsStep from '../components/wizard/OptionalSectionsStep'
import TemplateGallery      from '../components/wizard/TemplateGallery'
import { useResumeStore }   from '../store/useResumeStore'

const STEPS = [
  { title: 'Personal',   component: PersonalInfoStep     },
  { title: 'Experience', component: ExperienceStep       },
  { title: 'Education',  component: EducationStep        },
  { title: 'Skills',     component: SkillsStep           },
  { title: 'Optional',   component: OptionalSectionsStep },
]

export default function BuildPage() {
  const location   = useLocation()
  const fromPreview = location.state?.fromPreview === true

  const [phase, setPhase]                   = useState(fromPreview ? 'editor' : 'gallery')
  const [currentStep, setCurrentStep]       = useState(0)
  const [maxVisitedStep, setMaxVisitedStep] = useState(fromPreview ? STEPS.length - 1 : 0)
  const navigate                            = useNavigate()
  const setTemplateId                       = useResumeStore(s => s.setTemplateId)

  function handleGalleryStart(templateId) {
    setTemplateId(templateId)
    setCurrentStep(0)
    setMaxVisitedStep(0)
    setPhase('editor')
  }

  function handleNext() {
    if (currentStep === STEPS.length - 1) {
      navigate('/preview')
    } else {
      const next = Math.min(currentStep + 1, STEPS.length - 1)
      setCurrentStep(next)
      setMaxVisitedStep(s => Math.max(s, next))
    }
  }

  function handleStepClick(index) {
    if (index <= maxVisitedStep) setCurrentStep(index)
  }

  if (phase === 'gallery') {
    return <TemplateGallery onStart={handleGalleryStart} />
  }

  return (
    <WizardLayout
      steps={STEPS}
      currentStep={currentStep}
      maxVisitedStep={maxVisitedStep}
      onNext={handleNext}
      onStepClick={handleStepClick}
      onChangeTemplate={() => setPhase('gallery')}
    />
  )
}

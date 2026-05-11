import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const [phase, setPhase]             = useState('gallery')
  const [currentStep, setCurrentStep] = useState(0)
  const navigate                      = useNavigate()
  const setTemplateId                 = useResumeStore(s => s.setTemplateId)

  function handleGalleryStart(templateId) {
    setTemplateId(templateId)
    setCurrentStep(0)
    setPhase('editor')
  }

  function handleNext() {
    if (currentStep === STEPS.length - 1) navigate('/preview')
    else setCurrentStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  function handleStepClick(index) {
    if (index < currentStep) setCurrentStep(index)
  }

  if (phase === 'gallery') {
    return <TemplateGallery onStart={handleGalleryStart} />
  }

  return (
    <WizardLayout
      steps={STEPS}
      currentStep={currentStep}
      onNext={handleNext}
      onStepClick={handleStepClick}
      onChangeTemplate={() => setPhase('gallery')}
    />
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WizardLayout         from '../components/wizard/WizardLayout'
import PersonalInfoStep     from '../components/wizard/PersonalInfoStep'
import ExperienceStep       from '../components/wizard/ExperienceStep'
import EducationStep        from '../components/wizard/EducationStep'
import SkillsStep           from '../components/wizard/SkillsStep'
import OptionalSectionsStep from '../components/wizard/OptionalSectionsStep'
import TemplatePickerStep   from '../components/wizard/TemplatePickerStep'
import PreviewStep          from '../components/wizard/PreviewStep'
import { useResumeStore }   from '../store/useResumeStore'

const STEPS = [
  { title: 'Personal Info',      component: PersonalInfoStep     },
  { title: 'Work Experience',    component: ExperienceStep       },
  { title: 'Education',          component: EducationStep        },
  { title: 'Skills',             component: SkillsStep           },
  { title: 'Optional Sections',  component: OptionalSectionsStep },
  { title: 'Choose Template',    component: TemplatePickerStep   },
  { title: 'Preview',            component: PreviewStep          },
]

export default function BuildPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const navigate    = useNavigate()
  const personalName = useResumeStore(s => s.content.personal.name)
  const hasContent  = !!personalName

  function handleNext() {
    if (currentStep === STEPS.length - 1) navigate('/preview')
    else setCurrentStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  function handleStepClick(index) {
    if (hasContent || index < currentStep) setCurrentStep(index)
  }

  return (
    <WizardLayout
      steps={STEPS}
      currentStep={currentStep}
      onNext={handleNext}
      onStepClick={handleStepClick}
      hasContent={hasContent}
    />
  )
}

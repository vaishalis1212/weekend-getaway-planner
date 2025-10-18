import { useState } from 'react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import VibeSelection from './VibeSelection'
import DepartureCity from './DepartureCity'
import BudgetSlider from './BudgetSlider'
import DateRangePicker from './DateRangePicker'
import InterestTags from './InterestTags'

function PreferenceWizard({ onComplete, onClose }) {
  const [wizardData, setWizardData] = useState({
    currentStep: 1,
    selectedVibe: null,
    departureCity: null,
    budget: 35000,
    startDate: '',
    endDate: '',
    interests: []
  })

  const totalSteps = 5

  const updateData = (field, value) => {
    setWizardData(prev => ({ ...prev, [field]: value }))
  }

  const goToNextStep = () => {
    if (wizardData.currentStep < totalSteps) {
      setWizardData(prev => ({ ...prev, currentStep: prev.currentStep + 1 }))
    } else {
      // Generate query and complete wizard
      const query = generateQuery(wizardData)
      onComplete(query, wizardData)
    }
  }

  const goToPreviousStep = () => {
    if (wizardData.currentStep > 1) {
      setWizardData(prev => ({ ...prev, currentStep: prev.currentStep - 1 }))
    }
  }

  const generateQuery = (data) => {
    const { selectedVibe, departureCity, budget, startDate, endDate, interests } = data

    let query = `I'm looking for a ${selectedVibe} weekend getaway from ${departureCity}, `
    query += `budget ₹${budget.toLocaleString('en-IN')} for 2 people. `
    query += `Traveling from ${startDate} to ${endDate}.`

    if (interests.length > 0) {
      query += ` We're interested in ${interests.join(', ')}.`
    }

    query += ` Show me personalized recommendations!`

    return query
  }

  const isStepValid = () => {
    switch (wizardData.currentStep) {
      case 1:
        return wizardData.selectedVibe !== null
      case 2:
        return wizardData.departureCity !== null
      case 3:
        return wizardData.budget >= 20000 && wizardData.budget <= 100000
      case 4:
        return wizardData.startDate && wizardData.endDate &&
               new Date(wizardData.endDate) > new Date(wizardData.startDate)
      case 5:
        return true // Interests are optional - always valid
      default:
        return false
    }
  }

  const getErrorMessage = () => {
    switch (wizardData.currentStep) {
      case 1:
        return 'Please select your vibe to continue'
      case 2:
        return 'Please select your departure city to continue'
      case 3:
        return 'Please set your budget to continue'
      case 4:
        if (!wizardData.startDate || !wizardData.endDate) {
          return 'Please select both start and end dates'
        }
        if (new Date(wizardData.endDate) <= new Date(wizardData.startDate)) {
          return 'End date must be after start date'
        }
        return ''
      default:
        return ''
    }
  }

  const renderStepContent = () => {
    switch (wizardData.currentStep) {
      case 1:
        return <VibeSelection data={wizardData} updateData={updateData} />
      case 2:
        return <DepartureCity data={wizardData} updateData={updateData} />
      case 3:
        return <BudgetSlider data={wizardData} updateData={updateData} />
      case 4:
        return <DateRangePicker data={wizardData} updateData={updateData} />
      case 5:
        return <InterestTags data={wizardData} updateData={updateData} />
      default:
        return null
    }
  }

  const progressPercentage = (wizardData.currentStep / totalSteps) * 100

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-labelledby="wizard-title">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-4xl h-[700px] flex flex-col animate-fadeIn border-2 border-neutral-light overflow-hidden">
        {/* Header */}
        <div className="bg-warm-gradient p-6 text-white flex-shrink-0 rounded-t-2xl relative">
          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
              aria-label="Close wizard and return to hero page"
            >
              <X size={24} aria-hidden="true" />
            </button>
          )}

          <h2 id="wizard-title" className="text-3xl font-bold mb-2 pr-12">Plan Your Perfect Getaway</h2>
          <p className="text-white/95">Tell us your preferences and we'll create the ideal itinerary</p>

          {/* Progress Bar */}
          <div className="mt-4" role="progressbar" aria-valuenow={Math.round(progressPercentage)} aria-valuemin="0" aria-valuemax="100">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Step {wizardData.currentStep} of {totalSteps}</span>
              <span className="font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2.5 border border-white/40">
              <div
                className="bg-white rounded-full h-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content - Fixed height container */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto min-h-0">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="bg-background p-6 border-t-2 border-neutral-light flex-shrink-0 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <button
              onClick={goToPreviousStep}
              disabled={wizardData.currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-0 disabled:cursor-not-allowed hover:bg-neutral-light border-2 border-transparent hover:border-neutral focus:outline-none focus:ring-focus focus:ring-primary focus:ring-offset-focus text-text-primary"
              aria-label="Go to previous step"
            >
              <ArrowLeft size={20} aria-hidden="true" />
              Back
            </button>

            <button
              onClick={goToNextStep}
              disabled={!isStepValid()}
              className="flex items-center gap-2 px-8 py-3 bg-nature-gradient text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-focus focus:ring-primary focus:ring-offset-focus hover:brightness-110"
              aria-label={wizardData.currentStep === totalSteps ? 'Get your personalized plan' : 'Go to next step'}
            >
              {wizardData.currentStep === totalSteps ? 'Get My Plan' : 'Next'}
              {wizardData.currentStep < totalSteps && <ArrowRight size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreferenceWizard

import { Mic, Volume2, Activity, AlertTriangle, Brain, FileText, Stethoscope, CheckCircle, XCircle, BarChart, ListChecks, Share2 } from "lucide-react"

export const StepOneDetails = () => (
  <div className="space-y-4">
    <h3 className="text-base font-semibold flex items-center gap-1.5">
      <Mic className="w-4 h-4 text-[#ff7757]" />
      Recording Process
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-xs font-medium flex items-center gap-1.5 mb-1.5">
          <Volume2 className="w-3 h-3 text-[#1a2352]" />
          Environment Requirements
        </h4>
        <ul className="space-y-1 text-xs text-gray-600">
          <li>• Quiet room with minimal noise</li>
          <li>• Close windows to reduce noise</li>
          <li>• Turn off appliances nearby</li>
          <li>• Sit in an upright position</li>
        </ul>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-xs font-medium flex items-center gap-1.5 mb-1.5">
          <Activity className="w-3 h-3 text-[#1a2352]" />
          Breathing Technique
        </h4>
        <ul className="space-y-1 text-xs text-gray-600">
          <li>• Take normal, natural breaths</li>
          <li>• Hold device 4-6 inches away</li>
          <li>• Breathe for 30 seconds</li>
          <li>• Include coughs if needed</li>
        </ul>
      </div>
    </div>
    
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs">
      <h4 className="font-medium flex items-center gap-1.5 mb-1 text-amber-700">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        Important Note
      </h4>
      <p className="text-amber-700">
        This tool is for preliminary screening only and does not replace professional medical diagnosis.
      </p>
    </div>
  </div>
)

export const StepTwoDetails = () => (
  <div className="space-y-4">
    <h3 className="text-base font-semibold flex items-center gap-1.5">
      <Brain className="w-4 h-4 text-[#ff7757]" />
      AI Analysis Process
    </h3>
    
    <div className="space-y-2.5">
      <div className="border-l-3 border-[#1a2352] pl-2.5">
        <h4 className="text-xs font-medium mb-0.5">Sound Processing</h4>
        <p className="text-xs text-gray-600">
          Converts breathing audio into spectrograms - visual representations that highlight imperceptible patterns.
        </p>
      </div>
      
      <div className="border-l-3 border-[#1a2352] pl-2.5">
        <h4 className="text-xs font-medium mb-0.5">Pattern Recognition</h4>
        <p className="text-xs text-gray-600">
          Deep learning models identify patterns associated with various respiratory conditions.
        </p>
      </div>
      
      <div className="border-l-3 border-[#1a2352] pl-2.5">
        <h4 className="text-xs font-medium mb-0.5">Anomaly Detection</h4>
        <p className="text-xs text-gray-600">
          Compares patterns with healthy profiles to identify abnormalities indicating concerns.
        </p>
      </div>
    </div>
    
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs">
      <h4 className="font-medium mb-1 text-blue-700">Technology</h4>
      <p className="text-blue-700">
        Uses CNN and RNN neural networks specialized for audio processing and medical diagnostics.
      </p>
    </div>
  </div>
)

export const StepThreeDetails = () => (
  <div className="space-y-4">
    <h3 className="text-base font-semibold flex items-center gap-1.5">
      <FileText className="w-4 h-4 text-[#ff7757]" />
      Understanding Your Report
    </h3>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-xs font-medium flex items-center gap-1.5 mb-1.5">
          <BarChart className="w-3 h-3 text-[#1a2352]" />
          Visualizations
        </h4>
        <ul className="space-y-1 text-xs text-gray-600">
          <li>• Breathing pattern waveforms</li>
          <li>• Frequency analysis graphs</li>
          <li>• Anomaly indicators</li>
          <li>• Baseline comparisons</li>
        </ul>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-xs font-medium flex items-center gap-1.5 mb-1.5">
          <ListChecks className="w-3 h-3 text-[#1a2352]" />
          Assessment Metrics
        </h4>
        <ul className="space-y-1 text-xs text-gray-600">
          <li>• Breathing regularity score</li>
          <li>• Lung capacity estimation</li>
          <li>• Airflow restriction levels</li>
          <li>• Respiratory risk assessment</li>
        </ul>
      </div>
    </div>
    
    <div className="space-y-2">
      <h4 className="text-xs font-medium">Risk Classification</h4>
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center p-1.5 border rounded-md">
          <CheckCircle className="w-3 h-3 text-green-500 mr-1.5" />
          <div>
            <div className="font-medium text-2xs">Normal</div>
            <div className="text-2xs text-gray-500">No concerns</div>
          </div>
        </div>
        <div className="flex items-center p-1.5 border rounded-md">
          <AlertTriangle className="w-3 h-3 text-amber-500 mr-1.5" />
          <div>
            <div className="font-medium text-2xs">Moderate</div>
            <div className="text-2xs text-gray-500">Follow-up</div>
          </div>
        </div>
        <div className="flex items-center p-1.5 border rounded-md">
          <XCircle className="w-3 h-3 text-red-500 mr-1.5" />
          <div>
            <div className="font-medium text-2xs">High Risk</div>
            <div className="text-2xs text-gray-500">See doctor</div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export const StepFourDetails = () => (
  <div className="space-y-4">
    <h3 className="text-base font-semibold flex items-center gap-1.5">
      <Stethoscope className="w-4 h-4 text-[#ff7757]" />
      Professional Follow-up
    </h3>
    
    <div className="space-y-2.5">
      <div className="border-l-3 border-[#1a2352] pl-2.5">
        <h4 className="text-xs font-medium mb-0.5">Sharing Results</h4>
        <p className="text-xs text-gray-600">
          Securely share analysis results with healthcare providers for better diagnostic information.
        </p>
      </div>
      
      <div className="border-l-3 border-[#1a2352] pl-2.5">
        <h4 className="text-xs font-medium mb-0.5">Specialist Referrals</h4>
        <p className="text-xs text-gray-600">
          Connect with pulmonologists, respiratory therapists, or other specialists if needed.
        </p>
      </div>
      
      <div className="border-l-3 border-[#1a2352] pl-2.5">
        <h4 className="text-xs font-medium mb-0.5">Long-term Monitoring</h4>
        <p className="text-xs text-gray-600">
          Track changes over time for chronic conditions to adjust treatment and medications.
        </p>
      </div>
    </div>
    
    <div className="bg-gray-50 p-3 rounded-lg">
      <h4 className="text-xs font-medium flex items-center gap-1.5 mb-1.5">
        <Share2 className="w-3 h-3 text-[#1a2352]" />
        For Your Appointment
      </h4>
      <ul className="space-y-1 text-xs text-gray-600">
        <li>• Analysis report copy</li>
        <li>• Symptom list</li>
        <li>• Family respiratory history</li>
        <li>• Current medications</li>
        <li>• Prepared questions</li>
      </ul>
    </div>
  </div>
) 
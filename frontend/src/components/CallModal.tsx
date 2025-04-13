import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { X, Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react"

interface CallModalProps {
  isOpen: boolean
  onClose: () => void
  doctorName: string
  doctorId: string
  callType: "audio" | "video"
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any
  }
}

export function CallModal({ isOpen, onClose, doctorName, doctorId, callType }: CallModalProps) {
  const [api, setApi] = useState<any>(null)
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    // Load Jitsi script
    const script = document.createElement("script")
    script.src = "https://meet.jit.si/external_api.js"
    script.async = true
    script.onload = initializeJitsi
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
      if (api) {
        api.dispose()
      }
    }
  }, [isOpen])

  const initializeJitsi = () => {
    const domain = "meet.jit.si"
    const options = {
      roomName: `apollo-health-${doctorId}-${Date.now()}`,
      width: "100%",
      height: "100%",
      parentNode: document.querySelector("#jitsi-container"),
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
        ],
        SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_REMOTE_DISPLAY_NAME: doctorName,
        TOOLBAR_ALWAYS_VISIBLE: true,
      },
      configOverwrite: {
        startWithAudioMuted: callType === "video",
        startWithVideoMuted: callType === "audio",
        prejoinPageEnabled: false,
        disableDeepLinking: true,
      },
    }

    const jitsiApi = new window.JitsiMeetExternalAPI(domain, options)
    setApi(jitsiApi)

    // Add event listeners
    jitsiApi.addEventListeners({
      videoMuteStatusChanged: ({ muted }: { muted: boolean }) => setIsVideoMuted(muted),
      audioMuteStatusChanged: ({ muted }: { muted: boolean }) => setIsAudioMuted(muted),
      readyToClose: handleClose,
    })
  }

  const handleClose = () => {
    if (api) {
      api.dispose()
    }
    onClose()
  }

  const toggleAudio = () => {
    api.executeCommand('toggleAudio')
  }

  const toggleVideo = () => {
    api.executeCommand('toggleVideo')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col">
        <div className="p-4 flex items-center justify-between border-b">
          <h2 className="text-xl font-semibold text-[#1a2352]">
            {callType === "video" ? "Video" : "Audio"} Call with {doctorName}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 relative">
          <div id="jitsi-container" className="absolute inset-0" />
        </div>

        <div className="p-4 bg-gray-50 rounded-b-2xl flex items-center justify-center gap-4">
          <Button
            variant="outline"
            className={`rounded-full p-3 ${isAudioMuted ? 'bg-red-50 text-red-600' : ''}`}
            onClick={toggleAudio}
          >
            {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
          
          {callType === "video" && (
            <Button
              variant="outline"
              className={`rounded-full p-3 ${isVideoMuted ? 'bg-red-50 text-red-600' : ''}`}
              onClick={toggleVideo}
            >
              {isVideoMuted ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </Button>
          )}

          <Button
            variant="destructive"
            className="rounded-full p-3 bg-red-600 hover:bg-red-700"
            onClick={handleClose}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  )
} 
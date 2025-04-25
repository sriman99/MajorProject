import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { chatService } from '@/services/websocket';

export function ServerStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [mockMode, setMockMode] = useState<boolean>(chatService.isMockMode());
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkServerStatus = async () => {
    setStatus('checking');
    try {
      const response = await fetch('http://localhost:8000/');
      if (response.ok) {
        setStatus('online');
        chatService.setMockMode(false);
      } else {
        setStatus('offline');
        chatService.setMockMode(true);
      }
    } catch (error) {
      console.error('Failed to check server status:', error);
      setStatus('offline');
      chatService.setMockMode(true);
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkServerStatus();
    
    // Subscribe to mock mode changes
    const unsubscribe = chatService.onMockModeChange(setMockMode);
    
    // Check server status every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-gray-100">
      {status === 'checking' && (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
          <span className="text-gray-600">Checking server status...</span>
        </>
      )}
      
      {status === 'online' && !mockMode && (
        <>
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-gray-600">Server online</span>
        </>
      )}
      
      {status === 'online' && mockMode && (
        <>
          <CheckCircle className="w-4 h-4 text-orange-500" />
          <span className="text-gray-600">Server online (using mock data)</span>
          <button 
            onClick={() => chatService.setMockMode(false)}
            className="ml-2 text-xs underline text-blue-500"
          >
            Use real server
          </button>
        </>
      )}
      
      {status === 'offline' && (
        <>
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-gray-600">Server offline - using mock data</span>
          <button 
            onClick={checkServerStatus}
            className="ml-2 text-xs underline text-blue-500 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </>
      )}
      
      {lastChecked && (
        <span className="ml-auto text-xs text-gray-400">
          Last checked: {lastChecked.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
} 
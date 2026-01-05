// Device fingerprinting utility for admin security
// Creates a unique identifier for the current device/browser

export async function generateDeviceFingerprint(): Promise<string> {
  const components: string[] = [];

  // Screen properties
  components.push(`screen:${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`);
  
  // Timezone
  components.push(`tz:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  
  // Language
  components.push(`lang:${navigator.language}`);
  
  // Platform
  components.push(`platform:${navigator.platform}`);
  
  // Hardware concurrency (CPU cores)
  components.push(`cores:${navigator.hardwareConcurrency || 'unknown'}`);
  
  // Device memory (if available)
  const nav = navigator as Navigator & { deviceMemory?: number };
  components.push(`memory:${nav.deviceMemory || 'unknown'}`);
  
  // Touch support
  components.push(`touch:${navigator.maxTouchPoints || 0}`);
  
  // WebGL renderer (graphics card info)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push(`gpu:${gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)}`);
      }
    }
  } catch {
    components.push('gpu:unknown');
  }
  
  // Canvas fingerprint
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('MetsXM Admin', 2, 15);
      components.push(`canvas:${canvas.toDataURL().slice(-50)}`);
    }
  } catch {
    components.push('canvas:unknown');
  }
  
  // Audio fingerprint (simplified)
  try {
    const audioContext = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    components.push(`audio:${audioContext.sampleRate}`);
    audioContext.close();
  } catch {
    components.push('audio:unknown');
  }

  // Combine all components
  const fingerprint = components.join('|');
  
  // Hash the fingerprint
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getDeviceName(): string {
  const ua = navigator.userAgent;
  
  // Detect OS
  let os = 'Unknown OS';
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
  // Detect browser
  let browser = 'Unknown Browser';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';
  
  return `${browser} on ${os}`;
}

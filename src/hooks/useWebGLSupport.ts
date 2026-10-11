import { useState, useEffect } from 'react';

/**
 * Checks if WebGL is supported and enabled in the current browser environment.
 * Gracefully handles headless browsers, software rendering, and legacy devices.
 */
export function useWebGLSupport(): boolean {
  const [isSupported, setIsSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return Boolean(gl && gl instanceof WebGLRenderingContext);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setIsSupported(Boolean(gl && gl instanceof WebGLRenderingContext));
    } catch {
      setIsSupported(false);
    }
  }, []);

  return isSupported;
}

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Base64URL encoding/decoding helpers
function bufferToBase64URL(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const byte of bytes) {
    str += String.fromCharCode(byte);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64URLToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(padLen);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate random challenge
function generateChallenge(): ArrayBuffer {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return array.buffer as ArrayBuffer;
}

interface StoredCredential {
  credentialId: string;
  publicKey: string;
  userId: string;
  email: string;
  createdAt: string;
}

const CREDENTIALS_KEY = 'webauthn_credentials';

export function useWebAuthn() {
  const [isSupported, setIsSupported] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 
           window.PublicKeyCredential !== undefined &&
           typeof window.PublicKeyCredential === 'function';
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Check if user has registered a passkey
  const hasPasskey = useCallback((email: string): boolean => {
    try {
      const stored = localStorage.getItem(CREDENTIALS_KEY);
      if (!stored) return false;
      const credentials: StoredCredential[] = JSON.parse(stored);
      return credentials.some(c => c.email === email);
    } catch {
      return false;
    }
  }, []);

  // Get stored credential for user
  const getStoredCredential = useCallback((email: string): StoredCredential | null => {
    try {
      const stored = localStorage.getItem(CREDENTIALS_KEY);
      if (!stored) return null;
      const credentials: StoredCredential[] = JSON.parse(stored);
      return credentials.find(c => c.email === email) || null;
    } catch {
      return null;
    }
  }, []);

  // Save credential
  const saveCredential = useCallback((credential: StoredCredential) => {
    try {
      const stored = localStorage.getItem(CREDENTIALS_KEY);
      const credentials: StoredCredential[] = stored ? JSON.parse(stored) : [];
      // Remove existing credential for this email
      const filtered = credentials.filter(c => c.email !== credential.email);
      filtered.push(credential);
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to save credential:', error);
    }
  }, []);

  // Register a new passkey for the current user
  const registerPasskey = useCallback(async (userId: string, email: string): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: 'Not Supported',
        description: 'Biometric login is not supported on this device/browser.',
        variant: 'destructive',
      });
      return false;
    }

    setLoading(true);
    try {
      const challenge = generateChallenge();

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'MetsXMFanZone',
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: email,
          displayName: email.split('@')[0],
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },   // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      const response = credential.response as AuthenticatorAttestationResponse;
      
      // Store credential info locally (in a production app, you'd store this on the server)
      const storedCredential: StoredCredential = {
        credentialId: bufferToBase64URL(credential.rawId),
        publicKey: bufferToBase64URL(response.getPublicKey() || new ArrayBuffer(0)),
        userId,
        email,
        createdAt: new Date().toISOString(),
      };

      saveCredential(storedCredential);

      toast({
        title: 'Passkey Registered!',
        description: 'You can now use biometrics to sign in.',
      });

      return true;
    } catch (error: any) {
      console.error('Passkey registration error:', error);
      
      if (error.name === 'NotAllowedError') {
        toast({
          title: 'Registration Cancelled',
          description: 'Passkey registration was cancelled or timed out.',
          variant: 'destructive',
        });
      } else if (error.name === 'NotSupportedError') {
        toast({
          title: 'Not Supported',
          description: 'Your device does not support passkeys.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Registration Failed',
          description: error.message || 'Failed to register passkey.',
          variant: 'destructive',
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, saveCredential, toast]);

  // Authenticate with passkey
  const authenticateWithPasskey = useCallback(async (email: string): Promise<{ success: boolean; userId?: string }> => {
    if (!isSupported) {
      toast({
        title: 'Not Supported',
        description: 'Biometric login is not supported on this device/browser.',
        variant: 'destructive',
      });
      return { success: false };
    }

    const storedCredential = getStoredCredential(email);
    if (!storedCredential) {
      toast({
        title: 'No Passkey Found',
        description: 'Please register a passkey first or use password login.',
        variant: 'destructive',
      });
      return { success: false };
    }

    setLoading(true);
    try {
      const challenge = generateChallenge();

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [{
          id: base64URLToBuffer(storedCredential.credentialId),
          type: 'public-key',
          transports: ['internal'],
        }],
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname,
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      }) as PublicKeyCredential;

      if (!assertion) {
        throw new Error('Authentication failed');
      }

      // In a production app, you would verify the assertion on the server
      // For this implementation, we trust the local verification
      
      return { 
        success: true, 
        userId: storedCredential.userId 
      };
    } catch (error: any) {
      console.error('Passkey authentication error:', error);
      
      if (error.name === 'NotAllowedError') {
        toast({
          title: 'Authentication Cancelled',
          description: 'Biometric authentication was cancelled or timed out.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Authentication Failed',
          description: error.message || 'Failed to authenticate with passkey.',
          variant: 'destructive',
        });
      }
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [isSupported, getStoredCredential, toast]);

  // Remove passkey for user
  const removePasskey = useCallback((email: string) => {
    try {
      const stored = localStorage.getItem(CREDENTIALS_KEY);
      if (!stored) return;
      const credentials: StoredCredential[] = JSON.parse(stored);
      const filtered = credentials.filter(c => c.email !== email);
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(filtered));
      
      toast({
        title: 'Passkey Removed',
        description: 'Your passkey has been removed from this device.',
      });
    } catch (error) {
      console.error('Failed to remove passkey:', error);
    }
  }, [toast]);

  return {
    isSupported,
    loading,
    hasPasskey,
    registerPasskey,
    authenticateWithPasskey,
    removePasskey,
  };
}

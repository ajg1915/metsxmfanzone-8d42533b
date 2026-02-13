import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import logo from "@/assets/metsxmfanzone-logo.png";

const HelcimCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const checkoutToken = searchParams.get('token') || sessionStorage.getItem('helcim_checkout_token');

  useEffect(() => {
    if (!checkoutToken) {
      navigate('/plans');
      return;
    }

    // Hide nav for full-screen checkout
    document.body.classList.add('helcim-active');

    // Listen for Helcim payment events via postMessage
    const handleMessage = (event: MessageEvent) => {
      const helcimPayJsIdentifierKey = 'helcim-pay-js-' + checkoutToken;
      if (event.data.eventName === helcimPayJsIdentifierKey) {
        if (event.data.eventStatus === 'SUCCESS') {
          navigate(`/payment-success?session_id=${checkoutToken}`);
        }
        if (event.data.eventStatus === 'ABORTED') {
          navigate('/payment-error');
        }
        if (event.data.eventStatus === 'HIDE') {
          navigate('/plans');
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      document.body.classList.remove('helcim-active');
      window.removeEventListener('message', handleMessage);
    };
  }, [checkoutToken, navigate]);

  if (!checkoutToken) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-white">
      {/* Minimal top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shrink-0">
        <button
          onClick={() => navigate('/plans')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <img src={logo} alt="MetsXMFanZone" className="h-6" />
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Lock className="w-3 h-3" />
          <span>Secure</span>
        </div>
      </div>

      {/* Full-page Helcim iframe */}
      <iframe
        src={`https://secure.helcim.app/helcim-pay/#${checkoutToken}`}
        className="flex-1 w-full border-none"
        title="Helcim Secure Checkout"
        allow="payment"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
      />
    </div>
  );
};

export default HelcimCheckout;

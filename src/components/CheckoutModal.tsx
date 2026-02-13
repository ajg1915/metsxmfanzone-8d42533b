import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tag, X, CreditCard, Shield, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import metsLogo from "@/assets/metsxmfanzone-logo.png";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface Plan {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  period: string;
  billingNote?: string;
  description: string;
  features: string[];
}

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
}

declare global {
  interface Window {
    appendHelcimPayIframe: (checkoutToken: string, allowExit?: boolean) => void;
  }
}

const CheckoutModal = ({ open, onOpenChange, plan }: CheckoutModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPromoCode, setShowPromoCode] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<'summary' | 'loading' | 'iframe' | 'error'>('summary');
  const [errorMsg, setErrorMsg] = useState("");
  const checkoutTokenRef = useRef<string | null>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setPaymentPhase('summary');
      setIsProcessing(false);
      setErrorMsg("");
      checkoutTokenRef.current = null;
      // Clean up any injected styles
      const style = document.getElementById('helcim-modal-styles');
      if (style) style.remove();
    }
  }, [open]);

  const handleHelcimMessage = useCallback((event: MessageEvent) => {
    const token = checkoutTokenRef.current;
    if (!token) return;
    const key = 'helcim-pay-js-' + token;

    if (event.data.eventName === key) {
      if (event.data.eventStatus === 'SUCCESS') {
        onOpenChange(false);
        navigate(`/payment-success?session_id=${token}`);
      }
      if (event.data.eventStatus === 'ABORTED') {
        onOpenChange(false);
        navigate('/payment-error');
      }
      if (event.data.eventStatus === 'HIDE') {
        setPaymentPhase('summary');
        // Remove iframe wrapper
        const wrapper = document.querySelector('.helcim-pay-iframe-wrapper');
        if (wrapper) wrapper.remove();
        const style = document.getElementById('helcim-modal-styles');
        if (style) style.remove();
      }
    }
  }, [navigate, onOpenChange]);

  // Listen for Helcim messages
  useEffect(() => {
    if (paymentPhase === 'iframe') {
      window.addEventListener('message', handleHelcimMessage);
      return () => window.removeEventListener('message', handleHelcimMessage);
    }
  }, [paymentPhase, handleHelcimMessage]);

  const loadHelcimIframe = async (checkoutToken: string) => {
    checkoutTokenRef.current = checkoutToken;
    setPaymentPhase('loading');

    // Inject styles to position the Helcim iframe as a full-screen overlay
    const style = document.createElement('style');
    style.id = 'helcim-modal-styles';
    style.textContent = `
      .helcim-pay-iframe-wrapper,
      .helcim-pay-iframe-wrapper iframe,
      div[id*="helcimPayIframe"] {
        z-index: 999999 !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100dvh !important;
        border: none !important;
        background: #fff !important;
      }
    `;
    document.head.appendChild(style);

    // Load Helcim script if not already loaded
    if (typeof window.appendHelcimPayIframe !== 'function') {
      const script = document.createElement('script');
      script.src = 'https://secure.helcim.app/helcim-pay/services/start.js';
      script.async = true;

      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load payment script'));
        document.head.appendChild(script);
      });
    }

    // Small delay to ensure script is initialized
    await new Promise(r => setTimeout(r, 500));

    if (typeof window.appendHelcimPayIframe === 'function') {
      window.appendHelcimPayIframe(checkoutToken, true);
      setPaymentPhase('iframe');
    } else {
      setPaymentPhase('error');
      setErrorMsg('Payment form failed to initialize. Please try again.');
    }
  };

  const handleSubscribe = async () => {
    if (!plan) return;

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      onOpenChange(false);
      navigate("/auth");
      return;
    }

    setIsProcessing(true);

    try {
      // Handle free plan
      if (plan.id === "free") {
        const { error } = await supabase
          .from("subscriptions")
          .insert({
            user_id: user.id,
            plan_type: "free",
            status: "active",
            amount: 0,
            currency: "USD",
            start_date: new Date().toISOString(),
          });

        if (error) throw error;

        toast({
          title: "Welcome!",
          description: "Your free plan has been activated",
        });
        onOpenChange(false);
        navigate("/");
        return;
      }

      // Create Helcim checkout session
      const { data, error } = await supabase.functions.invoke("create-helcim-checkout", {
        body: { planType: plan.id, promoCode: appliedPromo },
      });

      if (error) throw error;

      if (data?.checkoutToken && data?.secretToken) {
        sessionStorage.setItem("helcim_checkout_token", data.checkoutToken);
        sessionStorage.setItem("helcim_secret_token", data.secretToken);
        // Load the iframe directly instead of navigating away
        await loadHelcimIframe(data.checkoutToken);
      } else {
        toast({
          title: "Error",
          description: "Failed to get payment tokens. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      setPaymentPhase('summary');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      setAppliedPromo(promoCode.trim().toUpperCase());
      toast({
        title: "Promo Code Applied",
        description: `Code "${promoCode.toUpperCase()}" has been applied`,
      });
      setShowPromoCode(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
  };

  if (!plan) return null;

  // When iframe is active, hide the dialog but keep it mounted for state
  if (paymentPhase === 'iframe') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (paymentPhase === 'loading') return; // Don't close while loading
      onOpenChange(v);
    }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <img src={metsLogo} alt="MetsXM" className="h-8 w-8 object-contain" />
            <DialogTitle className="text-xl font-semibold">Checkout</DialogTitle>
          </div>
        </DialogHeader>

        {paymentPhase === 'error' ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
            <AlertCircle className="w-10 h-10 text-destructive" />
            <h3 className="text-lg font-bold text-foreground">Payment Error</h3>
            <p className="text-muted-foreground text-sm">{errorMsg}</p>
            <Button onClick={() => setPaymentPhase('summary')}>Try Again</Button>
          </div>
        ) : paymentPhase === 'loading' ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <h3 className="text-lg font-bold text-foreground">Preparing Secure Payment</h3>
            <p className="text-muted-foreground text-sm">Loading your payment form...</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>256-bit SSL encrypted</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Plan Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{plan.name} Plan</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{plan.price}</p>
                  <p className="text-xs text-muted-foreground">{plan.period}</p>
                </div>
              </div>
              {plan.billingNote && (
                <p className="text-xs text-muted-foreground">{plan.billingNote}</p>
              )}
            </div>

            <Separator />

            {/* Promo Code Section */}
            <div>
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-primary/10 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">{appliedPromo}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRemovePromo} className="h-7 w-7 p-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : showPromoCode ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="h-10"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                    />
                    <Button onClick={handleApplyPromo} className="h-10 px-4">Apply</Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowPromoCode(false)} className="text-xs text-muted-foreground">
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowPromoCode(true)} className="w-full justify-start h-10">
                  <Tag className="w-4 h-4 mr-2" />
                  Add promotion code
                </Button>
              )}
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{plan.price}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-sm">
                  <span className="text-primary">Promo discount</span>
                  <span className="text-primary">-$0.00</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-base">
                <span className="text-foreground">Total due today</span>
                <span className="text-foreground">{plan.price}</span>
              </div>
            </div>

            <Separator />

            {/* Payment Method Info */}
            {plan.priceValue > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Credit/Debit Card</p>
                  <p className="text-xs text-muted-foreground">Secure payment via Helcim</p>
                </div>
              </div>
            )}

            {/* Subscribe Button */}
            <Button
              className="w-full h-12 text-base font-semibold"
              size="lg"
              onClick={handleSubscribe}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : plan.priceValue === 0 ? "Activate Free Plan" : `Pay ${plan.price}`}
            </Button>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Secure checkout powered by Helcim</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;

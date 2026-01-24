import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthBackground from "@/components/AuthBackground";
import authLogo from "@/assets/metsxmfanzone-logo-auth.png";

interface OTPVerificationFormProps {
  email: string;
  otpCode: string;
  onOtpChange: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
  loading: boolean;
  resendCooldown: number;
}

const OTPVerificationForm = ({
  email,
  otpCode,
  onOtpChange,
  onVerify,
  onResend,
  onBack,
  loading,
  resendCooldown,
}: OTPVerificationFormProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AuthBackground />
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex flex-col items-center gap-3 mb-4">
            <img 
              src={authLogo} 
              alt="MetsXMFanZone" 
              className="h-20 w-auto object-contain"
            />
            <span className="text-lg font-bold text-[#FF5910]">MetsXMFanZone.com</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-bold">Verify Your Identity</CardTitle>
          </div>
          <CardDescription className="text-center">
            Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={onOtpChange}
              disabled={loading}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button 
            onClick={onVerify} 
            className="w-full" 
            disabled={loading || otpCode.length !== 6}
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={onResend}
                disabled={resendCooldown > 0 || loading}
                className="text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </button>
            </p>
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto"
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerificationForm;

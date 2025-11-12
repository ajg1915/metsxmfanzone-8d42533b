import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { Download, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QRCodeGenerator() {
  const [url, setUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [qrSize, setQrSize] = useState(300);
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to generate QR code",
        variant: "destructive",
      });
      return;
    }

    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = qrSize;
    canvas.height = qrSize;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      
      // Add logo if provided
      if (logoUrl) {
        const logo = new Image();
        logo.crossOrigin = "anonymous";
        logo.onload = () => {
          const logoSize = qrSize * 0.2;
          const x = (qrSize - logoSize) / 2;
          const y = (qrSize - logoSize) / 2;
          
          // Draw white background for logo
          ctx!.fillStyle = "white";
          ctx!.fillRect(x - 10, y - 10, logoSize + 20, logoSize + 20);
          
          ctx?.drawImage(logo, x, y, logoSize, logoSize);
          downloadCanvas(canvas);
        };
        logo.src = logoUrl;
      } else {
        downloadCanvas(canvas);
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const downloadCanvas = (canvas: HTMLCanvasElement) => {
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "QR Code Downloaded",
      description: "Your branded QR code has been downloaded successfully",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">QR Code Generator</h1>
        <p className="text-muted-foreground">
          Generate branded QR codes for your links
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>QR Code Settings</CardTitle>
            <CardDescription>
              Configure your QR code with custom branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">
                <LinkIcon className="w-4 h-4 inline mr-2" />
                Link URL *
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://metsxmfanzone.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Brand Logo URL (Optional)</Label>
              <Input
                id="logo"
                type="url"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Add your logo in the center of the QR code
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">QR Code Size (px)</Label>
              <Input
                id="size"
                type="number"
                min="200"
                max="1000"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
              />
            </div>

            <Button 
              onClick={handleDownload} 
              className="w-full"
              disabled={!url}
            >
              <Download className="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Your QR code preview
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[300px]">
            {url ? (
              <div ref={qrRef} className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                  value={url}
                  size={qrSize / 1.5}
                  level="H"
                  includeMargin={true}
                />
              </div>
            ) : (
              <p className="text-muted-foreground text-center">
                Enter a URL to generate QR code
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>
            Generate QR codes for common MetsXMFanZone pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Home", url: "https://metsxmfanzone.com" },
              { label: "Live", url: "https://metsxmfanzone.com/live" },
              { label: "Merch", url: "https://metsxmfanzone.com/merch" },
              { label: "Community", url: "https://metsxmfanzone.com/community" },
              { label: "Podcast", url: "https://metsxmfanzone.com/podcast" },
              { label: "Blog", url: "https://metsxmfanzone.com/blog" },
              { label: "Spring Training", url: "https://metsxmfanzone.com/spring-training-live" },
              { label: "Plans", url: "https://metsxmfanzone.com/plans" },
            ].map((link) => (
              <Button
                key={link.url}
                variant="outline"
                size="sm"
                onClick={() => setUrl(link.url)}
                className="w-full"
              >
                {link.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

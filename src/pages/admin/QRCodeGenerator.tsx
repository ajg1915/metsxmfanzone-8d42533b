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
    <div className="max-w-full px-2 py-3 space-y-4 overflow-x-hidden">
      <div>
        <h1 className="text-lg sm:text-xl font-bold">QR Code Generator</h1>
        <p className="text-xs text-muted-foreground">Generate branded QR codes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-3">
            <div className="space-y-1">
              <Label className="text-xs">Link URL *</Label>
              <Input
                type="url"
                placeholder="https://metsxmfanzone.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Logo URL</Label>
              <Input
                type="url"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <Button onClick={handleDownload} className="w-full h-8 text-xs" disabled={!url}>
              <Download className="w-3.5 h-3.5 mr-1" />
              Download
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[200px] px-3">
            {url ? (
              <div ref={qrRef} className="bg-white p-3 rounded-lg">
                <QRCodeSVG value={url} size={180} level="H" includeMargin />
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">Enter a URL</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="px-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Home", url: "https://metsxmfanzone.com" },
              { label: "Live", url: "https://metsxmfanzone.com/live" },
              { label: "Merch", url: "https://metsxmfanzone.com/merch" },
              { label: "Blog", url: "https://metsxmfanzone.com/blog" },
            ].map((link) => (
              <Button
                key={link.url}
                variant="outline"
                size="sm"
                onClick={() => setUrl(link.url)}
                className="w-full h-7 text-xs"
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

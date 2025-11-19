import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/metsxmfanzone-logo.png";

export default function ShopPreview() {
  const navigate = useNavigate();

  return (
    <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="py-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <img src={logo} alt="MetsXMFanZone" className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-primary mb-3">
          MetsXMFanZone Shop
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Show your Mets pride with exclusive MetsXMFanZone merchandise. 
          T-shirts, hoodies, caps, and more!
        </p>
        <Button 
          size="lg" 
          onClick={() => navigate("/merch")}
          className="gap-2"
        >
          <ShoppingBag className="w-5 h-5" />
          Browse Merch
        </Button>
      </CardContent>
    </Card>
  );
}

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingBag, Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/metsxmfanzone-logo.png";

interface ShopProduct {
  id: string;
  title: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  category: string | null;
  condition: string | null;
  stock_quantity: number | null;
}

const Shop = () => {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [buyingProduct, setBuyingProduct] = useState<ShopProduct | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("shop_products")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true });
      if (!error) setProducts((data as unknown as ShopProduct[]) || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const categories = ["All", ...new Set(products.map(l => l.category || "General"))];
  const filtered = filter === "All" ? products : products.filter(l => l.category === filter);

  const handleBuyNow = async () => {
    if (!buyingProduct) return;
    if (!customerForm.name || !customerForm.email || !customerForm.line1 || !customerForm.city || !customerForm.state || !customerForm.zip) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-shop-order', {
        body: {
          productId: buyingProduct.id,
          quantity: 1,
          customerName: customerForm.name,
          customerEmail: customerForm.email,
          shippingAddress: {
            line1: customerForm.line1,
            line2: customerForm.line2,
            city: customerForm.city,
            state: customerForm.state,
            zip: customerForm.zip,
            country: 'US',
          },
          returnOrigin: window.location.origin,
        },
      });

      if (error) throw error;

      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('No approval URL received');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const isOutOfStock = (product: ShopProduct) => product.stock_quantity !== null && product.stock_quantity <= 0;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>MetsXMFanZone Shop - Mets Collectibles & Gear</title>
        <meta name="description" content="Shop Mets collectibles, jerseys, cards, and memorabilia. Authentic fan gear with secure PayPal checkout." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/shop" />
      </Helmet>
      <Navigation />

      <main className="flex-1 pt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <img src={logo} alt="MetsXMFanZone" className="w-12 h-12" />
              <h1 className="text-3xl sm:text-4xl font-bold text-primary">MetsXMFanZone Shop</h1>
            </div>
            <p className="text-muted-foreground">Mets collectibles, jerseys, cards & more — secure PayPal checkout</p>
          </div>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <Button key={cat} variant={filter === cat ? "default" : "outline"} size="sm" onClick={() => setFilter(cat)}>
                  {cat}
                </Button>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Products Yet</h2>
              <p className="text-muted-foreground">Check back soon for Mets collectibles and gear!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((product) => (
                <Card
                  key={product.id}
                  className={`border-2 ${isOutOfStock(product) ? 'border-muted opacity-75' : 'border-primary'} bg-card overflow-hidden hover:shadow-lg transition-all group`}
                >
                  <div className="aspect-square overflow-hidden relative">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-secondary/20 flex items-center justify-center">
                        <img src={logo} alt="MetsXMFanZone" className="w-20 h-20 opacity-50" />
                      </div>
                    )}
                    {isOutOfStock(product) && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <span className="text-lg font-bold text-destructive bg-background/80 px-4 py-2 rounded-lg">SOLD OUT</span>
                      </div>
                    )}
                    {product.condition && (
                      <Badge variant="secondary" className="absolute top-2 right-2 text-xs">{product.condition}</Badge>
                    )}
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base line-clamp-2">{product.title}</CardTitle>
                    {product.category && product.category !== "General" && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Tag className="w-3 h-3" />
                        {product.category}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {product.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                    )}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-primary">${Number(product.price).toFixed(2)}</span>
                      {product.compare_at_price && (
                        <span className="text-sm text-muted-foreground line-through">${Number(product.compare_at_price).toFixed(2)}</span>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      disabled={isOutOfStock(product)}
                      onClick={() => {
                        setBuyingProduct(product);
                        setCustomerForm({ name: "", email: "", line1: "", line2: "", city: "", state: "", zip: "" });
                      }}
                    >
                      {isOutOfStock(product) ? "Sold Out" : "Buy Now"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Checkout Dialog */}
      <Dialog open={!!buyingProduct} onOpenChange={(open) => { if (!open) setBuyingProduct(null); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Checkout
            </DialogTitle>
          </DialogHeader>
          {buyingProduct && (
            <div className="space-y-4">
              <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                {buyingProduct.image_url && (
                  <img src={buyingProduct.image_url} alt={buyingProduct.title} className="w-16 h-16 object-cover rounded" />
                )}
                <div>
                  <p className="font-medium text-sm">{buyingProduct.title}</p>
                  <p className="text-lg font-bold text-primary">${Number(buyingProduct.price).toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Contact Info</h3>
                <div>
                  <Label>Full Name *</Label>
                  <Input value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} placeholder="John Doe" />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} placeholder="john@example.com" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Shipping Address</h3>
                <div>
                  <Label>Address Line 1 *</Label>
                  <Input value={customerForm.line1} onChange={(e) => setCustomerForm({ ...customerForm, line1: e.target.value })} placeholder="123 Main St" />
                </div>
                <div>
                  <Label>Address Line 2</Label>
                  <Input value={customerForm.line2} onChange={(e) => setCustomerForm({ ...customerForm, line2: e.target.value })} placeholder="Apt 4B" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label>City *</Label>
                    <Input value={customerForm.city} onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })} placeholder="Queens" />
                  </div>
                  <div>
                    <Label>State *</Label>
                    <Input value={customerForm.state} onChange={(e) => setCustomerForm({ ...customerForm, state: e.target.value })} placeholder="NY" maxLength={2} />
                  </div>
                  <div>
                    <Label>ZIP *</Label>
                    <Input value={customerForm.zip} onChange={(e) => setCustomerForm({ ...customerForm, zip: e.target.value })} placeholder="11101" />
                  </div>
                </div>
              </div>

              <Button onClick={handleBuyNow} disabled={checkoutLoading} className="w-full" size="lg">
                {checkoutLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                ) : (
                  <>Pay ${Number(buyingProduct.price).toFixed(2)} with PayPal</>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">You'll be redirected to PayPal to complete payment</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Shop;

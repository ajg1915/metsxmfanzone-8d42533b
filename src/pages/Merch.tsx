import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { storefrontApiRequest, STOREFRONT_QUERY, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import logo from "@/assets/metsxmfanzone-logo.png";

const Merch = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await storefrontApiRequest(STOREFRONT_QUERY, { first: 20 });
      setProducts(data.data.products.edges);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0].node;
    
    const cartItem = {
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions
    };
    
    addItem(cartItem);
    toast.success("Added to cart!", {
      description: product.node.title,
      position: "top-center",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>MetsXMFanZone Merch - Official Merchandise & Apparel</title>
        <meta name="description" content="Shop official MetsXMFanZone merchandise. T-shirts, hoodies, hats, and more Mets fan gear." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/merch" />
      </Helmet>
      <Navigation />
      
      <main className="flex-1 pt-20 sm:pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <img src={logo} alt="MetsXMFanZone" className="w-12 h-12" />
                <h1 className="text-3xl sm:text-4xl font-bold text-primary">MetsXMFanZone Merch</h1>
              </div>
              <p className="text-muted-foreground">Official fan gear and merchandise</p>
            </div>
            <CartDrawer />
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Products Yet</h2>
              <p className="text-muted-foreground mb-6">
                We're working on adding awesome MetsXMFanZone merchandise!
              </p>
              <p className="text-sm text-muted-foreground">
                Products will be available soon. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card 
                  key={product.node.id}
                  className="border-2 border-primary bg-card overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => navigate(`/product/${product.node.handle}`)}
                >
                  <div className="aspect-square overflow-hidden relative">
                    {product.node.images?.edges?.[0]?.node ? (
                      <img 
                        src={product.node.images.edges[0].node.url}
                        alt={product.node.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary/20 flex items-center justify-center">
                        <img src={logo} alt="MetsXMFanZone" className="w-20 h-20 opacity-50" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg line-clamp-2">{product.node.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-2xl font-bold text-primary">
                        ${parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2)}
                      </span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Merch;

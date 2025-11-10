import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { storefrontApiRequest, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

const Product = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    fetchProduct();
  }, [handle]);

  const fetchProduct = async () => {
    try {
      const query = `
        query GetProduct($handle: String!) {
          productByHandle(handle: $handle) {
            id
            title
            description
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 5) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
            options {
              name
              values
            }
          }
        }
      `;
      
      const data = await storefrontApiRequest(query, { handle });
      
      if (data.data.productByHandle) {
        const productData: ShopifyProduct = {
          node: data.data.productByHandle
        };
        setProduct(productData);
        setSelectedVariant(productData.node.variants.edges[0].node);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    
    const cartItem = {
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions
    };
    
    addItem(cartItem);
    toast.success("Added to cart!", {
      description: product.node.title,
      position: "top-center",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="flex-1 pt-20 sm:pt-24">
          <div className="container mx-auto px-4 py-8">
            <p className="text-center text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="flex-1 pt-20 sm:pt-24">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <Button onClick={() => navigate("/merch")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{product.node.title} - MetsXMFanZone Merch</title>
        <meta name="description" content={product.node.description || `Shop ${product.node.title} at MetsXMFanZone`} />
      </Helmet>
      <Navigation />
      
      <main className="flex-1 pt-20 sm:pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" onClick={() => navigate("/merch")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </Button>
            <CartDrawer />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              {product.node.images?.edges?.[0]?.node ? (
                <img 
                  src={product.node.images.edges[0].node.url}
                  alt={product.node.title}
                  className="w-full rounded-lg border-2 border-primary"
                />
              ) : (
                <div className="w-full aspect-square bg-secondary/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-20 h-20 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.node.title}</h1>
                <p className="text-3xl font-bold text-primary">
                  ${parseFloat(selectedVariant.price.amount).toFixed(2)} {selectedVariant.price.currencyCode}
                </p>
              </div>

              {product.node.description && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-muted-foreground">{product.node.description}</p>
                </div>
              )}

              {/* Variant Selector */}
              {product.node.variants.edges.length > 1 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Select Variant</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.node.variants.edges.map((variant) => (
                      <Button
                        key={variant.node.id}
                        variant={selectedVariant.id === variant.node.id ? "default" : "outline"}
                        onClick={() => setSelectedVariant(variant.node)}
                      >
                        {variant.node.title}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
                disabled={!selectedVariant.availableForSale}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {selectedVariant.availableForSale ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Product;

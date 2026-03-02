import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, ShoppingBag, Package, DollarSign, Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ShopProduct {
  id: string;
  title: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  image_urls: string[] | null;
  category: string | null;
  condition: string | null;
  stock_quantity: number | null;
  weight_oz: number | null;
  published: boolean | null;
  display_order: number | null;
  created_at: string;
}

interface ShopOrder {
  id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  customer_name: string;
  customer_email: string;
  shipping_address_line1: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  created_at: string;
  shop_products: { title: string } | null;
}

const CATEGORIES = ["General", "Jerseys", "Hats", "Cards", "Memorabilia", "Accessories", "Clothing", "Collectibles"];
const CONDITIONS = ["New", "Like New", "Good", "Fair"];

const emptyForm = {
  title: "",
  description: "",
  price: "",
  compare_at_price: "",
  image_urls: [] as string[],
  category: "General",
  condition: "New",
  stock_quantity: "1",
  weight_oz: "",
  published: true,
  display_order: 0,
};

const ShopManagement = () => {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("shop_products")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) toast.error("Failed to load products");
    else setProducts((data as unknown as ShopProduct[]) || []);
    setLoading(false);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("shop_orders")
      .select("*, shop_products(title)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error) setOrders((data as unknown as ShopOrder[]) || []);
  };

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `shop/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('media_library')
        .upload(fileName, file);

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('media_library')
        .getPublicUrl(fileName);

      newUrls.push(urlData.publicUrl);
    }

    setForm(prev => ({ ...prev, image_urls: [...prev.image_urls, ...newUrls] }));
    setUploading(false);

    if (fileInputRef.current) fileInputRef.current.value = '';
    if (newUrls.length > 0) toast.success(`${newUrls.length} image(s) uploaded`);
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.price) {
      toast.error("Title and price are required");
      return;
    }

    const payload = {
      title: form.title,
      description: form.description || null,
      price: parseFloat(form.price),
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      image_url: form.image_urls[0] || null,
      image_urls: form.image_urls,
      category: form.category,
      condition: form.condition,
      stock_quantity: form.stock_quantity ? parseInt(form.stock_quantity) : null,
      weight_oz: form.weight_oz ? parseFloat(form.weight_oz) : null,
      published: form.published,
      display_order: form.display_order,
    };

    if (editingId) {
      const { error } = await supabase.from("shop_products").update(payload as any).eq("id", editingId);
      if (error) toast.error("Failed to update");
      else toast.success("Product updated!");
    } else {
      const { error } = await supabase.from("shop_products").insert(payload as any);
      if (error) toast.error("Failed to create");
      else toast.success("Product created!");
    }

    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchProducts();
  };

  const handleEdit = (product: ShopProduct) => {
    setEditingId(product.id);
    const urls = product.image_urls && product.image_urls.length > 0
      ? product.image_urls
      : product.image_url ? [product.image_url] : [];
    setForm({
      title: product.title,
      description: product.description || "",
      price: String(product.price),
      compare_at_price: product.compare_at_price ? String(product.compare_at_price) : "",
      image_urls: urls,
      category: product.category || "General",
      condition: product.condition || "New",
      stock_quantity: product.stock_quantity !== null ? String(product.stock_quantity) : "",
      weight_oz: product.weight_oz ? String(product.weight_oz) : "",
      published: product.published ?? true,
      display_order: product.display_order || 0,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("shop_products").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); fetchProducts(); }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("shop_orders").update({ status } as any).eq("id", orderId);
    if (error) toast.error("Failed to update order");
    else { toast.success(`Order marked as ${status}`); fetchOrders(); }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400';
      case 'shipped': return 'bg-blue-500/20 text-blue-400';
      case 'delivered': return 'bg-primary/20 text-primary';
      case 'cancelled': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPreviewImage = (product: ShopProduct) => {
    if (product.image_urls && product.image_urls.length > 0) return product.image_urls[0];
    return product.image_url;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">MetsXMFanZone Shop</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Product title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price *</Label>
                  <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="29.99" />
                </div>
                <div>
                  <Label>Compare At Price</Label>
                  <Input type="number" step="0.01" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} placeholder="39.99" />
                </div>
              </div>

              {/* Image Upload Section */}
              <div>
                <Label>Product Images</Label>
                <div className="mt-2 space-y-3">
                  {form.image_urls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {form.image_urls.map((url, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                          <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Main</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleUploadImages}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={uploading}
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                        fileInputRef.current.click();
                      }
                    }}
                  >
                    {uploading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" />Upload Images</>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">Upload multiple images. First image is the main photo.</p>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Condition</Label>
                  <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Stock Qty</Label>
                  <Input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} placeholder="1" />
                </div>
                <div>
                  <Label>Weight (oz)</Label>
                  <Input type="number" step="0.1" value={form.weight_oz} onChange={(e) => setForm({ ...form, weight_oz: e.target.value })} placeholder="8" />
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
                <Label>Published</Label>
              </div>
              <Button onClick={handleSubmit} className="w-full">{editingId ? "Update" : "Add"} Product</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products" className="gap-2"><Package className="w-4 h-4" />Products ({products.length})</TabsTrigger>
          <TabsTrigger value="orders" className="gap-2"><DollarSign className="w-4 h-4" />Orders ({orders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : products.length === 0 ? (
                <p className="text-muted-foreground">No products yet. Click "Add Product" to get started.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Photos</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          {getPreviewImage(product) ? (
                            <img src={getPreviewImage(product)!} alt={product.title} className="w-12 h-12 object-cover rounded" />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                              <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">{product.title}</TableCell>
                        <TableCell>
                          <span>${Number(product.price).toFixed(2)}</span>
                          {product.compare_at_price && (
                            <span className="text-xs text-muted-foreground line-through ml-2">${Number(product.compare_at_price).toFixed(2)}</span>
                          )}
                        </TableCell>
                        <TableCell>{product.stock_quantity ?? '∞'}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <ImageIcon className="w-3 h-3" />
                            {(product.image_urls?.length || (product.image_url ? 1 : 0))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.published ? (
                            <Badge variant="default" className="text-xs">Live</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Draft</Badge>
                          )}
                          {product.stock_quantity === 0 && (
                            <Badge variant="destructive" className="text-xs ml-1">Out of Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardContent className="pt-6">
              {orders.length === 0 ? (
                <p className="text-muted-foreground">No orders yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Shipping</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="text-xs">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{order.customer_name}</div>
                          <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                        </TableCell>
                        <TableCell className="text-sm">{order.shop_products?.title || 'N/A'}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell className="font-medium">${Number(order.total_amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-0.5 rounded ${statusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          {order.shipping_address_line1 ? (
                            <>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Select onValueChange={(v) => updateOrderStatus(order.id, v)}>
                            <SelectTrigger className="w-[120px] h-8 text-xs">
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShopManagement;

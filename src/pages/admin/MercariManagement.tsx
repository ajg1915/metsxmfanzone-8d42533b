import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ExternalLink, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

interface MercariListing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  mercari_url: string;
  category: string | null;
  condition: string | null;
  is_sold: boolean | null;
  published: boolean | null;
  display_order: number | null;
  created_at: string;
}

const CATEGORIES = ["General", "Jerseys", "Hats", "Cards", "Memorabilia", "Accessories", "Clothing", "Collectibles"];
const CONDITIONS = ["New", "Like New", "Good", "Fair"];

const emptyForm = {
  title: "",
  description: "",
  price: "",
  image_url: "",
  mercari_url: "",
  category: "General",
  condition: "Like New",
  is_sold: false,
  published: true,
  display_order: 0,
};

const MercariManagement = () => {
  const [listings, setListings] = useState<MercariListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("mercari_listings")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) {
      toast.error("Failed to load listings");
    } else {
      setListings((data as unknown as MercariListing[]) || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.mercari_url || !form.price) {
      toast.error("Title, price, and Mercari URL are required");
      return;
    }

    const payload = {
      title: form.title,
      description: form.description || null,
      price: parseFloat(form.price),
      image_url: form.image_url || null,
      mercari_url: form.mercari_url,
      category: form.category,
      condition: form.condition,
      is_sold: form.is_sold,
      published: form.published,
      display_order: form.display_order,
    };

    if (editingId) {
      const { error } = await supabase
        .from("mercari_listings")
        .update(payload as any)
        .eq("id", editingId);
      if (error) toast.error("Failed to update");
      else toast.success("Listing updated!");
    } else {
      const { error } = await supabase
        .from("mercari_listings")
        .insert(payload as any);
      if (error) toast.error("Failed to create");
      else toast.success("Listing created!");
    }

    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchListings();
  };

  const handleEdit = (listing: MercariListing) => {
    setEditingId(listing.id);
    setForm({
      title: listing.title,
      description: listing.description || "",
      price: String(listing.price),
      image_url: listing.image_url || "",
      mercari_url: listing.mercari_url,
      category: listing.category || "General",
      condition: listing.condition || "Like New",
      is_sold: listing.is_sold || false,
      published: listing.published ?? true,
      display_order: listing.display_order || 0,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("mercari_listings").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Deleted");
      fetchListings();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Mercari Shop</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Listing</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Listing" : "Add Mercari Listing"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Product title" />
              </div>
              <div>
                <Label>Price *</Label>
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="29.99" />
              </div>
              <div>
                <Label>Mercari URL *</Label>
                <Input value={form.mercari_url} onChange={(e) => setForm({ ...form, mercari_url: e.target.value })} placeholder="https://www.mercari.com/us/item/..." />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Display Order</Label>
                  <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
                  <Label>Published</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_sold} onCheckedChange={(v) => setForm({ ...form, is_sold: v })} />
                  <Label>Sold</Label>
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full">{editingId ? "Update" : "Add"} Listing</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>All Listings ({listings.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : listings.length === 0 ? (
            <p className="text-muted-foreground">No listings yet. Click "Add Listing" to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      {listing.image_url ? (
                        <img src={listing.image_url} alt={listing.title} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{listing.title}</TableCell>
                    <TableCell>${Number(listing.price).toFixed(2)}</TableCell>
                    <TableCell>{listing.category}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {listing.is_sold && <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">Sold</span>}
                        {listing.published ? (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Live</span>
                        ) : (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">Draft</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(listing)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={listing.mercari_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(listing.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MercariManagement;

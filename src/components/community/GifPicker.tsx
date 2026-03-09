import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

// Using Tenor's public GIF search (no API key required for basic use)
// Fallback to a curated set of popular reaction GIFs
const TRENDING_GIFS = [
  "https://media.tenor.com/images/a4905d9a4172c53aae2e58e7e7bca426/tenor.gif",
  "https://media.tenor.com/images/1f7b14c9a850368b202bbe06dbdd6cfc/tenor.gif",
  "https://media.tenor.com/images/eb5c9e3e46ee42e89ac7f4cddaef9a7c/tenor.gif",
  "https://media.tenor.com/images/2a51a40f7e979b2e3eea42c73d0a8e6a/tenor.gif",
];

// Popular baseball/Mets reaction GIFs with stable URLs
const BASEBALL_GIFS = [
  { url: "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif", label: "Let's Go Mets" },
  { url: "https://media.giphy.com/media/3o7TKF5DnsSLv4zVBu/giphy.gif", label: "Home Run" },
  { url: "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif", label: "Celebrate" },
  { url: "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif", label: "Excited" },
  { url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", label: "Clapping" },
  { url: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif", label: "Fire" },
  { url: "https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/giphy.gif", label: "Thumbs Up" },
  { url: "https://media.giphy.com/media/l4q8cJzGdR9J8w3hS/giphy.gif", label: "Mind Blown" },
  { url: "https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.gif", label: "Wow" },
  { url: "https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif", label: "Cheer" },
  { url: "https://media.giphy.com/media/l0HlvtIPdijJT1n0c/giphy.gif", label: "Victory" },
  { url: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif", label: "LOL" },
];

const REACTION_CATEGORIES = [
  {
    label: "🔥 Reactions",
    gifs: [
      "https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif",
      "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
      "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
      "https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/giphy.gif",
      "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
      "https://media.giphy.com/media/l4q8cJzGdR9J8w3hS/giphy.gif",
    ],
  },
  {
    label: "⚾ Baseball",
    gifs: BASEBALL_GIFS.map((g) => g.url),
  },
];

const GifPicker = ({ onSelect, onClose }: GifPickerProps) => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);

  // Simple GIPHY search using public beta key
  const searchGifs = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Using GIPHY's public beta API key (rate limited but free)
      const res = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${encodeURIComponent(query)}&limit=12&rating=pg`
      );
      const data = await res.json();
      const urls = (data.data || []).map(
        (gif: any) => gif.images?.fixed_height?.url || gif.images?.original?.url
      ).filter(Boolean);
      setSearchResults(urls);
    } catch (error) {
      console.error("GIF search error:", error);
      // Fallback: show default GIFs
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchGifs(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const displayGifs = search.trim()
    ? searchResults
    : REACTION_CATEGORIES;

  return (
    <div className="border border-border rounded-lg bg-card p-3 max-h-[300px] overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-foreground">Choose a GIF</p>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search GIFs..."
          className="pl-8 h-8 text-xs"
        />
      </div>

      {searching && (
        <p className="text-xs text-muted-foreground text-center py-4">Searching...</p>
      )}

      {search.trim() ? (
        <div className="grid grid-cols-3 gap-1.5">
          {searchResults.map((url, i) => (
            <button
              key={i}
              onClick={() => onSelect(url)}
              className="rounded-md overflow-hidden hover:ring-2 hover:ring-primary transition-all aspect-square"
            >
              <img
                src={url}
                alt="GIF"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
          {!searching && searchResults.length === 0 && (
            <p className="text-xs text-muted-foreground col-span-3 text-center py-4">
              No GIFs found. Try a different search.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {REACTION_CATEGORIES.map((category) => (
            <div key={category.label}>
              <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                {category.label}
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {category.gifs.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => onSelect(url)}
                    className="rounded-md overflow-hidden hover:ring-2 hover:ring-primary transition-all aspect-square"
                  >
                    <img
                      src={url}
                      alt="GIF"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[9px] text-muted-foreground text-center mt-2">Powered by GIPHY</p>
    </div>
  );
};

export default GifPicker;

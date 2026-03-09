import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

// Curated popular reaction GIFs (fallback + default browsing)
const REACTION_CATEGORIES = [
  {
    label: "🔥 Reactions",
    gifs: [
      "https://media1.tenor.com/m/ihqN6a3iiYEAAAAC/thumbs-up-okay.gif",
      "https://media1.tenor.com/m/dBTJCYKnKKMAAAAC/clapping-clap.gif",
      "https://media1.tenor.com/m/nAG6jFBfmgUAAAAC/lol-laughing.gif",
      "https://media1.tenor.com/m/ODrXzJXEF_wAAAAC/fire-lit.gif",
      "https://media1.tenor.com/m/MchhLEi7eYYAAAAC/mind-blown-explosion.gif",
      "https://media1.tenor.com/m/pUBVlSMBGaUAAAAC/wow-omg.gif",
    ],
  },
  {
    label: "⚾ Baseball",
    gifs: [
      "https://media1.tenor.com/m/3c4FcGaFNVMAAAAC/baseball-home-run.gif",
      "https://media1.tenor.com/m/lXwwJgWyeloAAAAC/mets-new-york-mets.gif",
      "https://media1.tenor.com/m/IVhLEF-WvSwAAAAC/baseball-bat.gif",
      "https://media1.tenor.com/m/GKHTGR47m_kAAAAC/baseball-catch.gif",
      "https://media1.tenor.com/m/Cs9V-OIBLM4AAAAC/celebration-baseball.gif",
      "https://media1.tenor.com/m/1oRtl5SNUYIAAAAC/celebrate-win.gif",
    ],
  },
  {
    label: "🎉 Celebrate",
    gifs: [
      "https://media1.tenor.com/m/S_8E1GCdP3IAAAAC/party-celebrate.gif",
      "https://media1.tenor.com/m/epGJNeYo40IAAAAC/lets-go-yes.gif",
      "https://media1.tenor.com/m/RQCxgaI8XBIAAAAC/dance-happy.gif",
      "https://media1.tenor.com/m/-6_VK9zPfMwAAAAC/cheer-cheering.gif",
      "https://media1.tenor.com/m/t7_ATwG-dp0AAAAC/victory-winner.gif",
      "https://media1.tenor.com/m/sAfxOyYLYOUAAAAC/yay-hooray.gif",
    ],
  },
];

const GifPicker = ({ onSelect, onClose }: GifPickerProps) => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);

  const searchGifs = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Tenor v2 API with free public key
      const res = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&client_key=metsxmfanzone&limit=12&media_filter=gif`
      );
      const data = await res.json();
      const urls = (data.results || [])
        .map((item: any) => item.media_formats?.gif?.url || item.media_formats?.mediumgif?.url)
        .filter(Boolean);
      setSearchResults(urls);
    } catch (error) {
      console.error("GIF search error:", error);
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

  return (
    <div className="border border-border rounded-lg bg-card p-3 max-h-[320px] overflow-y-auto">
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

      <p className="text-[9px] text-muted-foreground text-center mt-2">Powered by Tenor</p>
    </div>
  );
};

export default GifPicker;

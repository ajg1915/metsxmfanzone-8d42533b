import { Facebook, Twitter, Youtube } from "lucide-react";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z" />
  </svg>
);

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/metsxmfanzoneofficial", label: "Facebook", color: "bg-blue-600" },
  { icon: Twitter, href: "https://twitter.com/metsxmfanzone", label: "X", color: "bg-foreground" },
  { icon: Youtube, href: "https://www.youtube.com/@metsxmfanzone", label: "YouTube", color: "bg-red-600" },
  { icon: TikTokIcon, href: "https://www.tiktok.com/@metsxmfanzone", label: "TikTok", color: "bg-foreground" },
];

const SocialMediaBar = () => {
  return (
    <div className="block md:hidden px-4 py-3">
      <div className="flex items-center justify-center gap-3">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Follow Us</span>
        <div className="flex gap-2">
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Follow us on ${s.label}`}
              className={`${s.color} text-white rounded-full w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity`}
            >
              <s.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaBar;

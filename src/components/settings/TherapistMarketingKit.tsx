import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, ChevronDown, ChevronUp, Activity, Shield, Heart } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";

interface BadgeConfig {
  id: string;
  label: string;
  tagline: string;
  subtitle: string;
  previewBg: string;
  previewText: string;
  previewAccent: string;
  icon: typeof Activity;
  htmlStyle: string;
  htmlText1: string;
  htmlText2: string;
  htmlIconColor: string;
}

const BADGES: BadgeConfig[] = [
  {
    id: "clinical",
    label: "Clinical",
    tagline: "Partner Practitioner",
    subtitle: "ClutterPro",
    previewBg: "bg-gradient-to-br from-[hsl(173,58%,32%)] to-[hsl(173,58%,26%)]",
    previewText: "text-white",
    previewAccent: "",
    icon: Activity,
    htmlStyle: `background: linear-gradient(135deg, hsl(173 58% 32%), hsl(173 58% 26%)); color: white; padding: 14px 22px; border-radius: 14px; display: inline-flex; align-items: center; gap: 14px; font-family: system-ui, -apple-system, sans-serif; text-decoration: none; box-shadow: 0 6px 20px rgba(15, 118, 110, 0.35); transition: transform 0.2s;`,
    htmlText1: "Partner Practitioner",
    htmlText2: "ClutterPro",
    htmlIconColor: "white",
  },
  {
    id: "expert",
    label: "Expert",
    tagline: "Fluency Disorder Expert",
    subtitle: "Cluttering & Stuttering",
    previewBg: "bg-gradient-to-br from-slate-800 to-slate-900",
    previewText: "text-white",
    previewAccent: "",
    icon: Shield,
    htmlStyle: `background: linear-gradient(135deg, #1e293b, #0f172a); color: white; padding: 14px 22px; border-radius: 14px; display: inline-flex; align-items: center; gap: 14px; font-family: system-ui, -apple-system, sans-serif; text-decoration: none; box-shadow: 0 6px 20px rgba(15, 23, 42, 0.4); transition: transform 0.2s;`,
    htmlText1: "Fluency Disorder Expert",
    htmlText2: "Cluttering & Stuttering",
    htmlIconColor: "#38bdf8",
  },
  {
    id: "light",
    label: "Light",
    tagline: "Recommended by your SLP",
    subtitle: "clutterpro.com",
    previewBg: "bg-white border-2 border-border",
    previewText: "text-foreground",
    previewAccent: "text-primary",
    icon: Heart,
    htmlStyle: `background: #ffffff; color: #1f2937; padding: 14px 22px; border-radius: 14px; border: 2px solid #e5e7eb; display: inline-flex; align-items: center; gap: 14px; font-family: system-ui, -apple-system, sans-serif; text-decoration: none; box-shadow: 0 4px 14px rgba(0,0,0,0.08); transition: transform 0.2s;`,
    htmlText1: "Recommended by your SLP",
    htmlText2: "clutterpro.com",
    htmlIconColor: "#0F766E",
  },
];

const publishedUrl = "https://www.clutterpro.com";

function generateBadgeHTML(badge: BadgeConfig) {
  return `<!-- ClutterPro Badge -->
<a href="${publishedUrl}" target="_blank" rel="noopener noreferrer" style="${badge.htmlStyle}">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${badge.htmlIconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  <span>
    <strong style="display:block;font-size:14px;line-height:1.3;">${badge.htmlText1}</strong>
    <span style="font-size:12px;opacity:0.85;">${badge.htmlText2}</span>
  </span>
</a>`;
}

const TherapistMarketingKit = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCopy = async (badge: BadgeConfig) => {
    const html = generateBadgeHTML(badge);
    const success = await copyToClipboard(html);
    if (success) {
      setCopiedId(badge.id);
      toast.success("HTML code copied! Paste it on your website.");
      setTimeout(() => setCopiedId(null), 3000);
    } else {
      toast.error("Failed to copy");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Badge for your website
        </CardTitle>
        <CardDescription>
          A badge to add to your website or professional profile to let patients know you use ClutterPro.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Badges */}
        <div className="grid gap-4">
          {BADGES.map((badge) => {
            const Icon = badge.icon;
            const isCopied = copiedId === badge.id;
            const isExpanded = expandedId === badge.id;

            return (
              <div key={badge.id} className="rounded-xl border border-border overflow-hidden">
                {/* Preview area */}
                <div className="p-6 flex flex-col items-center gap-4 bg-muted/30">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{badge.label}</span>

                  {/* Badge preview */}
                  <div
                    className={`inline-flex items-center gap-3.5 px-5 py-3.5 rounded-[14px] shadow-lg ${badge.previewBg} ${badge.previewText} cursor-default select-none`}
                  >
                    <Icon className={`w-6 h-6 flex-shrink-0 ${badge.previewAccent}`} />
                    <span className="text-left">
                      <strong className="block text-sm leading-tight">{badge.tagline}</strong>
                      <span className="text-xs opacity-85">{badge.subtitle}</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 flex items-center gap-2 bg-background border-t border-border">
                  <Button
                    onClick={() => handleCopy(badge)}
                    size="sm"
                    variant={isCopied ? "secondary" : "default"}
                    className="gap-2 flex-1"
                  >
                    {isCopied ? (
                      <><Check className="w-3.5 h-3.5" /> Copied!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy HTML code</>
                    )}
                  </Button>
                  <Button
                    onClick={() => setExpandedId(isExpanded ? null : badge.id)}
                    size="sm"
                    variant="ghost"
                    className="gap-1 text-xs text-muted-foreground"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    Code
                  </Button>
                </div>

                {/* Expandable code */}
                {isExpanded && (
                  <div className="px-4 pb-4">
                    <pre className="text-xs font-mono bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {generateBadgeHTML(badge)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* How-to */}
        <div className="rounded-xl bg-muted/50 p-5 space-y-3">
          <p className="font-semibold text-sm">In 3 clicks:</p>
          <div className="grid gap-2.5">
            {[
              { step: "1", text: "Choose the badge you like and click \"Copy\"" },
              { step: "2", text: "Paste it on your website, professional profile, or email signature" },
              { step: "3", text: "That's it! Your patients will see that you use the app" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {item.step}
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TherapistMarketingKit;

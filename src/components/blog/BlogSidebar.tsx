import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Stethoscope, Users, BarChart3, Shield, Activity, Zap, List } from "lucide-react";
import type { BlogPost } from "@/data/blogPosts";

/** Extract H2 headings from markdown content and create IDs */
function extractTocItems(content: string): { id: string; text: string }[] {
  const lines = content.split('\n');
  const items: { id: string; text: string }[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      const text = trimmed.replace('## ', '');
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      items.push({ id, text });
    }
  }
  return items;
}

/** Auto-generated sticky Table of Contents */
function TableOfContents({ content }: { content: string }) {
  const items = extractTocItems(content);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0.1 }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  if (items.length < 3) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <List className="w-4 h-4 text-muted-foreground" />
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          In this article
        </h4>
      </div>
      <nav className="space-y-0.5">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`block text-[13px] leading-snug py-1.5 pl-3 border-l-2 transition-all ${
              activeId === item.id
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
}

interface BlogSidebarProps {
  relatedPosts: BlogPost[];
  audience: 'pro' | 'patient';
  ctaLink?: string;
  ctaLabel?: string;
  articleContent?: string;
}

export default function BlogSidebar({ relatedPosts, audience, ctaLink, ctaLabel, articleContent }: BlogSidebarProps) {
  const patientLink = ctaLink || '/assessment';
  const patientLabel = ctaLabel || 'Take the test (2 min)';
  return (
    <aside className="lg:w-80 flex-shrink-0 self-start lg:sticky lg:top-24">
      <div className="space-y-6">
        {/* Table of Contents */}
        {articleContent && <TableOfContents content={articleContent} />}

        {audience === 'pro' ? (
          /* Pro/SLP CTA */
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-muted/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <span className="font-bold text-foreground text-sm">
                  TalkSlower for SLPs
                </span>
              </div>

              <h4 className="font-bold text-foreground mb-3 text-base leading-snug">
                Track your patients' speech rate remotely
              </h4>

              <ul className="space-y-2.5 mb-5">
                <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <BarChart3 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Real-time SPS metrics</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Free for your patients</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>HIPAA-conscious, US-based hosting</span>
                </li>
              </ul>

              <Button asChild className="w-full" size="sm">
                <Link to="/auth?tab=signup">
                  Free 30-day trial
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>

              <p className="text-xs text-muted-foreground/70 text-center mt-2.5">
                No credit card required
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Patient CTA */
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-muted/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <span className="font-bold text-foreground text-sm">
                  Speaking too fast?
                </span>
              </div>

              <h4 className="font-bold text-foreground mb-3 text-base leading-snug">
                Measure your speech rate in 10 seconds
              </h4>

              <ul className="space-y-2.5 mb-5">
                <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Instant visual feedback</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <BarChart3 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Track your progress day by day</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Free with your therapist's Pro Code</span>
                </li>
              </ul>

              <Button asChild className="w-full" size="sm">
                <Link to={patientLink}>
                  {patientLabel}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>

              <p className="text-xs text-muted-foreground/70 text-center mt-2.5">
                Free and instant self-assessment
              </p>
            </CardContent>
          </Card>
        )}

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              Related articles
            </h4>
            <div className="space-y-3">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.slug}`}
                  className="block p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all"
                >
                  <Badge variant="outline" className="mb-2 text-xs">
                    {related.category}
                  </Badge>
                  <h5 className="font-medium text-foreground text-sm line-clamp-2">
                    {related.title}
                  </h5>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

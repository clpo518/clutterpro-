import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Stethoscope, Users, BarChart3, Shield, Activity, Zap } from "lucide-react";
import type { BlogPost } from "@/data/blogPosts";

interface BlogSidebarProps {
  relatedPosts: BlogPost[];
  audience: 'pro' | 'patient';
  ctaLink?: string;
  ctaLabel?: string;
}

export default function BlogSidebar({ relatedPosts, audience, ctaLink, ctaLabel }: BlogSidebarProps) {
  const patientLink = ctaLink || '/assessment';
  const patientLabel = ctaLabel || 'Take the test (2 min)';
  return (
    <aside className="lg:w-80 flex-shrink-0 self-start lg:sticky lg:top-24">
      <div className="space-y-6">
        {audience === 'pro' ? (
          /* Pro/SLP CTA */
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-muted/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <span className="font-bold text-foreground text-sm">
                  ClutterPro for SLPs
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
                  <span>Free with your SLP's Pro Code</span>
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

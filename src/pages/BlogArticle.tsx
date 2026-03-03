import { useParams, Link, Navigate } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Clock, User, Activity, Zap, Shield, CheckCircle2, Stethoscope } from "lucide-react";
import { getBlogPostBySlug, blogPosts } from "@/data/blogPosts";
import BlogInlineCTA from "@/components/blog/BlogInlineCTA";
import BlogSidebar from "@/components/blog/BlogSidebar";
import BlogStickyMobileCTA from "@/components/blog/BlogStickyMobileCTA";

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 2);

  const renderContent = (content: string) => {
    // Split by CTA marker first
    const parts = content.split('{{CTA}}');
    
    return parts.map((part, partIndex) => {
      const elements = part
        .split('\n')
        .map((line, index) => {
          const trimmedLine = line.trim();
          if (!trimmedLine) return <br key={`${partIndex}-${index}`} />;

          if (trimmedLine.startsWith('### ')) {
            return (
              <h3 key={`${partIndex}-${index}`} className="text-xl md:text-2xl font-semibold text-foreground mt-10 mb-4">
                {trimmedLine.replace('### ', '')}
              </h3>
            );
          }

          if (trimmedLine.startsWith('## ')) {
            return (
              <h2 key={`${partIndex}-${index}`} className="text-2xl md:text-3xl font-bold text-foreground mt-12 mb-6 leading-tight">
                {trimmedLine.replace('## ', '')}
              </h2>
            );
          }

          if (trimmedLine.startsWith('> ')) {
            const text = trimmedLine.replace('> ', '');
            return (
              <blockquote
                key={`${partIndex}-${index}`}
                className="border-l-4 border-primary pl-6 py-3 my-8 bg-primary/5 rounded-r-xl italic text-foreground/80 text-lg"
                dangerouslySetInnerHTML={{
                  __html: text
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline font-medium">$1</a>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold not-italic">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                }}
              />
            );
          }

          if (trimmedLine === '---') {
            return <hr key={`${partIndex}-${index}`} className="my-10 border-border/50" />;
          }

          if (trimmedLine.startsWith('- ')) {
            const text = trimmedLine.replace('- ', '');
            return (
              <li key={`${partIndex}-${index}`} className="text-foreground/80 ml-6 mb-3 list-disc list-outside text-lg leading-relaxed">
                <span dangerouslySetInnerHTML={{
                  __html: text
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline font-medium">$1</a>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                }} />
              </li>
            );
          }

          return (
            <p
              key={`${partIndex}-${index}`}
              className="text-foreground/80 text-lg leading-[1.8] mb-6"
              dangerouslySetInnerHTML={{
                __html: trimmedLine
                  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline font-medium">$1</a>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
              }}
            />
          );
        });

      // Insert inline CTA between parts
      if (partIndex < parts.length - 1) {
        return (
          <div key={`part-${partIndex}`}>
            {elements}
            <BlogInlineCTA ctaLink={inlineCTALink} ctaLabel={inlineCTALabel} />
          </div>
        );
      }
      return <div key={`part-${partIndex}`}>{elements}</div>;
    });
  };

  // Contextual CTAs for diagnostic article
  const isDiagnosticArticle = post.slug === 'test-vocal-debit-parole-gratuit';
  const inlineCTALink = isDiagnosticArticle ? '/diagnostic' : undefined;
  const inlineCTALabel = isDiagnosticArticle ? 'Test my speech rate for free' : undefined;
  const bottomCTALink = isDiagnosticArticle ? '/diagnostic' : '/auth?tab=signup';
  const bottomCTALabel = isDiagnosticArticle ? 'Take the free voice test' : 'Test my speech rate for free';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        {/* Breadcrumb + Article Header */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-muted/50 to-background">
          <div className="container px-4 md:px-6">
            <div className="max-w-[65ch] mx-auto">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to blog
              </Link>

              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                {post.category}
              </Badge>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
                <span className="text-muted-foreground/50">•</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime} read</span>
                </div>
                <span className="text-muted-foreground/50">•</span>
                <span>{new Date(post.date).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content with Sidebar */}
        <section className="py-8 md:py-12">
          <div className="container px-4 md:px-6">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12">
              {/* Main Content - 65ch optimal reading width */}
              <article className="flex-1 max-w-[65ch]">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {renderContent(post.content)}
                </div>

                {/* Bottom Article CTA */}
                <div className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-teal-500/10 rounded-2xl border border-primary/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      Take action
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Don't stay stuck in theory. Test your speech rate and start your practice right now. It's free.
                  </p>
                  <Button asChild size="lg">
                    <Link to={bottomCTALink}>
                      {bottomCTALabel}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </article>

              {/* Sticky Sidebar */}
              <BlogSidebar 
                relatedPosts={relatedPosts} 
                audience={post.audience} 
                ctaLink={isDiagnosticArticle ? '/diagnostic' : undefined}
                ctaLabel={isDiagnosticArticle ? 'Take the voice test (30s)' : undefined}
              />
            </div>
          </div>
        </section>

        {/* Bottom Banner CTA */}
        <section className="py-16 bg-gradient-to-r from-primary/10 via-teal-500/10 to-primary/10">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              From theory to practice
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Train with our visual biofeedback tool. Take control of your speech.
            </p>
            <Button asChild size="lg">
              <Link to="/auth?tab=signup">
                Create my free account
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Sticky mobile CTA */}
      <BlogStickyMobileCTA />

      <Footer />
    </div>
  );
}

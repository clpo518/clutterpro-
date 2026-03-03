/**
 * SEO Head Component
 * Provides page-specific meta tags, canonical URLs, JSON-LD structured data
 * Uses react-helmet-async for declarative <head> management
 */

import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { blogPosts } from '@/data/blogPosts';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  jsonLd?: object;
}

const SITE_URL = 'https://www.clutterpro.com';
const SITE_NAME = 'ClutterPro';
const OG_DEFAULT = `${SITE_URL}/og-default.png`;

// Per-page OG images
const ogImages: Record<string, string> = {
  '/': `${SITE_URL}/og-home.png`,
  '/patients': `${SITE_URL}/og-patients.png`,
  '/pricing': `${SITE_URL}/og-pricing.png`,
  '/pro': `${SITE_URL}/og-home.png`,
  '/assessment': `${SITE_URL}/og-assessment.png`,
  '/about': `${SITE_URL}/og-about.png`,
  '/blog': `${SITE_URL}/og-blog.png`,
  '/diagnostic': `${SITE_URL}/og-diagnostic.png`,
};

const seoConfig: Record<string, SEOConfig> = {
  // -- Public Pages --
  '/': {
    title: 'ClutterPro — Control Your Speech Rate',
    description: 'ClutterPro helps people with cluttering and their speech-language pathologists measure, practice, and improve speech rate. Real-time SPS measurement, 60+ exercises, clinical tracking.',
    keywords: 'cluttering speech therapy, SLP tool, speech rate measurement, SPS Van Zaalen, fluency training',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web',
      description: 'Speech rate training tool for cluttering. Real-time SPS measurement, clinical reports, and remote patient monitoring.',
      url: SITE_URL,
      offers: {
        '@type': 'Offer',
        price: '29',
        priceCurrency: 'USD',
        description: 'Pro subscription from $29/month'
      }
    }
  },
  '/patients': {
    title: 'Cluttering Exercises & Speech Rate Training | ClutterPro',
    description: 'The training app for people who clutter or speak too fast. Measure your rate in syllables/second, track your progress, and practice 5 min/day.',
    keywords: 'cluttering exercises, speaking too fast, speech rate control, vocal biofeedback, speech training'
  },
  '/pricing': {
    title: 'ClutterPro Pricing — Plans for SLPs and Patients',
    description: 'Pro subscription from $29/month for 3 patients. Free for patients. 30-day free trial. Cancel anytime.',
    keywords: 'SLP subscription, cluttering therapy tool pricing, speech therapy software'
  },
  '/pro': {
    title: 'ClutterPro for SLPs — Clinical Tools for Cluttering Therapy',
    description: 'Clinical tool for cluttering assessment and monitoring. Van Zaalen SPS metrics, auto-generated PDF reports, remote patient tracking. 30-day free trial.',
    keywords: 'SLP cluttering tool, fluency assessment, remote patient monitoring, SPS Van Zaalen, clinical report'
  },
  '/auth': {
    title: 'Log In — ClutterPro',
    description: 'Log in to your ClutterPro patient or professional account.',
    keywords: 'clutterpro login, SLP signup, patient account'
  },
  '/assessment': {
    title: 'Free Cluttering Assessment — 2-Minute Self-Test',
    description: 'Evaluate your cluttering symptoms for free in 10 questions. Based on clinically validated screening tools. Instant results.',
    keywords: 'cluttering assessment free, cluttering self-test, speech rate evaluation, cluttering screening',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: 'Cluttering Screening Assessment',
      description: 'Self-assessment based on clinically validated cluttering screening tools.',
      audience: { '@type': 'PeopleAudience', healthCondition: { '@type': 'MedicalCondition', name: 'Cluttering' } }
    }
  },
  '/about': {
    title: 'About ClutterPro — Built by Someone Who Clutters',
    description: 'The story of how a developer with cluttering built the speech training tool he wished existed.',
    keywords: 'about clutterpro, founder cluttering, speech rate tool story'
  },
  '/contact': {
    title: 'Contact — ClutterPro',
    description: 'Contact the ClutterPro team. Response within 24 hours. Human and confidential support.',
    keywords: 'contact clutterpro, SLP support, technical help'
  },
  '/legal/terms': {
    title: 'Terms of Service — ClutterPro',
    description: 'ClutterPro terms of service. Access conditions, service usage, and responsibilities.',
    keywords: 'terms of service, legal, terms and conditions'
  },
  '/legal/privacy': {
    title: 'Privacy Policy — ClutterPro',
    description: 'How ClutterPro protects your personal data. HIPAA-conscious security practices, encryption, and data protection.',
    keywords: 'privacy policy, HIPAA, personal data protection, health data security'
  },
  '/diagnostic': {
    title: 'Free Voice Test — Measure Your Speech Rate in 30 Seconds',
    description: 'Do you speak too fast? Take the free voice test, no signup needed. Instant clinical results in syllables/second based on Van Zaalen norms.',
    keywords: 'free voice test, measure speech rate, speaking too fast test, cluttering diagnosis, syllables per second',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: 'Speech Rate Voice Test',
      description: 'Free voice test to measure your speech rate in syllables per second.',
      audience: { '@type': 'PeopleAudience', healthCondition: { '@type': 'MedicalCondition', name: 'Cluttering' } }
    }
  },

  // -- Blog Pages --
  '/blog': {
    title: 'ClutterPro Blog — Cluttering Resources for SLPs',
    description: 'Expert articles on cluttering, speech exercises, and clinical tools. Learn to master your speech rate.',
    keywords: 'cluttering blog, speech exercises, speech rate, SLP resources, fluency'
  },

  // -- App Pages (Patient) --
  '/dashboard': {
    title: 'My Dashboard — Progress Tracking | ClutterPro',
    description: 'Your speech rate stats, recent recordings, and weekly goals.',
    keywords: 'dashboard, progress, speech rate stats, training tracker'
  },
  '/library': {
    title: 'Exercise Library — 60+ Exercises | ClutterPro',
    description: 'Clinical texts, tongue twisters, breathing exercises, and cognitive challenges. Over 60 exercises to work on your pace.',
    keywords: 'speech exercises, fluency, tongue twisters, guided reading, articulation drills'
  },
  '/practice': {
    title: 'Training Studio — Vocal Biofeedback | ClutterPro',
    description: 'Recording interface with visual feedback (waveform), real-time SPS gauge, and filler word detection.',
    keywords: 'biofeedback training, speech rate exercise, speech speed gauge, karaoke reading'
  },
  '/settings': {
    title: 'Settings — ClutterPro',
    description: 'Manage your profile, preferences, and subscription.',
    keywords: 'settings, profile, preferences'
  },
  '/subscription/manage': {
    title: 'My Subscription — ClutterPro',
    description: 'Manage your ClutterPro subscription.',
    keywords: 'subscription, management, billing'
  },

  // -- App Pages (Therapist) --
  '/patient/list': {
    title: 'My Patients — Pro Dashboard | ClutterPro',
    description: 'Manage your patients, track their progress, and send remote exercise prescriptions.',
    keywords: 'patient management, SLP dashboard, clinical tracking'
  },
  '/pro/subscription': {
    title: 'Pro Subscription — ClutterPro',
    description: 'Choose your professional plan and start monitoring your patients.',
    keywords: 'pro subscription, SLP plan'
  },
  '/pro/subscription/manage': {
    title: 'Manage Pro Subscription — ClutterPro',
    description: 'Modify or cancel your professional subscription.',
    keywords: 'subscription management, cancellation, billing'
  }
};

// FAQ structured data for landing pages
const patientFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does this replace a speech-language pathologist?',
      acceptedAnswer: { '@type': 'Answer', text: 'No, ClutterPro is a complementary tool for practicing between sessions. It is ideally used under the guidance of your SLP.' }
    },
    {
      '@type': 'Question',
      name: 'What is cluttering?',
      acceptedAnswer: { '@type': 'Answer', text: 'Cluttering is a fluency disorder characterized by an excessively fast and/or irregular speech rate, collapsed syllables, and sometimes difficulty organizing discourse.' }
    },
    {
      '@type': 'Question',
      name: 'How long should I practice?',
      acceptedAnswer: { '@type': 'Answer', text: '5 to 10 minutes per day is enough to see progress. Consistency matters more than duration.' }
    },
    {
      '@type': 'Question',
      name: 'Are my recordings confidential?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Your recordings are encrypted and accessible only by you (and your SLP if you link your account). HIPAA-conscious hosting.' }
    }
  ]
};

const proFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does the free trial work?',
      acceptedAnswer: { '@type': 'Answer', text: 'You get 30 days to test all features with up to 3 patients. No credit card required.' }
    },
    {
      '@type': 'Question',
      name: 'Do my patients need to pay?',
      acceptedAnswer: { '@type': 'Answer', text: "No, it's free for your patients. Your subscription covers their access. They simply create an account with your Pro Code." }
    },
    {
      '@type': 'Question',
      name: 'Is patient data secure?',
      acceptedAnswer: { '@type': 'Answer', text: 'Absolutely. Encrypted hosting, HIPAA-conscious security practices. Only you and your patient have access to the data.' }
    }
  ]
};

function useSEOConfig() {
  const location = useLocation();

  let config = seoConfig[location.pathname];
  let jsonLd = config?.jsonLd;

  if (!config) {
    if (location.pathname.startsWith('/patient/')) {
      config = {
        title: 'Patient Profile — Clinical Tracking | ClutterPro',
        description: 'Recordings, SPS progress chart, and clinical metrics for your patient.',
        keywords: 'patient profile, clinical tracking, SPS, speech therapy progress'
      };
    } else if (location.pathname.startsWith('/session/')) {
      config = {
        title: 'Session Analysis — ClutterPro',
        description: 'Analyze your recording: SPS rate curve, detected disfluencies, and waveform.',
        keywords: 'session analysis, recording, SPS rate, waveform'
      };
    } else if (location.pathname.startsWith('/blog/')) {
      config = {
        title: 'Article — ClutterPro Blog',
        description: 'Article on cluttering, speech rate, and speech therapy exercises.',
        keywords: 'cluttering blog, speech therapy article'
      };
    } else {
      config = {
        title: 'ClutterPro — Speech Rate Training for Cluttering',
        description: 'ClutterPro helps people with cluttering and their speech-language pathologists measure, practice, and improve speech rate. Real-time SPS measurement, 60+ exercises, clinical tracking.',
        keywords: 'clutterpro, cluttering, speech-language pathologist'
      };
    }
  }

  // Add FAQ JSON-LD for landing pages
  if (location.pathname === '/patients') {
    jsonLd = patientFaqJsonLd;
  } else if (location.pathname === '/pricing') {
    jsonLd = proFaqJsonLd;
  }

  // Auto-generate Article JSON-LD for blog posts
  const isBlogArticle = location.pathname.startsWith('/blog/') && location.pathname !== '/blog';
  let blogPost: (typeof blogPosts)[number] | undefined;
  if (isBlogArticle) {
    const slug = location.pathname.replace('/blog/', '');
    blogPost = blogPosts.find(p => p.slug === slug);
    if (blogPost && !jsonLd) {
      const articleOgImage = ogImages[location.pathname] || ogImages['/blog'] || OG_DEFAULT;
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: blogPost.title,
        description: blogPost.excerpt,
        image: articleOgImage,
        datePublished: blogPost.date,
        dateModified: blogPost.date,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${SITE_URL}${location.pathname}`
        },
        author: { '@type': 'Person', name: blogPost.author },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-email.png` }
        }
      };
    }
    // Enrich existing Article JSON-LD
    if (blogPost && jsonLd && (jsonLd as any)['@type'] === 'Article') {
      const ld = jsonLd as any;
      const articleOgImage = ogImages[location.pathname] || ogImages['/blog'] || OG_DEFAULT;
      if (!ld.image) ld.image = articleOgImage;
      if (!ld.dateModified) ld.dateModified = blogPost.date;
      if (!ld.mainEntityOfPage) ld.mainEntityOfPage = { '@type': 'WebPage', '@id': `${SITE_URL}${location.pathname}` };
      if (!ld.publisher?.logo) {
        ld.publisher = { ...ld.publisher, logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-email.png` } };
      }
    }
  }

  const canonicalPath = location.pathname === '/' ? '' : location.pathname;
  const pageOgImage = ogImages[location.pathname]
    || (location.pathname.startsWith('/blog/') ? ogImages['/blog'] : undefined)
    || OG_DEFAULT;
  const ogType = isBlogArticle ? 'article' : 'website';

  return { config, jsonLd, canonicalPath, pageOgImage, ogType, isBlogArticle, blogPost, pathname: location.pathname };
}

export default function SEOHead() {
  const { config, jsonLd, canonicalPath, pageOgImage, ogType, isBlogArticle, blogPost, pathname } = useSEOConfig();

  return (
    <Helmet>
      <title>{config.title}</title>
      <meta name="description" content={config.description} />
      {config.keywords && <meta name="keywords" content={config.keywords} />}
      <link rel="canonical" href={`${SITE_URL}${canonicalPath}`} />

      {/* Open Graph */}
      <meta property="og:title" content={config.title} />
      <meta property="og:description" content={config.description} />
      <meta property="og:url" content={`${SITE_URL}${pathname}`} />
      <meta property="og:image" content={pageOgImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:type" content={ogType} />
      {isBlogArticle && blogPost && (
        <meta property="article:published_time" content={blogPost.date} />
      )}
      {isBlogArticle && blogPost && (
        <meta property="article:author" content={blogPost.author} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={config.title} />
      <meta name="twitter:description" content={config.description} />
      <meta name="twitter:image" content={pageOgImage} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

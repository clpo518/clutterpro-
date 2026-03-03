import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Trash2, Cookie } from "lucide-react";
import { motion } from "framer-motion";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">Privacy</span>
          </div>
          <div className="w-24" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: January 2026
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-10">
            <p className="text-foreground/90 leading-relaxed">
              At <strong>ClutterPro</strong>, protecting your personal data is our top priority.
              This privacy policy explains how we collect, use, and protect
              your information, especially your <strong>voice recordings</strong>, in accordance with
              HIPAA-conscious practices and applicable data protection regulations.
            </p>
          </div>

          {/* Legal Content */}
          <div className="space-y-10 text-foreground/90 leading-relaxed">

            {/* Section 1 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-serif font-semibold text-foreground">
                  1. Data Collection
                </h2>
              </div>
              <p className="mb-4">
                When using our application, we collect the following data:
              </p>
              <ul className="space-y-3 list-none pl-0">
                <li className="flex items-start gap-3 bg-muted/30 rounded-lg p-3">
                  <span className="text-primary font-bold">•</span>
                  <div>
                    <strong>Identification data:</strong> Email address and name (for account creation and management).
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-muted/30 rounded-lg p-3">
                  <span className="text-primary font-bold">•</span>
                  <div>
                    <strong>Voice recordings:</strong> Audio files created during active training exercises.
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-muted/30 rounded-lg p-3">
                  <span className="text-primary font-bold">•</span>
                  <div>
                    <strong>Progress data:</strong> Speech rate statistics (SPS), session duration, training history.
                  </div>
                </li>
              </ul>

              <div className="mt-6 bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-700 rounded-xl p-4">
                <p className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy commitment
                </p>
                <p className="text-green-900 dark:text-green-200 mt-2">
                  Your voice recordings are stored securely and are <strong>NEVER</strong> used
                  for advertising, marketing, or sold to third parties. They are used solely for your personal training.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-serif font-semibold text-foreground">
                  2. Use of Voice Data
                </h2>
              </div>
              <p className="mb-4">
                Your audio files are used <strong>exclusively</strong> for the following purposes:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="font-semibold mb-2">Visual feedback</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate the waveform and spectral analysis to visualize your speech rate.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🎧</span>
                  </div>
                  <h3 className="font-semibold mb-2">Personal playback</h3>
                  <p className="text-sm text-muted-foreground">
                    Allow you to replay your sessions to analyze your progress.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">👩‍⚕️</span>
                  </div>
                  <h3 className="font-semibold mb-2">SLP follow-up</h3>
                  <p className="text-sm text-muted-foreground">
                    Allow your linked SLP to listen (if you entered a Pro Code).
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground italic">
                Note: Only the SLP you have explicitly linked via a Pro Code can access your recordings.
                No other professional or ClutterPro employee has access.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-serif font-semibold text-foreground">
                  3. Data Sharing
                </h2>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl p-4 mb-4">
                <p className="font-semibold text-amber-800 dark:text-amber-300">
                  🔒 We NEVER sell your data.
                </p>
              </div>
              <p className="mb-4">
                Data sharing is strictly limited to the following cases:
              </p>
              <ul className="space-y-2 list-disc pl-6">
                <li>
                  <strong>Technical subcontractors:</strong> Our hosting partners (Supabase, secure US-based hosting)
                  that comply with applicable data protection standards and ensure data security.
                </li>
                <li>
                  <strong>Legal obligations:</strong> In case of a request from a competent judicial authority.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-serif font-semibold text-foreground">
                  4. Your Rights
                </h2>
              </div>
              <p className="mb-4">
                You have the following rights regarding your personal data:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">✅ Right of access</h3>
                  <p className="text-sm text-muted-foreground">
                    Request a copy of all data we hold about you.
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">✅ Right to rectification</h3>
                  <p className="text-sm text-muted-foreground">
                    Modify or correct your personal information.
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">✅ Right to erasure</h3>
                  <p className="text-sm text-muted-foreground">
                    Request the complete deletion of your account and recordings.
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">✅ Right to portability</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive your data in a structured, readable format.
                  </p>
                </div>
              </div>
              <div className="mt-6 bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p>
                  To exercise your rights, contact us at:
                  <a href="mailto:support@clutterpro.com" className="text-primary font-semibold hover:underline ml-1">
                    support@clutterpro.com
                  </a>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  We will respond to your request within a maximum of 30 days.
                </p>
              </div>
            </section>

            {/* HIPAA Notice */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-serif font-semibold text-foreground">
                  5. HIPAA Notice
                </h2>
              </div>
              <p className="mb-4">
                While ClutterPro is not a covered entity under HIPAA, we follow HIPAA-conscious practices to protect your health-related data:
              </p>
              <ul className="space-y-2 list-disc pl-6">
                <li><strong>Encryption:</strong> All data is encrypted in transit (HTTPS/TLS) and at rest.</li>
                <li><strong>Access controls:</strong> Only authorized automated systems access recordings for processing.</li>
                <li><strong>Minimum necessary:</strong> We collect only the data necessary to provide our services.</li>
                <li><strong>Breach notification:</strong> In the unlikely event of a data breach, affected users will be notified promptly.</li>
              </ul>
            </section>

            {/* Section 5 - Cookies */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-serif font-semibold text-foreground">
                  6. Cookies
                </h2>
              </div>
              <p className="mb-4">
                Our application uses only the following cookies:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border p-3 text-left font-semibold">Type</th>
                      <th className="border border-border p-3 text-left font-semibold">Purpose</th>
                      <th className="border border-border p-3 text-left font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-3">Session cookies</td>
                      <td className="border border-border p-3">Keep your session active</td>
                      <td className="border border-border p-3">Session</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="border border-border p-3">Authentication cookies</td>
                      <td className="border border-border p-3">Secure your account</td>
                      <td className="border border-border p-3">30 days</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Preference cookies</td>
                      <td className="border border-border p-3">Remember your settings (theme, language)</td>
                      <td className="border border-border p-3">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                We do not use advertising or marketing tracking cookies.
              </p>
            </section>

            {/* Section 6 - Data Security */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                7. Data Security
              </h2>
              <p className="mb-4">
                We implement technical and organizational security measures to protect your data:
              </p>
              <ul className="space-y-2 list-disc pl-6">
                <li><strong>Encryption:</strong> All data is encrypted in transit (HTTPS/TLS) and at rest.</li>
                <li><strong>Restricted access:</strong> Only automated systems access recordings for processing.</li>
                <li><strong>Secure US-based hosting:</strong> Your data is hosted on secure US-based infrastructure.</li>
                <li><strong>Backups:</strong> Regular backups ensure the availability of your data.</li>
              </ul>
            </section>

            {/* Section 7 - Contact */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                8. Contact
              </h2>
              <p className="mb-4">
                For any questions regarding this privacy policy or your personal data,
                you can contact us:
              </p>
              <div className="bg-card border border-border rounded-xl p-6">
                <p><strong>ClutterPro</strong></p>
                <p className="mt-2">
                  Email: <a href="mailto:support@clutterpro.com" className="text-primary hover:underline">support@clutterpro.com</a>
                </p>
              </div>
            </section>

          </div>

          {/* Back to Home */}
          <div className="mt-16 text-center border-t border-border pt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Privacy;

import { Link } from "react-router-dom";
import { ArrowLeft, Scale, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const Terms = () => {
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
            <Scale className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">Legal</span>
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
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Last updated: January 2026
            </p>
          </div>

          {/* Legal Content */}
          <div className="space-y-10 text-foreground/90 leading-relaxed">

            {/* Article 1 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                1. General Information
              </h2>
              <p className="mb-4">
                The website and application <strong>ClutterPro</strong> are operated by <strong>ClutterPro Inc.</strong>
              </p>
              <ul className="space-y-2 list-none pl-0">
                <li><strong>Hosting:</strong> Supabase / Vercel</li>
                <li><strong>Contact:</strong> <a href="mailto:support@clutterpro.com" className="text-primary hover:underline">support@clutterpro.com</a></li>
              </ul>
            </section>

            {/* Article 2 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                2. Purpose and Scope
              </h2>
              <p>
                These Terms of Service govern the sale of subscriptions and the use of the "ClutterPro" application. They apply to all subscribing healthcare professionals (the "SLP" or "Subscriber") as well as any person with access via a Pro Code (the "Patient"). Use of the application constitutes unconditional acceptance of these terms.
              </p>
            </section>

            {/* Article 3 - CRITICAL WARNING BOX */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                3. IMPORTANT DISCLAIMER (MEDICAL NON-LIABILITY)
              </h2>
              <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-400 dark:border-red-700 rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                  <p className="font-semibold text-red-800 dark:text-red-300">
                    ClutterPro is a speech rate training and regulation tool. IT IS NOT A MEDICAL DEVICE.
                  </p>
                </div>
                <ul className="space-y-3 text-red-900 dark:text-red-200 ml-9">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400">•</span>
                    <span>The application does not provide any diagnosis or medical prescription.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400">•</span>
                    <span>The use of the application is not a substitute for a consultation with a speech-language pathologist, ENT physician, or any other healthcare specialist.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400">•</span>
                    <span>ClutterPro disclaims all liability in case of lack of progress or worsening of conditions. The user is solely responsible for the interpretation of provided data (charts, speed) which are given for informational purposes only.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Article 4 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                4. Services, Access, and Subscription Model
              </h2>
              <p className="mb-4">
                The application operates under two complementary models:
              </p>

              <h3 className="text-lg font-semibold mb-3 text-foreground">4.1 — Professional Model (B2B)</h3>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li><strong>The SLP</strong> subscribes to a paid plan and receives a unique "Pro Code" to share with their patients.</li>
                <li><strong>The Patient</strong> receives free access to all features (exercises, spectral analysis, progress tracking) through the Pro Code provided by their SLP.</li>
                <li>The SLP's subscription includes a number of "active patient seats." The SLP can archive a patient to free up a seat.</li>
                <li>If the SLP cancels their subscription, associated patients lose access to exercises and tracking data.</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-foreground">4.2 — Solo Patient Subscription (B2C)</h3>
              <ul className="space-y-2 list-disc pl-6 mb-4">
                <li>Anyone can sign up without a Pro Code and receive a <strong>7-day free trial</strong> with access to all features.</li>
                <li>After the trial, the user can subscribe to a monthly plan at the current rate (currently <strong>$9 USD/month</strong>) to retain access.</li>
                <li>Solo users can link their account to an SLP via a Pro Code in Settings at any time, switching to the B2B model.</li>
                <li>If the subscription is not renewed, access to exercises and tracking data is suspended.</li>
              </ul>
            </section>

            {/* Article 5 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                5. Pricing and Payment Terms
              </h2>
              <p className="mb-4">
                Prices are listed in US Dollars (USD).
              </p>
              <ul className="space-y-3 list-disc pl-6">
                <li>
                  <strong>Professional Subscription (B2B):</strong> The SLP subscribes to a monthly plan. Payment is due immediately upon order, with automatic renewal unless canceled before the billing date.
                </li>
                <li>
                  <strong>Solo Patient Subscription (B2C):</strong> Patients without a Pro Code can subscribe to a monthly plan (currently $9 USD/month) after the 7-day free trial. The subscription auto-renews each month.
                </li>
                <li>
                  <strong>Security:</strong> Transactions are secured by our payment processor (Stripe). ClutterPro does not store any banking information.
                </li>
              </ul>
            </section>

            {/* Article 6 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                6. Cancellation and Refund Policy
              </h2>
              <p className="mb-4">
                You may cancel your subscription at any time. Upon cancellation, you will retain access until the end of your current billing period. No partial refunds are provided for unused portions of a subscription period.
              </p>
              <p className="font-semibold bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-lg p-4 text-amber-900 dark:text-amber-200">
                By subscribing and immediately accessing the features, the Subscriber acknowledges that the digital content has been delivered and that refunds are subject to our discretion.
              </p>
            </section>

            {/* Article 7 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                7. Personal and Health Data
              </h2>
              <p className="mb-4">
                ClutterPro places the utmost importance on protecting your data.
              </p>
              <ul className="space-y-2 list-disc pl-6">
                <li>
                  <strong>Recordings:</strong> Your audio files are not listened to by anyone other than you and, if applicable, your SLP linked via Pro Code.
                </li>
                <li>
                  <strong>Security:</strong> Data is encrypted in transit and at rest.
                </li>
              </ul>
            </section>

            {/* Article 8 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                8. Liability and Force Majeure
              </h2>
              <p>
                ClutterPro shall not be held liable for internet network malfunctions, software bugs, or hardware incompatibility. In any event, ClutterPro's liability is limited to the amount paid by the customer for the service over the last 12 months.
              </p>
            </section>

            {/* Article 9 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                9. Intellectual Property
              </h2>
              <p>
                All elements of the application (texts, code, graphics, audio, detection algorithms) are the exclusive property of ClutterPro. Any reproduction or reverse engineering is strictly prohibited.
              </p>
            </section>

            {/* Article 10 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                10. Governing Law and Disputes
              </h2>
              <p>
                These terms are governed by the laws of the State of Delaware. In the event of a dispute, and failing an amicable resolution, exclusive jurisdiction is granted to the courts of the State of Delaware.
              </p>
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

export default Terms;

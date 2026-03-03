import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, Shield, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "pmv_cookie_consent";
const CONSENT_EXPIRY_DAYS = 30;

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent) {
      const { timestamp } = JSON.parse(consent);
      const expiryDate = new Date(timestamp);
      expiryDate.setDate(expiryDate.getDate() + CONSENT_EXPIRY_DAYS);

      if (new Date() > expiryDate) {
        // Consent expired, show banner again
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        setIsVisible(true);
      }
      // Consent still valid, don't show
    } else {
      // No consent yet, show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      type: "full"
    }));
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: false,
      timestamp: new Date().toISOString(),
      type: "essential"
    }));
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Icon */}
                <div className="hidden md:flex w-12 h-12 rounded-full bg-primary/10 items-center justify-center flex-shrink-0">
                  <Cookie className="w-6 h-6 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 md:hidden">
                    <Cookie className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Cookies & Privacy</h3>
                  </div>
                  <h3 className="hidden md:block font-semibold text-foreground mb-1">
                    Cookies & Privacy
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We use cookies to ensure the site works properly and to analyze
                    your progress. <strong className="text-foreground">Your voice data remains strictly private</strong> and
                    is never shared for advertising purposes.{" "}
                    <Link to="/legal/privacy" className="text-primary hover:underline">
                      Learn more
                    </Link>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <Button
                    onClick={handleAccept}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <Shield className="w-4 h-4" />
                    Accept & Continue
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleDecline}
                    className="text-muted-foreground hover:text-foreground w-full sm:w-auto"
                  >
                    Continue without accepting
                  </Button>
                </div>

                {/* Close button (mobile) */}
                <button
                  onClick={handleDecline}
                  className="absolute top-3 right-3 md:hidden p-1 rounded-full hover:bg-muted transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;

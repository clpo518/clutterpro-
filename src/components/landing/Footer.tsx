import { Activity, Shield, CreditCard, HeadphonesIcon, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      {/* Reassurance Icons */}
      <div className="border-b border-border/60">
        <div className="container px-4 md:px-6 py-8">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Secure payment</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Cancel in 1 click</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <HeadphonesIcon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Responsive support</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Column 1: Logo + Description */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">ClutterPro</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Speech fluency practice tool, recommended by speech-language pathologists.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Navigation</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Log in
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Resources</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Self-Assessment
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Help & Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Patients */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Patients</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/patients" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Patient Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom: Legal + Copyright */}
        <div className="border-t border-border/60 mt-10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Your data is encrypted and stored securely.</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/legal/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/legal/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <span>&copy; {new Date().getFullYear()} ClutterPro. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Mail, Check, Stethoscope, User } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";

interface NoCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUPPORT_EMAIL = "support@clutterpro.com";

// Template for option A: SLP doesn't know the app - we contact them
const CONTACT_SLP_TEMPLATE = `Hello,

I would like to use the ClutterPro app for my training.

My SLP is not yet familiar with the app. Here are their contact details so you can reach out:

SLP name: [Fill in]
Email or phone: [Fill in]
City / Practice: [Fill in]

My name: [Fill in]
My email: [Fill in]

Thank you for your help!`;

// Template for option B: Solo training request
const SOLO_TEMPLATE = `Hello,

I would like to use ClutterPro to train on controlling my speech rate, without SLP supervision for now.

Could you let me know about individual access options?

My name: [Fill in]
My email: [Fill in]

Thanks!`;

const NoCodeModal = ({ open, onOpenChange }: NoCodeModalProps) => {
  const [copiedOrtho, setCopiedOrtho] = useState(false);
  const [copiedSolo, setCopiedSolo] = useState(false);

  const handleCopySLPTemplate = async () => {
    const success = await copyToClipboard(CONTACT_SLP_TEMPLATE);
    if (success) {
      setCopiedOrtho(true);
      toast.success("Email template copied!");
      setTimeout(() => setCopiedOrtho(false), 3000);
    } else {
      toast.error("Failed to copy");
    }
  };

  const handleMailtoSLP = () => {
    const subject = encodeURIComponent("Contact my SLP - ClutterPro");
    const body = encodeURIComponent(CONTACT_SLP_TEMPLATE);
    window.open(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`, "_blank");
  };

  const handleCopySoloTemplate = async () => {
    const success = await copyToClipboard(SOLO_TEMPLATE);
    if (success) {
      setCopiedSolo(true);
      toast.success("Email template copied!");
      setTimeout(() => setCopiedSolo(false), 3000);
    } else {
      toast.error("Failed to copy");
    }
  };

  const handleMailtoSolo = () => {
    const subject = encodeURIComponent("Individual access request - ClutterPro");
    const body = encodeURIComponent(SOLO_TEMPLATE);
    window.open(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">I don't have a code</DialogTitle>
          <DialogDescription>
            Access to the app is reserved for patients followed by an SLP
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Option A: SLP doesn't know the app */}
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">My SLP doesn't know the app</h3>
                <p className="text-sm text-muted-foreground">
                  Give us their contact info, <strong className="text-foreground">we'll reach out to them for you</strong>.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleMailtoSLP}
              >
                <Mail className="w-4 h-4" />
                Send an email
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopySLPTemplate}
                title="Copy template"
              >
                {copiedOrtho ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Option B: Solo training */}
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">I want to train on my own</h3>
                <p className="text-sm text-muted-foreground">
                  For access without SLP supervision, contact us and we'll review your request.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleMailtoSolo}
              >
                <Mail className="w-4 h-4" />
                Send an email
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopySoloTemplate}
                title="Copy template"
              >
                {copiedSolo ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Email display for webmail users */}
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Or write directly to: <span className="font-mono text-foreground">{SUPPORT_EMAIL}</span>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => onOpenChange(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoCodeModal;

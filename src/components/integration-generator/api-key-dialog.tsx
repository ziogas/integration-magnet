'use client';

import { Mail, Shield, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useIntegration } from '@/contexts/integration-context';
import { trackEvent } from '@/lib/posthog';

type ApiKeyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ApiKeyDialog({ open, onOpenChange }: ApiKeyDialogProps) {
  const { email, setEmail } = useIntegration();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  async function handleSubmit() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error('Please enter your email');
      return;
    }
    // Basic email sanity check; adjust if you need stricter "work email" rules
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      toast.error('Enter a valid work email');
      return;
    }
    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Magic link sent! Check your email to complete signup and get your API key.', {
        duration: 10000,
      });
      trackEvent('api_key_requested', { source: 'api_key_dialog' });
      setAgreedToTerms(false);
      onOpenChange(false);
    } catch {
      toast.error('Something went wrong while sending the magic link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Get Your API Key</DialogTitle>
          <DialogDescription>
            Enter your work email and we'll send you a link to finalize setup and get your API key instantly.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative">
            <Mail className="left-3 top-1/2 absolute w-4 h-4 text-gray-500 -translate-y-1/2" />
            <Input
              type="email"
              placeholder="work@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="placeholder:text-gray-500 pl-10 pr-4 transition-all duration-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSubmitting && agreedToTerms) {
                  handleSubmit();
                }
              }}
            />
          </div>

          <div className="bg-purple-500/5 border-purple-500/10 flex items-start gap-3 p-3 border rounded-lg">
            <Checkbox
              id="api-terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 mt-0.5"
            />
            <label htmlFor="api-terms" className="text-sm leading-relaxed cursor-pointer select-none">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-3.5 h-3.5 text-purple-500" />
                <span className="dark:text-gray-100 font-medium text-gray-900">I agree to the terms</span>
              </div>
              <p className="text-muted-foreground text-xs">
                By checking this box, I agree to Integration.app's{' '}
                <Link
                  href="https://integration.app/terms-and-conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-700 underline-offset-2 text-purple-600 underline"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="https://integration.app/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-700 underline-offset-2 text-purple-600 underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </label>
          </div>

          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Lock className="w-3 h-3" />
            <span>Your data is protected with SOC-2 certified security & GDPR compliance</span>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !agreedToTerms || !email}>
            {isSubmitting ? 'Sending Magic Link...' : 'Send Magic Link'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

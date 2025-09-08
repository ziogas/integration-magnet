'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ArrowRight, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ApiKeyDialog } from './api-key-dialog';
import { trackEvent } from '@/lib/posthog';

export function StickyFooter() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookDemo = () => {
    trackEvent('demo_requested');
    window.open('https://integration.app/book-a-demo', '_blank');
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="backdrop-blur-2xl absolute inset-0 bg-gray-900" />
        <div className="bg-gradient-to-r from-purple-700 to-purple-100/10 absolute inset-x-0 top-0 h-px" />

        <div className="relative">
          <div className="sm:px-6 sm:py-4 max-w-6xl px-4 py-3 mx-auto">
            <div className="sm:flex-row sm:gap-4 flex flex-col items-center justify-between gap-3">
              <div className="sm:flex sm:gap-6 sm:text-sm items-center hidden gap-4 text-xs">
                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400">
                  <Image
                    src="/images/compliance.png"
                    alt="SOC 2 Certified"
                    width={20}
                    height={20}
                    className="opacity-80 sm:w-5 sm:h-5 w-4 h-4"
                  />
                  <span className="md:inline hidden">SOC-2 Certified & GDPR Compliant</span>
                  <span className="md:hidden">SOC-2 & GDPR</span>
                </div>
              </div>

              <div className="sm:gap-3 sm:w-auto flex items-center w-full gap-2">
                <Button
                  variant="ghost"
                  onClick={handleBookDemo}
                  className="bg-gray-950/50 hover:bg-gray-900/50 hover:border-gray-700 sm:text-sm sm:flex-initial flex-1 text-xs transition-all border-gray-800"
                >
                  <Calendar className="sm:w-4 sm:h-4 w-3 h-3 mr-1" />
                  <span className="sm:inline hidden">Book a Demo</span>
                  <span className="sm:hidden">Demo</span>
                </Button>

                <Button
                  onClick={() => {
                    trackEvent('api_key_modal_opened');
                    setIsModalOpen(true);
                  }}
                  className="sm:text-sm sm:flex-initial flex-1 text-xs"
                >
                  <span className="sm:inline hidden">Get API Key</span>
                  <span className="sm:hidden">Get Key</span>
                  <ArrowRight className="sm:w-4 sm:h-4 sm:ml-2 w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ApiKeyDialog open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}

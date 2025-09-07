'use client';

import LogoWhite from '@/assets/logo--white.svg';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { ApiKeyDialog } from './api-key-dialog';

export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookDemo = () => {
    window.open('https://integration.app/book-a-demo', '_blank');
  };

  return (
    <>
      <div className="w-full">
        <nav className="max-w-7xl md:px-6 flex items-center justify-between px-0 py-4 mx-auto">
          <Link href="https://integration.app" className="group flex items-center gap-2 font-medium">
            <LogoWhite
              alt="Membrane"
              width={50}
              height={30}
              className="opacity-90 transition-all duration-300 group-hover:opacity-100 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
            />
            <span className="transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              Membrane
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBookDemo} className="md:flex hidden">
              <Calendar className="w-4 h-4 mr-1" />
              Book a Demo
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              Get API Key
              <ArrowRight className="md:block hidden w-4 h-4 ml-2" />
            </Button>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto mt-12 text-center">
          <h1 className="sm:text-6xl lg:text-7xl text-4xl font-bold tracking-tight text-white">
            Stop Coding
            <br />
            <span className="gradient-text">Membrane AI Does It</span>
          </h1>

          <p className="sm:text-xl mt-6 text-lg leading-8 text-gray-300">
            Turn integration ideas into working code instantly. Powered by Membrane's battle-tested infrastructure and
            AI that understands your business context.
          </p>

          <div className="md:flex-row md:gap-8 flex flex-col items-center justify-center gap-2 mt-8 text-sm text-gray-400">
            <div className="gap-x-2 flex items-center">
              <div className="animate-pulse w-2 h-2 bg-green-400 rounded-full" />
              <span>3,289+ Integrations</span>
            </div>
            <div className="gap-x-2 flex items-center">
              <div className="animate-pulse w-2 h-2 bg-blue-400 rounded-full" />
              <span>283+ Scenarios</span>
            </div>
            <div className="gap-x-2 flex items-center">
              <div className="animate-pulse w-2 h-2 bg-purple-400 rounded-full" />
              <span>Powered by AI</span>
            </div>
          </div>
        </div>
      </div>

      <ApiKeyDialog open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}

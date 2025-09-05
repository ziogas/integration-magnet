import LogoWhite from '@/assets/logo--white.svg';

export function HeroSection() {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="flex justify-center mb-8">
        <LogoWhite alt="Membrane" width={120} height={72} className="opacity-90" />
      </div>
      <h1 className="sm:text-6xl lg:text-7xl text-4xl font-bold tracking-tight text-white">
        Stop Coding
        <br />
        <span className="gradient-text">Membrane AI Does It</span>
      </h1>

      <p className="sm:text-xl mt-6 text-lg leading-8 text-gray-300">
        Turn integration ideas into working code instantly. Powered by Membrane's battle-tested infrastructure and AI
        that understands your business context.
      </p>

      <div className="gap-x-8 flex items-center justify-center mt-8 text-sm text-gray-400">
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
  );
}

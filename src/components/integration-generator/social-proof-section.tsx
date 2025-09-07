import Image from 'next/image';
import G2no1 from '@/assets/g2-1.svg';
import G2no2 from '@/assets/g2-2.svg';
import G2no3 from '@/assets/g2-3.svg';

export function SocialProofSection() {
  return (
    <section className="sm:mt-16 md:mt-20 sm:mb-10 mt-12 mb-8">
      <div className="sm:space-y-10 md:space-y-12 max-w-6xl px-4 mx-auto space-y-8">
        <div className="sm:space-y-3 space-y-2 text-center">
          <h2 className="sm:text-2xl text-xl font-semibold text-gray-100">Trusted by Leading Companies</h2>
          <p className="sm:text-sm text-xs text-gray-400">
            Join hundreds of teams building integrations faster with Membrane AI
          </p>
        </div>

        <div className="group sm:block relative hidden">
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-3xl group-hover:opacity-100 absolute inset-0 transition-opacity duration-500 opacity-0" />
          <div className="bg-gray-900/40 backdrop-blur-sm border-gray-800/50 rounded-2xl sm:p-6 md:p-8 relative p-4 overflow-hidden border">
            <Image
              src="/images/logos.png"
              width={1065}
              height={242}
              alt="Companies using Membrane"
              className="opacity-70 group-hover:opacity-90 w-full h-auto transition-opacity duration-300 rounded-lg"
            />
          </div>
        </div>

        <div className="sm:gap-4 md:gap-8 flex items-center justify-center gap-2">
          <div className="group flex items-center">
            <G2no1 className="hover:scale-105 sm:w-24 md:w-auto w-20 h-auto transition" />
          </div>
          <div className="group flex items-center">
            <G2no2 className="hover:scale-105 sm:w-24 md:w-auto w-20 h-auto transition" />
          </div>
          <div className="group flex items-center">
            <G2no3 className="hover:scale-105 sm:w-24 md:w-auto w-20 h-auto transition" />
          </div>
        </div>

        <div className="sm:flex-row sm:gap-4 sm:mt-10 md:mt-12 flex flex-col gap-3 mt-8">
          <div className="group relative flex-1">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-xl group-hover:opacity-100 absolute inset-0 transition-opacity duration-500 opacity-0" />
            <div className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 rounded-xl hover:border-gray-700/50 sm:p-5 md:p-6 relative p-4 text-center transition-all duration-300 border">
              <div className="bg-gradient-to-br from-green-400 to-emerald-400 bg-clip-text sm:text-3xl md:text-4xl text-2xl font-bold text-transparent">
                10K+
              </div>
              <div className="sm:mt-2 sm:text-sm mt-1 text-xs font-medium text-gray-400">Active Integrations</div>
              <div className="mt-0.5 sm:mt-1 text-xs text-gray-600">Across all platforms</div>
            </div>
          </div>
          <div className="group relative flex-1">
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-xl group-hover:opacity-100 absolute inset-0 transition-opacity duration-500 opacity-0" />
            <div className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 rounded-xl hover:border-gray-700/50 sm:p-5 md:p-6 relative p-4 text-center transition-all duration-300 border">
              <div className="bg-gradient-to-br from-blue-400 to-cyan-400 bg-clip-text sm:text-3xl md:text-4xl text-2xl font-bold text-transparent">
                99.9%
              </div>
              <div className="sm:mt-2 sm:text-sm mt-1 text-xs font-medium text-gray-400">Uptime SLA</div>
              <div className="mt-0.5 sm:mt-1 text-xs text-gray-600">Enterprise reliability</div>
            </div>
          </div>
          <div className="group relative flex-1">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl group-hover:opacity-100 absolute inset-0 transition-opacity duration-500 opacity-0" />
            <div className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 rounded-xl hover:border-gray-700/50 sm:p-5 md:p-6 relative p-4 text-center transition-all duration-300 border">
              <div className="bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text sm:text-3xl md:text-4xl text-2xl font-bold text-transparent">
                5min
              </div>
              <div className="sm:mt-2 sm:text-sm mt-1 text-xs font-medium text-gray-400">Average Setup Time</div>
              <div className="mt-0.5 sm:mt-1 text-xs text-gray-600">From idea to production</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

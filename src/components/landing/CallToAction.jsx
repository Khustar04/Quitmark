import { Link } from 'react-router-dom';
import { ArrowRight, Download, Smartphone } from 'lucide-react';

const ANDROID_DOWNLOAD_URL =
  'https://github.com/Khustar04/Quitmark/releases/latest/download/Quitmark.apk';

export default function CallToAction() {
  return (
    <section className="final-cta-section max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center">
      <div className="final-cta-card rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm dark:shadow-none p-8 sm:p-12 transition-colors">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3">
          Ready to break the cycle?
        </h2>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          Start with today.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/signup"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-base shadow-sm shadow-emerald-600/25 transition-all hover:gap-3 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
          >
            <span>Start Your Streak</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href={ANDROID_DOWNLOAD_URL}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-7 py-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/70 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-medium text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
          >
            <Download className="w-4 h-4" />
            <span>Download for Android</span>
          </a>
        </div>

        <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Smartphone className="w-3.5 h-3.5" />
          Android 7.0+ · APK download from GitHub Releases
        </p>
      </div>
    </section>
  );
}

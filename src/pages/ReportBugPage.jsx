import { useState } from 'react';
import { Bug, ArrowRight, CheckCircle2 } from 'lucide-react';

const BUG_CATEGORIES = [
  { id: 'ui', label: 'UI Issue', description: 'Visual glitches, layout problems, or broken designs on mobile/desktop.' },
  { id: 'checkin', label: 'Check-in Problem', description: 'Unable to check in, or optimistic updates failing.' },
  { id: 'auth', label: 'Authentication Problem', description: 'Login, signup, or Google OAuth issues.' },
  { id: 'data', label: 'Data / History Problem', description: 'Missing history, incorrect streaks, or heatmap errors.' },
];
const MAX_BUG_DETAILS_LENGTH = 4000;

export default function ReportBugPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCategory) return;

    const categoryLabel = BUG_CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'General Bug';
    const subject = encodeURIComponent(`[Bug Report] ${categoryLabel}`);
    const body = encodeURIComponent(`Category: ${categoryLabel}\n\nDetails:\n${details || 'No additional details provided.'}\n\n--- \nPlease do not remove the information above.`);
    
    // Trigger default mail client
    window.location.href = `mailto:khustarhussain8@gmail.com?subject=${subject}&body=${body}`;
    
    setSubmitted(true);
    
    // Reset after a few seconds
    setTimeout(() => {
      setSubmitted(false);
      setSelectedCategory('');
      setDetails('');
    }, 5000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20 animate-in fade-in duration-300">
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 mx-auto flex items-center justify-center mb-5">
          <Bug className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-3">
          Report a Bug
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
          Found something that isn't working? Let us know so we can fix it.
        </p>
      </div>

      <div className="bg-white dark:bg-[#0D0F17] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-5 sm:p-8 shadow-sm">
        {submitted ? (
          <div className="text-center py-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              Email Draft Prepared
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              We prepared an email draft in your default mail client. Send it when you are ready—thank you for helping us improve Quitmark!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Category Selection */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-zinc-900 dark:text-white">
                1. What kind of issue are you experiencing?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BUG_CATEGORIES.map((category) => {
                  const isSelected = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`text-left p-4 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500'
                          : 'border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#131722] hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className={`font-semibold text-sm mb-1 ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'}`}>
                        {category.label}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {category.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Details (Optional) */}
            <div className="space-y-3">
              <label htmlFor="bug-details" className="block text-sm font-semibold text-zinc-900 dark:text-white">
                2. Additional Details (Optional)
              </label>
              <textarea
                id="bug-details"
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={MAX_BUG_DETAILS_LENGTH}
                placeholder="Briefly describe what happened..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#131722] text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 text-right">
                {details.length}/{MAX_BUG_DETAILS_LENGTH}
              </p>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!selectedCategory}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 disabled:cursor-not-allowed text-white font-medium text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-[#0D0F17]"
              >
                <span>Continue to Email</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                This will prepare an email template using your device's default mail app.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

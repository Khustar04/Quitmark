import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What is Quitmark?',
    answer: 'Quitmark is a simple, focused habit tracker designed to help you break unwanted habits. Instead of overwhelming you with gamification or complex charts, it helps you build discipline one day at a time by tracking your daily check-ins and maintaining streaks.'
  },
  {
    question: 'How does streak calculation work?',
    answer: 'Your current streak counts consecutive days where you have successfully checked in as "completed". The streak continues as long as you don\'t miss a day. Your longest streak represents your personal best consecutive run across the entire history of the habit.'
  },
  {
    question: 'What happens if I miss a day?',
    answer: 'If you mark a day as "missed" (or forget to check in for a past date), your current streak resets to 0. However, your longest streak and complete history are safely preserved, so you can always see your long-term progress.'
  },
  {
    question: 'Can I change today\'s check-in?',
    answer: 'Yes! As long as it is still the current calendar day, you can freely change your check-in status between "completed", "missed", or "pending".'
  },
  {
    question: 'Is my habit data private?',
    answer: 'Absolutely. Quitmark is secured by Supabase Row Level Security (RLS). This means your habits and check-in history are strictly locked to your authenticated account and cannot be accessed by anyone else.'
  },
  {
    question: 'How does the GitHub-style history work?',
    answer: 'The habit history page visualizes your check-ins over the past 84 days (approx. 12 weeks). It uses a continuous grid where columns represent weeks and rows represent days of the week. Completed days appear emerald, missed days appear crimson, and future/empty days remain neutral.'
  }
];

function FaqAccordionItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden bg-white dark:bg-[#0D0F17] transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 bg-transparent hover:bg-zinc-50 dark:hover:bg-[#131722] transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base pr-4">
          {question}
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-zinc-400 dark:text-zinc-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      <div 
        className={`px-5 overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-h-96 py-4 border-t border-zinc-100 dark:border-zinc-800/60' : 'max-h-0 py-0'}`}
        aria-hidden={!isOpen}
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 animate-in fade-in duration-300">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
          Everything you need to know about tracking habits, maintaining streaks, and using Quitmark.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <FaqAccordionItem key={idx} question={faq.question} answer={faq.answer} />
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Still have questions?{' '}
          <a 
            href="mailto:support@quitmark.com?subject=Quitmark%20Support" 
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm inline-block"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}

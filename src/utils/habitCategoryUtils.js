import {
  TrendingUp,
  BookOpen,
  Dumbbell,
  Droplet,
  Sparkles,
} from 'lucide-react';

/**
 * Infer a display category from habit name for Stitch aesthetic.
 */
export const getHabitCategory = (habitName = '') => {
  const lower = (habitName || '').toLowerCase();
  if (
    lower.includes('read') ||
    lower.includes('study') ||
    lower.includes('english') ||
    lower.includes('code') ||
    lower.includes('learn') ||
    lower.includes('practice') ||
    lower.includes('write')
  ) {
    return {
      name: 'Learning',
      icon: BookOpen,
      color: 'text-cyan-400',
      dotColor: 'bg-cyan-400',
      boxBg: 'bg-[#0F232B] border-[#1B4350]',
    };
  }
  if (
    lower.includes('water') ||
    lower.includes('drink') ||
    lower.includes('hydrat')
  ) {
    return {
      name: 'Health',
      icon: Droplet,
      color: 'text-sky-400',
      dotColor: 'bg-sky-400',
      boxBg: 'bg-[#102330] border-[#1A455A]',
    };
  }
  if (
    lower.includes('exercise') ||
    lower.includes('gym') ||
    lower.includes('workout') ||
    lower.includes('run') ||
    lower.includes('walk') ||
    lower.includes('sleep')
  ) {
    return {
      name: 'Health',
      icon: Dumbbell,
      color: 'text-[#FF7A8A]',
      dotColor: 'bg-[#FF7A8A]',
      boxBg: 'bg-[#24171A] border-[#48282D]',
    };
  }
  if (
    lower.includes('meditat') ||
    lower.includes('mindful') ||
    lower.includes('pray') ||
    lower.includes('gratitude')
  ) {
    return {
      name: 'Mindfulness',
      icon: Sparkles,
      color: 'text-amber-400',
      dotColor: 'bg-amber-400',
      boxBg: 'bg-[#252014] border-[#4E3F1F]',
    };
  }
  return {
    name: 'General',
    icon: TrendingUp,
    color: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
    boxBg: 'bg-[#0D1E22] border-[#1F3E45]',
  };
};

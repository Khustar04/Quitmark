import {
  Target,
  BookOpen,
  Dumbbell,
  Brain,
  Laptop,
  Leaf,
  Heart,
  Plane,
  Coins,
  Users,
  Star,
  Sparkles,
} from 'lucide-react';

export const GOAL_ICONS = [
  { id: 'Target', label: 'Target', icon: Target, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'Book', label: 'Learning', icon: BookOpen, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { id: 'Fitness', label: 'Fitness', icon: Dumbbell, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { id: 'Brain', label: 'Mindset', icon: Brain, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { id: 'Laptop', label: 'Tech', icon: Laptop, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { id: 'Leaf', label: 'Nature', icon: Leaf, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'Heart', label: 'Health', icon: Heart, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { id: 'Plane', label: 'Travel', icon: Plane, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  { id: 'Finance', label: 'Finance', icon: Coins, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'People', label: 'Social', icon: Users, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { id: 'Star', label: 'Personal', icon: Star, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'Sparkles', label: 'More', icon: Sparkles, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
];

export const GOAL_CATEGORIES = [
  'Personal',
  'Health',
  'Learning',
  'Productivity',
  'Finance',
  'Other',
];

/**
 * Gets the component and styling for a goal icon.
 * @param {string} iconId
 * @returns {Object}
 */
export function getGoalIcon(iconId) {
  const found = GOAL_ICONS.find((item) => item.id.toLowerCase() === (iconId || '').toLowerCase());
  return found || GOAL_ICONS[0]; // defaults to Target
}

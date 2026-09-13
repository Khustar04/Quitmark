import gsap from 'gsap';

/**
 * Reusable animation helper functions using GSAP.
 * Prepared for future UI transitions, streaks, and entrance effects.
 */

export const fadeIn = (target, options = {}) => {
  return gsap.fromTo(
    target,
    { opacity: 0, ...options.from },
    {
      opacity: 1,
      duration: options.duration || 0.4,
      ease: options.ease || 'power2.out',
      ...options.to,
    }
  );
};

export const slideUp = (target, options = {}) => {
  return gsap.fromTo(
    target,
    { opacity: 0, y: 20, ...options.from },
    {
      opacity: 1,
      y: 0,
      duration: options.duration || 0.5,
      ease: options.ease || 'power2.out',
      ...options.to,
    }
  );
};

export const staggerFadeIn = (targets, options = {}) => {
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 15, ...options.from },
    {
      opacity: 1,
      y: 0,
      stagger: options.stagger || 0.1,
      duration: options.duration || 0.4,
      ease: options.ease || 'power2.out',
      ...options.to,
    }
  );
};

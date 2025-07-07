"use client";
import { TypewriterEffectSmooth } from "../components/ui/typewriter-effect";
export function TypewriterEffectSmoothDemo() {
  const words = [
    {
      text: "Page",
    },
    {
      text: "is",
    },
    {
      text: "coming",
    },
    {
      text: "very soon...",
    },
    {
      text: "X-repo",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-[40rem]  bg-white dark:bg-black text-center p-8 space-y-4">
      <p className="text-neutral-600 dark:text-neutral-200 text-xs sm:text-base  ">
        Stay tuned for updates!<br />
        <br />
      </p>
      <TypewriterEffectSmooth words={words} />
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
        <button
          onClick={() => window.location.href = '/knowledge'}
          className="mt-8 px-8 py-4 rounded-lg bg-blue-600 text-white text-lg font-semibold shadow-lg hover:bg-blue-700 transition-colors"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default TypewriterEffectSmoothDemo;

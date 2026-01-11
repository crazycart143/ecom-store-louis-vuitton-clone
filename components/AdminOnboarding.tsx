"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetElement: string;
  position?: "top" | "bottom" | "left" | "right";
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Your Admin Panel!",
    description: "Let's take a quick tour to help you get started with managing your Louis Vuitton store. This will only take a minute!",
    targetElement: "body",
    position: "bottom",
  },
  {
    id: "dashboard",
    title: "Dashboard Overview",
    description: "This is your command center. Here you'll see key metrics like total revenue, orders, and customer analytics at a glance.",
    targetElement: "[data-tour='dashboard']",
    position: "right",
  },
  {
    id: "products",
    title: "Manage Products",
    description: "Add, edit, and organize your product catalog. You can upload images, set prices, and manage inventory from here.",
    targetElement: "[data-tour='products']",
    position: "right",
  },
  {
    id: "orders",
    title: "Track Orders",
    description: "View and manage all customer orders. You can update order status, process refunds, and track shipments.",
    targetElement: "[data-tour='orders']",
    position: "right",
  },
  {
    id: "settings",
    title: "Store Settings",
    description: "Configure your store details, payment methods, security settings, and the new announcement bar feature!",
    targetElement: "[data-tour='settings']",
    position: "right",
  },
  {
    id: "search",
    title: "Quick Search",
    description: "Use the search bar to quickly navigate to any page or find products. Try typing 'products', 'orders', or 'settings'!",
    targetElement: "[data-tour='search']",
    position: "bottom",
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "You're ready to start managing your store. Remember, you can always restart this tour from the button in the bottom-right corner. Good luck!",
    targetElement: "body",
    position: "bottom",
  },
];

export function AdminOnboarding({ onRestartAction }: { onRestartAction?: () => void }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem("admin-onboarding-completed");
    if (!completed) {
      // Wait a bit before showing to let the page load
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setHasCompletedOnboarding(true);
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const step = onboardingSteps[currentStep];
    const updatePosition = () => {
      const element = document.querySelector(step.targetElement);
      
      if (element) {
        const rect = element.getBoundingClientRect();

        // Set highlight position
        setHighlightPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });

        // Calculate tooltip position based on step position preference
        let top = 0;
        let left = 0;
        const tooltipOffset = 280; // Increased offset for better spacing

        switch (step.position) {
          case "top":
            top = rect.top - tooltipOffset;
            left = rect.left + rect.width / 2;
            break;
          case "bottom":
            top = rect.top + rect.height + 30;
            left = rect.left + rect.width / 2;
            break;
          case "left":
            top = rect.top + rect.height / 2;
            left = rect.left - tooltipOffset;
            break;
          case "right":
            top = rect.top + rect.height / 2;
            left = rect.left + rect.width + 30;
            break;
          default:
            top = rect.top + rect.height + 30;
            left = rect.left + rect.width / 2;
        }

        setTooltipPosition({ top, left });

        // Scroll element into view
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    updatePosition();
    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(updatePosition, 100);
    
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [currentStep, isActive]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = () => {
    localStorage.setItem("admin-onboarding-completed", "true");
    setIsActive(false);
    setHasCompletedOnboarding(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem("admin-onboarding-completed");
    setHasCompletedOnboarding(false);
    setCurrentStep(0);
    setIsActive(true);
    if (onRestartAction) onRestartAction();
  };

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const isWelcomeOrComplete = step.targetElement === "body";

  if (hasCompletedOnboarding && !isActive) {
    return (
      <button
        onClick={resetOnboarding}
        className="fixed bottom-6 right-6 bg-black text-white px-3 py-3 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-2xl z-50 flex items-center group border border-white/10"
      >
        <HelpCircle size={18} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out group-hover:ml-2 whitespace-nowrap">Guide</span>
      </button>
    );
  }

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Backdrop with cutout for highlighted element */}
          <div className="fixed inset-0 z-[200] pointer-events-none">
            <svg className="w-full h-full">
              <defs>
                <mask id="tour-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {!isWelcomeOrComplete && (
                    <rect
                      x={highlightPosition.left - 8}
                      y={highlightPosition.top - 8}
                      width={highlightPosition.width + 16}
                      height={highlightPosition.height + 16}
                      rx="12"
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.85)"
                mask="url(#tour-mask)"
              />
            </svg>
          </div>

          {/* Highlight ring around target element */}
          {!isWelcomeOrComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed z-[201] pointer-events-none"
              style={{
                top: highlightPosition.top - 8,
                left: highlightPosition.left - 8,
                width: highlightPosition.width + 16,
                height: highlightPosition.height + 16,
              }}
            >
              <div className="w-full h-full rounded-xl border-4 border-white shadow-2xl animate-pulse" />
            </motion.div>
          )}

          {/* Tooltip Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed z-[202] ${
              isWelcomeOrComplete || isMobile 
                ? "left-1/2 -translate-x-1/2 w-full max-w-[480px]" 
                : ""
            } ${
              isWelcomeOrComplete 
                ? "top-1/2 -translate-y-1/2" 
                : isMobile 
                ? (["settings", "search"].includes(step.id) ? "top-8" : "bottom-8")
                : ""
            }`}
            style={
              !isWelcomeOrComplete && !isMobile
                ? {
                    top: tooltipPosition.top,
                    left: tooltipPosition.left,
                    transform:
                      step.position === "left"
                        ? "translate(-100%, -50%)"
                        : step.position === "right"
                        ? "translate(0, -50%)"
                        : step.position === "top"
                        ? "translate(-50%, -100%)"
                        : "translate(-50%, 0)",
                  }
                : {}
            }
          >
            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mx-4 border border-zinc-100">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-500">
                    Step {currentStep + 1} of {onboardingSteps.length}
                  </span>
                  <button
                    onClick={handleSkip}
                    className="text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    Skip Tour
                  </button>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-black rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-black mb-2">
                  {step.title}
                </h2>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    currentStep === 0
                      ? "opacity-0 pointer-events-none"
                      : "bg-zinc-100 text-black hover:bg-zinc-200"
                  }`}
                >
                  <ArrowLeft size={16} />
                  Previous
                </button>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all"
                >
                  {currentStep === onboardingSteps.length - 1 ? "Finish" : "Next"}
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Dots Indicator */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {onboardingSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep
                        ? "bg-black w-6"
                        : index < currentStep
                        ? "bg-zinc-400"
                        : "bg-zinc-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

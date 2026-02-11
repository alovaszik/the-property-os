"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Check } from "@/components/icons";

interface TutorialStep {
  title: string;
  description: string;
  target?: string;
}

const landlordSteps: TutorialStep[] = [
  {
    title: "Welcome to Your Dashboard",
    description: "This is your command center. You can manage all your properties, tenants, and finances from here.",
  },
  {
    title: "Add Your First Property",
    description: "Click on Properties to add your rental units and start managing them efficiently.",
  },
  {
    title: "Manage Tenants",
    description: "Assign tenants to properties and track their lease agreements in one place.",
  },
  {
    title: "Unified Activity Feed",
    description: "All payments, messages, and maintenance tickets flow into your Activity feed - like a banking app.",
  },
  {
    title: "Earn RentDuo Points",
    description: "Get rewarded for on-time payments, good property management, and positive tenant relationships!",
  },
];

const tenantSteps: TutorialStep[] = [
  {
    title: "Welcome to RentDuo",
    description: "Your all-in-one platform for managing your rental experience.",
  },
  {
    title: "View Your Lease",
    description: "Access your lease details, terms, and important dates anytime.",
  },
  {
    title: "Make Payments",
    description: "Set up automatic payments and never miss a rent deadline.",
  },
  {
    title: "Activity Timeline",
    description: "Messages, payments, and maintenance requests all in one unified chat-like timeline.",
  },
  {
    title: "Earn RentDuo Points",
    description: "Get rewarded for on-time payments and being a great tenant!",
  },
];

export function TutorialOverlay({
  variant,
  onComplete,
}: {
  variant: "landlord" | "tenant";
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(true);
  const steps = variant === "landlord" ? landlordSteps : tenantSteps;

  useEffect(() => {
    // Check if tutorial was already completed
    const completed = localStorage.getItem(`tutorial-${variant}-completed`);
    if (completed) {
      setShow(false);
    }
  }, [variant]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem(`tutorial-${variant}-completed`, "true");
    setShow(false);
    onComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(`tutorial-${variant}-completed`, "true");
    setShow(false);
    onComplete();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-md mx-4 p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
          aria-label="Close tutorial"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="mb-6">
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? "w-8 bg-primary"
                    : idx < currentStep
                      ? "w-6 bg-primary/60"
                      : "w-6 bg-border"
                }`}
              />
            ))}
          </div>

          <div className="text-center mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-foreground text-center mb-3">
            {steps[currentStep].title}
          </h2>
          <p className="text-muted-foreground text-center leading-relaxed">
            {steps[currentStep].description}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="flex-1 h-11 bg-transparent"
          >
            Skip Tutorial
          </Button>
          <Button onClick={handleNext} className="flex-1 h-11">
            {currentStep === steps.length - 1 ? (
              <>
                Get Started
                <Check className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

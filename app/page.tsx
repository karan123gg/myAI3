"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AI_NAME, TAGLINE, RECIPIENTS, OCCASIONS, PERSONALITIES, INTERESTS_OPTIONS, PRICE_BANDS, PRICE_BAND_REVERSE_MAP } from "@/config";
import type { GiftContext } from "@/types/gifts";
import { Loader2, RotateCcw } from "lucide-react";

type StepKey = "recipient" | "occasion" | "budget" | "personality" | "interests";

export default function GiftMatchPage() {
  const [step, setStep] = useState<StepKey>("recipient");
  const [context, setContext] = useState<GiftContext>({});
  const [recommendations, setRecommendations] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleRecipientClick = (group: string, type?: string) => {
    setContext(prev => ({
      ...prev,
      recipientGroup: group,
      recipientType: type,
    }));
    setStep("occasion");
  };

  const handleOccasionClick = (occasion: string) => {
    setContext(prev => ({ ...prev, occasion }));
    setStep("budget");
  };

  const handleBudgetClick = (displayBudget: string) => {
    const csvBudget = PRICE_BAND_REVERSE_MAP[displayBudget];
    setContext(prev => ({ ...prev, priceBand: csvBudget }));
    setStep("personality");
  };

  const handlePersonalityClick = (personality: string) => {
    setContext(prev => ({ ...prev, personality }));
    setStep("interests");
  };

  const handleInterestToggle = (value: string) => {
    setContext(prev => {
      const interests = prev.interests || [];
      if (interests.includes(value)) {
        return { ...prev, interests: interests.filter(i => i !== value) };
      } else {
        return { ...prev, interests: [...interests, value] };
      }
    });
  };

  const handleShowMatches = async () => {
    if (!context.recipientGroup || !context.occasion || !context.priceBand) {
      setError("Please complete all selections");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get recommendations");
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
      setShowResults(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setContext({});
    setRecommendations("");
    setShowResults(false);
    setError("");
    setStep("recipient");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{AI_NAME}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{TAGLINE}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Results Panel (Left) */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 min-h-96">
              {!showResults ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🎁</div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Hi, I'm {AI_NAME}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                    I help you find thoughtful gift ideas based on who you're gifting, the occasion, their personality, and your budget.
                  </p>
                  <p className="text-gray-500 dark:text-gray-500">
                    Start by selecting who you're shopping for on the right →
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Shopping for:</span> {context.recipientGroup}
                      {context.recipientType && ` (${context.recipientType})`} · 
                      <span className="font-semibold ml-2">Occasion:</span> {context.occasion} · 
                      <span className="font-semibold ml-2">Budget:</span> {context.priceBand}
                      {context.personality && (
                        <>
                          · <span className="font-semibold">Personality:</span> {context.personality}
                        </>
                      )}
                      {context.interests && context.interests.length > 0 && (
                        <>
                          · <span className="font-semibold">Interests:</span> {context.interests.join(", ")}
                        </>
                      )}
                    </p>
                  </div>

                  <div className="prose dark:prose-invert max-w-none">
                    <div className="text-gray-800 dark:text-gray-200 space-y-3 whitespace-pre-wrap text-sm leading-relaxed">
                      {recommendations}
                    </div>
                  </div>

                  <Button onClick={handleReset} variant="outline" className="w-full">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Find Different Gifts
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Selection Panel (Right) */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 h-fit">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Build Your Match</h3>

            <div className="space-y-8">
              {/* Step 1: Recipient */}
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  1. Who are we shopping for?
                  {context.recipientGroup && <span className="text-green-600 ml-2">✓</span>}
                </p>
                <div className="space-y-2">
                  {Object.entries(RECIPIENTS).map(([group, types]) => (
                    <div key={group}>
                      <button
                        onClick={() => handleRecipientClick(group)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                          context.recipientGroup === group
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {group}
                      </button>
                      {context.recipientGroup === group && types.length > 0 && (
                        <div className="mt-2 ml-2 space-y-1">
                          {types.map(type => (
                            <button
                              key={type}
                              onClick={() => handleRecipientClick(group, type)}
                              className={`w-full text-left px-3 py-1 rounded text-xs transition-colors ${
                                context.recipientType === type
                                  ? "bg-blue-300 text-blue-900"
                                  : "bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600"
                              }`}
                            >
                              → {type}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Occasion */}
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  2. What's the occasion?
                  {context.occasion && <span className="text-green-600 ml-2">✓</span>}
                </p>
                <div className="space-y-2">
                  {OCCASIONS.map(occasion => (
                    <button
                      key={occasion}
                      onClick={() => handleOccasionClick(occasion)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        context.occasion === occasion
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {occasion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Budget */}
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  3. What's your budget?
                  {context.priceBand && <span className="text-green-600 ml-2">✓</span>}
                </p>
                <div className="space-y-2">
                  {PRICE_BANDS.map(band => (
                    <button
                      key={band}
                      onClick={() => handleBudgetClick(band)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        context.priceBand === PRICE_BAND_REVERSE_MAP[band]
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {band}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Personality */}
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  4. What's their personality?
                  {context.personality && <span className="text-green-600 ml-2">✓</span>}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {PERSONALITIES.map(personality => (
                    <button
                      key={personality}
                      onClick={() => handlePersonalityClick(personality)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        context.personality === personality
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {personality}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 5: Interests */}
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  5. What are they into? (Optional)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {INTERESTS_OPTIONS.map(interest => (
                    <button
                      key={interest.value}
                      onClick={() => handleInterestToggle(interest.value)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        context.interests?.includes(interest.value)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {interest.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-sm">
                  {error}
                </div>
              )}

              {/* Show Matches Button */}
              <Button
                onClick={handleShowMatches}
                disabled={loading || !context.recipientGroup || !context.occasion || !context.priceBand}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finding matches...
                  </>
                ) : (
                  "Show Gift Matches"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

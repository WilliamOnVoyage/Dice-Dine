"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MapPin, Dice5 } from "lucide-react";
import { parseBotResponse } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "assistant";
    content: string;
    recommendations?: any[];
}

interface ChatInterfaceProps {
    onRecommendation: (data: any) => void;
    onLocationUpdate?: (location: string) => void;
}

export default function ChatInterface({ onRecommendation, onLocationUpdate }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [locationInput, setLocationInput] = useState("");
    const [isLocating, setIsLocating] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const PRESET_PROMPTS = [
        "🍣 Best Sushi nearby",
        "🍕 Top-rated Pizza around here",
        "☕ Cozy Coffee Shops near me",
        "🌮 Authentic Local Tacos",
        "🥗 Healthy Lunch options nearby"
    ];

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Since reverse geocoding might require an API key or an extra call,
                // passing Lat/Lng directly for context is often enough for modern LLMs,
                // but a user-facing string is better. We'll simply use the coordinates directly in the input text for logic,
                // or just display "Current GPS Location" to the user.
                const locStr = `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                setLocationInput(locStr);
                if (onLocationUpdate) onLocationUpdate(locStr);
                setIsLocating(false);
            },
            (error) => {
                console.error("Error getting location", error);
                alert("Unable to retrieve your location. Please type it manually.");
                setIsLocating(false);
            }
        );
    };

    const handlePresetClick = (prompt: string) => {
        setInput(prompt);
        sendMessage(prompt);
    };

    const handleDiceRoll = () => {
        const prompt = "Roll a dice and give me 3 completely random, highly-rated restaurant recommendations. Surprise me!";
        setInput(prompt);
        sendMessage(prompt);
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessageContent = text;
        const userMessage = { role: "user" as const, content: userMessageContent };

        // Append location context to the backend call, but don't show it in the UI message bubble
        const contextString = locationInput.trim() ? ` [Context: User location is ${locationInput}]` : "";
        const apiPayloadMessage = `${userMessageContent}${contextString}`;

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: apiPayloadMessage
                }),
            });

            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            const parsed = parseBotResponse(data.output_text);

            let displayContent = "";

            let recommendations = undefined;

            if (parsed.type === "recommendation") {
                // It's structured data
                onRecommendation(parsed.data["Recommended Restaurants"]);

                recommendations = parsed.data["Recommended Restaurants"];
                // Format a nice summary for the chat
                const summary = parsed.data["Summary"];
                displayContent = summary;
            } else {
                displayContent = parsed.content || "I couldn't understand that.";
            }

            const botMessage: Message = { role: "assistant" as const, content: displayContent, recommendations };
            setMessages((prev) => [...prev, botMessage]);

        } catch (error) {
            console.error(error);
            setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                        <div className="text-gray-400">
                            <p className="font-medium">Start by telling me what you're in the mood for!</p>
                        </div>
                        <div className="grid grid-cols-1 gap-2 w-full max-w-xs mb-4">
                            {PRESET_PROMPTS.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handlePresetClick(prompt)}
                                    className="bg-white hover:bg-gray-50 text-slate-700 text-sm py-2 px-4 rounded-md transition-all border border-gray-200 hover:border-gray-300 shadow-sm font-medium"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleDiceRoll}
                            className="bg-slate-900 hover:bg-rose-600 text-white font-medium py-3 px-6 rounded-md transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Dice5 size={20} />
                            Roll a Dice!
                        </button>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm md:text-base ${m.role === "user" ? "bg-slate-900 text-white rounded-br-sm" : "bg-gray-50 text-slate-800 rounded-bl-sm prose prose-sm max-w-none flex flex-col gap-3"}`}>
                            {m.role === "user" ? (
                                m.content
                            ) : (
                                <>
                                    <ReactMarkdown>{m.content}</ReactMarkdown>
                                    {m.recommendations && m.recommendations.length > 0 && (
                                        <div className="flex flex-col gap-3 mt-2">
                                            {m.recommendations.map((rec: any, idx: number) => (
                                                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-1.5 transition-colors hover:border-gray-300">
                                                    {rec.Website ? (
                                                        <a href={rec.Website} target="_blank" rel="noopener noreferrer" className="font-bold text-slate-900 hover:text-rose-600 hover:underline transition-colors w-fit">
                                                            {rec.Name}
                                                        </a>
                                                    ) : (
                                                        <h4 className="font-bold text-slate-900">{rec.Name}</h4>
                                                    )}
                                                    <p className="text-sm text-slate-500 font-medium">{rec.Address}</p>
                                                    {rec.Rating && (
                                                        <p className="text-xs text-rose-600 font-bold bg-rose-50 w-fit px-2 py-0.5 rounded-md mt-1">Rating {rec.Rating}</p>
                                                    )}
                                                    {rec.Reason && (
                                                        <p className="text-sm text-slate-700 italic mt-2 leading-relaxed">"{rec.Reason}"</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="text-orange-400 text-sm p-4 animate-pulse">Thinking...</div>}
            </div>
            <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center gap-2">
                <button
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-gray-200 rounded-md transition-colors"
                    title="Use Current Location"
                >
                    <MapPin size={18} className={isLocating ? "animate-pulse" : ""} />
                </button>
                <input
                    value={locationInput}
                    onChange={(e) => {
                        setLocationInput(e.target.value);
                        if (onLocationUpdate) onLocationUpdate(e.target.value);
                    }}
                    placeholder="Enter neighborhood or zip code..."
                    className="w-full p-2 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-900"
                />
            </div>
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 flex gap-2 bg-white">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your craving..."
                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-900 transition-all font-medium"
                />
                <button type="submit" disabled={isLoading} className="p-3 px-4 bg-slate-900 text-white rounded-md hover:bg-rose-600 disabled:opacity-50 transition-colors flex items-center justify-center font-medium">
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Send,
  Bot,
  User,
  Sparkles,
} from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Advisor() {

  const [messages, setMessages] = useState<Message[]>([]);

  const [question, setQuestion] = useState("");

  const [loading, setLoading] = useState(false);

  const askAI = async () => {

    if (!question.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);

    setQuestion("");

    setLoading(true);

    try {

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${
          import.meta.env.VITE_GEMINI_API_KEY
        }`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text:
                      "You are a helpful financial advisor. Give financial advice for this question: " +
                      userMessage.content,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      const aiAnswer =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response from AI";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiAnswer,
        },
      ]);

    } catch (error) {

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Error connecting to AI. Please check your Gemini API key.",
        },
      ]);

    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] lg:h-[calc(100vh-4rem)]">

      <div className="mb-4">

        <h1 className="text-2xl font-bold tracking-tight">
          AI Financial Advisor
        </h1>

        <p className="text-muted-foreground mt-1">
          Ask AI for budgeting, savings, and finance advice.
        </p>

      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">

              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">

                <Sparkles className="w-8 h-8 text-primary" />

              </div>

              <h2 className="text-lg font-semibold">
                Welcome to AI Advisor
              </h2>

              <p className="text-sm text-muted-foreground max-w-md">
                Ask questions about budgeting, savings, expenses, or investments.
              </p>

            </div>
          )}

          {messages.map((msg, index) => (

            <div
              key={index}
              className={`flex gap-3 ${
                msg.role === "user"
                  ? "justify-end"
                  : ""
              }`}
            >

              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">

                  <Bot className="w-4 h-4 text-primary" />

                </div>
              )}

              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {msg.content}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">

                  <User className="w-4 h-4 text-secondary-foreground" />

                </div>
              )}

            </div>

          ))}

          {loading && (
            <div className="text-sm text-muted-foreground">
              AI is thinking...
            </div>
          )}

        </div>

        {/* Input */}
        <div className="border-t p-4">

          <form
            onSubmit={(e) => {
              e.preventDefault();
              askAI();
            }}
            className="flex gap-2"
          >

            <Input
              placeholder="Ask AI about finance..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1"
            />

            <Button
              type="submit"
              size="icon"
              disabled={loading}
            >

              <Send className="w-4 h-4" />

            </Button>

          </form>

        </div>

      </Card>

    </div>
  );
}
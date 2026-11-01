import {
  ArrowUpRight,
  BookOpen,
  Code2,
  Lightbulb,
  Sparkles,
  Workflow,
} from "lucide-react";

export const starters = [
  {
    Icon: Sparkles,
    title: "A little clarity",
    text: "What is Generative AI?",
    prompt: "Explain Generative AI in simple words.",
  },
  {
    Icon: BookOpen,
    title: "Learn something",
    text: "Explain Transformers",
    prompt: "Explain the Transformer architecture.",
  },
  {
    Icon: Code2,
    title: "Make something",
    text: "Write a Python program",
    prompt: "Write a Python program to check whether a number is prime.",
  },
  {
    Icon: Workflow,
    title: "Connect the dots",
    text: "How do neural networks work?",
    prompt: "How does a neural network learn? Explain with a simple example.",
  },
  {
    Icon: Lightbulb,
    title: "Find a starting point",
    text: "Give me project ideas",
    prompt: "Suggest three practical beginner Generative AI project ideas.",
  },
];

export default function PromptShelf({ onPrompt, disabled }) {
  return (
    <section className="prompt-shelf" aria-label="Conversation starters">
      <div className="prompt-grid">
        {starters.map(({ Icon, title, text, prompt }, index) => (
          <button
            className="prompt-card"
            key={title}
            disabled={disabled}
            onClick={() => onPrompt(prompt)}
            style={{ "--delay": `${index * 60}ms` }}
          >
            <Icon size={21} strokeWidth={1.4} />
            <span>
              <strong>{text}</strong>
            </span>
            <ArrowUpRight size={14} className="prompt-arrow" />
          </button>
        ))}
      </div>
    </section>
  );
}

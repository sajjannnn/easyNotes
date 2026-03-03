import { useState, useRef, useEffect } from "react";
import groq from "../utilis/openAI";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `
You are a concise AI assistant.

Rules:
- Give clear and direct answers.
- Avoid long lists unless necessary.
- No tables.
- No markdown separators.
- No decorative formatting.
- If the question is vague, ask for clarification.
`,
          },
          ...updatedMessages,
        ],
        model: "openai/gpt-oss-20b",
      });

      const aiReply = completion.choices[0]?.message?.content || "No response.";

      setMessages((prev) => [...prev, { role: "assistant", content: aiReply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error connecting to Groq API.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full w-[400px] border-l bg-white">
      <div className="p-3 border-b font-semibold text-sm">AI Chat</div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && <div className="text-gray-400 text-sm">Start chatting...</div>}

        {messages.map((msg, index) => (
          <div key={index} className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === "user" ? "bg-purple-600 text-white ml-auto" : "bg-gray-200 text-gray-800"}`}>
            {msg.content}
          </div>
        ))}

        {loading && <div className="bg-gray-200 text-gray-600 p-3 rounded-lg text-sm w-fit">Thinking...</div>}

        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Ask anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />

        <button onClick={handleSend} className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition">
          Send
        </button>
      </div>
    </div>
  );
};

export default AIChat;

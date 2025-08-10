import { useState, useRef, useEffect } from "react";
import {
  Send,
  Menu,
  X,
  Bot,
  User,
  Code,
  FileText,
  Table,
  Presentation,
  LogOut,
  LogIn,
  Trash2,
  Play,
  BrainCircuit,
} from "lucide-react";

// ✅ First functions
const determineContentType = (message) => {
  const msg = message.toLowerCase();
  if (
    msg.includes("code") ||
    msg.includes("function") ||
    msg.includes("javascript") ||
    msg.includes("react")
  )
    return "code";
  if (msg.includes("table") || msg.includes("data") || msg.includes("csv"))
    return "table";
  if (
    msg.includes("slides") ||
    msg.includes("presentation") ||
    msg.includes("pitch")
  )
    return "slides";
  return "markdown";
};

const formatResponse = (userMessage, aiResponse) => {
  const contentType = determineContentType(userMessage);
  switch (contentType) {
    case "code":
      return `// AI Generated Code Response
${aiResponse}

// Example implementation:
function ExampleComponent() {
  const [state, setState] = useState('');
  
  return (
    <div>
      <p>Generated response: {state}</p>
    </div>
  );
}`;
    case "table":
      return {
        headers: ["Item", "Description", "Value"],
        rows: [
          ["AI Response", aiResponse.substring(0, 50) + "...", "Generated"],
          ["Content Type", "Table Data", "Structured"],
          ["Source", "AI Model", "Dynamic"],
        ],
      };
    case "slides":
      return [
        {
          title: "AI Response",
          content: `# Generated Content\n\n${aiResponse}`,
        },
      ];
    default:
      return aiResponse;
  }
};

// API function
const aiCall = async (message, conversationHistory = []) => {
  console.log("🔍 Starting AI call with message:", message);

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: message },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse =
      data.choices[0]?.message?.content || "No response generated";

    return {
      type: determineContentType(message),
      content: formatResponse(message, aiResponse),
      language: "javascript",
    };
  } catch (error) {
    console.error("💥 AI API Error:", error);
    return {
      type: "markdown",
      content: `Sorry, I encountered an error: ${error.message}`,
    };
  }
};

//React components

// --- Code Editor Component ---
const CodeEditor = ({ code, language, onCodeChange }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");

  const runCode = () => {
    setIsRunning(true);
    try {
      if (language === "javascript") {
        const result = eval(code);
        setOutput(
          result !== undefined ? String(result) : "Code executed successfully"
        );
      } else {
        setOutput("Code execution not supported for this language");
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
    setIsRunning(false);
  };

  return (
    <div className="border rounded-lg bg-gray-900 text-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b">
        <span className="text-sm font-medium">Code Editor - {language}</span>
        <button
          onClick={runCode}
          disabled={isRunning}
          className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm disabled:opacity-50"
        >
          <Play size={14} />
          {isRunning ? "Running..." : "Run"}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="border-r border-gray-700">
          <textarea
            value={code}
            onChange={(e) => onCodeChange?.(e.target.value)}
            className="w-full h-64 p-4 bg-gray-900 text-white font-mono text-sm resize-none border-none outline-none"
            placeholder="Enter your code here..."
            spellCheck={false}
          />
        </div>
        <div className="bg-gray-800">
          <div className="p-4 text-sm font-mono">
            <div className="text-gray-300 mb-2">Output:</div>
            <div className="text-green-400 whitespace-pre-wrap">
              {output || 'Click "Run" to execute code'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Chat Interface ---
const AIChatInterface = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
        } else {
          setSidebarOpen(false);
        }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    window.removeEventListener('resize', handleResize);
  }, []);

  const login = (name) => {
    setUsername(name);
    setIsLoggedIn(true);
    setConversations([
      {
        id: "1",
        title: "Code Examples",
        messages: [
          {
            role: "user",
            content: "Show me a React component",
            timestamp: Date.now() - 86400000,
          },
        ],
      },
      {
        id: "2",
        title: "Data Analysis",
        messages: [
          {
            role: "user",
            content: "Create a sales data table",
            timestamp: Date.now() - 172800000,
          },
        ],
      },
    ]);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setConversations([]);
    setCurrentConversation(null);
  };

  const startNewConversation = () => {
    const newConv = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
    };
    setConversations([newConv, ...conversations]);
    setCurrentConversation(newConv);
  };

  const deleteConversation = (id) => {
    setConversations(conversations.filter((conv) => conv.id !== id));
    if (currentConversation?.id === id) setCurrentConversation(null);
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    let conversation = currentConversation;
    if (!conversation) {
      conversation = {
        id: Date.now().toString(),
        title: message.slice(0, 30) + (message.length > 30 ? "..." : ""),
        messages: [],
      };
      setConversations([conversation, ...conversations]);
      setCurrentConversation(conversation);
    }

    const userMessage = {
      role: "user",
      content: message,
      timestamp: Date.now(),
    };
    const updatedMessages = [...conversation.messages, userMessage];
    const updatedConversation = { ...conversation, messages: updatedMessages };
    setCurrentConversation(updatedConversation);
    setConversations(
      conversations.map((conv) =>
        conv.id === conversation.id ? updatedConversation : conv
      )
    );

    setMessage("");
    setIsLoading(true);

    try {
      const response = await aiCall(message, conversation.messages);
      const aiMessage = {
        role: "assistant",
        content: response.content,
        type: response.type,
        language: response.language,
        timestamp: Date.now(),
      };
      const finalMessages = [...updatedMessages, aiMessage];
      const finalConversation = {
        ...updatedConversation,
        messages: finalMessages,
      };
      setCurrentConversation(finalConversation);
      setConversations(
        conversations.map((conv) =>
          conv.id === conversation.id ? finalConversation : conv
        )
      );
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (message) => {
    if (message.role === "user")
      return <div className="whitespace-pre-wrap">{message.content}</div>;
    switch (message.type) {
      case "code":
        return (
          <CodeEditor
            code={message.content}
            language={message.language || "javascript"}
            onCodeChange={() => {}}
          />
        );
      case "table":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  {message.content.headers.map((h, i) => (
                    <th key={i} className="border px-2 py-1">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {message.content.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j} className="border px-2 py-1">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "slides":
        return (
          <div className="space-y-4">
            {message.content.map((slide, i) => (
              <div key={i} className="p-4 border rounded bg-gray-50">
                <h3 className="font-bold">{slide.title}</h3>
                <pre>{slide.content}</pre>
              </div>
            ))}
          </div>
        );
      default:
        return <div className="prose max-w-none">{message.content}</div>;
    }
  };

  const getMessageIcon = (message) => {
    if (message.role === "user") return <User size={16} />;
    switch (message.type) {
      case "code":
        return <Code size={16} />;
      case "table":
        return <Table size={16} />;
      case "slides":
        return <Presentation size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-black to-purple-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <BrainCircuit size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">TalkNow</h1>
            <p className="text-gray-600">
              AI that answers anything and adapts to everything
            </p>
          </div>
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) =>
                e.key === "Enter" && username.trim() && login(username)
              }
            />
            <button
              onClick={() => username.trim() && login(username)}
              className="w-full bg-black text-white border border-black hover:bg-white hover:text-black font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              Start Chatting
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100">
      {sidebarOpen && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div
        className={`bg-gray-900 border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? "w-80" : "w-0"
        } overflow-hidden fixed md:static h-full z-50`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User size={20} className="text-white" />
              <span className="font-medium text-white">{username}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
            >
              <LogOut size={16} />
            </button>
          </div>
          <button
            onClick={startNewConversation}
            className="w-full bg-white text-black border border-black hover:bg-black hover:text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            New Conversation
          </button>
        </div>
        <div className="p-4 space-y-2 overflow-y-auto h-full">
          <h3 className="text-sm font-medium text-white mb-2">Chat History</h3>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                currentConversation?.id === conv.id
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setCurrentConversation(conv)}
            >
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium truncate ${
                    currentConversation?.id === conv.id
                      ? "text-gray-900"
                      : "text-white group-hover:text-gray-800"
                  }`}
                >
                  {conv.title}
                </div>
                <div
                  className={`text-xs truncate ${
                    currentConversation?.id === conv.id
                      ? "text-gray-600"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                >
                  {conv.messages.length} messages
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-3 text-gray-400 hover:text-red-500 transition"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-grey border-b border-black p-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
            {currentConversation?.title ||
              "Select a conversation or start a new one"}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {currentConversation?.messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-3 max-w-4xl ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user"
                      ? "bg-black text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {getMessageIcon(msg)}
                </div>
                <div
                  className={`rounded-2xl p-4 ${
                    msg.role === "user"
                      ? "bg-black text-white"
                      : "bg-white border border-gray-200 shadow-sm"
                  }`}
                >
                  {renderMessageContent(msg)}
                  <div
                    className={`text-xs mt-2 ${
                      msg.role === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <BrainCircuit size={16} className="text-gray-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask for code examples, data tables, presentations, or general questions..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !message.trim()}
              className="bg-black hover:bg-black disabled:opacity-50 text-white p-3 rounded-lg transition flex items-center gap-2"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Try: "Show me a React component", "Create a sales table", "Make a
            presentation about AI", or ask any question!
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatInterface;
  
# TalkNow
TalkNow is an AI-powered chat platform that delivers instant, intelligent responses in a clean, responsive interface. Features include a toggleable sidebar with chat history, support for code, tables, and slides, and mobile-friendly design. Built with React, Tailwind CSS, and AI integration for dynamic conversations.

**Live Demo**
Live App: https://talknoww.netlify.app/

**Features Implemented**
* Collapsible Sidebar - Chat history and user authentication
* Responsive Design - Works on desktop and mobile devices
* Modern UI/UX - Clean, intuitive interface with smooth animations
* Real-time Chat - Instant messaging with typing indicator
* Content Type Detection - Automatically determines response format based on user input
* Conversation Management - Create, delete, and switch between multiple chats
* User Authentication - Simple login/logout functionality

**AI Integration & Tools Used**
* Primary AI Service: Groq API with Llama3-8b model
* Fallback Support: Designed to work with multiple AI providers (OpenAI, Hugging Face, etc.)

**AI Tools Used for -**
   * Debugging API integration issues
   * README documentation structure
   * Refactoring repetitive components
   * Creating README draft and deployment steps
  
**Known Limitations**
 * API Rate Limits - Free tier API has usage limitations
 * Performance - Large conversations might impact performance
 * No Persistent Storage - Chat history is lost on page refresh (stored in memory only)
 * Basic Authentication - Simple name-based login (no real user accounts)

**Improvements with more time -**
 * Connect to backend with database for persistent chat history
 * Add authentication and user profiles
 * Implement message search and filters
 * Lazy loading for conversation history

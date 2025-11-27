# MyAI3 - AI Chatbot Application

## Overview
MyAI3 is a customizable AI chatbot assistant built with Next.js 16, featuring web search capabilities, vector database integration, and content moderation. The application provides a complete foundation for deploying an AI assistant with multiple AI provider support.

## Project Information
- **Framework**: Next.js 16.0.0 with React 19
- **Language**: TypeScript
- **AI SDK**: Vercel AI SDK with support for OpenAI, Groq, Fireworks, DeepSeek, and xAI
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **Vector Database**: Pinecone
- **Web Search**: Exa API

## Replit Environment Setup

### Port Configuration
- **Development**: Runs on port 5000 with host 0.0.0.0
- **Production**: Configured for autoscale deployment on port 5000

### Workflow
- **Name**: Next.js Dev Server
- **Command**: `npm run dev`
- **Output**: Webview
- **Port**: 5000

### Environment Variables
The following secrets are configured and available:
- `OPENAI_API_KEY` - Required for AI model and content moderation
- `EXA_API_KEY` - Optional, enables web search functionality
- `PINECONE_API_KEY` - Optional, enables vector database search

### Deployment Configuration
- **Target**: Autoscale (stateless web application)
- **Build**: `npm run build`
- **Run**: `npm run start`

## Project Structure
```
myAI3/
├── app/                          # Next.js app directory
│   ├── api/chat/                 # Chat API endpoint with tools
│   │   ├── route.ts              # Main chat handler
│   │   └── tools/                # AI tools (web search, vector search)
│   ├── page.tsx                  # Main chat interface
│   └── parts/                    # UI components
├── components/                    # React components
│   ├── ai-elements/              # AI-specific UI components
│   ├── messages/                 # Message display components
│   └── ui/                       # Radix UI components
├── lib/                          # Utility libraries
│   ├── moderation.ts             # Content moderation
│   ├── pinecone.ts               # Vector database integration
│   └── sources.ts                # Citation handling
├── config.ts                     # Main configuration file
├── prompts.ts                    # AI behavior configuration
└── package.json                  # Dependencies
```

## Key Features
1. **Multi-Provider AI Support**: OpenAI, Groq, Fireworks, DeepSeek, xAI
2. **Web Search**: Real-time web search using Exa API
3. **Vector Database**: Knowledge base search with Pinecone
4. **Content Moderation**: OpenAI moderation API integration
5. **Streaming Responses**: Real-time AI response streaming
6. **Reasoning Display**: Shows AI reasoning process
7. **Citation Support**: Automatic source citations

## Customization
Most customization can be done in two main files:
- **config.ts**: AI name, owner name, welcome message, moderation messages
- **prompts.ts**: AI behavior, tone, style, guardrails

## Development
```bash
npm install        # Install dependencies
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
```

## Recent Changes
- **2025-11-27**: Initial Replit environment setup
  - Configured Next.js to run on port 5000 with 0.0.0.0 host
  - Set up workflow for development server
  - Configured autoscale deployment
  - Added environment variables for API keys

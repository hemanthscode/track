import { useMutation } from '@tanstack/react-query'
import { useState, useRef, useEffect } from 'react'
import { aiAPI } from '../../lib/api.js'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { MessageSquare, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI financial assistant. I can help you analyze your spending, suggest budgets, and answer questions about your finances. How can I help you today?'
    }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  const chatMutation = useMutation({
    mutationFn: (message) => aiAPI.chat(message),
    onSuccess: (response) => {
      const answer = response.data.data.answer
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: answer
      }])
    },
    onError: () => {
      toast.error('Failed to get AI response')
    }
  })

  const handleSend = () => {
    if (!input.trim()) return
    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    chatMutation.mutate(input)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) 
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const suggestedQuestions = [
    'What are my top spending categories?',
    'How can I reduce my expenses?',
    'Am I on track with my budget?',
    'Show me spending trends'
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-8 w-8" />
          AI Assistant
        </h1>
        <p className="text-muted-foreground mt-2">
          Get personalized financial insights and recommendations  
        </p>
      </div>

      <Card 
        title="Chat with AI" 
        icon={Sparkles}
        className="h-[650px] flex flex-col"
      >
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="h-12 w-12 bg-gradient-to-br from-muted/50 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 p-3">      
                  <Bot className="h-6 w-6 text-muted-foreground" />
                </div>
              )}

              <div
                className={`max-w-[75%] p-5 rounded-2xl shadow-xl border leading-relaxed whitespace-pre-wrap ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground ml-auto border-primary/30 shadow-primary/20'
                    : 'bg-gradient-to-r from-background to-card border-border/50 shadow-md'
                }`}
              >
                <p className="text-base">{message.content}</p>       
              </div>

              {message.role === 'user' && (
                <div className="h-12 w-12 bg-gradient-to-br from-primary/20 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 p-3">     
                  <User className="h-6 w-6 text-primary-foreground" />     
                </div>
              )}
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex gap-4 justify-start">
              <div className="h-12 w-12 bg-gradient-to-br from-muted/50 rounded-2xl flex items-center justify-center shadow-lg p-3">
                <Bot className="h-6 w-6 text-muted-foreground animate-pulse" />
              </div>
              <div className="bg-gradient-to-r from-background to-card border rounded-2xl p-5 shadow-xl max-w-[75%]">
                <div className="flex items-center gap-3 text-base text-muted-foreground">
                  <div className="flex gap-1.5 p-1.5 bg-muted/50 rounded-xl">
                    <div className="h-2.5 w-2.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                    <div className="h-2.5 w-2.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />     
                    <div className="h-2.5 w-2.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />     
                  </div>
                  <span>AI is typing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t bg-gradient-to-b from-card to-background">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-4 p-2 bg-muted/20 rounded-xl">
              {suggestedQuestions.map((question, index) => (       
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-accent transition-all px-4 py-2 text-sm backdrop-blur-sm shadow-sm border-border/50"
                  onClick={() => setInput(question)}
                >
                  {question}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Input
              placeholder="Ask me anything about your finances..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={chatMutation.isPending}
              className="flex-1 h-14 border-border/50 bg-muted/50 focus:border-primary/70 shadow-lg backdrop-blur-sm text-lg"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}   
              className="h-14 px-8 shadow-xl hover:shadow-2xl bg-gradient-to-r from-primary to-primary/90"
              size="lg"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export { AIChat }

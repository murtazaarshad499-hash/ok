import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Phone, User, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const recentChats = [
  {
    id: 1,
    name: "Sarah Mitchell",
    message: "When can we schedule a viewing?",
    time: "2 min ago",
    unread: true,
    avatar: "SM",
  },
  {
    id: 2,
    name: "Michael Chen",
    message: "Thank you for the property brochure!",
    time: "1 hour ago",
    unread: false,
    avatar: "MC",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    message: "Is the Miami condo still available?",
    time: "3 hours ago",
    unread: true,
    avatar: "ER",
  },
]

const quickReplies = [
  "Schedule viewing",
  "Send brochure",
  "Call back later",
  "Property details",
]

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedChat, setSelectedChat] = useState<number | null>(null)
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (message.trim()) {
      setMessage("")
    }
  }

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30",
          "hover:bg-green-600 transition-colors",
          isOpen && "hidden"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold">
          2
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-2xl overflow-hidden shadow-2xl border border-border/50"
          >
            <div className="bg-green-500 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">WhatsApp Business</h3>
                    <p className="text-xs text-white/80">LuxeState CRM</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsOpen(false)
                    setSelectedChat(null)
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="bg-background">
              <AnimatePresence mode="wait">
                {selectedChat === null ? (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4"
                  >
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      Recent Conversations
                    </p>
                    <div className="space-y-2">
                      {recentChats.map((chat) => (
                        <motion.button
                          key={chat.id}
                          onClick={() => setSelectedChat(chat.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
                          whileHover={{ x: 4 }}
                        >
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                              {chat.avatar}
                            </div>
                            {chat.unread && (
                              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-foreground truncate">
                                {chat.name}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {chat.time}
                              </span>
                            </div>
                            <p className={cn(
                              "text-sm truncate",
                              chat.unread ? "text-foreground font-medium" : "text-muted-foreground"
                            )}>
                              {chat.message}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <Button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white">
                      <User className="h-4 w-4 mr-2" />
                      Start New Chat
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex items-center gap-3 p-3 border-b border-border/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedChat(null)}
                        className="text-muted-foreground"
                      >
                        ← Back
                      </Button>
                      <div className="flex-1 text-center">
                        <p className="font-medium text-foreground">
                          {recentChats.find((c) => c.id === selectedChat)?.name}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Phone className="h-4 w-4 text-green-500" />
                      </Button>
                    </div>

                    <div className="h-48 p-4 overflow-y-auto space-y-3">
                      <div className="flex justify-start">
                        <div className="bg-secondary rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                          <p className="text-sm">
                            {recentChats.find((c) => c.id === selectedChat)?.message}
                          </p>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {recentChats.find((c) => c.id === selectedChat)?.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-2">
                      <div className="flex flex-wrap gap-2">
                        {quickReplies.map((reply) => (
                          <button
                            key={reply}
                            onClick={() => setMessage(reply)}
                            className="text-xs px-3 py-1.5 rounded-full border border-green-500/30 text-green-600 hover:bg-green-500/10 transition-colors"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <Input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 bg-secondary/50 border-border/50"
                          onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        />
                        <Button
                          onClick={handleSend}
                          size="icon"
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

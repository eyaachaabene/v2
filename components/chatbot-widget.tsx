"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: number
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "أهلاً وسهلاً! أنا مساعدك الذكي في Agri-SHE. نجم نعاونك في مشاكل الفلاحة، أخبار الطقس، الري، والكل. كيفاش نجم نعاونك اليوم؟",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage("")
    setIsTyping(true)

    // Simulate bot response with realistic typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: getBotResponse(currentMessage),
        sender: "bot",
        timestamp: new Date(),
      }
      setIsTyping(false)
      setMessages((prev) => [...prev, botResponse])
    }, 1500 + Math.random() * 1000)
  }

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    // Salutations et politesse
    if (input.includes("مرحبا") || input.includes("أهلا") || input.includes("سلام") || input.includes("hello") || input.includes("ahla") || input.includes("صباح") || input.includes("مساء")) {
      return "أهلين وسهلين! 🌱 أنا مساعدك الذكي في Agri-SHE. يمكنني مساعدتك في:\n• نصائح الزراعة والفلاحة 🌾\n• معلومات الطقس والري 💧\n• أسعار السوق 💰\n• فرص العمل 💼\n• إدارة المحاصيل 🍅\n\nشنو تحب تعرف النهارده؟"
    }
    
    // Remerciements
    else if (input.includes("شكرا") || input.includes("يعطيك الصحة") || input.includes("thanks") || input.includes("merci")) {
      return "العفو! 😊 أنا هنا دائماً لخدمتك. لا تتردد في السؤال على أي حاجة تخص الفلاحة أو الزراعة. بالتوفيق في مشاريعك! 🌟"
    }

    // معلومات الطقس والمناخ
    else if (input.includes("طقس") || input.includes("weather") || input.includes("jaw") || input.includes("مناخ") || input.includes("حرارة") || input.includes("مطر")) {
      return "🌤️ **طقس اليوم في منطقتك:**\n• الحرارة: 28°م - مثالية للزراعة\n• الرطوبة: 65% - جيدة للنباتات\n• الرياح: 12 كم/س - مناسبة للرش\n• توقعات الأسبوع: مشمس مع فرصة أمطار خفيفة الخميس\n\n💡 **نصيحة:** أفضل وقت للري الآن من 6-8 صباحاً أو 6-8 مساءً"
    }

    // الري والمياه
    else if (input.includes("ري") || input.includes("ماء") || input.includes("irrigation") || input.includes("water") || input.includes("ma") || input.includes("سقي")) {
      return "💧 **دليل الري الذكي:**\n\n🎯 **حالة التربة الحالية:** رطوبة 68% - مناسبة\n\n📊 **جدول الري المقترح:**\n• الطماطم: كل يومين (5 لتر/م²)\n• الخيار: يومياً (3 لتر/م²)\n• الزيتون: أسبوعياً (20 لتر/شجرة)\n\n💡 **نصائح توفير الماء:**\n• استخدم الري بالتنقيط\n• أضف المالش حول النباتات\n• اري في الصباح الباكر"
    }

    // الزراعة والمحاصيل
    else if (input.includes("طماطم") || input.includes("tomato") || input.includes("زراعة") || input.includes("crop") || input.includes("zar3a") || input.includes("محصول")) {
      const crops = ["طماطم", "خيار", "فلفل", "باذنجان", "زيتون", "تفاح"]
      const mentionedCrop = crops.find(crop => input.includes(crop)) || "طماطم"
      
      if (mentionedCrop === "طماطم") {
        return "🍅 **دليل زراعة الطماطم:**\n\n🌱 **مرحلة النمو:** الثمار تنضج\n📊 **صحة المحصول:** ممتازة (92%)\n\n🛡️ **الوقاية:**\n• رش ضد الآفات كل أسبوعين\n• تهوية جيدة بين النباتات\n• إزالة الأوراق المصفرة\n\n📈 **التوقعات:** حصاد متوقع بعد 15 يوم\n💰 **سعر السوق:** 2.8 دينار/كيلو (مرتفع)"
      }
      return "🌾 **نصائح الزراعة العامة:**\n• فحص التربة شهرياً\n• تسميد منتظم حسب نوع المحصول\n• مراقبة الآفات والأمراض\n• تطبيق دورة زراعية مناسبة"
    }

    // أسعار السوق
    else if (input.includes("سوق") || input.includes("أسعار") || input.includes("market") || input.includes("price") || input.includes("sou9") || input.includes("بيع")) {
      return "💰 **أسعار السوق اليوم:**\n\n📈 **أسعار مرتفعة:**\n• طماطم: 2.8 دت/كيلو (+15%)\n• خيار: 2.1 دت/كيلو (+8%)\n\n📊 **أسعار مستقرة:**\n• زيتون: 4.2 دت/كيلو\n• فلفل: 3.1 دت/كيلو\n\n🏪 **أفضل أسواق البيع:**\n• سوق الجملة تونس\n• سوق صفاقس المركزي\n• سوق سوسة الأسبوعي\n\n💡 **نصيحة:** الأسعار أعلى صباح الجمعة"
    }

    // فرص العمل
    else if (input.includes("شغل") || input.includes("عمل") || input.includes("job") || input.includes("work") || input.includes("khedma") || input.includes("فرصة")) {
      return "💼 **فرص العمل الجديدة:**\n\n🌟 **فرص مميزة:**\n• مهندس زراعي - مصنع زيتون بصفاقس (1200 دت)\n• مشرف مزرعة - القيروان (900 دت)\n• تقني ري - شركة فلاحية بسوسة (750 دت)\n\n📚 **برامج التكوين:**\n• دورة الزراعة الذكية - مجانية\n• تكوين في الري الحديث\n• برنامج ريادة الأعمال الزراعية\n\n📞 **للتقديم:** زور قسم الفرص في التطبيق"
    }

    // الآفات والأمراض
    else if (input.includes("آفات") || input.includes("مرض") || input.includes("حشرات") || input.includes("علاج") || input.includes("دواء")) {
      return "🛡️ **دليل مكافحة الآفات:**\n\n🔍 **تشخيص سريع:**\n• أوراق مصفرة → نقص نيتروجين\n• بقع بنية → فطريات\n• ثقوب في الأوراق → حشرات\n\n💊 **العلاجات الطبيعية:**\n• زيت النيم ضد المن\n• محلول الصابون للعناكب\n• مغلي الثوم كمبيد طبيعي\n\n⚠️ **للحالات الشديدة:** استشر مهندس زراعي"
    }

    // الأسمدة والتسميد
    else if (input.includes("سماد") || input.includes("تسميد") || input.includes("غذاء") || input.includes("نيتروجين") || input.includes("فوسفور")) {
      return "🌿 **برنامج التسميد الموصى به:**\n\n📅 **جدول التسميد:**\n• النيتروجين: كل 3 أسابيع\n• الفوسفور: عند الزراعة وبداية الإزهار\n• البوتاسيوم: عند تكوين الثمار\n\n🥗 **أسمدة طبيعية:**\n• كومبوست (أفضل خيار)\n• سماد حيواني متخمر\n• رماد الخشب للبوتاسيوم\n\n⚖️ **الكميات:** 200-300 جرام/م² كل شهر"
    }

    // تقنيات حديثة وذكية
    else if (input.includes("تقنية") || input.includes("ذكي") || input.includes("حديث") || input.includes("تكنولوجيا") || input.includes("iot")) {
      return "🤖 **التقنيات الذكية في الزراعة:**\n\n📡 **أجهزة الاستشعار:**\n• مستشعرات رطوبة التربة\n• محطات طقس صغيرة\n• كاميرات مراقبة المحاصيل\n\n📱 **تطبيقات مفيدة:**\n• مراقبة الري عن بُعد\n• تنبيهات الطقس\n• تحليل صور النباتات\n\n💡 **استثمار ذكي:** ابدأ بمستشعر رطوبة (50 دت فقط)"
    }

    // مشاكل عامة وحلول
    else if (input.includes("مشكلة") || input.includes("مساعدة") || input.includes("حل") || input.includes("كيف") || input.includes("ماذا")) {
      return "🔧 **حلول سريعة للمشاكل الشائعة:**\n\n🟡 **اصفرار الأوراق:**\n• زيادة التسميد النيتروجيني\n• تحسين الصرف\n\n🟤 **ذبول النباتات:**\n• فحص جذور النبات\n• تقليل الري\n• تحسين التهوية\n\n🐛 **ظهور حشرات:**\n• رش زيت النيم\n• تنظيف الأعشاب الضارة\n\n📞 **للمساعدة العاجلة:** اتصل بالخط الساخن 71-XXX-XXX"
    }

    // أسئلة عامة
    else {
      const responses = [
        "🤔 ممكن توضح أكثر شنو تقصد؟ أنا هنا للمساعدة في كل ما يخص الفلاحة والزراعة.",
        "🌱 عندي معلومات كثيرة! اسأل عن الري، الزراعة، أسعار السوق، فرص العمل، أو أي مشكلة زراعية.",
        "💭 ما فهمتش السؤال بالضبط. جرب تسأل عن موضوع محدد مثل الطقس أو زراعة محصول معين.",
        "🎯 أنا متخصص في الفلاحة! اسأل عن نصائح الزراعة، مكافحة الآفات، الري الذكي، أو أحدث التقنيات الزراعية."
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="relative h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 group"
            size="sm"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse opacity-75"></div>
            <MessageCircle className="h-7 w-7 text-white relative z-10 group-hover:animate-bounce" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-ping" />
          </Button>
          <div className="absolute -top-2 -left-20 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            اسأل مساعدك الذكي
          </div>
        </div>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col bg-white/95 backdrop-blur-sm border-0 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="pb-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-3">
                <div className="relative">
                  <Bot className="h-6 w-6 text-white" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">مساعد Agri-SHE</span>
                  <span className="text-xs text-green-100 font-normal">متصل الآن</span>
                </div>
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)} 
                className="h-8 w-8 p-0 hover:bg-white/20 text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 bg-gradient-to-b from-gray-50 to-white">
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex animate-in slide-in-from-bottom-2 duration-300 ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white ml-12"
                          : "bg-white text-gray-800 mr-12 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {message.sender === "bot" && (
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                              <Bot className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        )}
                        <div className="flex-1">
                          <span className="leading-relaxed block">{message.text}</span>
                          <span className={`text-xs mt-1 block ${
                            message.sender === "user" ? "text-green-100" : "text-gray-400"
                          }`}>
                            {message.timestamp.toLocaleTimeString('ar-TN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        {message.sender === "user" && (
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                              <User className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                    <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white mr-12 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                            <Bot className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Quick Reply Buttons */}
            {messages.length === 1 && (
              <div className="px-4 py-2 bg-gray-50 border-t">
                <p className="text-xs text-gray-500 mb-2 text-center">أسئلة سريعة:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "طقس اليوم", 
                    "أسعار السوق", 
                    "نصائح الري", 
                    "فرص شغل"
                  ].map((question) => (
                    <button
                      key={question}
                      onClick={() => {
                        setInputMessage(question)
                        setTimeout(() => handleSendMessage(), 100)
                      }}
                      className="px-3 py-1 text-xs bg-white rounded-full border border-gray-200 hover:border-green-500 hover:text-green-600 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="p-4 border-t bg-white">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    placeholder="اسأل على اللي تحب..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    disabled={isTyping}
                    className="pr-4 pl-12 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 transition-colors text-right"
                    dir="rtl"
                  />
                  <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputMessage.trim() || isTyping}
                  className="h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-green-500/25 transition-all duration-200 transform hover:scale-105"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex items-center justify-center">
                <span className="text-xs text-gray-400">مدعوم بالذكاء الاصطناعي • Agri-SHE</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

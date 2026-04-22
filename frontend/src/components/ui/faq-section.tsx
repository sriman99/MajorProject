import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: "What kind of audio should I upload?",
    answer: "Clean recordings of your breathing, preferably in WAV format, taken in a quiet room."
  },
  {
    question: "Is this a diagnostic tool?",
    answer: "NeumoAI is an assistive platform. It provides AI-based predictions and connects you to licensed doctors for verified diagnoses."
  },
  {
    question: "How secure is my data?",
    answer: "Extremely. We use JWT for authentication, encrypted storage (S3 in future), and role-based access control."
  },
  {
    question: "Can I talk to a doctor directly?",
    answer: "Yes! You can schedule video calls or chat live through your dashboard."
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-foreground text-center mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Feel free to ask questions at{" "}
          <a href="mailto:neumoai@gmail.com" className="text-[#ff7757]">
            neumoai@gmail.com
          </a>
        </p>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-card rounded-lg shadow-sm overflow-hidden border border-border"
            >
              <button
                className="w-full p-6 text-left flex items-center justify-between"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-lg font-semibold text-foreground">
                  {faq.question}
                </span>
                <span className="text-[#ff7757] text-2xl">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const FAQSection = () => {
  const faqs = [
    {
      question: "What is MetsXMFanZone?",
      answer: "MetsXMFanZone is the ultimate destination for New York Mets fans, offering live game streams, highlights, podcasts, news updates, and an engaged community of passionate fans."
    },
    {
      question: "How much does it cost?",
      answer: "We offer a 7-day FREE trial to explore all features. After the trial, it's just $12.99/month for unlimited access to live streams, exclusive content, and more."
    },
    {
      question: "What content is available?",
      answer: "Enjoy live game streams, game highlights, exclusive podcasts, spring training coverage, real-time news updates, and a vibrant community forum to connect with fellow Mets fans."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes! You can cancel your subscription at any time with no penalties or hidden fees. Your access continues until the end of your billing period."
    },
    {
      question: "Is this official Mets content?",
      answer: "MetsXMFanZone is a fan-created platform dedicated to bringing Mets fans together. While we cover all things Mets, we are an independent community not officially affiliated with the New York Mets organization."
    },
    {
      question: "How do I watch live games?",
      answer: "After subscribing, navigate to the Live section from the menu to access live game streams and network broadcasts during game times."
    }
  ];

  return (
    <section className="py-10 sm:py-12 md:py-16 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8 md:mb-10"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Got questions? We've got answers. Find everything you need to know about MetsXMFanZone.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <AccordionItem 
                  value={`item-${index}`}
                  className="glass-card rounded-2xl border border-border/30 px-4 sm:px-5 overflow-hidden"
                >
                  <AccordionTrigger className="text-left text-xs sm:text-sm font-semibold text-foreground hover:text-primary py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

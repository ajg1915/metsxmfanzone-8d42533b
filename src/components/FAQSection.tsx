import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Got questions? We've got answers. Find everything you need to know about MetsXMFanZone.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-background rounded-lg border border-border px-4 sm:px-6"
              >
                <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-foreground hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQs = () => {
  const faqs = [
    {
      question: "What is MetsXMFanZone?",
      answer: "MetsXMFanZone is your ultimate destination for exclusive New York Mets content, including live streams, game highlights, community discussions, and in-depth analysis.",
    },
    {
      question: "How do I watch live streams?",
      answer: "Navigate to the Live section from the main menu or click on any live stream card on the homepage. Premium subscribers get access to all live content.",
    },
    {
      question: "What subscription plans are available?",
      answer: "We offer three plans: Free (basic access), Fan ($9.99/month with ad-free viewing and HD streams), and Super Fan ($19.99/month with all features plus exclusive content).",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes! You can cancel your subscription at any time from your account settings. Your access will continue until the end of your billing period.",
    },
    {
      question: "How do I join the community?",
      answer: "Create a free account and head to the Community section. You can post, comment, and engage with other Mets fans instantly.",
    },
    {
      question: "Is there a mobile app?",
      answer: "Yes! Our website is fully responsive and works great on mobile browsers. You can also add it to your home screen for an app-like experience.",
    },
    {
      question: "How often is new content added?",
      answer: "We add new content daily, including game highlights, analysis videos, blog posts, and live streams during the baseball season.",
    },
    {
      question: "Can I download videos for offline viewing?",
      answer: "Super Fan subscribers can download select content for offline viewing through our mobile app.",
    },
    {
      question: "How do I report inappropriate content?",
      answer: "Use the report button on any post or comment. Our moderation team reviews all reports within 24 hours.",
    },
    {
      question: "Do you offer student or military discounts?",
      answer: "Yes! Contact our support team with valid student or military ID for a 25% discount on any paid plan.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Frequently Asked Questions - MetsXMFanZone Help & Support</title>
        <meta name="description" content="Find answers to common questions about MetsXMFanZone subscriptions, live streams, content access, and more. Get help with your account and features." />
        <meta name="keywords" content="Mets FAQs, MetsXM help, support questions, streaming help, subscription FAQ" />
        <link rel="canonical" href="https://www.metsxmfanzone.com/faqs" />
      </Helmet>
      <Navigation />
      <main className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-3 sm:mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Find quick answers to common questions about MetsXMFanZone
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-sm sm:text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm sm:text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQs;
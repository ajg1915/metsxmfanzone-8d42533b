import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, Users, Radio, Star, Headphones, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";

const benefits = [
  {
    icon: Mic,
    title: "Host Your Show",
    description: "Create and host your own Mets-focused podcast episodes"
  },
  {
    icon: Users,
    title: "Build Community",
    description: "Connect with passionate Mets fans from around the world"
  },
  {
    icon: Radio,
    title: "Go Live",
    description: "Participate in live broadcasts and real-time discussions"
  },
  {
    icon: Star,
    title: "Get Featured",
    description: "Your content featured across our platforms and social media"
  }
];

const JoinPodcastSection = () => {
  return (
    <section className="py-10 sm:py-12 md:py-16 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <GlassCard variant="default" glow="blue" className="overflow-hidden">
          <div className="p-6 sm:p-8 md:p-10">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
                <Headphones className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Become a Podcaster</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
                Join Our Podcast Team
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                Are you a passionate Mets fan with a voice to share? Join the MetsXMFanZone podcast network and reach thousands of fellow fans.
              </p>
            </motion.div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center p-4 rounded-xl glass-card"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center flex flex-wrap justify-center gap-4"
            >
              <Button size="lg" asChild className="glass-card border-primary/30 hover:border-primary/50">
                <Link to="/podcaster-application" className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Apply Now
                </Link>
              </Button>
              <Button size="lg" asChild variant="outline" className="glass-card border-primary/30 hover:border-primary/50 hover:bg-primary/10">
                <Link to="/community-podcast" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Learn More
                </Link>
              </Button>
            </motion.div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
};

export default JoinPodcastSection;

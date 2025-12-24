import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { StreamPlayer } from "@/components/StreamPlayer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Radio, Tv, Signal, Clock, MapPin, Users, Mic, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/metsxmfanzone-logo.png";

const MetsXMFanZone = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="MetsXMFanZone TV - Watch Live Mets Shows & Exclusive Content"
        description="Watch MetsXMFanZone TV for exclusive Mets live shows, fan discussions, and 24/7 coverage. Your ultimate destination for Mets content."
        canonical="https://www.metsxmfanzone.com/metsxmfanzone-tv"
        keywords="MetsXMFanZone TV, Mets live show, Mets fan TV, exclusive Mets content, Mets 24/7"
        ogType="video.other"
      />
      <Navigation />
      
      <main className="flex-1 pt-12">
        {/* Hero Banner with MetsXMFanZone Branding */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-20 -right-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            {/* Animated scan lines */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,102,0,0.02)_50%)] bg-[length:100%_4px] pointer-events-none" />
          </div>
          
          <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Logo/Branding */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/20 p-2">
                  <img src={logo} alt="MetsXMFanZone" className="w-full h-full object-contain" />
                </div>
                {/* Live indicator */}
                <motion.div 
                  className="absolute -top-2 -right-2 flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Radio className="w-3 h-3" />
                  LIVE
                </motion.div>
              </motion.div>
              
              {/* Title and Info */}
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                      <Signal className="w-3 h-3 mr-1" />
                      Exclusive
                    </Badge>
                    <Badge variant="outline" className="border-muted-foreground/30">
                      <Tv className="w-3 h-3 mr-1" />
                      HD Quality
                    </Badge>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
                    MetsXMFanZone <span className="text-primary">TV</span>
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
                    Your ultimate destination for exclusive Mets content, live fan discussions, 
                    and 24/7 coverage from the heart of the fanbase.
                  </p>
                </motion.div>
                
                {/* Quick Info Cards */}
                <motion.div 
                  className="flex flex-wrap gap-3 mt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-xs text-foreground">New York, NY</span>
                  </div>
                  <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-xs text-foreground">24/7 Fan Coverage</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Stream Player Section */}
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <StreamPlayer 
                pageName="metsxmfanzone"
                pageTitle="MetsXMFanZone Live Stream"
                pageDescription="Ultimate Destination Where the Fans Go"
              />
            </motion.div>
            
            {/* Channel Info Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/50 transition-colors group">
                <CardContent className="p-4 sm:p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Mic className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">Live Shows</h3>
                  <p className="text-sm text-muted-foreground">
                    Exclusive live shows featuring fan discussions, game reactions, and special guest appearances.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-secondary/50 transition-colors group">
                <CardContent className="p-4 sm:p-6">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">Fan Community</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with fellow Mets fans in real-time during live streams and interactive events.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/50 transition-colors group">
                <CardContent className="p-4 sm:p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">Exclusive Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Premium Mets content you won't find anywhere else - interviews, analysis, and behind-the-scenes.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MetsXMFanZone;
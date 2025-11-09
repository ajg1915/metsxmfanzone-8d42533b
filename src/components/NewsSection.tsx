import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import springImage from "@/assets/spring-training.jpg";

const NewsSection = () => {
  const articles = [
    {
      id: 1,
      category: "PLAYER SPOTLIGHT",
      title: "Jeff McNeil's Fork in the Road: Trade Bait or Glue Guy?",
      excerpt: "Should the Mets shop Jeff McNeil this winter, or is he the quintessential glue guy?",
      date: "5 hours",
      image: springImage
    },
    {
      id: 2,
      category: "NEWS",
      title: "Showdown at Sienna Docks: Is Pete Alonso or Edwin Diaz the...",
      excerpt: "As free agent season is in full swing now that the World Series fans have turned their attention toward Mets' free agents.",
      date: "8 hours",
      image: springImage
    },
    {
      id: 3,
      category: "ANALYSIS",
      title: "Juan Soto's Championship Pedigree: They Strikler Filled as a...",
      excerpt: "The New York Mets will have their appointment with Juan Soto coming up soon. Analyst coach Roy Stribler on the team's new hitting.",
      date: "12 hours",
      image: springImage
    }
  ];

  return (
    <section className="py-16 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="border-2 border-primary bg-card overflow-hidden hover:shadow-xl transition-all group cursor-pointer">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <Badge className="w-fit mb-2 bg-primary text-primary-foreground">
                  {article.category}
                </Badge>
                <h3 className="text-lg font-bold text-primary group-hover:text-primary/80 transition-colors">
                  {article.title}
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {article.date}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;

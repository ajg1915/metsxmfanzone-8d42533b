import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, TrendingUp, Calendar } from "lucide-react";

const Community = () => {
  const forumCategories = [
    {
      title: "Game Day Discussion",
      description: "Live game chats and real-time reactions",
      posts: 1247,
      members: 3420,
      icon: MessageSquare,
      trending: true,
    },
    {
      title: "Trade Talk & Rumors",
      description: "Latest news, trades, and roster moves",
      posts: 856,
      members: 2103,
      icon: TrendingUp,
      trending: true,
    },
    {
      title: "Season Predictions",
      description: "Share your predictions and analysis",
      posts: 642,
      members: 1876,
      icon: Calendar,
      trending: false,
    },
    {
      title: "Fan Meetups",
      description: "Organize watch parties and events",
      posts: 234,
      members: 892,
      icon: Users,
      trending: false,
    },
  ];

  const recentPosts = [
    {
      title: "Who should the Mets target in free agency?",
      author: "MetsFan2024",
      replies: 47,
      time: "2 hours ago",
    },
    {
      title: "Breaking down last night's incredible comeback",
      author: "BaseballAnalyst",
      replies: 89,
      time: "3 hours ago",
    },
    {
      title: "Best moments from this season so far",
      author: "CitiFieldRegular",
      replies: 134,
      time: "5 hours ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16 bg-gradient-to-b from-secondary/20 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                Join the Community
              </h1>
              <p className="text-lg text-foreground max-w-2xl mx-auto">
                Connect with thousands of passionate Mets fans. Share your thoughts, predictions, and game reactions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {forumCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Card key={index} className="border-2 border-primary bg-card hover:shadow-xl transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Icon className="w-8 h-8 text-primary" />
                        {category.trending && (
                          <Badge className="bg-primary text-primary-foreground">
                            🔥 Trending
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl text-primary">{category.title}</CardTitle>
                      <CardDescription className="text-foreground">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span>{category.posts} posts</span>
                        <span>{category.members} members</span>
                      </div>
                      <Button className="w-full">Join Discussion</Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-primary mb-6">Recent Discussions</h2>
              <div className="space-y-4">
                {recentPosts.map((post, index) => (
                  <Card key={index} className="border-2 border-primary bg-card hover:shadow-lg transition-all cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-primary mb-2">{post.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>by {post.author}</span>
                            <span>•</span>
                            <span>{post.replies} replies</span>
                            <span>•</span>
                            <span>{post.time}</span>
                          </div>
                        </div>
                        <MessageSquare className="w-5 h-5 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Community;

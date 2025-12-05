import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";
import StoriesSection from "./StoriesSection";

const LiveNetworks = () => {
  const navigate = useNavigate();

  return <StoriesSection />;
};

export default LiveNetworks;
import MatchupPage from "./MatchupPage";
import { metsData2026 } from "./metsRoster2026";
import springImage from "@/assets/spring-mets-astros.jpg";

const opponentData = {
  name: "Houston Astros",
  abbr: "HOU",
  primaryColor: "#EB6E1F",
  secondaryColor: "#002D62",
  logo: "",
  teamId: 117,
  record: "88-74",
  springRecord: "10-10",
  keyPlayers: [
    { name: "Jose Altuve", position: "2B", avg: ".298", hr: 20, rbi: 70, imageId: 514888 },
    { name: "Yordan Alvarez", position: "DH", avg: ".290", hr: 35, rbi: 100, imageId: 670541 },
    { name: "Alex Bregman", position: "3B", avg: ".270", hr: 22, rbi: 82, imageId: 608324 },
  ],
  keyPitchers: [
    { name: "Framber Valdez", position: "SP", era: "3.35", wins: 14, strikeouts: 200, imageId: 664285 },
    { name: "Hunter Brown", position: "SP", era: "3.75", wins: 12, strikeouts: 165, imageId: 686613 },
  ],
};

const bettingLines = {
  spread: "NYM -1.5",
  moneyline: { mets: "-125", opponent: "+105" },
  overUnder: "8.5",
};

const anthonyPick = {
  pick: "Mets to Win + Over 8.5 Runs",
  confidence: 78,
  reasoning: "The Astros have a solid lineup but the Mets' Juan Soto and Lindor combo is lethal. Expect fireworks when these two lineups go head to head.",
  whereToBet: ["DraftKings", "FanDuel", "BetMGM", "Caesars"],
  recommendation: "Parlay the Mets ML with Over 8.5 for +220 odds. Spring games tend to be high scoring with pitchers working on mechanics.",
};

export default function MetsVsAstros() {
  return (
    <MatchupPage
      opponent={opponentData}
      metsData={metsData2026}
      bettingLines={bettingLines}
      anthonyPick={anthonyPick}
      headToHead={{ metsWins: 12, opponentWins: 15 }}
      heroImage={springImage}
      matchupDate="2026 Season"
    />
  );
}

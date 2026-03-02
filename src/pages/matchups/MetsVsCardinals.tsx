import MatchupPage from "./MatchupPage";
import { metsData2026 } from "./metsRoster2026";
import springImage from "@/assets/spring-mets-cards.jpg";

const opponentData = {
  name: "St. Louis Cardinals",
  abbr: "STL",
  primaryColor: "#C41E3A",
  secondaryColor: "#0C2340",
  logo: "",
  teamId: 138,
  record: "68-94",
  springRecord: "8-12",
  keyPlayers: [
    { name: "Masyn Winn", position: "SS", avg: ".272", hr: 18, rbi: 65, imageId: 694613 },
    { name: "Nolan Gorman", position: "2B", avg: ".255", hr: 28, rbi: 78, imageId: 687462 },
    { name: "Jordan Walker", position: "RF", avg: ".268", hr: 22, rbi: 72, imageId: 694207 },
  ],
  keyPitchers: [
    { name: "Sonny Gray", position: "SP", era: "3.35", wins: 12, strikeouts: 175, imageId: 543243 },
    { name: "Miles Mikolas", position: "SP", era: "4.05", wins: 9, strikeouts: 125, imageId: 571945 },
  ],
};

const bettingLines = {
  spread: "NYM -2.5",
  moneyline: { mets: "-175", opponent: "+145" },
  overUnder: "8.0",
};

const anthonyPick = {
  pick: "Mets -1.5 Run Line",
  confidence: 85,
  reasoning: "The Cardinals are in a rebuild with their young core. The Mets have the clear advantage with Soto, Lindor, and Vientos in the lineup. Hammer the Mets run line.",
  whereToBet: ["DraftKings", "FanDuel", "BetMGM", "Caesars"],
  recommendation: "Mets -1.5 at -110 is great value. The Cardinals bullpen is their weakness - target late-inning props.",
};

export default function MetsVsCardinals() {
  return (
    <MatchupPage
      opponent={opponentData}
      metsData={metsData2026}
      bettingLines={bettingLines}
      anthonyPick={anthonyPick}
      headToHead={{ metsWins: 78, opponentWins: 71 }}
      heroImage={springImage}
      matchupDate="2026 Season"
    />
  );
}

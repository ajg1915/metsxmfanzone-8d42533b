import MatchupPage from "./MatchupPage";
import { metsData2026 } from "./metsRoster2026";
import springImage from "@/assets/spring-mets-redsox.jpg";

const opponentData = {
  name: "Boston Red Sox",
  abbr: "BOS",
  primaryColor: "#BD3039",
  secondaryColor: "#0C2340",
  logo: "",
  teamId: 111,
  record: "82-80",
  springRecord: "11-9",
  keyPlayers: [
    { name: "Rafael Devers", position: "3B", avg: ".282", hr: 35, rbi: 105, imageId: 646240 },
    { name: "Jarren Duran", position: "CF", avg: ".285", hr: 22, rbi: 78, imageId: 680776 },
    { name: "Triston Casas", position: "1B", avg: ".270", hr: 28, rbi: 88, imageId: 671213 },
  ],
  keyPitchers: [
    { name: "Brayan Bello", position: "SP", era: "3.55", wins: 13, strikeouts: 170, imageId: 678394 },
    { name: "Tanner Houck", position: "SP", era: "3.35", wins: 11, strikeouts: 155, imageId: 656557 },
  ],
};

const bettingLines = {
  spread: "NYM -1.5",
  moneyline: { mets: "-140", opponent: "+120" },
  overUnder: "8.5",
};

const anthonyPick = {
  pick: "Mets ML + First 5 Innings Over 4.5",
  confidence: 75,
  reasoning: "Interleague matchups are always interesting. The Red Sox have solid young talent but the Mets' lineup depth with Soto and Lindor gives them the edge.",
  whereToBet: ["FanDuel", "DraftKings", "BetRivers", "Bet365"],
  recommendation: "Two-leg parlay: Mets ML + F5 Over 4.5 for +175 odds. Great value matchup.",
};

export default function MetsVsRedSox() {
  return (
    <MatchupPage
      opponent={opponentData}
      metsData={metsData2026}
      bettingLines={bettingLines}
      anthonyPick={anthonyPick}
      headToHead={{ metsWins: 42, opponentWins: 38 }}
      heroImage={springImage}
      matchupDate="2026 Season"
    />
  );
}

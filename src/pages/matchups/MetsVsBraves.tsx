import MatchupPage from "./MatchupPage";
import { metsData2026 } from "./metsRoster2026";
import springImage from "@/assets/spring-mets-braves.jpg";

const opponentData = {
  name: "Atlanta Braves",
  abbr: "ATL",
  primaryColor: "#CE1141",
  secondaryColor: "#13274F",
  logo: "",
  teamId: 144,
  record: "88-74",
  springRecord: "12-8",
  keyPlayers: [
    { name: "Ronald Acuña Jr.", position: "RF", avg: ".290", hr: 30, rbi: 88, imageId: 660670 },
    { name: "Matt Olson", position: "1B", avg: ".275", hr: 40, rbi: 115, imageId: 621566 },
    { name: "Austin Riley", position: "3B", avg: ".280", hr: 35, rbi: 95, imageId: 663586 },
  ],
  keyPitchers: [
    { name: "Spencer Strider", position: "SP", era: "3.05", wins: 15, strikeouts: 260, imageId: 675911 },
    { name: "Reynaldo López", position: "SP", era: "3.45", wins: 12, strikeouts: 175, imageId: 625643 },
  ],
};

const bettingLines = {
  spread: "ATL -1.5",
  moneyline: { mets: "+125", opponent: "-145" },
  overUnder: "9.0",
};

const anthonyPick = {
  pick: "Take the Under 9.0 Runs",
  confidence: 72,
  reasoning: "Division rivals know each other well. Both teams have elite starting pitching that will be stretched out more in this matchup. I'm going against the grain and taking the under.",
  whereToBet: ["DraftKings", "FanDuel", "BetRivers", "PointsBet"],
  recommendation: "The under at 9.0 is the play. Also consider First 5 Innings under 4.5 at plus money.",
};

export default function MetsVsBraves() {
  return (
    <MatchupPage
      opponent={opponentData}
      metsData={metsData2026}
      bettingLines={bettingLines}
      anthonyPick={anthonyPick}
      headToHead={{ metsWins: 85, opponentWins: 102 }}
      heroImage={springImage}
      matchupDate="2026 Season"
    />
  );
}

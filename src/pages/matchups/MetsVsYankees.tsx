import MatchupPage from "./MatchupPage";
import { metsData2026 } from "./metsRoster2026";
import springImage from "@/assets/spring-mets-yankees.jpg";

const opponentData = {
  name: "New York Yankees",
  abbr: "NYY",
  primaryColor: "#003087",
  secondaryColor: "#E4002C",
  logo: "",
  teamId: 147,
  record: "92-70",
  springRecord: "13-7",
  keyPlayers: [
    { name: "Aaron Judge", position: "RF", avg: ".275", hr: 50, rbi: 120, imageId: 592450 },
    { name: "Jazz Chisholm Jr.", position: "3B", avg: ".260", hr: 25, rbi: 75, imageId: 665862 },
    { name: "Anthony Volpe", position: "SS", avg: ".262", hr: 24, rbi: 72, imageId: 686580 },
  ],
  keyPitchers: [
    { name: "Gerrit Cole", position: "SP", era: "3.05", wins: 15, strikeouts: 225, imageId: 543037 },
    { name: "Max Fried", position: "SP", era: "3.18", wins: 14, strikeouts: 185, imageId: 608331 },
  ],
};

const bettingLines = {
  spread: "EVEN",
  moneyline: { mets: "+105", opponent: "-115" },
  overUnder: "9.0",
};

const anthonyPick = {
  pick: "Mets Moneyline +105 (SUBWAY SERIES SPECIAL)",
  confidence: 72,
  reasoning: "The Subway Series is always electric! With Juan Soto now wearing blue and orange against his old Yankee teammates, the Mets have extra motivation. Taking the underdog value here. LET'S GO METS!",
  whereToBet: ["DraftKings", "FanDuel", "BetMGM", "Caesars", "PointsBet"],
  recommendation: "Mets ML at +105 is fantastic value. Also look at Juan Soto to hit a HR against his former team at +320!",
};

export default function MetsVsYankees() {
  return (
    <MatchupPage
      opponent={opponentData}
      metsData={metsData2026}
      bettingLines={bettingLines}
      anthonyPick={anthonyPick}
      headToHead={{ metsWins: 48, opponentWins: 52 }}
      heroImage={springImage}
      matchupDate="2026 Season"
    />
  );
}

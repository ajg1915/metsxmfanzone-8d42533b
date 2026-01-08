import MatchupPage from "./MatchupPage";
import springImage from "@/assets/spring-mets-braves.jpg";

const metsData = {
  name: "New York Mets",
  abbr: "NYM",
  primaryColor: "#002D72",
  secondaryColor: "#FF5910",
  logo: "",
  teamId: 121,
  record: "89-73",
  springRecord: "12-8",
  keyPlayers: [
    { name: "Francisco Lindor", position: "SS", avg: ".273", hr: 33, rbi: 98, imageId: 596019 },
    { name: "Pete Alonso", position: "1B", avg: ".231", hr: 46, rbi: 118, imageId: 624413 },
    { name: "Brandon Nimmo", position: "CF", avg: ".274", hr: 23, rbi: 77, imageId: 607043 },
  ],
  keyPitchers: [
    { name: "Kodai Senga", position: "SP", era: "2.98", wins: 12, strikeouts: 202, imageId: 681739 },
    { name: "David Peterson", position: "SP", era: "3.65", wins: 9, strikeouts: 142, imageId: 656849 },
  ],
};

const opponentData = {
  name: "Atlanta Braves",
  abbr: "ATL",
  primaryColor: "#CE1141",
  secondaryColor: "#13274F",
  logo: "",
  teamId: 144,
  record: "101-61",
  springRecord: "14-6",
  keyPlayers: [
    { name: "Ronald Acuña Jr.", position: "RF", avg: ".337", hr: 41, rbi: 106, imageId: 660670 },
    { name: "Matt Olson", position: "1B", avg: ".283", hr: 54, rbi: 139, imageId: 621566 },
    { name: "Austin Riley", position: "3B", avg: ".285", hr: 37, rbi: 97, imageId: 663586 },
  ],
  keyPitchers: [
    { name: "Spencer Strider", position: "SP", era: "3.15", wins: 16, strikeouts: 281, imageId: 675911 },
    { name: "Max Fried", position: "SP", era: "3.21", wins: 14, strikeouts: 189, imageId: 608331 },
  ],
};

const bettingLines = {
  spread: "ATL -1.5",
  moneyline: { mets: "+135", opponent: "-155" },
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
      metsData={metsData}
      bettingLines={bettingLines}
      anthonyPick={anthonyPick}
      headToHead={{ metsWins: 85, opponentWins: 102 }}
      heroImage={springImage}
      matchupDate="March 2026"
    />
  );
}

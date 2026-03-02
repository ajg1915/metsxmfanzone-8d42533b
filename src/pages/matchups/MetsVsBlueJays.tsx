import MatchupPage from "./MatchupPage";
import { metsData2026 } from "./metsRoster2026";
import springImage from "@/assets/spring-training.jpg";

const opponentData = {
  name: "Toronto Blue Jays",
  abbr: "TOR",
  primaryColor: "#134A8E",
  secondaryColor: "#E8291C",
  logo: "",
  teamId: 141,
  record: "72-90",
  springRecord: "9-11",
  keyPlayers: [
    { name: "Vladimir Guerrero Jr.", position: "1B", avg: ".310", hr: 35, rbi: 108, imageId: 665489 },
    { name: "Bo Bichette", position: "SS", avg: ".275", hr: 22, rbi: 75, imageId: 666182 },
    { name: "Daulton Varsho", position: "CF", avg: ".258", hr: 25, rbi: 70, imageId: 662139 },
  ],
  keyPitchers: [
    { name: "Kevin Gausman", position: "SP", era: "3.45", wins: 13, strikeouts: 195, imageId: 592332 },
    { name: "José Berríos", position: "SP", era: "3.95", wins: 11, strikeouts: 170, imageId: 621244 },
  ],
};

const bettingLines = {
  spread: "NYM -1.5",
  moneyline: { mets: "-135", opponent: "+115" },
  overUnder: "8.5",
};

const anthonyPick = {
  pick: "Mets -1.5 Run Line",
  confidence: 80,
  reasoning: "The Blue Jays are in a transition phase. Vladdy Jr. is always dangerous, but the Mets have the edge with Soto, Lindor, and Vientos in the heart of the order.",
  whereToBet: ["DraftKings", "FanDuel", "BetMGM", "Caesars"],
  recommendation: "Mets -1.5 at -115 is the play. Also consider Juan Soto to record 2+ hits at +180.",
};

export default function MetsVsBlueJays() {
  return (
    <MatchupPage
      opponent={opponentData}
      metsData={metsData2026}
      bettingLines={bettingLines}
      anthonyPick={anthonyPick}
      headToHead={{ metsWins: 35, opponentWins: 32 }}
      heroImage={springImage}
      matchupDate="2026 Season"
    />
  );
}

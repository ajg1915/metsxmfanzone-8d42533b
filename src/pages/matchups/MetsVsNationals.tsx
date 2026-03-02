import MatchupPage from "./MatchupPage";
import { metsData2026 } from "./metsRoster2026";
import springImage from "@/assets/spring-mets-nats.jpg";

const opponentData = {
  name: "Washington Nationals",
  abbr: "WSH",
  primaryColor: "#AB0003",
  secondaryColor: "#14225A",
  logo: "",
  teamId: 120,
  record: "67-95",
  springRecord: "7-13",
  keyPlayers: [
    { name: "CJ Abrams", position: "SS", avg: ".275", hr: 22, rbi: 70, imageId: 682928 },
    { name: "James Wood", position: "CF", avg: ".268", hr: 20, rbi: 68, imageId: 694612 },
    { name: "Dylan Crews", position: "RF", avg: ".260", hr: 18, rbi: 62, imageId: 700379 },
  ],
  keyPitchers: [
    { name: "MacKenzie Gore", position: "SP", era: "3.45", wins: 11, strikeouts: 175, imageId: 669022 },
    { name: "DJ Herz", position: "SP", era: "3.80", wins: 9, strikeouts: 155, imageId: 694614 },
  ],
};

const bettingLines = {
  spread: "NYM -3.5",
  moneyline: { mets: "-210", opponent: "+175" },
  overUnder: "9.5",
};

const anthonyPick = {
  pick: "Mets Team Total Over 5.5",
  confidence: 88,
  reasoning: "The Nationals' young pitching staff is still developing. The Mets' Soto-Lindor-Vientos trio should feast in this matchup.",
  whereToBet: ["DraftKings", "BetMGM", "Caesars", "WynnBET"],
  recommendation: "Mets Team Total Over 5.5 is the safest play. Consider Mark Vientos home run prop at +280.",
};

export default function MetsVsNationals() {
  return (
    <MatchupPage
      opponent={opponentData}
      metsData={metsData2026}
      bettingLines={bettingLines}
      anthonyPick={anthonyPick}
      headToHead={{ metsWins: 95, opponentWins: 82 }}
      heroImage={springImage}
      matchupDate="2026 Season"
    />
  );
}

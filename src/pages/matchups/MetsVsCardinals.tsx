import MatchupPage from "./MatchupPage";
import springImage from "@/assets/spring-mets-cards.jpg";

const metsData = {
  name: "New York Mets",
  abbr: "NYM",
  primaryColor: "#ff4500",
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
  name: "St. Louis Cardinals",
  abbr: "STL",
  primaryColor: "#C41E3A",
  secondaryColor: "#0C2340",
  logo: "",
  teamId: 138,
  record: "71-91",
  springRecord: "8-12",
  keyPlayers: [
    { name: "Nolan Arenado", position: "3B", avg: ".266", hr: 26, rbi: 93, imageId: 571448 },
    { name: "Paul Goldschmidt", position: "1B", avg: ".254", hr: 25, rbi: 80, imageId: 502671 },
    { name: "Willson Contreras", position: "C", avg: ".264", hr: 20, rbi: 67, imageId: 575929 },
  ],
  keyPitchers: [
    { name: "Sonny Gray", position: "SP", era: "3.24", wins: 13, strikeouts: 178, imageId: 543243 },
    { name: "Miles Mikolas", position: "SP", era: "4.12", wins: 9, strikeouts: 124, imageId: 571945 },
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
  reasoning: "The Cardinals are in a rebuilding phase. The Mets have the clear advantage in both starting pitching and offense. This is a spot to hammer the Mets run line.",
  whereToBet: ["DraftKings", "FanDuel", "BetMGM", "Caesars"],
  recommendation: "Mets -1.5 at -110 is great value. The Cardinals bullpen is their weakness - target late-inning props.",
};

export default function MetsVsCardinals() {
  return (
    <MatchupPage
      opponent={opponentData}
      metsData={metsData}
      bettingLines={bettingLines}
      anthonyPick={anthonyPick}
      headToHead={{ metsWins: 78, opponentWins: 71 }}
      heroImage={springImage}
      matchupDate="March 2026"
    />
  );
}

import MatchupPage from "./MatchupPage";
import springImage from "@/assets/spring-training.jpg";

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
  name: "Toronto Blue Jays",
  abbr: "TOR",
  primaryColor: "#134A8E",
  secondaryColor: "#E8291C",
  logo: "",
  teamId: 141,
  record: "74-88",
  springRecord: "9-11",
  keyPlayers: [
    { name: "Vladimir Guerrero Jr.", position: "1B", avg: ".323", hr: 30, rbi: 103, imageId: 665489 },
    { name: "Bo Bichette", position: "SS", avg: ".278", hr: 20, rbi: 73, imageId: 666182 },
    { name: "Daulton Varsho", position: "CF", avg: ".252", hr: 24, rbi: 65, imageId: 662139 },
  ],
  keyPitchers: [
    { name: "Kevin Gausman", position: "SP", era: "3.52", wins: 13, strikeouts: 195, imageId: 592332 },
    { name: "José Berríos", position: "SP", era: "4.15", wins: 11, strikeouts: 168, imageId: 621244 },
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
  reasoning: "The Blue Jays are in a transition phase and their pitching depth is questionable. Vladdy Jr. is always dangerous, but the Mets have the edge in starting pitching. Take the run line with confidence.",
  whereToBet: ["DraftKings", "FanDuel", "BetMGM", "Caesars"],
  recommendation: "Mets -1.5 at -115 is the play. Also consider Francisco Lindor to record 2+ hits at +180.",
};

export default function MetsVsBlueJays() {
  return (
    <MatchupPage
      opponent={opponentData}
      metsData={metsData}
      bettingLines={bettingLines}
      anthonyPick={anthonyPick}
      headToHead={{ metsWins: 35, opponentWins: 32 }}
      heroImage={springImage}
      matchupDate="March 2026"
    />
  );
}

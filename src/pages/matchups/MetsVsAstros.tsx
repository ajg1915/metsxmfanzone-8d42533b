import MatchupPage from "./MatchupPage";
import springImage from "@/assets/spring-mets-astros.jpg";

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
  name: "Houston Astros",
  abbr: "HOU",
  primaryColor: "#EB6E1F",
  secondaryColor: "#002D62",
  logo: "",
  teamId: 117,
  record: "90-72",
  springRecord: "10-10",
  keyPlayers: [
    { name: "Jose Altuve", position: "2B", avg: ".311", hr: 18, rbi: 67, imageId: 514888 },
    { name: "Kyle Tucker", position: "RF", avg: ".284", hr: 29, rbi: 107, imageId: 663656 },
    { name: "Yordan Alvarez", position: "DH", avg: ".293", hr: 31, rbi: 97, imageId: 670541 },
  ],
  keyPitchers: [
    { name: "Framber Valdez", position: "SP", era: "3.45", wins: 15, strikeouts: 194, imageId: 664285 },
    { name: "Hunter Brown", position: "SP", era: "3.89", wins: 11, strikeouts: 156, imageId: 686613 },
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
  reasoning: "The Astros have a solid lineup but their pitching depth is still recovering. The Mets offense has been hot this spring, and I expect a high-scoring affair. Take the Mets ML and the over.",
  whereToBet: ["DraftKings", "FanDuel", "BetMGM", "Caesars"],
  recommendation: "Parlay the Mets ML with Over 8.5 for +220 odds. Spring games tend to be high scoring with pitchers working on mechanics.",
};

export default function MetsVsAstros() {
  return (
    <MatchupPage
      opponent={opponentData}
      metsData={metsData}
      bettingLines={bettingLines}
      anthonyPick={anthonyPick}
      headToHead={{ metsWins: 12, opponentWins: 15 }}
      heroImage={springImage}
      matchupDate="March 2026"
    />
  );
}

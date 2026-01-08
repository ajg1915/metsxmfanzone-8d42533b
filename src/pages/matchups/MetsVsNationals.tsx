import MatchupPage from "./MatchupPage";
import springImage from "@/assets/spring-mets-nats.jpg";

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
  name: "Washington Nationals",
  abbr: "WSH",
  primaryColor: "#AB0003",
  secondaryColor: "#14225A",
  logo: "",
  teamId: 120,
  record: "65-97",
  springRecord: "7-13",
  keyPlayers: [
    { name: "CJ Abrams", position: "SS", avg: ".268", hr: 18, rbi: 62, imageId: 682928 },
    { name: "Joey Gallo", position: "1B", avg: ".228", hr: 22, rbi: 55, imageId: 608336 },
    { name: "Lane Thomas", position: "CF", avg: ".258", hr: 28, rbi: 86, imageId: 657041 },
  ],
  keyPitchers: [
    { name: "MacKenzie Gore", position: "SP", era: "3.56", wins: 10, strikeouts: 168, imageId: 669022 },
    { name: "Josiah Gray", position: "SP", era: "4.21", wins: 8, strikeouts: 145, imageId: 680686 },
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
  reasoning: "The Nationals have one of the weakest pitching staffs in baseball. The Mets should feast in this matchup. Take the Mets team total over instead of the game total.",
  whereToBet: ["DraftKings", "BetMGM", "Caesars", "WynnBET"],
  recommendation: "Mets Team Total Over 5.5 is the safest play. Consider Pete Alonso home run prop at +280.",
};

export default function MetsVsNationals() {
  return (
    <MatchupPage
      opponent={opponentData}
      metsData={metsData}
      bettingLines={bettingLines}
      anthonyPick={anthonyPick}
      headToHead={{ metsWins: 95, opponentWins: 82 }}
      heroImage={springImage}
      matchupDate="March 2026"
    />
  );
}

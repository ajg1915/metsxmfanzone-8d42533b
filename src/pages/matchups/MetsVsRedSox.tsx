import MatchupPage from "./MatchupPage";
import springImage from "@/assets/spring-mets-redsox.jpg";

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
  name: "Boston Red Sox",
  abbr: "BOS",
  primaryColor: "#BD3039",
  secondaryColor: "#0C2340",
  logo: "",
  teamId: 111,
  record: "78-84",
  springRecord: "11-9",
  keyPlayers: [
    { name: "Rafael Devers", position: "3B", avg: ".279", hr: 33, rbi: 100, imageId: 646240 },
    { name: "Masataka Yoshida", position: "LF", avg: ".289", hr: 15, rbi: 72, imageId: 807799 },
    { name: "Trevor Story", position: "SS", avg: ".245", hr: 21, rbi: 67, imageId: 596115 },
  ],
  keyPitchers: [
    { name: "Brayan Bello", position: "SP", era: "3.68", wins: 12, strikeouts: 158, imageId: 678394 },
    { name: "Tanner Houck", position: "SP", era: "3.45", wins: 10, strikeouts: 142, imageId: 656557 },
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
  reasoning: "Interleague spring training games are always interesting. The Red Sox have young arms still developing, and the Mets bats should be ready. Parlay the ML with F5 over.",
  whereToBet: ["FanDuel", "DraftKings", "BetRivers", "Bet365"],
  recommendation: "Two-leg parlay: Mets ML + F5 Over 4.5 for +175 odds. Great value for a spring training matchup.",
};

export default function MetsVsRedSox() {
  return (
    <MatchupPage
      opponent={opponentData}
      metsData={metsData}
      bettingLines={bettingLines}
      anthonyPick={anthonyPick}
      headToHead={{ metsWins: 42, opponentWins: 38 }}
      heroImage={springImage}
      matchupDate="March 2026"
    />
  );
}

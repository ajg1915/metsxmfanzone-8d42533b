import MatchupPage from "./MatchupPage";
import springImage from "@/assets/spring-mets-yankees.jpg";

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
  name: "New York Yankees",
  abbr: "NYY",
  primaryColor: "#003087",
  secondaryColor: "#E4002C",
  logo: "",
  teamId: 147,
  record: "95-67",
  springRecord: "13-7",
  keyPlayers: [
    { name: "Aaron Judge", position: "RF", avg: ".267", hr: 52, rbi: 114, imageId: 592450 },
    { name: "Juan Soto", position: "LF", avg: ".288", hr: 35, rbi: 109, imageId: 665742 },
    { name: "Anthony Volpe", position: "SS", avg: ".255", hr: 22, rbi: 68, imageId: 686580 },
  ],
  keyPitchers: [
    { name: "Gerrit Cole", position: "SP", era: "3.12", wins: 16, strikeouts: 218, imageId: 543037 },
    { name: "Carlos Rodón", position: "SP", era: "3.96", wins: 12, strikeouts: 175, imageId: 607074 },
  ],
};

const bettingLines = {
  spread: "EVEN",
  moneyline: { mets: "+105", opponent: "-115" },
  overUnder: "9.0",
};

const anthonyPick = {
  pick: "Mets Moneyline +105 (SUBWAY SERIES SPECIAL)",
  confidence: 70,
  reasoning: "The Subway Series is always electric, even in spring training! The Mets have something to prove against their crosstown rivals. I'm taking the underdog value here. LET'S GO METS!",
  whereToBet: ["DraftKings", "FanDuel", "BetMGM", "Caesars", "PointsBet"],
  recommendation: "Mets ML at +105 is fantastic value. Also look at Francisco Lindor to hit a HR at +350 - he loves the big stage!",
};

export default function MetsVsYankees() {
  return (
    <MatchupPage
      opponent={opponentData}
      metsData={metsData}
      bettingLines={bettingLines}
      anthonyPick={anthonyPick}
      headToHead={{ metsWins: 48, opponentWins: 52 }}
      heroImage={springImage}
      matchupDate="March 2026"
    />
  );
}

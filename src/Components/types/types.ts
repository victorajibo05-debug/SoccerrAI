export interface Prediction {
  home_win: number;
  draw: number;
  away_win: number;
  confidence: "high" | "medium" | "low";
  value_bet: string | null;
}

export interface Area {
  id: number;
  name: string;
  flag: string | null;
}

export interface Competition {
  id: number;
  name: string;
  emblem: string | null;
}

export interface MatchTeam {
  id: number;
  name: string;
  crest: string | null;
}

export interface ScoreDetail {
  home: number | null;
  away: number | null;
}

export interface Score {
  winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
  duration: string;
  fullTime: ScoreDetail;
  halfTime: ScoreDetail;
}

export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "POSTPONED"
  | "SUSPENDED"
  | "CANCELLED";

export interface MatchResponse {
  id: number;
  utcDate: string;
  status: MatchStatus;
  minute: number | null;
  area: Area;
  competition: Competition;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  score: Score;
}

export interface ApiResponse {
  count: number;
  filters: any;
  matches: MatchResponse[];
}
 
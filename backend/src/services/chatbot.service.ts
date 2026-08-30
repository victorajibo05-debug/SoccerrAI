import { getAllmatches, getMatchesbydate } from './match.service';

export interface Fixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  kickoff: string;
}

// Wraps getAllmatches / getMatchesbydate into the flat shape the chatbot tool expects
export async function get_fixtures(date?: string): Promise<Fixture[]> {
  const data = date ? await getMatchesbydate(date) : await getAllmatches();

  if (!data?.matches) return [];

  return data.matches.map((m: any) => ({
    id: m.id,
    homeTeam: m.homeTeam.name,
    awayTeam: m.awayTeam.name,
    competition: m.competition.name,
    kickoff: m.utcDate,
  }));
}
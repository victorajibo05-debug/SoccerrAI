import { useState, useEffect, useRef } from 'react';
import { getAllTeams } from '../football';

interface Team {
    id: number;
    name: string;
    shortName: string;
    crest: string | null;
    competition: string;
    type: 'team';
}

interface Competition {
    id: number;        // football-data.org numeric ID
    code: string;      // Your short code (PL, PD, etc.)
    name: string;
    emblem: string | null;
    type: 'competition';
}

type SearchResult = Team | Competition;

interface SearchBarProps {
    onSelectTeam: (team: Team) => void;
    onSelectCompetition: (competition: Competition) => void;
}

const COMPETITIONS: Competition[] = [
    { id: 2021, code: 'PL',  name: 'Premier League',        emblem: null, type: 'competition' },
    { id: 2014, code: 'PD',  name: 'La Liga',               emblem: null, type: 'competition' },
    { id: 2002, code: 'BL1', name: 'Bundesliga',            emblem: null, type: 'competition' },
    { id: 2019, code: 'SA',  name: 'Serie A',               emblem: null, type: 'competition' },
    { id: 2015, code: 'FL1', name: 'Ligue 1',               emblem: null, type: 'competition' },
    { id: 2001, code: 'CL',  name: 'UEFA Champions League', emblem: null, type: 'competition' },
    { id: 2072, code: 'ELC', name: 'Championship',          emblem: null, type: 'competition' },
    { id: 2003, code: 'DED', name: 'Eredivisie',            emblem: null, type: 'competition' },
    { id: 2017, code: 'PPL', name: 'Primeira Liga',         emblem: null, type: 'competition' },
    { id: 2013, code: 'BSA', name: 'Brazilian Serie A',     emblem: null, type: 'competition' },
    { id: 2000, code: 'WC',  name: 'FIFA World Cup',        emblem: null, type: 'competition' },
    { id: 2018, code: 'EC',  name: 'European Championship', emblem: null, type: 'competition' },
];

export function SearchBar({ onSelectTeam, onSelectCompetition }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [teams, setTeams] = useState<Team[]>([]);
    const [filtered, setFiltered] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLoading(true);
        getAllTeams()
            .then((res) => {
                const teamsWithType = (res.data as any[]).map((t) => ({ ...t, type: 'team' as const }));
                setTeams(teamsWithType);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (query.trim().length < 2) {
            setFiltered([]);
            setIsOpen(false);
            return;
        }

        const lower = query.toLowerCase();

        const matchedCompetitions: Competition[] = COMPETITIONS.filter((c) =>
            c.name.toLowerCase().includes(lower)
        );

        const matchedTeams: Team[] = teams.filter(
            (t) =>
                t.name.toLowerCase().includes(lower) ||
                t.shortName?.toLowerCase().includes(lower)
        );

        const results: SearchResult[] = [
            ...matchedCompetitions,
            ...matchedTeams,
        ].slice(0, 10);

        setFiltered(results);
        setIsOpen(results.length > 0);
    }, [query, teams]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const containerStyle: React.CSSProperties = {
        position: 'relative',
        width: '100%',
        maxWidth: '400px',
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 16px',
        backgroundColor: '#111111',
        border: '1px solid #333333',
        borderRadius: '10px',
        color: '#ffffff',
        fontFamily: 'Bebas Neue',
        fontSize: '15px',
        outline: 'none',
        boxSizing: 'border-box',
    };

    const dropdownStyle: React.CSSProperties = {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#111111',
        border: '1px solid #1a1a1a',
        borderRadius: '10px',
        marginTop: '4px',
        zIndex: 100,
        overflow: 'hidden',
    };

    const resultRowStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        cursor: 'pointer',
        borderBottom: '1px solid #1a1a1a',
        fontFamily: 'Bebas Neue',
    };

    const badgeStyle = (type: 'team' | 'competition'): React.CSSProperties => ({
        fontSize: '10px',
        padding: '2px 6px',
        borderRadius: '4px',
        backgroundColor: type === 'competition' ? '#1e3a5f' : '#1a1a1a',
        color: type === 'competition' ? '#60a5fa' : '#888888',
        flexShrink: 0,
        marginLeft: 'auto',
    });

    return (
        <div ref={ref} style={containerStyle}>
            <input
                type="text"
                placeholder={loading ? 'Loading...' : 'Search teams or competitions...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => filtered.length > 0 && setIsOpen(true)}
                style={inputStyle}
                disabled={loading}
            />

            {isOpen && (
                <div style={dropdownStyle}>
                    {filtered.map((result) => (
                        <div
                            key={result.type === 'team' ? `team-${result.id}` : `comp-${result.id}`}
                            style={resultRowStyle}
                            onClick={() => {
                                if (result.type === 'team') {
                                    onSelectTeam(result as Team);
                                } else {
                                    onSelectCompetition(result as Competition);
                                }
                                setQuery('');
                                setIsOpen(false);
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLDivElement).style.backgroundColor = '#1a1a1a';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                            }}
                        >
                            {result.type === 'team' && (result as Team).crest && (
                                <img
                                    src={(result as Team).crest!}
                                    alt={result.name}
                                    style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                                />
                            )}

                            {result.type === 'competition' && (
                                <span style={{ fontSize: '18px' }}>🏆</span>
                            )}

                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#ffffff', fontSize: '14px' }}>{result.name}</div>
                                {result.type === 'team' && (
                                    <div style={{ color: '#666666', fontSize: '11px' }}>
                                        {(result as Team).competition}
                                    </div>
                                )}
                            </div>

                            <span style={badgeStyle(result.type)}>
                                {result.type === 'competition' ? 'League' : 'Club'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
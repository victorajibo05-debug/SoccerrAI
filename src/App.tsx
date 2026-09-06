import { useState, useEffect, useRef } from 'react';
import { Layout } from './Components/Layout';
import { Header } from './Components/Header';
import { Tabs } from './Components/Tabs';
import { MatchList } from './Components/MatchList';
import { LoadingSpinner } from './Components/Loading';
import { getMatchesByDate } from './football';
import type { MatchResponse } from './Components/types/types';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import { Auth } from './Components/auth';
import { DateSlider } from './Components/dateslider';
import type { Session } from '@supabase/supabase-js';
import { SearchBar } from './Components/searchbar';
import { SearchResults } from './Components/searchresults';
import ChatBot from "./Components/Chatbot";

interface Team {
    id: number;
    name: string;
    crest: string | null;
    competition: string;
}

interface Competition {
    id: number;        
    code: string;      
    name: string;
    emblem: string | null;
    type: 'competition';
}


type SearchResult =
    | { type: 'team'; team: Team }
    | { type: 'competition'; competition: Competition };

export default function App() {
    const [Allmatches, setAllmatches] = useState<MatchResponse[]>([]);
    const [livematches, setLivematches] = useState<MatchResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'live' | 'all' | 'FIFA World Cup' | 'Premier League' | 'La Liga' | 'Serie A' | 'Bundesliga' | 'Ligue 1' | 'Eredivisie' | 'Campeonato Brasileiro Série A' | 'UEFA Champions League' | 'UEFA Europa League'>('all');
    const [session, setSession] = useState<Session | null>(null);
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const selectedDateRef = useRef(selectedDate);

    useEffect(() => {
        selectedDateRef.current = selectedDate;
    }, [selectedDate]);

    useEffect(() => {
        
        const apiBaseUrl = import.meta.env.DEV
            ? 'http://localhost:3000'
            : import.meta.env.VITE_API_BASE_URL;
        const wsBaseUrl = apiBaseUrl.replace(/^http/, 'ws').replace(/\/$/, '');
        const ws = new WebSocket(`${wsBaseUrl}/ws`);


        ws.addEventListener('open', () => {
            console.log('WebSocket connected');
        });

        ws.addEventListener('message', (event) => {
            try {
                const payload = JSON.parse(event.data);
                console.log('WebSocket payload:', payload);

                if (payload?.type === 'refresh') {
                    handleDateChange(selectedDateRef.current, { showLoader: false });
                }
            } catch {
                console.log('WebSocket message:', event.data);
            }
        });

        ws.addEventListener('close', () => {
            console.log('WebSocket disconnected');
        });

        return () => {
            ws.close();
        };
    }, []);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleDateChange = (date: string, options?: { showLoader?: boolean }) => {
        const showLoader = options?.showLoader ?? true;

        setSelectedDate(date);

        if (showLoader) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        setError(null);

        getMatchesByDate(date)
            .then((res) => {
                setAllmatches(res.data.matches);
                setLivematches(res.data.matches.filter((match: any) => match.status === 'IN_PLAY' || match.status === 'LIVE' || match.status === 'PAUSED'));

                if (showLoader) {
                    setLoading(false);
                } else {
                    setRefreshing(false);
                }
            })
            .catch(() => {
                setError("Failed to fetch matches for that date");

                if (showLoader) {
                    setLoading(false);
                } else {
                    setRefreshing(false);
                }
            });
    };

    useEffect(() => {
        handleDateChange(selectedDate);
    }, []);

    const displayedMatches =
        activeTab === 'live'
            ? livematches
            : activeTab === 'all'
                ? Allmatches
                : Allmatches.filter((matches) => matches.competition.name === activeTab);

    const handleSelectTeam = (team: Team) => {
        setSearchResult({ type: 'team', team });
    };

    const handleSelectCompetition = (competition: Competition) => {
        setSearchResult({ type: 'competition', competition });
    };

    const handleBack = () => {
        setSearchResult(null);
    };

    const controlBarStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '3px',
        flexWrap: 'wrap',
        gap: '12px'
    };

    const refreshButtonStyle: React.CSSProperties = {
        padding: '8px',
        color: '#22c55e',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.5 : 1,
        transition: 'opacity 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    const errorContainerStyle: React.CSSProperties = {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        textAlign: 'center'
    };

    const footerStyle: React.CSSProperties = {
        marginTop: '60px',
        paddingTop: '32px',
        borderTop: '1px solid #1a1a1a',
        textAlign: 'center'
    };

    const userBarStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '4px',
        fontFamily: 'Bebas Neue',
        fontSize: '13px',
        color: '#888888',
    };

    const logoutButtonStyle: React.CSSProperties = {
        padding: '6px 12px',
        backgroundColor: 'transparent',
        border: '1px solid #333333',
        borderRadius: '6px',
        color: '#888888',
        fontSize: '12px',
        fontFamily: 'Bebas Neue',
        cursor: 'pointer',
    };

    if (!session) {
        return (
            <Layout>
                <Header />
                <Auth />
            </Layout>
        );
    }

    return (
         <>
        <Layout>
            <Header />
            
            <div style={userBarStyle}>
                <span>{session.user.email}</span>
                <button
                    style={logoutButtonStyle}
                    onClick={() => supabase.auth.signOut()}
                >
                    Log Out
                </button>
            </div>

            <SearchBar
                onSelectTeam={handleSelectTeam}
                onSelectCompetition={handleSelectCompetition}
            />

            

            <div style={controlBarStyle}>
                <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
                <DateSlider selectedDate={selectedDate} onDateChange={handleDateChange} daysCount={150} />

                <button
                    onClick={() => handleDateChange(selectedDate, { showLoader: false })}
                    disabled={loading || refreshing}
                    style={refreshButtonStyle}
                    title="Refresh scores"
                >
                    <style>{`
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                        .animate-spin-icon { animation: spin 1s linear infinite; }
                    `}</style>
                    <RefreshCw
                        className={loading || refreshing ? 'animate-spin-icon' : ''}
                        style={{ width: '20px', height: '20px' }}
                    />
                </button>
            </div>

            {error ? (
                <div style={errorContainerStyle}>
                    <AlertCircle style={{ width: '32px', height: '32px', color: '#ef4444' }} />
                    <div>
                        <h3 style={{ fontWeight: 'bold', color: '#ef4444', margin: '0 0 4px 0' }}>
                            Connection Error
                        </h3>
                        <p style={{ fontSize: '14px', color: '#888888', maxWidth: '300px', margin: '0 auto' }}>
                            {error}
                        </p>
                    </div>
                    <button
                        onClick={() => handleDateChange(selectedDate, { showLoader: false })}
                        style={{ marginTop: '8px', padding: '8px 16px', backgroundColor: '#22c55e', color: '#000', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Try Again
                    </button>
                </div>
            ) : loading ? (
                <LoadingSpinner />
            ) : searchResult ? (
                <SearchResults
                    result={searchResult}
                    onBack={handleBack}
                />
            ) : (
                <MatchList matches={displayedMatches} />
            )}
            
            <footer style={footerStyle}>
                <p style={{ color: '#555', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold', margin: 0 }}>
                    All rights reserved. SoccerrAI © 2026
                </p>
            </footer>
        </Layout>
        <ChatBot />
        </>
    );
}
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Star, Send, Sparkles, MessageSquare, UtensilsCrossed, Music, CheckCircle2, Heart } from 'lucide-react';

interface SessionInfo {
    id: string;
    customer_name: string;
    table_number: string;
    total_spent: number;
}

export default function FeedbackPage() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [session, setSession] = useState<SessionInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Ratings
    const [ratingService, setRatingService] = useState(0);
    const [ratingProducts, setRatingProducts] = useState(0);
    const [ratingAmbiance, setRatingAmbiance] = useState(0);
    const [suggestions, setSuggestions] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sid = params.get('session');
        setSessionId(sid);

        if (sid) {
            fetchSession(sid);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchSession = async (sid: string) => {
        const { data, error } = await supabase
            .from('table_sessions')
            .select('id, customer_name, table_number, total_spent')
            .eq('id', sid)
            .single();

        if (!error && data) {
            setSession(data);

            // Check if already responded
            const { data: existingFeedback } = await supabase
                .from('feedback_responses')
                .select('id')
                .eq('session_id', sid)
                .single();

            if (existingFeedback) {
                setSubmitted(true);
            }
        }

        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!sessionId || ratingService === 0 || ratingProducts === 0 || ratingAmbiance === 0) {
            alert('Por favor, avalie todas as categorias (mínimo 1 estrela cada)');
            return;
        }

        setSubmitting(true);

        try {
            const { error } = await supabase
                .from('feedback_responses')
                .insert({
                    session_id: sessionId,
                    rating_service: ratingService,
                    rating_products: ratingProducts,
                    rating_ambiance: ratingAmbiance,
                    suggestions: suggestions.trim() || null
                });

            if (error) throw error;

            setSubmitted(true);
        } catch (error: any) {
            console.error('Erro ao enviar feedback:', error);
            alert('Erro ao enviar avaliação. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    // Star Rating Component
    const StarRating = ({
        value,
        onChange,
        label,
        icon
    }: {
        value: number;
        onChange: (v: number) => void;
        label: string;
        icon: React.ReactNode;
    }) => (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted">
                {icon}
                <span className="text-xs font-black uppercase tracking-widest">{label}</span>
            </div>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className={`w-12 h-12 rounded-xl transition-all duration-200 flex items-center justify-center ${star <= value
                                ? 'bg-amber-500 shadow-lg shadow-amber-500/30 scale-105'
                                : 'bg-white/5 hover:bg-white/10'
                            }`}
                    >
                        <Star
                            className={`w-6 h-6 transition-all ${star <= value ? 'text-white fill-white' : 'text-gray-600'
                                }`}
                        />
                    </button>
                ))}
            </div>
        </div>
    );

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="animate-pulse text-muted">Carregando...</div>
            </div>
        );
    }

    // Invalid session
    if (!session || !sessionId) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
                        <MessageSquare className="w-10 h-10 text-red-400" />
                    </div>
                    <h1 className="text-2xl font-black text-white mb-2">Link Inválido</h1>
                    <p className="text-muted">Este link de avaliação não é válido ou já expirou.</p>
                </div>
            </div>
        );
    }

    // Already submitted
    if (submitted) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-green-500/10 rounded-full blur-[150px]" />

                <div className="relative text-center animate-in zoom-in duration-500">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-green-500/30">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Obrigado! 💚</h1>
                    <p className="text-muted text-lg mb-4">
                        Sua avaliação foi registrada com sucesso.
                    </p>
                    <p className="text-sm text-muted/60">
                        {session.customer_name}, agradecemos sua visita!
                    </p>

                    <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10 inline-block">
                        <div className="flex items-center gap-2 text-amber-400">
                            <Heart className="w-5 h-5 fill-current" />
                            <span className="font-bold text-sm">Volte sempre!</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Feedback form
    return (
        <div className="min-h-screen bg-[#020617] text-white p-4 flex items-center justify-center">
            {/* Background effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-500/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[150px]" />

            <div className="relative w-full max-w-lg animate-in slide-in-from-bottom duration-500">
                <div className="glass-card p-8 border border-white/10 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight mb-1">
                            Avalie sua Experiência
                        </h1>
                        <p className="text-muted text-sm">
                            Olá, <span className="text-amber-400 font-bold">{session.customer_name}</span>! Como foi?
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <StarRating
                            value={ratingService}
                            onChange={setRatingService}
                            label="Atendimento"
                            icon={<MessageSquare className="w-4 h-4" />}
                        />

                        <StarRating
                            value={ratingProducts}
                            onChange={setRatingProducts}
                            label="Produtos / Qualidade"
                            icon={<UtensilsCrossed className="w-4 h-4" />}
                        />

                        <StarRating
                            value={ratingAmbiance}
                            onChange={setRatingAmbiance}
                            label="Ambiente"
                            icon={<Music className="w-4 h-4" />}
                        />

                        {/* Suggestions */}
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-muted flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Sugestões de Melhoria (opcional)
                            </label>
                            <textarea
                                value={suggestions}
                                onChange={(e) => setSuggestions(e.target.value)}
                                placeholder="Conte-nos como podemos melhorar..."
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all resize-none placeholder:text-gray-600"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting || ratingService === 0 || ratingProducts === 0 || ratingAmbiance === 0}
                            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-amber-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <span className="animate-pulse">Enviando...</span>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Enviar Avaliação
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-[10px] text-muted mt-6">
                        Suas respostas nos ajudam a melhorar continuamente.
                    </p>
                </div>
            </div>
        </div>
    );
}

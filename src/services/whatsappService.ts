// WhatsApp Service for Evolution API integration
// Sends feedback survey link when table is closed

const getEvolutionConfig = () => {
    const saved = localStorage.getItem('smartbar_settings');
    if (saved) {
        const settings = JSON.parse(saved);
        return {
            apiUrl: settings.evolutionApiUrl || '',
            instance: settings.evolutionInstance || '',
            apiKey: settings.evolutionApiKey || '',
            adminEmail: settings.adminReportEmail || settings.profileEmail || ''
        };
    }
    return { apiUrl: '', instance: '', apiKey: '', adminEmail: '' };
};

export interface FeedbackMessage {
    phone: string;
    customerName: string;
    sessionId: string;
    tableNumber: string;
    totalSpent: number;
}

/**
 * Send feedback survey link via WhatsApp
 */
export async function sendFeedbackMessage(data: FeedbackMessage): Promise<boolean> {
    const config = getEvolutionConfig();

    if (!config.apiUrl || !config.instance || !config.apiKey) {
        console.warn('Evolution API not configured');
        return false;
    }

    // Format phone number (Brazil)
    let phone = data.phone.replace(/\D/g, '');
    if (phone.length === 11) {
        phone = '55' + phone;
    } else if (phone.length === 10) {
        phone = '55' + phone;
    }

    // Build feedback URL
    const baseUrl = window.location.origin;
    const feedbackUrl = `${baseUrl}/feedback?session=${data.sessionId}`;

    // Message template
    const message = `
🍹 *SmartBar* - Agradecemos sua visita!

Olá, *${data.customerName}*!

Foi um prazer te atender na *Mesa ${data.tableNumber}*.
Total da comanda: *R$ ${data.totalSpent.toFixed(2)}*

Gostaríamos muito da sua opinião! 
🎯 Avalie nosso atendimento, produtos e ambiente:

👉 ${feedbackUrl}

Leva menos de 1 minuto e nos ajuda muito a melhorar!

Obrigado e volte sempre! 💚
`.trim();

    try {
        const response = await fetch(`${config.apiUrl}/message/sendText/${config.instance}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': config.apiKey
            },
            body: JSON.stringify({
                number: phone,
                options: {
                    delay: 1200,
                    presence: 'composing'
                },
                textMessage: {
                    text: message
                }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('WhatsApp send error:', error);
            return false;
        }

        console.log('Feedback message sent successfully');
        return true;
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error);
        return false;
    }
}

/**
 * Close table session and trigger feedback message
 */
export async function closeTableSession(
    sessionId: string,
    supabase: any
): Promise<{ success: boolean; message: string }> {
    try {
        // 1. Get session data
        const { data: session, error: fetchError } = await supabase
            .from('table_sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

        if (fetchError || !session) {
            return { success: false, message: 'Sessão não encontrada' };
        }

        if (session.status === 'closed') {
            return { success: false, message: 'Mesa já foi fechada' };
        }

        // 2. Calculate total spent from transactions
        const { data: transactions } = await supabase
            .from('transactions')
            .select('total_amount')
            .eq('table_number', session.table_number)
            .gte('created_at', session.opened_at);

        const totalSpent = transactions?.reduce((sum: number, t: any) => sum + (t.total_amount || 0), 0) || 0;

        // 3. Update session
        const { error: updateError } = await supabase
            .from('table_sessions')
            .update({
                status: 'closed',
                closed_at: new Date().toISOString(),
                total_spent: totalSpent,
                feedback_sent: true
            })
            .eq('id', sessionId);

        if (updateError) {
            return { success: false, message: 'Erro ao fechar sessão' };
        }

        // 4. Send WhatsApp feedback message
        const sent = await sendFeedbackMessage({
            phone: session.customer_phone,
            customerName: session.customer_name,
            sessionId: session.id,
            tableNumber: session.table_number,
            totalSpent
        });

        if (!sent) {
            console.warn('Feedback message could not be sent (API not configured or error)');
        }

        return {
            success: true,
            message: sent
                ? 'Mesa fechada. Pesquisa enviada via WhatsApp!'
                : 'Mesa fechada. (WhatsApp não configurado)'
        };
    } catch (error: any) {
        console.error('Error closing session:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Get daily feedback report
 */
export async function getDailyFeedbackReport(supabase: any): Promise<{
    totalResponses: number;
    avgService: number;
    avgProducts: number;
    avgAmbiance: number;
    suggestions: string[];
}> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: feedbacks } = await supabase
        .from('feedback_responses')
        .select('*')
        .gte('responded_at', today.toISOString());

    if (!feedbacks || feedbacks.length === 0) {
        return {
            totalResponses: 0,
            avgService: 0,
            avgProducts: 0,
            avgAmbiance: 0,
            suggestions: []
        };
    }

    const totalResponses = feedbacks.length;
    const avgService = feedbacks.reduce((sum: number, f: any) => sum + f.rating_service, 0) / totalResponses;
    const avgProducts = feedbacks.reduce((sum: number, f: any) => sum + f.rating_products, 0) / totalResponses;
    const avgAmbiance = feedbacks.reduce((sum: number, f: any) => sum + f.rating_ambiance, 0) / totalResponses;
    const suggestions = feedbacks
        .filter((f: any) => f.suggestions)
        .map((f: any) => f.suggestions);

    return {
        totalResponses,
        avgService: Math.round(avgService * 10) / 10,
        avgProducts: Math.round(avgProducts * 10) / 10,
        avgAmbiance: Math.round(avgAmbiance * 10) / 10,
        suggestions
    };
}

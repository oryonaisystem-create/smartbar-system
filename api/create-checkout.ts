
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'APP_USR-8427835307671939-013016-ff86dc63a67343e8b8f9cd7b055293d7-193574357';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email, price, title } = req.body;

    if (!email || !price) {
        return res.status(400).json({ error: 'Missing email or price' });
    }

    try {
        const preference = {
            items: [
                {
                    title: title || 'Assinatura Pro - SmartBar',
                    unit_price: Number(price),
                    quantity: 1,
                    currency_id: 'BRL'
                }
            ],
            payer: {
                email: email
            },
            back_urls: {
                success: "https://smartbar-system.vercel.app/settings?status=success",
                failure: "https://smartbar-system.vercel.app/pricing?status=failure",
                pending: "https://smartbar-system.vercel.app/pricing?status=pending"
            },
            auto_return: "approved",
            external_reference: email // We use email to identify user for now, ideally ID
        };

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            },
            body: JSON.stringify(preference)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('MP Error:', data);
            throw new Error(data.message || 'Error creating preference');
        }

        return res.status(200).json({ init_point: data.init_point, sandbox_init_point: data.sandbox_init_point });
    } catch (error: any) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

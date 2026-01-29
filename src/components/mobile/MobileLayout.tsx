import React, { useState } from 'react';
import BottomBar from './BottomBar';
import MobileActionsSheet from './MobileActionsSheet';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CashierManager } from '../CashierManager';

const MobileLayout = ({ children }: { children: React.ReactNode }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCashierOpen, setIsCashierOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020617] pb-32">
            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <img
                    src="https://public.readdy.ai/ai/img_res/4ced1042-ca06-43d9-9c63-861d1f714373.png"
                    alt="SmartBar"
                    className="h-8 w-auto hover:opacity-80 transition-opacity cursor-pointer"
                    onClick={() => navigate('/')}
                />

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/notifications')}
                        className="p-2 bg-white/5 rounded-xl border border-white/10 text-muted relative"
                    >
                        <Bell className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="pt-24 px-4 max-w-lg mx-auto overflow-x-hidden">
                {children}
            </main>

            {/* Mobile Navigation */}
            <BottomBar
                onOpenMore={() => setIsMenuOpen(true)}
                onOpenCashier={() => setIsCashierOpen(true)}
            />

            {/* More Menu Sheet */}
            <MobileActionsSheet
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />

            {/* Cashier Modal */}
            <CashierManager
                isOpen={isCashierOpen}
                onClose={() => setIsCashierOpen(false)}
            />
        </div>
    );
};

export default MobileLayout;

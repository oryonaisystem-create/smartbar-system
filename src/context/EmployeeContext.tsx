import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Employee {
    id: string;
    name: string;
    role: string;
    active: boolean;
}

interface EmployeeContextType {
    employees: Employee[];
    loading: boolean;
    refreshEmployees: () => Promise<void>;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider = ({ children }: { children: React.ReactNode }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEmployees = async () => {
        try {
            const { data, error } = await supabase
                .from('staff_users')
                .select('id, display_name, username, role, active')
                .eq('active', true)
                .order('display_name', { ascending: true });

            if (error) throw error;

            if (data) {
                const mapped: Employee[] = data.map(d => ({
                    id: d.id,
                    name: d.display_name || d.username,
                    role: d.role,
                    active: d.active
                }));
                setEmployees(mapped);
            }
        } catch (err) {
            console.error('Error fetching employees:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();

        // Subscribe to changes
        const channel = supabase
            .channel('staff_users_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'staff_users' },
                () => {
                    fetchEmployees();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <EmployeeContext.Provider value={{ employees, loading, refreshEmployees: fetchEmployees }}>
            {children}
        </EmployeeContext.Provider>
    );
};

export const useEmployees = () => {
    const context = useContext(EmployeeContext);
    if (!context) {
        throw new Error('useEmployees must be used within an EmployeeProvider');
    }
    return context;
};

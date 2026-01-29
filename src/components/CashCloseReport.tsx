import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Paleta de Cores extraída do Dashboard SmartBar
const colors = {
    primary: '#2563EB',      // Azul vibrante
    secondary: '#4F46E5',    // Roxo/Indigo
    darkBg: '#0F172A',       // Tom escuro do fundo
    success: '#10B981',      // Verde (Dinheiro)
    lightAccent: '#EEF2FF',  // Azul clarinho para fundos
    gray: '#6B7280'
};

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF'
    },

    // Cabeçalho com identidade SmartBar
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        borderBottomWidth: 3,
        borderBottomColor: colors.primary,
        paddingBottom: 15
    },
    brandTitle: {
        fontSize: 26,
        fontWeight: 'heavy',
        color: colors.darkBg,
        textTransform: 'uppercase',
        letterSpacing: 2
    },
    reportDate: {
        fontSize: 10,
        color: colors.primary,
        fontWeight: 'bold',
        marginTop: 5
    },

    // Box de Destaque
    summaryBox: {
        flexDirection: 'row',
        backgroundColor: colors.lightAccent,
        borderRadius: 12,
        padding: 20,
        marginBottom: 30,
        borderLeftWidth: 5,
        borderLeftColor: colors.secondary
    },
    summaryItem: { flex: 1 },
    summaryLabel: {
        fontSize: 9,
        color: colors.secondary,
        marginBottom: 6,
        textTransform: 'uppercase',
        fontWeight: 'bold'
    },
    summaryValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.success
    },

    // Tabela
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 15,
        color: colors.darkBg,
        backgroundColor: '#F3F4F6',
        padding: 8,
        borderRadius: 4
    },
    operatorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB'
    },
    operatorName: {
        fontSize: 12,
        color: '#374151',
        fontWeight: 'medium'
    },
    operatorValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.darkBg
    },

    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 9,
        color: colors.gray,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10
    }
});

export interface CashCloseReportData {
    totalCaixa: string;
    pixTotal: string;
    cartaoTotal?: string;
    dinheiroTotal?: string;
    operators: Array<{ name: string; value: string }>;
}

interface CashCloseReportProps {
    data: CashCloseReportData;
}

export const CashCloseReport: React.FC<CashCloseReportProps> = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* Cabeçalho Refinado */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.brandTitle}>SmartBar</Text>
                    <Text style={{ fontSize: 10, color: colors.gray }}>Sistema de Gestão Integrada</Text>
                </View>
                <View style={{ alignItems: 'flex-end' as any }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.darkBg }}>Fechamento de Caixa</Text>
                    <Text style={styles.reportDate}>{new Date().toLocaleDateString('pt-BR')}</Text>
                </View>
            </View>

            {/* Box de Resumo com Cores da Marca */}
            <View style={styles.summaryBox}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total em Caixa</Text>
                    <Text style={styles.summaryValue}>{data.totalCaixa}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Vendas via PIX</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>{data.pixTotal}</Text>
                </View>
                {data.cartaoTotal && (
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Vendas Cartão</Text>
                        <Text style={[styles.summaryValue, { color: colors.secondary }]}>{data.cartaoTotal}</Text>
                    </View>
                )}
            </View>

            {/* Lista de Operadores */}
            <View>
                <Text style={styles.sectionTitle}>RESUMO POR OPERADOR</Text>
                {data.operators.map((op, index) => (
                    <View key={index} style={styles.operatorRow}>
                        <Text style={styles.operatorName}>{op.name}</Text>
                        <Text style={styles.operatorValue}>{op.value}</Text>
                    </View>
                ))}
            </View>

            <Text style={styles.footer}>Documento gerado automaticamente via SmartBar System • Confidencial</Text>
        </Page>
    </Document>
);

export default CashCloseReport;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MapPin, CheckCircle, Edit3 } from 'lucide-react-native';

/**
 * 🛡️ [SIRAGO-SMART-PICKUP] Validation Humaine du point de ramassage.
 * Ton Nouchi et Glassmorphism pour rassurer l'utilisateur.
 */
const SmartPickupVerify = ({ address, onConfirm, onRectify }) => {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <View style={styles.iconCircle}>
                        <MapPin size={24} color="#7C3AED" />
                    </View>
                    <Text style={styles.title}>Vérification du lieu</Text>
                </View>

                <Text style={styles.addressText}>
                    Vous avez sélectionné : <Text style={styles.bold}>{address || "cette adresse"}</Text>.
                </Text>

                <Text style={styles.nouchiText}>
                    Afin d'aider votre chauffeur à vous localiser rapidement, merci de confirmer que le curseur est placé au bon endroit.
                </Text>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.rectifyBtn} onPress={onRectify}>
                        <Edit3 size={18} color="#64748B" />
                        <Text style={styles.rectifyText}>Modifier</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
                        <CheckCircle size={18} color="#FFFFFF" />
                        <Text style={styles.confirmText}>C'est exact</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 100,
        left: 20,
        right: 20,
        zIndex: 1000,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        padding: 22,
        shadowColor: "#7C3AED",
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 15,
        borderWidth: 2,
        borderColor: '#F5F3FF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 15,
        backgroundColor: '#F5F3FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        color: '#7C3AED',
    },
    addressText: {
        fontSize: 15,
        color: '#1E293B',
        lineHeight: 22,
        marginBottom: 12,
    },
    bold: {
        fontWeight: '900',
        color: '#7C3AED',
        backgroundColor: '#F5F3FF',
        paddingHorizontal: 4,
    },
    nouchiText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 15,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#7C3AED',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    rectifyBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 15,
        backgroundColor: '#F1F5F9',
    },
    rectifyText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
    },
    confirmBtn: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 15,
        backgroundColor: '#7C3AED',
    },
    confirmText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '900',
        color: '#FFFFFF',
    },
});

export default SmartPickupVerify;

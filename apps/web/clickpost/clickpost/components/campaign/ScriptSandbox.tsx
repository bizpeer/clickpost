import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';

interface ScriptSandboxProps {
  scripts: string[];
  onApprove: (index: number) => void;
}

export function ScriptSandbox({ scripts, onApprove }: ScriptSandboxProps) {
  const [editableScripts, setEditableScripts] = useState(scripts);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleScriptChange = (text: string, index: number) => {
    const newScripts = [...editableScripts];
    newScripts[index] = text;
    setEditableScripts(newScripts);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Script Sandbox</Text>
      <Text style={styles.subtitle}>
        Gemini has generated 3 distinct scripts. Review, edit, and approve the best one.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardContainer}>
        {editableScripts.map((script, index) => (
          <View key={index} style={[styles.card, selectedIndex === index && styles.selectedCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTag}>Option {index + 1}</Text>
              <Text style={styles.toneTag}>
                {index === 0 ? 'Viral' : index === 1 ? 'Professional' : 'Emotional'}
              </Text>
            </View>
            
            <TextInput
              style={styles.scriptInput}
              multiline
              value={script}
              onChangeText={(text) => handleScriptChange(text, index)}
              onFocus={() => setSelectedIndex(index)}
            />

            <TouchableOpacity 
              style={[styles.approveButton, selectedIndex === index && styles.activeApproveButton]}
              onPress={() => onApprove(index)}
            >
              <Text style={styles.approveButtonText}>Approve this Script</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 24,
    lineHeight: 22,
  },
  cardContainer: {
    paddingBottom: 16,
    gap: 20,
  },
  card: {
    width: 320,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  selectedCard: {
    borderColor: '#6366f1',
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  toneTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scriptInput: {
    fontSize: 15,
    color: '#1e293b',
    lineHeight: 24,
    height: 200,
    textAlignVertical: 'top',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  approveButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  activeApproveButton: {
    backgroundColor: '#6366f1',
  },
  approveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748b',
  },
});

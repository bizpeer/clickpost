import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';

interface ScriptSandboxProps {
  scripts: string[];
  onApprove: (index: number) => void;
  onScriptChange: (scripts: string[]) => void;
}

export function ScriptSandbox({ scripts, onApprove, onScriptChange }: ScriptSandboxProps) {
  const [editableScripts, setEditableScripts] = useState(scripts);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleScriptChange = (text: string, index: number) => {
    const newScripts = [...editableScripts];
    newScripts[index] = text;
    setEditableScripts(newScripts);
    onScriptChange(newScripts);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Script Sandbox</Text>
      <Text style={styles.subtitle}>
        Gemini has generated 3 distinct scripts. Review, edit, and approve the best one.
      </Text>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.cardContainer}
      >
        {editableScripts.map((script, index) => (
          <View key={index} style={[styles.card, selectedIndex === index && styles.selectedCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.tagWrapper}>
                <Text style={styles.cardTag}>Option {index + 1}</Text>
                <Text style={styles.toneTag}>
                  {index === 0 ? 'Viral' : index === 1 ? 'Professional' : 'Emotional'}
                </Text>
              </View>
              {selectedIndex === index && (
                <View style={styles.activeDot} />
              )}
            </View>
            
            <TextInput
              style={styles.scriptInput}
              multiline
              value={script}
              onChangeText={(text) => handleScriptChange(text, index)}
              onFocus={() => setSelectedIndex(index)}
              placeholder="Type your script here..."
            />

            <TouchableOpacity 
              style={[styles.approveButton, selectedIndex === index && styles.activeApproveButton]}
              onPress={() => onApprove(index)}
              activeOpacity={0.8}
            >
              <Text style={[styles.approveButtonText, selectedIndex === index && styles.activeApproveButtonText]}>
                {selectedIndex === index ? 'Confirm Approval' : 'Select This Script'}
              </Text>
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
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
    lineHeight: 24,
  },
  cardContainer: {
    paddingBottom: 24,
    gap: 24,
    paddingHorizontal: 4,
  },
  card: {
    width: 340,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  selectedCard: {
    borderColor: '#6366f1',
    borderWidth: 2,
    shadowOpacity: 0.12,
    shadowRadius: 30,
    transform: [{ scale: 1.02 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTag: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  toneTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
  },
  scriptInput: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 26,
    height: 240,
    textAlignVertical: 'top',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  approveButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeApproveButton: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
  },
  activeApproveButtonText: {
    color: '#ffffff',
  },
});

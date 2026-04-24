import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CampaignData, CampaignService } from '../../services/CampaignService';
import { GeminiService } from '../../services/GeminiService';
import { ScriptSandbox } from './ScriptSandbox';

const STEPS = ['Basic Info', 'Targeting', 'AI Sandbox', 'Payment'];

export function CampaignBuilder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [advertiserId, setAdvertiserId] = useState('00000000-0000-0000-0000-000000000000'); // Mock ID
  const [campaignData, setCampaignData] = useState<CampaignData>({
    title: '',
    description: '',
    totalBudget: 1000000,
    currencyCode: 'KRW',
    targetFilters: { age: [20, 40], gender: 'all' },
    mustIncludeKeywords: [],
    mustExcludeKeywords: [],
    targetPlatform: 'TIKTOK',
    providedMediaUrls: [],
  });
  const [generatedScripts, setGeneratedScripts] = useState<string[]>([]);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleNext = async () => {
    if (currentStep === 0) {
      if (!campaignData.title || !campaignData.description) {
        alert('Please fill in the title and description.');
        return;
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
      // Step 1 & 2 완료 후 캠페인 생성 및 AI 스크립트 생성
      setLoading(true);
      try {
        // 1. 캠페인 데이터 저장 (DRAFT)
        const campaign = await CampaignService.createCampaign(advertiserId, campaignData);
        setCampaignId(campaign.campaign_id);

        // 2. AI 스크립트 생성
        const scripts = await GeminiService.generateSampleScripts({
          description: campaignData.description,
          mustIncludeKeywords: campaignData.mustIncludeKeywords,
          mustExcludeKeywords: campaignData.mustExcludeKeywords,
          targetPlatform: campaignData.targetPlatform,
        });
        
        // 3. 샘플 스크립트 저장
        await CampaignService.saveSampleScripts(campaign.campaign_id, scripts);
        
        setGeneratedScripts(scripts);
        setCurrentStep(2);
      } catch (error) {
        console.error(error);
        alert('An error occurred during campaign creation or script generation.');
      } finally {
        setLoading(false);
      }
    } else if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleApprove = async (index: number) => {
    if (!campaignId) return;
    
    setLoading(true);
    try {
      // 실제로는 script_id를 찾아야 함. 현재는 샌드박스에서 인덱스로만 넘기므로 
      // CampaignService.saveSampleScripts에서 반환된 ID를 매핑해야 함.
      // 여기서는 데모를 위해 전체 스크립트 중 하나를 승인된 것으로 간주하는 로직으로 대체하거나 
      // 간단히 다음 단계로 이동합니다.
      setCurrentStep(3);
    } catch (error) {
      alert('Error approving script.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!campaignId) return;
    
    setPaymentLoading(true);
    try {
      // PayPal/Stripe API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 캠페인 활성화
      await CampaignService.activateCampaign(campaignId);
      
      alert('Payment successful! Your campaign is now ACTIVE.');
      // 홈으로 이동하거나 상세 페이지로 이동
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.label}>Campaign Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Summer Collection Launch 2024"
              value={campaignData.title}
              onChangeText={(text) => setCampaignData({ ...campaignData, title: text })}
            />
            <Text style={styles.label}>Product Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              placeholder="Describe your product, its unique selling points, and what kind of video you want."
              value={campaignData.description}
              onChangeText={(text) => setCampaignData({ ...campaignData, description: text })}
            />
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.label}>Target Platform</Text>
            <View style={styles.row}>
              {['TIKTOK', 'INSTAGRAM', 'YOUTUBE'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, campaignData.targetPlatform === p && styles.activeChip]}
                  onPress={() => setCampaignData({ ...campaignData, targetPlatform: p })}
                >
                  <Text style={[styles.chipText, campaignData.targetPlatform === p && styles.activeChipText]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Must-include Keywords (Comma separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Innovation, Eco-friendly, 20% Off"
              onChangeText={(text) => setCampaignData({ 
                ...campaignData, 
                mustIncludeKeywords: text.split(',').map(s => s.trim()).filter(s => s) 
              })}
            />
            <Text style={styles.label}>Total Budget ({campaignData.currencyCode})</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={campaignData.totalBudget.toString()}
              onChangeText={(text) => setCampaignData({ ...campaignData, totalBudget: parseInt(text) || 0 })}
            />
          </View>
        );
      case 2:
        return (
          <ScriptSandbox 
            scripts={generatedScripts} 
            onApprove={handleApprove}
            onScriptChange={(newScripts) => setGeneratedScripts(newScripts)}
          />
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Final Step: Escrow Deposit</Text>
            <Text style={styles.description}>
              Review your campaign details. Your budget will be held in escrow and distributed to influencers upon successful mission completion.
            </Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Campaign</Text>
                <Text style={styles.summaryValue}>{campaignData.title}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Platform</Text>
                <Text style={styles.summaryValue}>{campaignData.targetPlatform}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Budget</Text>
                <Text style={styles.summaryValue}>{campaignData.totalBudget.toLocaleString()} {campaignData.currencyCode}</Text>
              </View>
              <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#e2e8f0', marginTop: 12, paddingTop: 12 }]}>
                <Text style={[styles.summaryLabel, { color: '#0f172a', fontWeight: '800' }]}>Total Due</Text>
                <Text style={[styles.summaryValue, { color: '#6366f1', fontSize: 20, fontWeight: '800' }]}>
                  {campaignData.totalBudget.toLocaleString()} {campaignData.currencyCode}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.paymentButton, paymentLoading && { opacity: 0.7 }]} 
              onPress={handlePayment}
              disabled={paymentLoading}
            >
              {paymentLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.paymentButtonText}>Deposit to Escrow via PayPal</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.secureText}>🔒 Secure SSL Encrypted Payment</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.mainTitle}>Create New Campaign</Text>
        <View style={styles.stepper}>
          {STEPS.map((step, i) => (
            <View key={step} style={styles.stepItem}>
              <View style={[styles.stepCircle, currentStep >= i && styles.activeStepCircle]}>
                <Text style={[styles.stepNumber, currentStep >= i && styles.activeStepNumber]}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepLabel, currentStep >= i && styles.activeStepLabel]}>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>AI is crafting your scripts...</Text>
          </View>
        ) : (
          renderStep()
        )}
      </ScrollView>

      {currentStep < 2 && !loading && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentStep === 1 ? 'Generate AI Scripts' : 'Next Step'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 32,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 24,
    textAlign: 'center',
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepItem: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStepCircle: {
    backgroundColor: '#6366f1',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
  },
  activeStepNumber: {
    color: '#ffffff',
  },
  stepLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  activeStepLabel: {
    color: '#6366f1',
  },
  scrollContent: {
    padding: 24,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  stepContainer: {
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeChip: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  chipText: {
    color: '#64748b',
    fontWeight: '600',
  },
  activeChipText: {
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    padding: 64,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#64748b',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    padding: 24,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
    marginBottom: 32,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 4,
  },
  paymentButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  paymentButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  }
});

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { router } from 'expo-router';
import { CampaignData, CampaignService } from '../../services/CampaignService';
import { GeminiService } from '../../services/GeminiService';
import { supabase } from '../../services/SupabaseClient';
import { ScriptSandbox } from './ScriptSandbox';

import { useTranslation } from 'react-i18next';

const STEPS = ['builder.basicInfo', 'builder.targeting', 'builder.aiSandbox', 'builder.payment'];
import { ThemedInput } from '@/components/themed-input';

export function CampaignBuilder() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [advertiserId, setAdvertiserId] = useState<string | null>(null);
  const [keywordInput, setKeywordInput] = useState('');
  
    React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setAdvertiserId(session.user.id);
      } else {
        // No session found, redirect to login
        router.replace('/(auth)/login');
      }
    };
    fetchUser();
  }, []);

  const [campaignData, setCampaignData] = useState<CampaignData>({
    title: '',
    description: '',
    purpose: 'AWARENESS',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalBudget: 1000000,
    currencyCode: 'KRW',
    targetFilters: { 
      minAge: 20, 
      maxAge: 40, 
      gender: 'all',
      locationName: 'Seoul, South Korea',
      lat: 37.5665,
      lon: 126.9780,
      isGlobal: false
    },
    mustIncludeKeywords: [],
    mustExcludeKeywords: [],
    targetPlatform: 'TIKTOK',
    providedMediaUrls: [],
    isPremium: false,
    allowProposals: false,
  });
  const [generatedScripts, setGeneratedScripts] = useState<{ id: string; text: string }[]>([]);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [approvedScriptId, setApprovedScriptId] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

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
        const savedScripts = await CampaignService.saveSampleScripts(campaign.campaign_id, scripts);
        
        setGeneratedScripts(savedScripts.map((s: any) => ({ id: s.script_id, text: s.script_text })));
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
    if (!campaignId || !generatedScripts[index]) return;
    
    setLoading(true);
    try {
      await CampaignService.approveScript(generatedScripts[index].id);
      setApprovedScriptId(generatedScripts[index].id);
      setCurrentStep(3);
    } catch (error) {
      alert('Error approving script.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (index: number) => {
    if (!generatedScripts[index]) return;
    
    setIsRegenerating(true);
    try {
      const newText = await GeminiService.regenerateScript({
        description: campaignData.description,
        mustIncludeKeywords: campaignData.mustIncludeKeywords,
        mustExcludeKeywords: campaignData.mustExcludeKeywords,
        targetPlatform: campaignData.targetPlatform,
        tone: index === 0 ? 'Viral' : index === 1 ? 'Professional' : 'Emotional'
      });
      
      const updated = [...generatedScripts];
      updated[index] = { ...updated[index], text: newText };
      setGeneratedScripts(updated);
    } catch (error) {
      alert('Error regenerating script.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleFileUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    input.multiple = true;
    
    input.onchange = async (e: any) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      try {
        setLoading(true);
        const newUrls = [];
        for (const file of files as any[]) {
          if (file.size > 500 * 1024 * 1024) {
            alert(`File ${file.name} exceeds 500MB limit.`);
            continue;
          }
          const fileName = `${Date.now()}_${file.name}`;
          const path = `${advertiserId}/${fileName}`;
          const publicUrl = await CampaignService.uploadMaterial(file, path);
          newUrls.push(publicUrl);
        }
        
        setCampaignData(prev => ({
          ...prev,
          providedMediaUrls: [...prev.providedMediaUrls, ...newUrls]
        }));
        
        alert('Files uploaded successfully!');
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload files.');
      } finally {
        setLoading(false);
      }
    };
    
    input.click();
  };

  const removeFile = (url: string) => {
    setCampaignData(prev => ({
      ...prev,
      providedMediaUrls: prev.providedMediaUrls.filter(u => u !== url)
    }));
  };

  const handlePayment = async () => {
    if (!campaignId) return;
    
    setPaymentLoading(true);
    try {
      // PayPal/Stripe API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 캠페인 활성화
      await CampaignService.activateCampaign(campaignId);
      
      // 스크립트 변주 생성 (비동기 트리거)
      if (approvedScriptId) {
        CampaignService.expandApprovedScript(campaignId, approvedScriptId).catch(console.error);
      }

      alert('Payment successful! Your campaign is now ACTIVE and AI is generating variations.');
      // 홈으로 이동
      router.replace('/');
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
            <ThemedInput
              label={t('campaign.builder.nameLabel')}
              placeholder="e.g. Summer Collection Launch 2024"
              value={campaignData.title}
              onChangeText={(text) => setCampaignData({ ...campaignData, title: text })}
            />
            
            <View style={styles.row}>
              <View style={[styles.column, { flex: 1 }]}>
                <ThemedText style={styles.label}>{t('campaign.builder.purposeLabel')}</ThemedText>
                <View style={styles.pickerContainer}>
                  {(['AWARENESS', 'CONVERSION', 'POLITICAL'] as const).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.chip, campaignData.purpose === p && styles.activeChip]}
                      onPress={() => setCampaignData({ ...campaignData, purpose: p })}
                    >
                      <ThemedText style={[styles.chipText, campaignData.purpose === p && styles.activeChipText]}>
                        {t(`campaign.builder.${p.toLowerCase()}`)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.column, { flex: 1 }]}>
                <ThemedText style={styles.label}>{t('campaign.builder.periodLabel')}</ThemedText>
                <View style={styles.row}>
                  <ThemedInput
                    containerStyle={{ flex: 1 }}
                    type="date"
                    value={campaignData.startDate}
                    onChangeText={(text) => setCampaignData({ ...campaignData, startDate: text })}
                  />
                  <ThemedText style={{ alignSelf: 'center', marginHorizontal: 10 }}>~</ThemedText>
                  <ThemedInput
                    containerStyle={{ flex: 1 }}
                    type="date"
                    value={campaignData.endDate}
                    onChangeText={(text) => setCampaignData({ ...campaignData, endDate: text })}
                  />
                </View>
              </View>
            </View>

            <ThemedInput
              label={t('dashboard.subGreeting')}
              multiline
              numberOfLines={4}
              placeholder="Describe your product, its unique selling points, and what kind of video you want."
              value={campaignData.description}
              onChangeText={(text) => setCampaignData({ ...campaignData, description: text })}
            />
            
            <ThemedText style={styles.label}>{t('campaign.builder.materialLabel')}</ThemedText>
            <TouchableOpacity 
              style={styles.uploadBox}
              onPress={handleFileUpload}
            >
              <ThemedText style={styles.uploadText}>{t('campaign.builder.dropzoneHint')}</ThemedText>
              <View style={styles.previewGrid}>
                {campaignData.providedMediaUrls.map((url, i) => (
                  <View key={i} style={styles.previewItem}>
                    <Image source={{ uri: url }} style={styles.previewThumb} />
                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeFile(url)}>
                      <ThemedText style={styles.removeBtnText}>×</ThemedText>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </TouchableOpacity>

            <View style={styles.row}>
              <View style={[styles.column, { flex: 1 }]}>
                <ThemedText style={styles.label}>Mission Type</ThemedText>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[styles.chip, !campaignData.isPremium && styles.activeChip]}
                    onPress={() => setCampaignData({ ...campaignData, isPremium: false, allowProposals: false })}
                  >
                    <ThemedText style={[styles.chipText, !campaignData.isPremium && styles.activeChipText]}>Standard (Fixed Reward)</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chip, campaignData.isPremium && styles.activeChip]}
                    onPress={() => setCampaignData({ ...campaignData, isPremium: true, allowProposals: true })}
                  >
                    <ThemedText style={[styles.chipText, campaignData.isPremium && styles.activeChipText]}>Premium (Reverse Proposal)</ThemedText>
                  </TouchableOpacity>
                </View>
                {campaignData.isPremium && (
                  <ThemedText style={styles.infoText}>
                    * Only influencers with 10k+ followers can see and bid on this campaign.
                  </ThemedText>
                )}
              </View>
            </View>

            <View style={styles.column}>
              <View style={styles.keywordInputContainer}>
                <ThemedInput
                  containerStyle={{ flex: 1 }}
                  label="Keywords (Press Enter to add)"
                  placeholder="e.g. Eco-friendly, Sale"
                  value={keywordInput}
                  onChangeText={setKeywordInput}
                  onSubmitEditing={() => {
                    if (keywordInput.trim() && !campaignData.mustIncludeKeywords.includes(keywordInput.trim())) {
                      setCampaignData({
                        ...campaignData,
                        mustIncludeKeywords: [...campaignData.mustIncludeKeywords, keywordInput.trim()]
                      });
                      setKeywordInput('');
                    }
                  }}
                />
              </View>
              <View style={styles.tagCloud}>
                {campaignData.mustIncludeKeywords.map((tag) => (
                  <View key={tag} style={styles.activeTag}>
                    <ThemedText style={styles.activeTagText}>#{tag}</ThemedText>
                    <TouchableOpacity 
                      onPress={() => setCampaignData({
                        ...campaignData,
                        mustIncludeKeywords: campaignData.mustIncludeKeywords.filter(t => t !== tag)
                      })}
                    >
                      <ThemedText style={styles.removeTag}>×</ThemedText>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.label}>Target Platform</ThemedText>
            <View style={styles.row}>
              {['TIKTOK', 'INSTAGRAM', 'YOUTUBE'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, campaignData.targetPlatform === p && styles.activeChip]}
                  onPress={() => setCampaignData({ ...campaignData, targetPlatform: p })}
                >
                  <ThemedText style={[styles.chipText, campaignData.targetPlatform === p && styles.activeChipText]}>{p}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText style={styles.label}>Target Gender</ThemedText>
            <View style={styles.row}>
              {['all', 'male', 'female'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.chip, campaignData.targetFilters.gender === g && styles.activeChip]}
                  onPress={() => setCampaignData({ 
                    ...campaignData, 
                    targetFilters: { ...campaignData.targetFilters, gender: g as any } 
                  })}
                >
                  <ThemedText style={[styles.chipText, campaignData.targetFilters.gender === g && styles.activeChipText]}>
                    {g.toUpperCase()}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <ThemedInput
                  label="Min Age"
                  keyboardType="numeric"
                  value={campaignData.targetFilters.minAge.toString()}
                  onChangeText={(text) => setCampaignData({ 
                    ...campaignData, 
                    targetFilters: { ...campaignData.targetFilters, minAge: parseInt(text) || 0 } 
                  })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedInput
                  label="Max Age"
                  keyboardType="numeric"
                  value={campaignData.targetFilters.maxAge.toString()}
                  onChangeText={(text) => setCampaignData({ 
                    ...campaignData, 
                    targetFilters: { ...campaignData.targetFilters, maxAge: parseInt(text) || 0 } 
                  })}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.column, { flex: 0.5 }]}>
                <ThemedText style={styles.label}>Global Campaign</ThemedText>
                <TouchableOpacity 
                  style={[styles.toggleButton, campaignData.targetFilters.isGlobal && styles.toggleButtonActive]}
                  onPress={() => setCampaignData({
                    ...campaignData,
                    targetFilters: { ...campaignData.targetFilters, isGlobal: !campaignData.targetFilters.isGlobal }
                  })}
                >
                  <ThemedText style={[styles.toggleButtonText, campaignData.targetFilters.isGlobal && styles.toggleButtonTextActive]}>
                    {campaignData.targetFilters.isGlobal ? 'YES (Worldwide)' : 'NO (Target Area)'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
              <View style={styles.column}>
                <ThemedInput
                  label="Target Region Name"
                  placeholder="e.g. Seoul, Gangnam"
                  value={campaignData.targetFilters.locationName}
                  onChangeText={(text) => setCampaignData({ 
                    ...campaignData, 
                    targetFilters: { ...campaignData.targetFilters, locationName: text } 
                  })}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <ThemedInput
                  label={t('campaign.builder.budgetLabel')}
                  keyboardType="numeric"
                  value={campaignData.totalBudget.toString()}
                  onChangeText={(text) => setCampaignData({ ...campaignData, totalBudget: parseInt(text) || 0 })}
                />
              </View>
              <View style={{ flex: 0.4 }}>
                <ThemedText style={styles.label}>Currency</ThemedText>
                <View style={styles.currencySelector}>
                  {['KRW', 'USD', 'THB'].map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.currencyChip, campaignData.currencyCode === c && styles.currencyChipActive]}
                      onPress={() => setCampaignData({ ...campaignData, currencyCode: c })}
                    >
                      <ThemedText style={[styles.currencyChipText, campaignData.currencyCode === c && styles.currencyChipTextActive]}>
                        {c}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        );
      case 2:
        return (
          <ScriptSandbox 
            scripts={generatedScripts.map(s => s.text)} 
            mustIncludeKeywords={campaignData.mustIncludeKeywords}
            mustExcludeKeywords={campaignData.mustExcludeKeywords}
            onApprove={handleApprove}
            onRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
            onScriptChange={(newTexts) => {
              const updated = generatedScripts.map((s, i) => ({ ...s, text: newTexts[i] }));
              setGeneratedScripts(updated);
            }}
          />
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.title}>{t('campaign.builder.step3.title')}</ThemedText>
            <ThemedText style={styles.description}>{t('campaign.builder.step3.desc')}</ThemedText>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>{t('campaign.builder.summary.base')}</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {(campaignData.totalBudget * 0.8).toLocaleString()} {campaignData.currencyCode}
                </ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>{t('campaign.builder.summary.fee')}</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {(campaignData.totalBudget * 0.2).toLocaleString()} {campaignData.currencyCode}
                </ThemedText>
              </View>
              <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#e2e8f0', marginTop: 12, paddingTop: 12 }]}>
                <ThemedText style={[styles.summaryLabel, { color: '#0f172a', fontWeight: '800' }]}>{t('campaign.builder.summary.total')}</ThemedText>
                <ThemedText style={[styles.summaryValue, { color: '#6366f1', fontSize: 20, fontWeight: '800' }]}>
                  {campaignData.totalBudget.toLocaleString()} {campaignData.currencyCode}
                </ThemedText>
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
                <ThemedText style={styles.paymentButtonText}>{t('campaign.builder.payButton')}</ThemedText>
              )}
            </TouchableOpacity>
            <ThemedText style={styles.secureText}>🔒 {t('campaign.builder.securePayment')}</ThemedText>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.mainTitle}>{t('campaign.builder.title')}</ThemedText>
        <View style={styles.stepper}>
          {STEPS.map((key, i) => (
            <View key={key} style={styles.stepItem}>
              <View style={[styles.stepCircle, currentStep >= i && styles.activeStepCircle]}>
                <ThemedText style={[styles.stepNumber, currentStep >= i && styles.activeStepNumber]}>{i + 1}</ThemedText>
              </View>
              <ThemedText style={[styles.stepLabel, currentStep >= i && styles.activeStepLabel]}>{t(key)}</ThemedText>
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
            <ThemedText style={styles.backButtonText}>{t('campaign.builder.prev')}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <ThemedText style={styles.nextButtonText}>
              {currentStep === 1 ? t('campaign.builder.next') : t('campaign.builder.next')}
            </ThemedText>
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
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  previewItem: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#eee',
  },
  previewThumb: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  keywordInputContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  tagText: {
    color: '#6366f1',
    fontWeight: '600',
    fontSize: 13,
  },
  removeTagText: {
    marginLeft: 6,
    color: '#6366f1',
    fontSize: 18,
    lineHeight: 18,
  },
  scrollContent: {
    padding: 24,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  stepContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 32,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
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
  column: {
    flex: 1,
    minWidth: 150,
  },
  toggleButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  toggleButtonText: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 14,
  },
  toggleButtonTextActive: {
    color: '#6366f1',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
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
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  activeTagText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 6,
  },
  removeTag: {
    color: '#6366f1',
    fontSize: 18,
    fontWeight: '800',
  },
  activeStep: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  stepText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  activeStepText: {
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '700',
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
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    marginTop: 8,
  },
  uploadText: {
    color: '#6366f1',
    fontWeight: '700',
    fontSize: 15,
  },
  uploadCount: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748b',
  },
  infoText: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 8,
    fontWeight: '500',
  },
  currencySelector: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginTop: 8,
  },
  currencyChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  currencyChipActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currencyChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  currencyChipTextActive: {
    color: '#6366f1',
  },
  mapPreview: {
    marginTop: 20,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    // 맵 패턴 이미지 등을 넣을 수 있음
  },
  mapOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  mapCoords: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  searchMapButton: {
    marginTop: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchMapButtonText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '700',
  }
});

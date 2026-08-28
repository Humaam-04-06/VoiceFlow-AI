import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
  Share,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'ur-PK', name: 'Urdu', flag: '🇵🇰' },
  { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dictate' | 'polish' | 'summary' | 'translate' | 'babel' | 'vault'>('dictate');
  const [isRecording, setIsRecording] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Transcripts & AI Content
  const [rawTranscript, setRawTranscript] = useState('Welcome to VoiceFlow AI Mobile. Tap the microphone below to start real-time speech dictation...');
  const [polishedText, setPolishedText] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLang, setTargetLang] = useState('ur-PK');

  // Babel 2-Way State
  const [babelLangA, setBabelLangA] = useState('en-US');
  const [babelLangB, setBabelLangB] = useState('ur-PK');
  const [babelInputA, setBabelInputA] = useState('');
  const [babelInputB, setBabelInputB] = useState('');
  const [babelHistory, setBabelHistory] = useState<Array<{ id: string; sender: string; orig: string; trans: string; lang: string }>>([]);

  // Voice Vault History
  const [vaultItems, setVaultItems] = useState<Array<{ id: string; title: string; text: string; date: string }>>([
    { id: '1', title: 'Executive Project Kickoff', text: 'Discussed Q3 roadmaps, offline Whisper on-device acceleration, and multilingual Neural TTS.', date: 'Today' }
  ]);
  const [vaultSearch, setVaultSearch] = useState('');

  // Settings & API Keys
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isKeyAlertOpen, setIsKeyAlertOpen] = useState(false);
  const [keyAlertFeature, setKeyAlertFeature] = useState('AI Feature');
  const [apiKeys, setApiKeys] = useState<{ gemini?: string; openai?: string; claude?: string }>({});
  const [offlineEngine, setOfflineEngine] = useState(true);

  // Pulse animation for recording
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      clearInterval(interval);
      setTimerSeconds(0);
      pulseAnim.setValue(1);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const hasAnyKey = Boolean(apiKeys.geminiKey?.trim() || apiKeys.openaiKey?.trim() || apiKeys.claudeKey?.trim());

  const checkKeyOrAlert = (featureName: string): boolean => {
    if (!hasAnyKey) {
      setKeyAlertFeature(featureName);
      setIsKeyAlertOpen(true);
      return false;
    }
    return true;
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setRawTranscript('Listening with 48kHz DSP noise suppression & Whisper on-device engine...');
    }
  };

  // AI Actions
  const handleFixGrammar = () => {
    if (!checkKeyOrAlert('Fix Grammar & Polishing')) return;
    setPolishedText(rawTranscript.replace(/\b(um|uh|like|basically)\b/gi, '').trim());
    setActiveTab('polish');
  };

  const handleSummarize = () => {
    if (!checkKeyOrAlert('Executive Summary')) return;
    setSummaryText(`• Executive Takeaway: Speech recorded with high accuracy.\n• Key Decisions: Deployed offline Whisper CoreML engine.\n• Action Items: Review project milestones and sync with stakeholders.`);
    setActiveTab('summary');
  };

  const handleTranslate = () => {
    if (!checkKeyOrAlert('Multilingual Translation')) return;
    if (targetLang.startsWith('ur')) {
      setTranslatedText('ہیلو، آپ کی آواز کامیابی کے ساتھ ترجمہ ہو گئی ہے!');
    } else if (targetLang.startsWith('es')) {
      setTranslatedText('¡Hola, tu voz ha sido traducida con éxito!');
    } else if (targetLang.startsWith('ar')) {
      setTranslatedText('مرحبا، تم ترجمة صوتك بنجاح!');
    } else {
      setTranslatedText(`[Translated to ${targetLang}]: ${rawTranscript}`);
    }
    setActiveTab('translate');
  };

  const handleBabelSend = (sender: 'Person A' | 'Person B', text: string) => {
    if (!text.trim()) return;
    if (!checkKeyOrAlert('2-Way Babel Universal Translator')) return;

    let translated = '';
    if (sender === 'Person A') {
      translated = babelLangB.startsWith('ur') ? 'ہیلو، کیسے ہیں آپ؟' : '¡Hola! ¿Cómo estás?';
      setBabelInputA('');
    } else {
      translated = 'Hello, how are you?';
      setBabelInputB('');
    }

    setBabelHistory(prev => [
      { id: Date.now().toString(), sender, orig: text, trans: translated, lang: sender === 'Person A' ? babelLangB : babelLangA },
      ...prev
    ]);
  };

  const handleShare = async (content: string) => {
    try {
      await Share.share({ message: content, title: 'VoiceFlow AI Note' });
    } catch {}
  };

  const handleSaveToVault = () => {
    if (!rawTranscript.trim()) return;
    setVaultItems(prev => [
      { id: Date.now().toString(), title: rawTranscript.slice(0, 30) + '...', text: rawTranscript, date: 'Just now' },
      ...prev
    ]);
    Alert.alert('Saved', 'Note successfully saved to your Voice Vault!');
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Navbar */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoIcon}>
            <MaterialCommunityIcons name="microphone-variant" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.brandTitle}>Voice<Text style={styles.brandHighlight}>Flow</Text> AI</Text>
            <Text style={styles.brandSub}>
              {offlineEngine ? '⚡ 100% Offline CoreML / NPU' : '🌐 Cloud AI Active'}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => setIsSettingsOpen(true)} style={styles.settingsBtn}>
          <Ionicons name="settings-sharp" size={18} color="#a1a1aa" />
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContainer}>
        {[
          { key: 'dictate', label: 'Dictate', icon: 'microphone' },
          { key: 'polish', label: 'Polished', icon: 'wand-magic-sparkles' },
          { key: 'summary', label: 'Summary', icon: 'list-check' },
          { key: 'translate', label: 'Translate', icon: 'language' },
          { key: 'babel', label: 'Babel Mode', icon: 'globe' },
          { key: 'vault', label: 'Voice Vault', icon: 'bookmark' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => {
              if (['polish', 'summary', 'translate', 'babel'].includes(tab.key) && !hasAnyKey) {
                setKeyAlertFeature(tab.label);
                setIsKeyAlertOpen(true);
                return;
              }
              setActiveTab(tab.key as any);
            }}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
          >
            <FontAwesome5 name={tab.icon as any} size={12} color={activeTab === tab.key ? '#fff' : '#a1a1aa'} />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main Content Workspace */}
      <View style={styles.workspace}>
        {activeTab === 'dictate' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Live Speech Transcript</Text>
              <Text style={styles.timerBadge}>{formatTimer(timerSeconds)}</Text>
            </View>
            <TextInput
              style={styles.textEditor}
              multiline
              value={rawTranscript}
              onChangeText={setRawTranscript}
              placeholder="Speak or type your thoughts..."
              placeholderTextColor="#71717a"
            />
            {/* Quick Action Pills */}
            <View style={styles.pillsRow}>
              <TouchableOpacity onPress={handleFixGrammar} style={styles.pillBtn}>
                <FontAwesome5 name="magic" size={11} color="#06b6d4" />
                <Text style={styles.pillText}>Fix Grammar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSummarize} style={styles.pillBtn}>
                <FontAwesome5 name="list-alt" size={11} color="#10b981" />
                <Text style={styles.pillText}>Summarize</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleTranslate} style={styles.pillBtn}>
                <FontAwesome5 name="language" size={11} color="#8b5cf6" />
                <Text style={styles.pillText}>Translate</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'polish' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>✨ Polished Speech (Zero Filler Words)</Text>
            <TextInput
              style={styles.textEditor}
              multiline
              value={polishedText || rawTranscript}
              onChangeText={setPolishedText}
              placeholder="Click 'Fix Grammar' to generate polished prose..."
              placeholderTextColor="#71717a"
            />
          </View>
        )}

        {activeTab === 'summary' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📑 Executive Summary & Action Items</Text>
            <TextInput
              style={styles.textEditor}
              multiline
              value={summaryText || 'Tap "Summarize" to generate executive bullets and action checklist...'}
              onChangeText={setSummaryText}
              placeholderTextColor="#71717a"
            />
          </View>
        )}

        {activeTab === 'translate' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>🌐 Multilingual Translation</Text>
              <TouchableOpacity
                onPress={() => setTargetLang(targetLang === 'ur-PK' ? 'es-ES' : targetLang === 'es-ES' ? 'ar-SA' : 'ur-PK')}
                style={styles.langSelector}
              >
                <Text style={styles.langSelectorText}>
                  {SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.flag} {SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.textEditor}
              multiline
              value={translatedText || 'Select target language and tap "Translate"...'}
              onChangeText={setTranslatedText}
              placeholderTextColor="#71717a"
            />
          </View>
        )}

        {activeTab === 'babel' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🗣️ 2-Way Live Babel Universal Translator</Text>
            <ScrollView style={styles.babelStream}>
              {babelHistory.map(msg => (
                <View key={msg.id} style={[styles.babelBubble, msg.sender === 'Person A' ? styles.bubbleA : styles.bubbleB]}>
                  <Text style={styles.bubbleSender}>{msg.sender}</Text>
                  <Text style={styles.bubbleOrig}>"{msg.orig}"</Text>
                  <Text style={styles.bubbleTrans}>➔ {msg.trans}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.babelInputContainer}>
              <View style={styles.babelInputRow}>
                <TextInput
                  style={styles.babelInput}
                  value={babelInputA}
                  onChangeText={setBabelInputA}
                  placeholder="Person A (English)..."
                  placeholderTextColor="#71717a"
                />
                <TouchableOpacity onPress={() => handleBabelSend('Person A', babelInputA)} style={styles.sendBtnA}>
                  <Ionicons name="send" size={14} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.babelInputRow}>
                <TextInput
                  style={styles.babelInput}
                  value={babelInputB}
                  onChangeText={setBabelInputB}
                  placeholder="Person B (Urdu / Spanish)..."
                  placeholderTextColor="#71717a"
                />
                <TouchableOpacity onPress={() => handleBabelSend('Person B', babelInputB)} style={styles.sendBtnB}>
                  <Ionicons name="send" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'vault' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔍 Voice Vault (Semantic Audio History)</Text>
            <TextInput
              style={styles.searchBar}
              value={vaultSearch}
              onChangeText={setVaultSearch}
              placeholder="Search notes by keyword or topic..."
              placeholderTextColor="#71717a"
            />
            <ScrollView style={styles.vaultList}>
              {vaultItems.filter(i => i.title.toLowerCase().includes(vaultSearch.toLowerCase()) || i.text.toLowerCase().includes(vaultSearch.toLowerCase())).map(item => (
                <TouchableOpacity key={item.id} onPress={() => { setRawTranscript(item.text); setActiveTab('dictate'); }} style={styles.vaultCard}>
                  <Text style={styles.vaultTitle}>{item.title}</Text>
                  <Text style={styles.vaultText} numberOfLines={2}>{item.text}</Text>
                  <Text style={styles.vaultDate}>{item.date}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Floating Bottom Utility Toolbar */}
      <View style={styles.bottomToolbar}>
        <TouchableOpacity onPress={() => handleShare(rawTranscript)} style={styles.toolBtn}>
          <Ionicons name="share-social" size={18} color="#a1a1aa" />
        </TouchableOpacity>

        {/* Central Record Button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            onPress={toggleRecording}
            style={[styles.recordBtn, isRecording ? styles.recordBtnActive : styles.recordBtnIdle]}
            activeOpacity={0.8}
          >
            <Ionicons name={isRecording ? 'stop' : 'mic'} size={28} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity onPress={handleSaveToVault} style={styles.toolBtn}>
          <Ionicons name="bookmark" size={18} color="#a1a1aa" />
        </TouchableOpacity>
      </View>

      {/* SweetAlert API Key Required Modal */}
      <Modal visible={isKeyAlertOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.alertCard}>
            <View style={styles.alertIcon}>
              <FontAwesome5 name="key" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.alertTitle}>AI API Key Required</Text>
            <Text style={styles.alertDesc}>
              To use <Text style={{ fontWeight: 'bold', color: '#fff' }}>{keyAlertFeature}</Text>, please provide your free Google Gemini 2.0, OpenAI GPT-4o, or Claude 3.7 API key.
            </Text>

            <TouchableOpacity
              onPress={() => { setIsKeyAlertOpen(false); setIsSettingsOpen(true); }}
              style={styles.alertActionBtn}
            >
              <Text style={styles.alertActionText}>⚙️ Open Settings & Add Key</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsKeyAlertOpen(false)} style={styles.alertCancelBtn}>
              <Text style={styles.alertCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={isSettingsOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.settingsCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mobile Studio Settings</Text>
              <TouchableOpacity onPress={() => setIsSettingsOpen(false)}>
                <Ionicons name="close" size={22} color="#a1a1aa" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.settingsBody}>
              <Text style={styles.settingsSectionTitle}>AI Model API Keys</Text>

              <Text style={styles.inputLabel}>Google Gemini 2.0 / 2.5 (100% Free)</Text>
              <TextInput
                style={styles.keyInput}
                secureTextEntry
                value={apiKeys.geminiKey || ''}
                onChangeText={(text) => setApiKeys(k => ({ ...k, geminiKey: text }))}
                placeholder="AIzaSy..."
                placeholderTextColor="#52525b"
              />

              <Text style={styles.inputLabel}>OpenAI GPT-4o Key</Text>
              <TextInput
                style={styles.keyInput}
                secureTextEntry
                value={apiKeys.openaiKey || ''}
                onChangeText={(text) => setApiKeys(k => ({ ...k, openaiKey: text }))}
                placeholder="sk-proj-..."
                placeholderTextColor="#52525b"
              />

              <Text style={styles.inputLabel}>Anthropic Claude 3.7 Key</Text>
              <TextInput
                style={styles.keyInput}
                secureTextEntry
                value={apiKeys.claudeKey || ''}
                onChangeText={(text) => setApiKeys(k => ({ ...k, claudeKey: text }))}
                placeholder="sk-ant-..."
                placeholderTextColor="#52525b"
              />

              <Text style={[styles.settingsSectionTitle, { marginTop: 20 }]}>Speech Engine</Text>
              <TouchableOpacity
                onPress={() => setOfflineEngine(!offlineEngine)}
                style={styles.toggleRow}
              >
                <View>
                  <Text style={styles.toggleTitle}>Offline whisper.cpp Mode</Text>
                  <Text style={styles.toggleSub}>Runs 100% on-device via CoreML / NPU</Text>
                </View>
                <Ionicons name={offlineEngine ? 'checkbox' : 'square-outline'} size={24} color="#8b5cf6" />
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity onPress={() => setIsSettingsOpen(false)} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save & Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  brandHighlight: {
    color: '#8b5cf6',
  },
  brandSub: {
    fontSize: 10,
    color: '#a1a1aa',
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#18181b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  tabScroll: {
    maxHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
  },
  tabContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#18181b',
  },
  tabItemActive: {
    backgroundColor: '#7c3aed',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a1a1aa',
  },
  tabLabelActive: {
    color: '#ffffff',
  },
  workspace: {
    flex: 1,
    padding: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#18181b',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  timerBadge: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#c4b5fd',
    backgroundColor: '#2e1065',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  textEditor: {
    flex: 1,
    color: '#f4f4f5',
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#27272a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#e4e4e7',
  },
  langSelector: {
    backgroundColor: '#27272a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  langSelectorText: {
    fontSize: 12,
    color: '#e4e4e7',
    fontWeight: '600',
  },
  babelStream: {
    flex: 1,
    marginBottom: 10,
  },
  babelBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '85%',
  },
  bubbleA: {
    backgroundColor: '#2e1065',
    alignSelf: 'flex-start',
  },
  bubbleB: {
    backgroundColor: '#164e63',
    alignSelf: 'flex-end',
  },
  bubbleSender: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#a1a1aa',
    marginBottom: 2,
  },
  bubbleOrig: {
    fontSize: 12,
    color: '#d4d4d8',
    fontStyle: 'italic',
  },
  bubbleTrans: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  babelInputContainer: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    paddingTop: 8,
  },
  babelInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  babelInput: {
    flex: 1,
    backgroundColor: '#09090b',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  sendBtnA: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnB: {
    backgroundColor: '#0891b2',
    borderRadius: 12,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    backgroundColor: '#09090b',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  vaultList: {
    flex: 1,
  },
  vaultCard: {
    backgroundColor: '#09090b',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  vaultTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  vaultText: {
    fontSize: 12,
    color: '#a1a1aa',
    marginVertical: 4,
  },
  vaultDate: {
    fontSize: 10,
    color: '#71717a',
  },
  bottomToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#18181b',
    backgroundColor: '#09090b',
  },
  toolBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#18181b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  recordBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  recordBtnIdle: {
    backgroundColor: '#7c3aed',
  },
  recordBtnActive: {
    backgroundColor: '#dc2626',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  alertCard: {
    width: '100%',
    backgroundColor: '#18181b',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  alertIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#451a03',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  alertDesc: {
    fontSize: 13,
    color: '#d4d4d8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  alertActionBtn: {
    width: '100%',
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  alertActionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  alertCancelBtn: {
    paddingVertical: 8,
  },
  alertCancelText: {
    fontSize: 13,
    color: '#a1a1aa',
  },
  settingsCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#18181b',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  settingsBody: {
    marginBottom: 16,
  },
  settingsSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d4d4d8',
    marginTop: 8,
    marginBottom: 4,
  },
  keyInput: {
    backgroundColor: '#09090b',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    fontFamily: 'monospace',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#09090b',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  toggleSub: {
    fontSize: 11,
    color: '#a1a1aa',
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

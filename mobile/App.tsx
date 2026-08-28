import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('Tap the microphone to start 100% offline Whisper transcription...');

  const toggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setTranscript('Listening offline with CoreML / NPU acceleration...');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Voice<Text style={styles.titleHighlight}>Flow</Text> AI</Text>
        <Text style={styles.subtitle}>100% Offline Whisper Mobile Studio</Text>
      </View>

      <ScrollView style={styles.transcriptBox} contentContainerStyle={styles.transcriptContent}>
        <Text style={styles.transcriptText}>{transcript}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={toggleRecord}
          style={[styles.recordBtn, isRecording ? styles.recordBtnActive : styles.recordBtnIdle]}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>{isRecording ? '⏹ Stop' : '🎙 Dictate'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  titleHighlight: {
    color: '#8b5cf6',
  },
  subtitle: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 4,
  },
  transcriptBox: {
    flex: 1,
    backgroundColor: '#18181b',
    borderRadius: 24,
    marginVertical: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  transcriptContent: {
    flexGrow: 1,
  },
  transcriptText: {
    fontSize: 16,
    color: '#f4f4f5',
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  recordBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  recordBtnIdle: {
    backgroundColor: '#7c3aed',
  },
  recordBtnActive: {
    backgroundColor: '#ef4444',
  },
  btnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

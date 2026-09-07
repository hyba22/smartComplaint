import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Square, Send, X } from 'lucide-react';
import './voice-recorder.scss';

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob) => void;
  onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend, onCancel }) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pendingSendRef = useRef(false);
  const isCancelledRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const hasSentRef = useRef(false);
  const onSendRef = useRef(onSend);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onSendRef.current = onSend;
    onCancelRef.current = onCancel;
  }, [onSend, onCancel]);

  useEffect(() => {
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = e => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
          setIsRecording(false);
          stream.getTracks().forEach(track => track.stop());

          if (isCancelledRef.current) {
            onCancelRef.current();
            return;
          }
          if (pendingSendRef.current && !hasSentRef.current) {
            hasSentRef.current = true;
            pendingSendRef.current = false;
            if (blob.size > 0) {
              onSendRef.current(blob);
            } else {
              onCancelRef.current();
            }
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert(t('chat.micError'));
        onCancelRef.current();
      }
    };

    startRecording();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const stopRecording = () => {
    if (stopRequestedRef.current || !mediaRecorderRef.current) {
      return;
    }
    stopRequestedRef.current = true;
    if (mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const sendRecording = () => {
    if (hasSentRef.current) {
      return;
    }
    if (audioBlob) {
      hasSentRef.current = true;
      if (audioBlob.size > 0) {
        onSendRef.current(audioBlob);
      } else {
        onCancelRef.current();
      }
      return;
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      pendingSendRef.current = true;
      if (!stopRequestedRef.current) {
        stopRequestedRef.current = true;
        mediaRecorderRef.current.stop();
      }
    }
  };

  const cancelRecording = () => {
    if (stopRequestedRef.current) {
      return;
    }
    stopRequestedRef.current = true;
    isCancelledRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      onCancelRef.current();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-recorder">
      <button
        onClick={stopRecording}
        className="recorder-btn recorder-btn-stop"
        type="button"
        title={t('chat.stopRecording')}
        disabled={!isRecording}
      >
        <Square size={18} fill="currentColor" />
      </button>
      <div className="recorder-time">
        <span className="recorder-time-pill">{formatTime(recordingTime)}</span>
      </div>
      <div className="recorder-actions">
        <button
          onClick={sendRecording}
          className="recorder-btn recorder-btn-send"
          type="button"
          title={t('chat.sendVoice')}
          disabled={!isRecording && !audioBlob}
        >
          <Send size={18} />
        </button>
        <button onClick={cancelRecording} className="recorder-btn recorder-btn-cancel" type="button" title={t('chat.cancelRecording')}>
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

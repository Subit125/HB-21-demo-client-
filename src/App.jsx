import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import imageCompression from 'browser-image-compression';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Trophy,
  Target,
  Flame,
  Home as HomeIcon,
  Users,
  User,
  MessageSquare,
  LogOut,
  ChevronRight,
  Clock,
  Upload,
  Check,
  CheckCircle,
  XCircle,
  Lock,
  Award,
  Video,
  ShieldCheck,
  Bell,
  Zap,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  ShieldAlert,
  Globe,
  Phone,
  Mail,
  MapPin,
  Camera,
  Edit3,
  Save,
  BarChart3,
  CheckCircle2,
  MinusCircle,
  Activity,
  Hourglass,
  RefreshCw,
  RotateCw
} from 'lucide-react';

console.log('App.jsx: Module loaded');
import { uploadToAzure } from './lib/azureClient';
import { getAllEntities, TABLES, upsertEntity } from './lib/azureDb';
import { initGoogleAuth, signOutGoogle, signInWithGoogleCustom } from './lib/googleAuth';
import logoImg from './assets/logo.png';

// --- Constants ---
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// --- Helpers ---
const getEmbedUrl = (url) => {
  if (!url) return null;
  // Handle Google Drive links
  if (url.includes('drive.google.com')) {
    const fileId = url.match(/\/d\/(.+?)\//)?.[1] || url.match(/id=(.+?)(&|$)/)?.[1];
    if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  return url;
};

const getAvatarInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
  return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
};

const HEALTH_QUOTES = [
  "Health is a state of body. Wellness is a state of being.",
  "Your body hears everything your mind says.",
  "The first wealth is health.",
  "A healthy outside starts from the inside.",
  "Keep your vitality. A life without health is like a river without water.",
  "Exercise is king. Nutrition is queen. Put them together and you've got a kingdom.",
  "The human body is the best picture of the human soul.",
  "To ensure good health: eat lightly, breathe deeply, live moderately, cultivate cheerfulness.",
  "Success is nothing without health.",
  "Take care of your body. It's the only place you have to live."
];

// --- Components ---

const SkeletonTask = () => (
  <div className="skeleton-card" style={{
    padding: '24px',
    background: 'white',
    borderRadius: '24px',
    marginBottom: '16px',
    border: '1px solid rgba(0,0,0,0.03)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div style={{ flex: 1 }}>
        <div className="shimmer" style={{ width: '60%', height: '24px', borderRadius: '8px', marginBottom: '8px' }} />
        <div className="shimmer" style={{ width: '90%', height: '14px', borderRadius: '6px' }} />
      </div>
      <div className="shimmer" style={{ width: '40px', height: '20px', borderRadius: '6px' }} />
    </div>
    <div className="shimmer" style={{ width: '100%', height: '50px', borderRadius: '16px' }} />
  </div>
);

// Add this to your global style tag or create one if it doesn't exist
const globalStyles = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes storyFill {
    from { width: 0% }
    to   { width: 100% }
  }
  .shimmer {
    background: linear-gradient(90deg, #f5f2e9 25%, #eeebe1 50%, #f5f2e9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite linear;
  }
  .skeleton-card {
    overflow: hidden;
  }
`;


const RulesContent = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    {/* Submission Deadlines */}
    <div style={{ padding: '20px', background: 'var(--hb-cream)', borderRadius: '20px', border: '1px solid rgba(159, 64, 34, 0.1)' }}>
      <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '4px', height: '16px', background: 'var(--accent)', borderRadius: '2px' }} />
        Submission Deadlines
      </h3>
      <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <li>All tasks must be submitted by <strong>11:59 PM</strong> every day, with no exceptions.</li>
        <li>Late submissions will automatically result in <strong>0 points</strong>.</li>
        <li>Missing a day does not end your challenge; you just need to get back on track the following morning.</li>
      </ul>
    </div>

    {/* Proof Standards */}
    <div style={{ padding: '20px', background: 'var(--hb-cream)', borderRadius: '20px', border: '1px solid rgba(159, 64, 34, 0.1)' }}>
      <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '4px', height: '16px', background: 'var(--accent)', borderRadius: '2px' }} />
        Proof Standards
      </h3>
      <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <li>All proof must be submitted as <strong>photos</strong>.</li>
        <li>Videos are not required for any task.</li>
        <li>Every submitted photo must be clear.</li>
        <li>Proof must be taken on the <strong>actual day</strong> you are making the submission.</li>
        <li>Pre-taken, recycled, or blurry photos are not accepted and will be rejected.</li>
        <li>Do not reuse the same photo on different days.</li>
      </ul>
    </div>

    {/* Scoring & Moderation */}
    <div style={{ padding: '20px', background: 'var(--hb-cream)', borderRadius: '20px', border: '1px solid rgba(159, 64, 34, 0.1)' }}>
      <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '4px', height: '16px', background: 'var(--accent)', borderRadius: '2px' }} />
        Scoring & Moderation
      </h3>
      <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <li>Each fully completed task with valid photo proof earns <strong>10 points</strong> per day.</li>
        <li>All decisions made by the moderators are final.</li>
        <li>If the backend team rejects or partially credits a submission, their decision stands.</li>
      </ul>
    </div>

    {/* Bonus Section Header */}
    <div style={{ margin: '8px 0', textAlign: 'center' }}>
      <h2 style={{ fontSize: '22px', fontFamily: 'var(--font-heading)', color: 'var(--accent)', margin: 0 }}>Bonus Point Opportunities</h2>
    </div>

    {/* Social Media Bonus */}
    <div style={{ padding: '20px', background: 'rgba(255, 215, 0, 0.05)', borderRadius: '20px', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
      <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#B8860B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '4px', height: '16px', background: '#B8860B', borderRadius: '2px' }} />
        Social Media Bonus (+5 Points)
      </h3>
      <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <li>Share your progress with others to earn extra points!</li>
        <li>Upload a story while you are completing a task and tag <strong>@hopwith_hb</strong> to claim this bonus.</li>
      </ul>
    </div>

    {/* Health Assessment Bonus */}
    <div style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(159, 64, 34, 0.05) 0%, rgba(159, 64, 34, 0.1) 100%)', borderRadius: '20px', border: '1px solid var(--accent)' }}>
      <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '4px', height: '16px', background: 'var(--accent)', borderRadius: '2px' }} />
        The HB+ Health Assessment Bonus (+100 Points)
      </h3>
      <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <li>This is the <strong>biggest bonus</strong> in the game!</li>
        <li>You earn 50 points for completing the Physical Assessment and 50 points for the Nutrition Assessment.</li>
        <li><strong>Booking Window:</strong> You must book your slot between Day 5 (17th April, Friday) and Day 14 (26th April, Sunday).</li>
        <li><strong>Completion Deadline:</strong> You must complete the assessment before Day 15 (last date to take the assessment is Day 14 - 26th April, Sunday).</li>
        <li><strong style={{ color: '#c0392b' }}>Warning:</strong> If you miss Day 14, you forfeit the entire bonus, so do not sleep on this!</li>
      </ul>
    </div>

    <p style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--text-tertiary)', textAlign: 'center', margin: '0' }}>
      Note: Refer to the shared Playbook for Detailed breakdown and explanation.
    </p>
  </div>
);

const RulesGatekeeper = ({ onAccept }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        style={{ background: 'white', width: '100%', maxWidth: '500px', maxHeight: '90vh', borderRadius: '32px', padding: '32px', overflowY: 'auto', position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.4)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <ShieldCheck size={40} color="var(--accent)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', margin: 0 }}>Operational Protocols</h2>
          <p style={{ fontSize: '13px', opacity: 0.6, marginTop: '4px' }}>Please review and accept our guidelines to proceed</p>
        </div>

        <RulesContent />

        <div style={{ marginTop: '32px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '32px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '20px' }}>
            <input 
              type="checkbox" 
              checked={agreed} 
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ width: '24px', height: '24px', accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.4' }}>
              I strictly agree to follow all Rules & Guidelines for the HB+ 21-Day Challenge.
            </span>
          </label>
          <button
            disabled={!agreed}
            onClick={onAccept}
            style={{ 
              width: '100%', 
              padding: '20px', 
              background: agreed ? 'var(--text-primary)' : '#ccc', 
              color: 'white', 
              borderRadius: '16px', 
              border: 'none', 
              fontWeight: '900', 
              cursor: agreed ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.3s'
            }}
          >
            Accept & Initialize Profile
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const TaskCard = ({ task, onAction, isLocked, isHistory, minimal = false, scheduledTime }) => {
  const [localFile, setLocalFile] = useState(null);
  const [localPreview, setLocalPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [consentToFeed, setConsentToFeed] = useState(false);
  const [currentQuote, setCurrentQuote] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const fileInputRef = useRef(null);
  const nativeCameraRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const videoUrl = getEmbedUrl(task.video_url);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image only (JPG/PNG).');
      return;
    }

    setLocalFile(file);
    setLocalPreview(URL.createObjectURL(file));
  };

  const handleConfirm = async () => {
    setCurrentQuote(HEALTH_QUOTES[Math.floor(Math.random() * HEALTH_QUOTES.length)]);
    setIsUploading(true);
    try {
      await onAction(task, localFile, consentToFeed);
    } catch (err) {
      console.error(err);
    }
    setIsUploading(false);
    setLocalFile(null);
    setLocalPreview(null);
    setConsentToFeed(false);
  };

  const startCamera = async (mode = facingMode) => {
    // Stop any existing stream first
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support camera access or is not using a secure (HTTPS) connection.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (err) {
      console.error('Camera access error:', err);
      // Fallback for some browsers that don't support constraints well
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setCameraStream(stream);
        setShowCamera(true);
      } catch (e2) {
        console.error('Second camera attempt failed:', e2);
        alert('Camera access denied. Please ensure you have granted permission in your browser settings.');
      }
    }
  };

  const switchCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  useEffect(() => {
    if (showCamera && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [showCamera, cameraStream]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Ensure video dimensions are available
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Mirror the photo if using front camera
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0, width, height);
    
    canvas.toBlob((blob) => {
      if (!blob) {
        alert('Failed to capture photo. Please try again.');
        return;
      }
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setLocalFile(file);
      setLocalPreview(URL.createObjectURL(file));
      stopCamera();
    }, 'image/jpeg', 0.90);
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
    }
    setCameraStream(null);
    setShowCamera(false);
  };

  const statusBadgeStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px',
    borderRadius: '16px',
    fontSize: '15px',
    fontWeight: '700',
    transition: 'all 0.2s',
    border: '1px solid rgba(0,0,0,0.1)'
  };

  const getStatusButton = () => {
    if (isUploading) {
      return (
        <div className="status-badge" style={{ ...statusBadgeStyle, width: '100%', backgroundColor: '#fcfaf5', color: '#9f4022' }}>
          <Clock size={18} style={{ marginRight: '8px' }} /> Uploading...
        </div>
      );
    }

    if (localFile) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee' }}>
            <img src={localPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(159,64,34,0.04)', borderRadius: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={consentToFeed}
              onChange={(e) => setConsentToFeed(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#9f4022', cursor: 'pointer', flexShrink: 0 }}
            />
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#53372b' }}>Share this to the batch feed</span>
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setLocalFile(null); setLocalPreview(null); setConsentToFeed(false); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #eee', background: 'white', fontWeight: 'bold' }}>Cancel</button>
            <button onClick={handleConfirm} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#9f4022', color: 'white', fontWeight: 'bold' }}>Confirm</button>
          </div>
        </div>
      );
    }

    if (isLocked) return <div style={{ color: 'rgba(0,0,0,0.2)', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', width: '100%' }}>Locked · Available Day {task.day}</div>;

    // Lock historical tasks — clients cannot upload for past days
    if (isHistory && (task.status === 'pending' || task.status === 'retry' || !task.status)) {
      return (
        <div style={{ ...statusBadgeStyle, backgroundColor: 'rgba(210, 116, 64, 0.05)', color: '#d27440', border: '1px solid rgba(210, 116, 64, 0.2)' }}>
          <Clock size={16} style={{ marginRight: '8px' }} /> Protocol Expired
        </div>
      );
    }

    switch (task.status) {
      case 'pending':
      case 'retry':
        return (
          <>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }} 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <input 
              type="file" 
              ref={nativeCameraRef} 
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }} 
              accept="image/*" 
              capture="environment" 
              onChange={handleFileChange} 
            />
            {task.rejection_comment && (
              <p style={{ margin: '0 0 12px 0', padding: '10px 14px', background: 'rgba(210, 116, 64, 0.08)', color: '#d27440', borderRadius: '12px', fontSize: '11px', fontWeight: '600', borderLeft: '3px solid #d27440' }}>
                INSTRUCTION: {task.rejection_comment}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              {task.proof_mode === 'checkbox' ? (
                <button
                  className="status-badge"
                  style={{ ...statusBadgeStyle, width: '100%', backgroundColor: '#6f8e7c', color: 'white', border: 'none', cursor: 'pointer' }}
                  onClick={() => {
                    console.log('Checkbox confirmed for task:', task.id);
                    onAction(task, null);
                  }}
                >
                  <CheckCircle size={18} style={{ marginRight: '8px' }} /> Confirm Task completeion
                </button>
              ) : (
                <>
                  {(task.proof_mode === 'capture' || task.proof_mode === 'both' || !task.proof_mode) && (
                    <button
                      className="status-badge"
                      style={{ ...statusBadgeStyle, width: '100%', backgroundColor: '#53372b', color: 'white', border: 'none', cursor: 'pointer' }}
                      onClick={() => {
                        console.log('Take Photo clicked. Detecting device...');
                        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                        console.log('Is Mobile?', isMobile);
                        
                        if (isMobile) {
                          console.log('Triggering native camera input');
                          nativeCameraRef.current?.click();
                        } else {
                          console.log('Starting in-browser camera');
                          startCamera();
                        }
                      }}
                    >
                      <Camera size={18} style={{ marginRight: '8px' }} /> Take Photo
                    </button>
                  )}
                  {(task.proof_mode === 'upload' || task.proof_mode === 'both' || !task.proof_mode) && (
                    <button
                      className="status-badge"
                      style={{ ...statusBadgeStyle, width: '100%', backgroundColor: 'white', color: '#53372b', border: '1px solid #53372b', cursor: 'pointer' }}
                      onClick={() => {
                        console.log('Upload from Gallery clicked');
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload size={18} style={{ marginRight: '8px' }} /> Upload from Gallery
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        );
      case 'under-review':
        return (
          <div className="status-badge" style={{ ...statusBadgeStyle, width: '100%', backgroundColor: '#f5f2e9', color: '#53372b', border: '1px solid #53372b' }}>
            <Clock size={18} style={{ marginRight: '8px' }} /> Under Review
          </div>
        );
      case 'approved':
        return (
          <div className="status-badge" style={{ ...statusBadgeStyle, width: '100%', backgroundColor: '#fcfaf5', color: '#6f8e7c', border: '1px solid #6f8e7c' }}>
            <CheckCircle size={18} style={{ marginRight: '8px' }} /> Approved (+{task.points} pts)
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
      {/* In-Browser Camera Modal - works on both mobile & desktop */}
      {showCamera && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: '#000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ width: '100%', maxWidth: '600px', position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              📷 Camera Mode
            </div>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div style={{ display: 'flex', gap: '16px', padding: '24px', width: '100%', maxWidth: '600px', flexShrink: 0 }}>
            <button
              onClick={switchCamera}
              style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <RefreshCw size={20} /> Flip
            </button>
            <button
              onClick={stopCamera}
              style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              Cancel
            </button>
            <button
              onClick={capturePhoto}
              style={{ flex: 2, padding: '16px', background: '#9f4022', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Camera size={20} /> Capture Photo
            </button>
          </div>
        </div>
      )}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 100,
              background: 'rgba(255, 255, 255, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '24px',
              backdropFilter: 'blur(4px)'
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                width: '60px',
                height: '60px',
                border: '3px solid var(--hb-cream)',
                borderTop: '3px solid var(--accent)',
                borderRadius: '50%',
                marginBottom: '24px'
              }}
            />
            <p style={{
              fontSize: '18px',
              fontStyle: 'italic',
              color: 'var(--text-primary)',
              maxWidth: '280px',
              lineHeight: '1.4',
              fontFamily: "'Bodoni Moda', serif",
              fontWeight: '800'
            }}>
              "{currentQuote}"
            </p>
            <p style={{
              marginTop: '16px',
              fontSize: '10px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'var(--accent)',
              opacity: 0.8
            }}>
              Encrypting Protocol...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      {videoUrl && (
        <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
          <iframe
            src={videoUrl}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            allow="autoplay"
            title={task.title}
          />
        </div>
      )}
      <div style={{ padding: '24px' }}>
        {!minimal && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '4px', color: 'var(--text-primary)' }}>{task.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{task.description || 'Follow the protocol above and upload your proof below.'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              {task.points && <div style={{ fontWeight: 'bold', color: 'var(--accent)', fontSize: '18px' }}>+{task.points} pts</div>}
              {scheduledTime && (
                <div style={{ fontSize: '10px', color: 'rgba(83, 55, 43, 0.4)', fontWeight: 'bold', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  <Clock size={10} /> Live @ {scheduledTime}
                </div>
              )}
            </div>
          </div>
        )}
        {getStatusButton()}
      </div>
    </div>
  );
};
// --- Pages ---
// --- Pages ---

const WaitingScreen = ({ profile }) => {
  return (
    <div className="grid-bg" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
      {/* Top Header Mockup */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: '#333', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '14px' }}>21</div>
          <span style={{ fontWeight: '800', color: '#53372b', fontSize: '18px' }}>21 Days</span>
          <div style={{ background: 'white', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', background: '#6f8e7c', borderRadius: '50%' }} /> System online
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'white', padding: '4px 16px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', fontSize: '10px', fontWeight: 'bold', color: 'rgba(0,0,0,0.4)' }}>
            v2.4 ΓÇó Wait queue
          </div>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
            {profile?.name?.[0] || 'A'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', width: '100%' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(159, 64, 34, 0.05)', padding: '6px 16px', borderRadius: '30px', border: '1px solid rgba(159, 64, 34, 0.1)', marginBottom: '32px' }}>
          <div style={{ width: '4px', height: '4px', background: 'var(--accent)', borderRadius: '50%' }} />
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent)' }}>Hold tight, {profile?.name?.split(' ')[0]} ΓÇó You're in the queue</span>
        </div>

        <h1 style={{ fontSize: '72px', color: '#53372b', lineHeight: '1', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
          Welcome to your <span style={{ color: 'var(--accent)' }}>21 Days</span> <span style={{ fontStyle: 'italic', opacity: 0.8 }}>Transformation</span> <span style={{ fontWeight: '400' }}>Journey</span>
        </h1>

        <p style={{ fontSize: '18px', color: 'rgba(83, 55, 43, 0.6)', maxWidth: '580px', margin: '0 auto', lineHeight: '1.6', fontWeight: '500' }}>
          Our team is assigning you to the perfect batch based on your goals, schedule, and training experience. This usually takes a few minutes ΓÇö make yourself comfortable.
        </p>

        {/* Loading Indicator */}
        <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const WildcardCard = ({ card, onAction }) => {
  const [isMediaReady, setIsMediaReady] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const videoUrl = getEmbedUrl(card.video_url);
  const imageUrl = card.image_url;

  // Smart Detection: Check if Google has generated a thumbnail yet
  useEffect(() => {
    if (!videoUrl || isMediaReady) return;

    const fileId = card.video_url.match(/\/d\/(.+?)\//)?.[1] || card.video_url.match(/id=(.+?)(&|$)/)?.[1];
    if (!fileId) {
      setIsMediaReady(true);
      return;
    }

    const checkThumbnail = async () => {
      try {
        const thumbUrl = `https://lh3.googleusercontent.com/u/0/d/${fileId}=w400-h225-p-k-no-nu`;
        await fetch(thumbUrl, { method: 'HEAD', mode: 'no-cors' });
        setIsMediaReady(true);
      } catch (e) {
        if (checkCount < 5) {
          setTimeout(() => setCheckCount(c => c + 1), 2000);
        } else {
          setIsMediaReady(true);
        }
      }
    };
    checkThumbnail();
  }, [videoUrl, checkCount, isMediaReady, card.video_url]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card"
      style={{ padding: '0', overflow: 'hidden', borderLeft: '4px solid var(--accent)' }}
    >
      {videoUrl ? (
        <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
          <AnimatePresence>
            {!isMediaReady && (
              <motion.div
                exit={{ opacity: 0 }}
                style={{ position: 'absolute', inset: 0, zIndex: 2, background: '#1a1a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              >
                <div className="shimmer" style={{ width: '60px', height: '60px', borderRadius: '50%', marginBottom: '16px' }} />
                <p style={{ color: 'white', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Syncing Media Protocol...</p>
                <button 
                  onClick={() => setIsMediaReady(true)}
                  style={{ marginTop: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '10px', cursor: 'pointer' }}
                >
                  I'll wait
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <iframe
            src={videoUrl}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', zIndex: 1 }}
            allow="autoplay; fullscreen"
            title="Protocol Video"
          />
        </div>
      ) : imageUrl && (
        <div style={{ width: '100%', height: '270px', background: '#f5f5f5', overflow: 'hidden' }}>
          <img src={imageUrl} alt="Broadcast" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ color: 'var(--accent)', marginTop: '4px' }}>
            {videoUrl ? <Video size={20} /> : <MessageSquare size={20} />}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '16px', color: '#53372b', fontWeight: '800', lineHeight: '1.4' }}>{card.text || card.title}</p>
            {(card.description) && <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(83, 55, 43, 0.6)', fontWeight: '500' }}>{card.description}</p>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <div style={{ fontSize: '10px', fontWeight: '900', color: 'var(--accent)', textTransform: 'uppercase', background: 'rgba(159, 64, 34, 0.08)', padding: '4px 8px', borderRadius: '6px' }}>
                +{card.points || 50} Wildcard Points
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
            <Clock size={14} />
            <span style={{ fontSize: '11px', fontWeight: 'bold' }}>
              {card.deadline ? `EXPIRING: ${new Date(card.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'No Deadline'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button
              onClick={() => onAction(card.id, 'reject')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', fontWeight: '700', fontSize: '12px', cursor: 'pointer', padding: '4px 0' }}
            >
              Dismiss
            </button>
            <button
              onClick={() => onAction(card.id, 'interested')}
              style={{ background: 'var(--accent)', border: 'none', color: 'white', fontWeight: 'bold', fontSize: '12px', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(159, 64, 34, 0.2)', whiteSpace: 'nowrap' }}
            >
              Accept Wildcard
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const HomePage = ({ tasks = [], flashCards = [], currentDay, selectedDay, onSelectDay, onUpload, onFlashcardAction, profile, batch, feedPosts = [] }) => {
  const isIndependent = !profile?.batch_id;
  const weekNum = Math.ceil(selectedDay / 7);
  const weekTitles = ["Foundation", "Commitment", "Ascension", "Mastery"];
  const [storyIdx, setStoryIdx] = useState(null);
  const [storyPaused, setStoryPaused] = useState(false);
  const [reactions, setReactions] = useState({});
  const [viewedIds, setViewedIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(`ss_${profile?.id}`) || '[]')); }
    catch { return new Set(); }
  });
  const [reactionAnim, setReactionAnim] = useState(null);

  const isHistory = selectedDay < currentDay;
  const isLocked = selectedDay > currentDay;

  if (isIndependent) {
    return <WaitingScreen profile={profile} />;
  }

  const storyPost = storyIdx !== null ? feedPosts[storyIdx] : null;
  const hoursLeft = (post) => {
    const pub = new Date(post.feed_published_at || post.processed_at || post.created_at);
    return Math.max(0, Math.ceil((pub.getTime() + 24 * 60 * 60 * 1000 - Date.now()) / 3600000));
  };
  const advanceStory = () => {
    setStoryIdx(i => {
      if (i === null) return null;
      return i < feedPosts.length - 1 ? i + 1 : null;
    });
  };

  useEffect(() => {
    if (!feedPosts.length) return;
    (async () => {
      const allReac = await getAllEntities('StoryReactions').catch(() => []);
      const map = {};
      feedPosts.forEach(post => {
        const pr = (allReac || []).filter(r => (r.partitionKey || r.PartitionKey) === post.id);
        map[post.id] = {
          fire: pr.filter(r => r.type === 'fire').length,
          muscle: pr.filter(r => r.type === 'muscle').length,
          mine: pr.find(r => (r.rowKey || r.RowKey) === profile?.id)?.type || null
        };
      });
      setReactions(map);
    })();
  }, [feedPosts.length]);

  const openStory = (idx) => {
    setStoryIdx(idx);
    const post = feedPosts[idx];
    if (!post || !profile?.id || viewedIds.has(post.id)) return;
    const next = new Set(viewedIds);
    next.add(post.id);
    setViewedIds(next);
    try { localStorage.setItem(`ss_${profile.id}`, JSON.stringify([...next])); } catch {}
    upsertEntity('StoryViews', { partitionKey: post.id, rowKey: profile.id, viewed_at: new Date().toISOString() }).catch(() => {});
  };

  const handleReact = async (subId, type) => {
    const cur = reactions[subId] || { fire: 0, muscle: 0, mine: null };
    const toggle = cur.mine === type;
    setReactions(prev => ({
      ...prev,
      [subId]: {
        fire: (cur.fire || 0) + (type === 'fire' ? (toggle ? -1 : 1) : 0),
        muscle: (cur.muscle || 0) + (type === 'muscle' ? (toggle ? -1 : 1) : 0),
        mine: toggle ? null : type
      }
    }));
    if (!toggle) setReactionAnim({ type, key: Date.now() });
    await upsertEntity('StoryReactions', { partitionKey: subId, rowKey: profile?.id, type: toggle ? null : type }).catch(() => {});
  };

  useEffect(() => {
    const html = document.documentElement;
    if (storyPost) {
      html.style.overflow = 'hidden';
    } else {
      html.style.overflow = '';
    }
    return () => { html.style.overflow = ''; };
  }, [storyPost]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-container">

      {/* Stories Strip */}
      {feedPosts.length > 0 && (
        <div style={{ marginBottom: '28px', marginLeft: '-16px', marginRight: '-16px', paddingLeft: '16px' }}>
          <div style={{ overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ display: 'flex', gap: '16px', paddingRight: '16px', width: 'max-content' }}>
              {feedPosts.map((post, idx) => {
                const seen = viewedIds.has(post.id);
                const featured = post.is_featured === true || post.is_featured === 'true';
                return (
                  <div
                    key={post.id}
                    onClick={() => openStory(idx)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: '62px', height: '62px', borderRadius: '50%', flexShrink: 0,
                        background: featured
                          ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 60%, #FFD700 100%)'
                          : seen
                            ? 'rgba(83,55,43,0.15)'
                            : 'linear-gradient(135deg, #9f4022 0%, #c99d5d 60%, #d27440 100%)',
                        padding: '2.5px'
                      }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2.5px solid #fcfaf5', overflow: 'hidden', background: '#f0ebe3' }}>
                          {post.file_url && !isVideoUrl(post.file_url) ? (
                            <img src={post.file_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '20px', color: '#9f4022' }}>
                              {(post.prof?.name || '?')[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      {featured && (
                        <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', fontSize: '14px', lineHeight: 1 }}>⭐</span>
                      )}
                      {!seen && !featured && (
                        <span style={{ position: 'absolute', top: 0, right: 0, width: '13px', height: '13px', background: '#9f4022', borderRadius: '50%', border: '2px solid #fcfaf5' }} />
                      )}
                    </div>
                    <span style={{ fontSize: '10px', color: seen ? 'rgba(83,55,43,0.4)' : '#53372b', fontWeight: '700', maxWidth: '62px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.prof?.name?.split(' ')[0] || 'Member'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Story Viewer */}
      {createPortal(
        <AnimatePresence>
          {storyPost && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9500, background: '#000', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                maxWidth: '430px',
                overflow: 'hidden',
                background: '#000',
              }}
              onMouseDown={() => setStoryPaused(true)}
              onMouseUp={() => setStoryPaused(false)}
              onTouchStart={() => setStoryPaused(true)}
              onTouchEnd={() => setStoryPaused(false)}
            >
              {/* Media — fills full screen */}
              <div style={{ position: 'absolute', inset: 0 }}>
                {storyPost.file_url ? (
                  isVideoUrl(storyPost.file_url)
                    ? <video key={storyPost.id} src={storyPost.file_url} autoPlay playsInline muted={false} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <img key={storyPost.id} src={storyPost.file_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1009' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#9f4022', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: 'white', fontWeight: '900' }}>
                      {(storyPost.prof?.name || '?')[0].toUpperCase()}
                    </div>
                  </div>
                )}
              </div>

              {/* Top gradient */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)', zIndex: 5, pointerEvents: 'none' }} />

              {/* Bottom gradient */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)', zIndex: 5, pointerEvents: 'none' }} />

              {/* Progress bars */}
              <div style={{ position: 'absolute', top: '52px', left: '12px', right: '12px', display: 'flex', gap: '4px', zIndex: 10 }}>
                {feedPosts.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: '2px', borderRadius: '2px', background: 'rgba(255,255,255,0.35)', overflow: 'hidden' }}>
                    {i < storyIdx && (
                      <div style={{ width: '100%', height: '100%', background: 'white', borderRadius: '2px' }} />
                    )}
                    {i === storyIdx && (
                      <div
                        key={`fill-${storyIdx}`}
                        onAnimationEnd={advanceStory}
                        style={{
                          height: '100%',
                          background: 'white',
                          borderRadius: '2px',
                          animation: 'storyFill 5s linear forwards',
                          animationPlayState: storyPaused ? 'paused' : 'running',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Day badge */}
              {(storyPost.tasks?.day || storyPost.task?.day) && (
                <div style={{ position: 'absolute', top: '72px', left: '14px', zIndex: 11, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '5px', pointerEvents: 'none' }}>
                  <span style={{ fontSize: '11px', fontWeight: '900', color: 'white', letterSpacing: '0.03em' }}>Day {storyPost.tasks?.day || storyPost.task?.day}</span>
                  <span style={{ fontSize: '10px', color: '#c99d5d' }}>✓</span>
                </div>
              )}

              {/* Reaction pop animation */}
              {reactionAnim && (
                <div key={reactionAnim.key} style={{ position: 'absolute', bottom: '200px', left: '50%', zIndex: 20, fontSize: '42px', animation: 'reactPop 0.8s ease-out forwards', pointerEvents: 'none' }}>
                  {reactionAnim.type === 'fire' ? '🔥' : '💪'}
                </div>
              )}

              {/* User info — bottom overlay */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 20px 36px', zIndex: 8 }}>
                {storyPost.admin_shoutout && (
                  <div style={{ marginBottom: '12px', background: 'rgba(159,64,34,0.35)', backdropFilter: 'blur(8px)', borderRadius: '10px', padding: '8px 14px', borderLeft: '3px solid #c99d5d' }}>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#FFE4B5', fontStyle: 'italic' }}>"{storyPost.admin_shoutout}"</p>
                    <p style={{ margin: '3px 0 0 0', fontSize: '9px', fontWeight: '900', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Admin Shoutout</p>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: (storyPost.is_featured === true || storyPost.is_featured === 'true') ? 'linear-gradient(135deg, #FFD700, #FFA500)' : '#9f4022', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '14px', flexShrink: 0 }}>
                        {(storyPost.prof?.name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{storyPost.prof?.name}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {storyPost.prof?.team_name || 'Independent'} · {hoursLeft(storyPost)}h left
                        </p>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>
                      {storyPost.tasks?.title || storyPost.task?.title || storyPost.card?.text || 'Submission'}
                      {(storyPost.tasks?.points || storyPost.task?.points) ? <span style={{ color: '#c99d5d', fontWeight: '800' }}> · +{storyPost.tasks?.points || storyPost.task?.points} pts</span> : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                    {[{ type: 'fire', emoji: '🔥' }, { type: 'muscle', emoji: '💪' }].map(({ type, emoji }) => {
                      const cur = reactions[storyPost.id] || { fire: 0, muscle: 0, mine: null };
                      const count = cur[type] || 0;
                      const active = cur.mine === type;
                      return (
                        <button
                          key={type}
                          onClick={(e) => { e.stopPropagation(); handleReact(storyPost.id, type); }}
                          style={{ background: active ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: `1.5px solid ${active ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}`, borderRadius: '20px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', zIndex: 20, position: 'relative' }}
                        >
                          <span style={{ fontSize: '16px', lineHeight: 1 }}>{emoji}</span>
                          {count > 0 && <span style={{ fontSize: '11px', fontWeight: '800', color: 'white' }}>{count}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Prev tap zone */}
              <div
                style={{ position: 'absolute', top: 0, left: 0, width: '35%', height: '100%', cursor: 'pointer', zIndex: 6 }}
                onClick={(e) => { e.stopPropagation(); setStoryIdx(i => Math.max(0, i - 1)); }}
              />
              {/* Next tap zone */}
              <div
                style={{ position: 'absolute', top: 0, right: 0, width: '35%', height: '100%', cursor: 'pointer', zIndex: 6 }}
                onClick={(e) => { e.stopPropagation(); advanceStory(); }}
              />

              {/* Close */}
              <button
                onClick={() => setStoryIdx(null)}
                style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(0,0,0,0.4)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 11, backdropFilter: 'blur(4px)' }}
              >
                <X size={15} />
              </button>
            </motion.div>
          </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--accent)', fontWeight: '800', marginBottom: '8px' }}>Week {weekNum} — {weekTitles[weekNum - 1]}</h2>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', color: 'var(--text-primary)', margin: '0' }}>Day {selectedDay} of 21</h1>
        <p style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '4px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {(() => {
            const now = new Date();
            const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (currentDay - selectedDay));
            return targetDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
          })()}
        </p>
      </div>

      {/* Progress Grid */}
      <div style={{ marginBottom: '40px' }}>
        <h1 className="section-title">21-Day Progress</h1>
        <div className="day-grid">
          {Array.from({ length: 21 }, (_, i) => i + 1).map(d => (
            <div key={d} onClick={() => onSelectDay(d)} style={{ cursor: 'pointer' }}>
              <div className={`day-card ${d === selectedDay ? 'active' : ''} ${d < currentDay ? 'completed' : ''} ${d > currentDay ? 'locked' : ''}`}>
                <span style={{ fontSize: '10px', opacity: 0.5, marginBottom: '2px' }}>DAY</span>
                <span style={{ fontSize: '16px' }}>{d}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <>
        {flashCards.length > 0 && (
          <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>Active Wildcard Opportunities</p>
            {flashCards.map(card => (
              <WildcardCard key={card.id} card={card} onAction={onFlashcardAction} />
            ))}
          </div>
        )}

        <h1 className="section-title" style={{ marginTop: '40px' }}>{isLocked ? "Protocols Locked" : (isHistory ? "Protocol History" : "Active Protocols")}</h1>
        
        <div className="task-list-grid">
          {isLocked ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px', opacity: 0.5 }}>
              <Lock size={48} style={{ margin: '0 auto 24px', color: 'var(--accent)' }} />
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Locked Experience</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>This sequence launches on Day {selectedDay}.</p>
            </div>
          ) : (
            (tasks?.length || 0) === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                <SkeletonTask />
                <SkeletonTask />
                <SkeletonTask />
              </div>
            ) : (
              tasks?.map(task => {
                const now = Date.now();
                const goLiveAt = task.go_live_at ? new Date(task.go_live_at).getTime() : null;
                
                // Secondary fallback for current day tasks
                let isNotYetLive = !isHistory && goLiveAt && goLiveAt > now;
                
                if (!isNotYetLive && !isHistory && !isLocked && task.go_live_time) {
                   const [h, m] = task.go_live_time.split(':').map(Number);
                   const today = new Date();
                   const releaseToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), h || 0, m || 0, 0, 0).getTime();
                   if (releaseToday > now) isNotYetLive = true;
                }

                if (isNotYetLive) {
                  const diffMs = goLiveAt - now;
                  const diffH = Math.floor(diffMs / 3600000);
                  const diffM = Math.floor((diffMs % 3600000) / 60000);
                  return (
                    <div key={task.id} className="card" style={{ opacity: 0.65, borderLeft: '4px solid var(--accent)', filter: 'grayscale(0.3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <Lock size={18} color="var(--accent)" />
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{task.title}</p>
                      </div>
                      <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{task.description}</p>
                      <div style={{ background: 'rgba(159,64,34,0.06)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={16} color="var(--accent)" />
                        <div>
                          <p style={{ margin: 0, fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)' }}>Unlocks in</p>
                          <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                            {diffH > 0 ? `${diffH}h ${diffM}m` : `${diffM}m`}
                          </p>
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 'bold', color: 'var(--accent)', opacity: 0.7 }}>
                          {task.go_live_time} IST
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onAction={onUpload}
                    isHistory={isHistory}
                    isLocked={isLocked}
                    scheduledTime={task.go_live_time}
                  />
                );
              })
            )
          )}
        </div>
      </>
    </motion.div>
  );
};

const BoardPage = ({ leaderboard = [], profile, currentDay }) => {
  const [category, setCategory] = useState('Individual');
  const [timeframe, setTimeframe] = useState('Overall');
  const [lbDay, setLbDay] = useState(currentDay || 1);
  const [lbWeek, setLbWeek] = useState(Math.ceil((currentDay || 1) / 7));
  const [pointsData, setPointsData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [liveOverall, setLiveOverall] = useState([]);

  const [refreshTick, setRefreshTick] = useState(0);
  const categories = ['Individual', 'Teams'];
  const timeframes = ['Daily', 'Weekly', 'Overall'];

  // --- Polling Sync for "Live" Leaderboard ---
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTick(t => t + 1);
    }, 60000); // 1 minute polling

    return () => clearInterval(interval);
  }, []);


  // Sync selectors when currentDay is resolved
  useEffect(() => {
    if (currentDay) {
      setLbDay(currentDay);
      setLbWeek(Math.ceil(currentDay / 7));
    }
  }, [currentDay]);

  // Fetch when day/week or refresh tick changes
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const [allTasks, allSubs, allAwards, allFlashcards, allProfiles, allBatches] = await Promise.all([
          getAllEntities(TABLES.TASKS),
          getAllEntities(TABLES.SUBMISSIONS),
          getAllEntities(TABLES.MANUAL_AWARDS),
          getAllEntities(TABLES.FLASHCARDS),
          getAllEntities(TABLES.PROFILES),
          getAllEntities(TABLES.FLASHCARDS).then(cards => cards.filter(e => (e.partitionKey === "CONFIG_BATCH" || e.PartitionKey === "CONFIG_BATCH")))
        ]);

        if (cancelled) return;

        // BATCH ISOLATION: Only show members of MY batch
        const batchProfiles = allProfiles.filter(p => p.batch_id === profile.batch_id);
        const batchUserIds = batchProfiles.map(p => p.rowKey || p.RowKey);
        setLiveOverall(batchProfiles);

        // Find Batch Start Date
        const batchConfig = allBatches.find(b => (b.rowKey || b.RowKey) === profile.batch_id);
        const batchStart = batchConfig?.start_date ? new Date(batchConfig.start_date) : new Date();

        const up = {};
        const get = (id) => up[id] || (up[id] = { daily: 0, weekly: 0, overall: 0 });

        // Filter submissions to only those from this batch
        const batchSubs = allSubs.filter(s => {
          const uid = s.user_id || s.User_id;
          return batchUserIds.includes(uid) && (s.status === 'approved' || s.Status === 'approved');
        });

        // 1. Process Submissions
        batchSubs.forEach(s => {
          let p = 0;
          let tDay = 0;
          let tWk = 0;
          const uid = s.user_id || s.User_id;
          const tid = s.task_id || s.TaskId || s.Task_id;
          const fid = s.flashcard_id || s.FlashcardId || s.Flashcard_id;

          if (tid) {
            // Fuzzy match: check if the task rowKey contains our tid or vice-versa
            const task = allTasks.find(t => {
              const rk = (t.rowKey || t.RowKey || t.id || '').toString();
              const target = tid.toString();
              return rk === target || rk.includes(target) || target.includes(rk);
            });
            if (task) {
              p = Number(task.points || task.Points) || 0;
              tDay = Number(task.day || task.Day);
              tWk = Number(task.week || task.Week) || Math.ceil(tDay / 7);
            }
          } else if (fid) {
            const fc = allFlashcards.find(f => (f.rowKey || f.RowKey) === fid);
            if (fc) {
              p = Number(fc.points || fc.Points) || 0;
              const subDate = new Date(s.created_at || s.Timestamp);
              const diffTime = subDate.getTime() - batchStart.getTime();
              tDay = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
              tWk = Math.ceil(tDay / 7);
            }
          }

          if (p > 0 && uid) {
            get(uid).overall += p;
            if (tDay === lbDay) get(uid).daily += p;
            if (tWk === lbWeek) get(uid).weekly += p;
          }
        });

        // 2. Process Manual Awards
        allAwards.filter(a => batchUserIds.includes(a.user_id || a.User_id)).forEach(a => {
          const uid = a.user_id || a.User_id;
          const awardDate = new Date(a.created_at || a.Timestamp);
          const diffTime = awardDate.getTime() - batchStart.getTime();
          const aDay = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
          const aWk = Math.ceil(aDay / 7);
          const p = Number(a.points || a.Points) || 0;

          if (uid) {
            get(uid).overall += p;
            if (aDay === lbDay) get(uid).daily += p;
            if (aWk === lbWeek) get(uid).weekly += p;
          }
        });

        setPointsData(up);
      } catch (err) {
        console.error('Leaderboard Fetch Error:', err);
        if (!cancelled) setHasError(true);
      }
      if (!cancelled) setIsLoading(false);
    };
    run();
    return () => { cancelled = true; };
  }, [lbDay, lbWeek, refreshTick, timeframe, profile.batch_id]);

  const displayData = useMemo(() => {
    try {
      const sourceData = liveOverall.length > 0 ? liveOverall : leaderboard;
      const getPoints = (user) => {
        const uid = user.id || user.rowKey || user.RowKey;
        if (!pointsData || !uid) return timeframe === 'Overall' ? (Number(user.points || user.Points) || 0) : 0;
        if (timeframe === 'Overall') return pointsData[uid]?.overall || Number(user.points || user.Points) || 0;
        if (timeframe === 'Daily') return pointsData[uid]?.daily || 0;
        return pointsData[uid]?.weekly || 0;
      };
      if (category === 'Teams') {
        const teamScores = {};
        sourceData.forEach(u => {
          const team = u.team_name || u.TeamName || 'Independent';
          if (team === 'Independent') return;
          teamScores[team] = (teamScores[team] || 0) + getPoints(u);
        });
        return Object.entries(teamScores)
          .map(([name, pts]) => ({ name, points: pts, type: 'team' }))
          .sort((a, b) => b.points - a.points);
      } else {
        return sourceData
          .map(u => {
            const uid = u.id || u.rowKey || u.RowKey;
            return { 
              ...u, 
              id: uid, 
              points: getPoints({ ...u, id: uid }), 
              type: 'user' 
            };
          })
          .sort((a, b) => b.points - a.points);
      }
    } catch (e) {
      console.error('displayData error:', e);
      return [];
    }
  }, [leaderboard, liveOverall, category, timeframe, pointsData]);


  return (
    <div className="page-container leaderboard-container">
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          Real-time performance hierarchy
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', background: 'rgba(83, 55, 43, 0.08)', padding: '6px', borderRadius: '40px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                border: 'none',
                background: category === cat ? 'white' : 'transparent',
                padding: '8px 24px',
                borderRadius: '30px',
                fontSize: '11px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: category === cat ? 'var(--text-primary)' : 'rgba(83, 55, 43, 0.4)',
                cursor: 'pointer',
                boxShadow: category === cat ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '24px' }}>
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            style={{
              border: 'none',
              background: 'transparent',
              padding: '8px 0',
              fontSize: '11px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: timeframe === tf ? 'var(--accent)' : 'rgba(83, 55, 43, 0.3)',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            {tf}
            {timeframe === tf && (
              <motion.div
                layoutId="tf-underline"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'var(--accent)'
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Sub-Selectors for Daily/Weekly */}
      <AnimatePresence mode="wait">
        {timeframe === 'Daily' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            style={{ display: 'flex', gap: '8px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '12px', justifyContent: 'flex-start' }}
          >
            {Array.from({ length: 21 }, (_, i) => i + 1).map(d => (
              <button 
                key={d} 
                onClick={() => setLbDay(d)} 
                style={{ 
                  minWidth: '44px', 
                  height: '44px',
                  borderRadius: '12px', 
                  border: lbDay === d ? 'none' : '1px solid rgba(83, 55, 43, 0.1)', 
                  background: lbDay === d ? 'var(--accent)' : 'white', 
                  color: lbDay === d ? 'white' : 'var(--text-tertiary)', 
                  fontWeight: '800', 
                  fontSize: '11px', 
                  cursor: 'pointer', 
                  flexShrink: 0,
                  boxShadow: lbDay === d ? '0 4px 10px rgba(159, 64, 34, 0.2)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                D{d}
              </button>
            ))}
          </motion.div>
        )}
        {timeframe === 'Weekly' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            style={{ display: 'flex', gap: '12px', marginBottom: '32px', justifyContent: 'center' }}
          >
            {[1, 2, 3].map(w => (
              <button 
                key={w} 
                onClick={() => setLbWeek(w)} 
                style={{ 
                  flex: 1, 
                  maxWidth: '120px',
                  padding: '12px', 
                  borderRadius: '12px', 
                  border: lbWeek === w ? 'none' : '1px solid rgba(83, 55, 43, 0.1)', 
                  background: lbWeek === w ? 'var(--accent)' : 'white', 
                  color: lbWeek === w ? 'white' : 'var(--text-tertiary)', 
                  fontWeight: '800', 
                  fontSize: '12px', 
                  cursor: 'pointer',
                  boxShadow: lbWeek === w ? '0 4px 10px rgba(159, 64, 34, 0.2)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                WEEK {w}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Standings Header with Sync */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px' }}>
        <h3 style={{ margin: 0, fontSize: '11px', color: 'rgba(83, 55, 43, 0.4)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {timeframe === 'Overall' ? 'GLOBAL ALL-TIME STANDINGS' : `${timeframe.toUpperCase()} STANDINGS (D${lbDay})`}
          {timeframe === 'Weekly' && ` (WEEK ${lbWeek})`}
        </h3>
        <button
          onClick={() => setRefreshTick(t => t + 1)}
          style={{
            background: 'white',
            border: '1px solid rgba(83, 55, 43, 0.1)',
            borderRadius: '20px',
            padding: '6px 16px',
            fontSize: '10px',
            fontWeight: '900',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
          }}
        >
          <RotateCw size={12} className={isLoading ? 'spin-anim' : ''} />
          <span>SYNC</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {displayData.length > 0 ? displayData.map((item, idx) => {
          const rank = idx + 1;
          const isMe = item.type === 'user' && item.id === profile?.id;
          const key = item.type === 'user' ? item.id : `team-${item.name}`;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={{
                background: 'white',
                borderRadius: '32px',
                padding: '24px 32px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                boxShadow: isMe ? '0 15px 35px rgba(159, 64, 34, 0.08)' : '0 10px 25px rgba(0,0,0,0.02)',
                border: isMe ? '1px solid rgba(159, 64, 34, 0.1)' : '1px solid transparent',
                position: 'relative'
              }}
            >
              {/* Rank */}
              <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                {rank === 1 ? <Trophy size={28} color="#FFD700" /> :
                 rank === 2 ? <Trophy size={24} color="#C0C0C0" /> :
                 rank === 3 ? <Trophy size={24} color="#CD7F32" /> :
                 <span style={{ fontSize: '18px', fontWeight: '900', color: 'rgba(83, 55, 43, 0.15)', fontStyle: 'italic' }}>
                   {rank.toString().padStart(2, '0')}
                 </span>
                }
              </div>

              {/* Avatar */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--card-bg)',
                backgroundImage: item.avatar_url ? `url(${item.avatar_url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '16px',
                color: 'var(--accent)',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                {!item.avatar_url && (item.type === 'team' ? <Users size={24} /> : getAvatarInitials(item.name))}
              </div>

              {/* Name & Clan */}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {item.name}
                  {isMe && (
                    <span style={{ fontSize: '9px', fontWeight: '900', color: 'white', background: 'var(--accent)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      YOU
                    </span>
                  )}
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(83, 55, 43, 0.4)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                  {item.type === 'user' ? (item.team_name || 'Independent') : `${leaderboard.filter(u => u.team_name === item.name).length} Operatives`}
                </p>
              </div>

              {/* Points */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  {item.points.toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', fontWeight: '900', color: 'rgba(83, 55, 43, 0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  PTS
                </div>
              </div>
            </motion.div>
          );
        }) : (
          <div style={{ textAlign: 'center', padding: '60px', opacity: 0.3, fontStyle: 'italic' }}>
            No performance data recorded for this timeframe.
          </div>
        )}
      </div>
    </div>
  );
};

// --- Stable Sub-component for Team Expansion ---
const TeamExpandedList = ({ teamName, leaderboard, profile, pointsData = {}, timeframe = 'Overall' }) => {
  const getPoints = (u) => {
    if (timeframe === 'Overall') return Number(u.points) || 0;
    if (timeframe === 'Weekly') return Number(pointsData[u.id]?.weekly) || 0;
    if (timeframe === 'Daily') return Number(pointsData[u.id]?.daily) || 0;
    return 0;
  };

  const members = (leaderboard || [])
    .filter(u => u.team_name === teamName)
    .map(u => ({ ...u, displayPoints: getPoints(u) }))
    .sort((a, b) => (b.displayPoints || 0) - (a.displayPoints || 0));

  return (
    <div
      style={{ overflow: 'hidden', background: 'rgba(83,55,43,0.03)', borderTop: '1px solid rgba(83,55,43,0.08)', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '6px', borderRadius: '0 0 20px 20px', border: '1px solid var(--border-color)' }}
    >
      {members.map((m, mi) => (
        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: m.id === profile?.id ? 'rgba(159,64,34,0.06)' : 'white', borderRadius: '12px', border: m.id === profile?.id ? '1px solid rgba(159,64,34,0.15)' : '1px solid transparent' }}>
          <span style={{ width: '20px', fontSize: '11px', fontWeight: '900', color: mi === 0 ? '#c99d5d' : 'rgba(83,55,43,0.3)', textAlign: 'center' }}>#{mi + 1}</span>
          <div style={{ width: '30px', height: '30px', minWidth: '30px', borderRadius: '50%', background: m.id === profile?.id ? 'var(--accent)' : 'rgba(83,55,43,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', color: m.id === profile?.id ? 'white' : 'var(--accent)', backgroundImage: m.avatar_url ? `url(${m.avatar_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            {!m.avatar_url && (m.name?.[0] || '?').toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{m.name}</span>
              {m.id === profile?.id && <span style={{ fontSize: '8px', background: 'var(--accent)', color: 'white', padding: '1px 5px', borderRadius: '8px', fontWeight: '900' }}>YOU</span>}
              {m.role === 'captain' && <span style={{ fontSize: '8px', background: 'rgba(255,215,0,0.15)', color: '#B8860B', padding: '1px 5px', borderRadius: '8px', fontWeight: '900' }}>⚑</span>}
            </div>
          </div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>{m.displayPoints || 0} <span style={{ fontSize: '9px', fontWeight: '600', opacity: 0.6 }}>pts</span></div>
        </div>
      ))}
    </div>
  );
};

const TeamPage = ({ profile, leaderboard = [], clan }) => {
  const myTeamName = profile?.team_name || 'Independent';
  const isIndependent = myTeamName === 'Independent';
  // Fallback: If leaderboard is empty, we'll try to find members in the full profiles list
  const [localMembers, setLocalMembers] = useState([]);
  const [isSyncingMembers, setIsSyncingMembers] = useState(false);

  useEffect(() => {
    const syncLocalMembers = async () => {
      if (leaderboard.length > 0) return; // Use leaderboard if available
      setIsSyncingMembers(true);
      try {
        const allProfiles = await getAllEntities(TABLES.PROFILES);
        const members = allProfiles.filter(p => (p.team_name || p.TeamName) === myTeamName);
        setLocalMembers(members.map(m => ({ ...m, id: m.rowKey || m.RowKey })));
      } catch (e) {
        console.error("Local member sync failed", e);
      }
      setIsSyncingMembers(false);
    };
    syncLocalMembers();
  }, [myTeamName, leaderboard.length]);

  const teamMembers = leaderboard.length > 0
    ? (isIndependent
        ? leaderboard.filter(u => (u.id || u.rowKey) === profile?.id)
        : leaderboard.filter(u => (u.team_name || u.TeamName) === myTeamName))
    : localMembers;
    
  const totalTeamPoints = teamMembers.reduce((acc, curr) => acc + (Number(curr.points || curr.Points) || 0), 0);

  // Calculate Team Rank
  const teamScores = Array.from(new Set((leaderboard || []).map(u => u.team_name)))
    .filter(Boolean)
    .map(name => ({
      name,
      points: leaderboard.filter(u => u.team_name === name).reduce((acc, curr) => acc + (Number(curr.points) || 0), 0)
    }))
    .sort((a, b) => b.points - a.points);
  
  const myRank = teamScores.findIndex(s => s.name === myTeamName);
  const teamRank = myRank === -1 ? (isIndependent ? '—' : teamScores.length + 1) : myRank + 1;
  const [selectedMember, setSelectedMember] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logLimit, setLogLimit] = useState(20);
  const [isShowingHistory, setIsShowingHistory] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (selectedMember) {
      setIsShowingHistory(false);
      setLogLimit(20);
      setHasMore(true);
      fetchMemberLogs(selectedMember.id, 'today');
    }
  }, [selectedMember]);

  const fetchMemberLogs = async (uid, mode, limit = 50) => {
    setIsLoadingLogs(true);
    try {
      // Use the existing app-wide collections if available to avoid redundant network hits
      const [allSubs, allAwards, allTasks, allFlashcards] = await Promise.all([
        getAllEntities(TABLES.SUBMISSIONS),
        getAllEntities(TABLES.MANUAL_AWARDS),
        getAllEntities(TABLES.TASKS),
        getAllEntities(TABLES.FLASHCARDS)
      ]);

      let userSubs = (allSubs || []).filter(s => s.user_id === uid);
      let userAwards = (allAwards || []).filter(a => a.user_id === uid);

      // If mode is history or we want full audit, we don't filter by 'today'
      // Instead, we sort by date and show everything up to the limit
      
      const populatedSubs = userSubs.map(s => {
        const result = { ...s, type: 'submission' };
        const tid = s.task_id || s.TaskId;
        const fid = s.flashcard_id || s.FlashcardId;

        if (tid) {
          const task = allTasks.find(t => (t.rowKey || t.RowKey) === tid);
          if (task) result.tasks = { title: task.title, points: task.points || task.Points, day: task.day, week: task.week };
        }
        if (fid) {
          const fc = allFlashcards.find(f => (f.rowKey || f.RowKey) === fid);
          if (fc) result.flashcards = { text: fc.text || fc.Title, points: fc.points || fc.Points };
        }
        return result;
      });

      const populatedAwards = userAwards.map(a => ({
        id: a.rowKey || a.RowKey,
        created_at: a.created_at || a.Timestamp || new Date().toISOString(),
        status: 'approved',
        type: 'award',
        points: Number(a.points) || 0,
        reason: a.reason || 'Admin Grant',
        tasks: { title: `Award: ${a.reason || 'Admin Grant'}`, points: Number(a.points) || 0 }
      }));

      const newLogs = [...populatedSubs, ...populatedAwards]
        .sort((a, b) => {
          const dateA = new Date(a.created_at || a.Timestamp || 0);
          const dateB = new Date(b.created_at || b.Timestamp || 0);
          return dateB.getTime() - dateA.getTime();
        });

      setLogs(newLogs.slice(0, limit));
      setHasMore(newLogs.length > limit);
    } catch (e) {
      console.error("fetchMemberLogs error:", e);
    }
    setIsLoadingLogs(false);
  };

  const handleLoadMore = () => {
    const newLimit = logLimit + 50;
    setLogLimit(newLimit);
    fetchMemberLogs(selectedMember.id, 'history', newLimit);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-container">
      <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'var(--card-bg)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(83, 55, 43, 0.1)',
              overflow: 'hidden',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundImage: clan?.logo_url ? `url(${clan.logo_url})` : 'none'
            }}
          >
            {!clan?.logo_url && <Users size={32} color="var(--accent)" opacity={0.3} />}
          </div>
        </div>
        <div>
          <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>{myTeamName}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>Your team needs you. No weak links.</p>
        </div>
      </div>

      <div className="team-stats-grid">
        <div className="stat-card">
          <Trophy size={28} color="#964b29" />
          <div className="stat-value">{totalTeamPoints}</div>
          <div className="stat-label">Total Points</div>
        </div>
        <div className="stat-card">
          <Users size={28} color="#964b29" />
          <div className="stat-value">#{teamRank}</div>
          <div className="stat-label">Team Rank</div>
        </div>
      </div>

      <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Members</h2>
      <div className="members-list">
        {teamMembers.sort((a, b) => (b.points || 0) - (a.points || 0)).map(member => {
          const contributionPercent = totalTeamPoints > 0 ? Math.round(((member.points || 0) / totalTeamPoints) * 100) : 0;
          return (
            <motion.div 
              key={member.id} 
              className="ranking-card" 
              onClick={() => setSelectedMember(member)}
              whileHover={{ scale: 1.01, backgroundColor: '#fcfaf5' }}
              whileTap={{ scale: 0.99 }}
              style={{ padding: '16px 24px', cursor: 'pointer', transition: 'background-color 0.2s' }}
            >
              <div className="avatar-circle" style={{ 
                width: '44px', 
                height: '44px', 
                border: member.role === 'captain' ? '2px solid #FFD700' : 'none', 
                backgroundColor: member.role === 'captain' ? '#B8860B' : 'var(--card-bg)',
                backgroundImage: member.avatar_url ? `url(${member.avatar_url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                {!member.avatar_url && (member.role === 'captain' ? <Award size={20} color="white" /> : member.name?.split(' ').map(n => n[0]).join('').toUpperCase())}
              </div>
              <div className="name-stack">
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {member.name}
                  {member.role === 'captain' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(159, 64, 34, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      <Award size={10} color="var(--accent)" />
                      <span style={{ fontSize: '9px', color: 'var(--accent)', fontWeight: '900', letterSpacing: '0.05em' }}>CAPTAIN</span>
                    </div>
                  )}
                </h4>
                <p style={{ fontSize: '10px', opacity: 0.5, marginBottom: '2px' }}>{member.email}</p>
                <p style={{ fontWeight: 'bold' }}>{member.points || 0} pts</p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div className="member-progress-bar">
                    <div className="member-progress-fill" style={{ width: `${contributionPercent}%` }}></div>
                  </div>
                  <span className="member-percent">{contributionPercent}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.3, background: 'rgba(53, 55, 43, 0.05)', padding: '6px 10px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.05em' }}>AUDIT</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedMember && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(53, 55, 43, 0.4)', backdropFilter: 'blur(8px)' }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ 
                width: '100%', 
                maxWidth: '480px', 
                maxHeight: '80vh', 
                background: 'white', 
                borderRadius: '32px', 
                position: 'relative', 
                zIndex: 1, 
                padding: '32px', 
                overflowY: 'auto',
                boxShadow: '0 30px 60px rgba(83, 55, 43, 0.2)'
              }}
            >
              <button 
                onClick={() => setSelectedMember(null)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: '#f5f2e9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} color="#53372b" />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #53372b 0%, #9f4022 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: 'white', backgroundImage: selectedMember.avatar_url ? `url(${selectedMember.avatar_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  {!selectedMember.avatar_url && selectedMember.name?.[0].toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: '24px', margin: 0, fontFamily: 'var(--font-heading)' }}>{selectedMember.name}</h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#9f4022', fontWeight: 'bold' }}>{selectedMember.points || 0} TOTAL POINTS</p>
                </div>
              </div>

              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.4, marginBottom: '20px' }}>PROTOCOL AUDIT LOG</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {logs.length > 0 ? (
                  <>
                    {/* Today Section */}
                    {logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length > 0 && (
                      <div style={{ padding: '8px 4px', fontSize: '10px', fontWeight: '900', color: 'var(--accent)', letterSpacing: '0.1em' }}>TODAY'S OPERATIONS</div>
                    )}
                    
                    {logs.map((log) => {
                      const status = log.status || 'pending';
                      const colors = { approved: '#6f8e7c', 'under-review': '#c99d5d', retry: '#d27440', rejected: '#c0392b' };
                      return (
                        <div key={log.id} style={{ padding: '16px', background: '#f5f2e9', borderRadius: '20px', border: '1px solid rgba(83, 55, 43, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>
                              {log.tasks?.title || (log.flashcards?.text ? `WILDCARD: ${log.flashcards.text}` : 'Log Entry')}
                            </div>
                            <div style={{ fontSize: '11px', color: '#53372b', opacity: 0.6, marginTop: '2px' }}>
                              {new Date(log.created_at).toLocaleDateString()} · {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: '900', color: colors[status] || '#53372b' }}>
                              {status === 'approved' ? `+${log.points || log.tasks?.points || log.flashcards?.points || 0}` : (log.points || log.tasks?.points || log.flashcards?.points || 0)}
                            </div>
                            <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', color: colors[status] || '#53372b', opacity: 0.8 }}>{status.replace('-', ' ')}</div>
                          </div>
                        </div>
                      );
                    })}

                    {hasMore && (
                      <button
                        onClick={handleLoadMore}
                        disabled={isLoadingLogs}
                        style={{ width: '100%', padding: '16px', background: 'transparent', border: '1px dashed var(--accent)', color: 'var(--accent)', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '12px' }}
                      >
                        {isLoadingLogs ? 'Retrieving records...' : isShowingHistory ? 'Load More History ↓' : 'View Previous Days ↓'}
                      </button>
                    )}
                  </>
                ) : (
                  isLoadingLogs ? <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>Syncing audit trail...</div> : <div style={{ textAlign: 'center', padding: '40px', opacity: 0.3, fontStyle: 'italic' }}>No protocol entries found.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CaptainDashboard = ({ profile, leaderboard = [] }) => {
  const [teamSubmissions, setTeamSubmissions] = useState([]);
  const myTeamName = profile?.team_name || 'Independent';
  const teamMembers = leaderboard.filter(u => u.team_name === myTeamName);

  useEffect(() => {
    fetchTeamSubmissions();
  }, [teamMembers]);

  const fetchTeamSubmissions = async () => {
    const memberIds = teamMembers.map(m => m.id);
    if (memberIds.length === 0) return;
    const allSubs = await getAllEntities(TABLES.SUBMISSIONS);
    const data = allSubs.filter(s => memberIds.includes(s.user_id));
    setTeamSubmissions(data || []);
  };

  const getMemberStatus = (memberId) => {
    const subs = teamSubmissions.filter(s => s.user_id === memberId && (s.status === 'approved' || s.status === 'under-review'));
    return subs.length;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-container">
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', marginBottom: '8px' }}>
            <Award size={16} color="#FFD700" />
            <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#B8860B' }}>Captain's Console</span>
          </div>
          <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>{myTeamName} Command</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Monitor your squad. Drive them to excellence.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="card" style={{ background: 'var(--hb-cream)', border: '1px solid rgba(159, 64, 34, 0.1)' }}>
          <h3 style={{ fontSize: '14px', color: '#53372b', opacity: 0.6, marginBottom: '12px' }}>TEAM READINESS</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--accent)' }}>
            {Math.round((teamMembers.filter(m => getMemberStatus(m.id) > 0).length / teamMembers.length) * 100) || 0}%
          </div>
          <p style={{ fontSize: '11px', marginTop: '4px' }}>Members with active protocols</p>
        </div>
        <div className="card" style={{ background: 'var(--hb-cream)', border: '1px solid rgba(159, 64, 34, 0.1)' }}>
          <h3 style={{ fontSize: '14px', color: '#53372b', opacity: 0.6, marginBottom: '12px' }}>SQUAD SIZE</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--accent)' }}>{teamMembers.length}</div>
          <p style={{ fontSize: '11px', marginTop: '4px' }}>Elite operatives active</p>
        </div>
      </div>

      <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Squad Performance</h2>
      <div className="members-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {teamMembers.map(member => (
          <div key={member.id} className="ranking-card" style={{ padding: '20px 24px' }}>
            <div className="avatar-circle" style={{ width: '44px', height: '44px', backgroundColor: member.role === 'captain' ? 'var(--accent)' : 'var(--card-bg)' }}>
              {member.name?.[0].toUpperCase()}
            </div>
            <div className="name-stack">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {member.name}
                {member.id === profile.id && <span style={{ fontSize: '10px', color: 'var(--accent)' }}>(You)</span>}
                {member.role === 'captain' && <Award size={12} color="var(--accent)" />}
              </h4>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{getMemberStatus(member.id)} Protocols Completed</span>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              {member.id !== profile.id && (
                <button
                  disabled={getMemberStatus(member.id) > 0}
                  style={{
                    background: getMemberStatus(member.id) > 0 ? 'rgba(0,0,0,0.05)' : 'var(--accent)',
                    border: 'none',
                    color: getMemberStatus(member.id) > 0 ? 'rgba(0,0,0,0.2)' : 'white',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: getMemberStatus(member.id) > 0 ? 'default' : 'pointer'
                  }}
                >
                  <Bell size={12} /> NUDGE
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const ProfilePage = ({ profile, onUpdate, onLogout, onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate({ name });
    setIsEditing(false);
    setIsSaving(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSaving(true);
    await onUpdate({ avatar: file });
    setIsSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-container">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '48px' }}>
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <div
            style={{
              width: '120px',
              height: '120px',
              background: 'var(--card-bg)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              fontWeight: 'bold',
              border: profile?.role === 'captain' ? '4px solid #FFD700' : '4px solid white',
              boxShadow: profile?.role === 'captain' ? '0 0 30px rgba(255, 215, 0, 0.3)' : '0 15px 35px rgba(83, 55, 43, 0.1)',
              color: 'var(--text-primary)',
              backgroundImage: profile?.avatar_url ? `url(${profile.avatar_url})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              overflow: 'hidden'
            }}
          >
            {!profile?.avatar_url && (profile?.name?.[0] || 'A')}
          </div>
          <button
            onClick={() => fileInputRef.current.click()}
            style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(160, 64, 34, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            <Camera size={18} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>

        <div style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  textAlign: 'center',
                  border: 'none',
                  borderBottom: '2px solid var(--accent)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  width: '200px'
                }}
              />
              <button onClick={handleSave} style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                <Save size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ position: 'relative' }}>
                <h1 style={{ fontSize: '32px', margin: 0, color: profile?.role === 'captain' ? '#B8860B' : 'var(--text-primary)' }}>{profile?.name || 'Client'}</h1>
                {profile?.role === 'captain' && (
                  <div style={{
                    position: 'absolute',
                    top: '-25px',
                    right: '-35px',
                    background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    boxShadow: '0 4px 15px rgba(184, 134, 11, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}>
                    <Award size={14} />
                    <span style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '0.1em' }}>TEAM CAPTAIN</span>
                  </div>
                )}
              </div>
              <button onClick={() => setIsEditing(true)} style={{ background: 'transparent', border: 'none', opacity: 0.4, cursor: 'pointer' }}>
                <Edit3 size={20} />
              </button>
            </div>
          )}
          <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginTop: '8px' }}>{profile?.email}</p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '11px', marginTop: '4px', opacity: 0.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div className="card" style={{
          textAlign: 'center',
          background: profile?.role === 'captain' ? 'rgba(255, 215, 0, 0.05)' : 'var(--card-bg)',
          border: profile?.role === 'captain' ? '1px solid rgba(255, 215, 0, 0.2)' : '1px solid var(--border-color)',
          boxShadow: profile?.role === 'captain' ? '0 10px 20px rgba(255, 215, 0, 0.1)' : 'none'
        }}>
          <Target size={24} color={profile?.role === 'captain' ? '#B8860B' : 'var(--accent)'} style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: profile?.role === 'captain' ? '#B8860B' : 'var(--text-primary)' }}>{profile?.points || 0}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Career Points</div>
        </div>
        <div className="card" style={{
          textAlign: 'center',
          background: profile?.role === 'captain' ? 'rgba(255, 215, 0, 0.05)' : 'var(--card-bg)',
          border: profile?.role === 'captain' ? '1px solid rgba(255, 215, 0, 0.2)' : '1px solid var(--border-color)',
          boxShadow: profile?.role === 'captain' ? '0 10px 20px rgba(255, 215, 0, 0.1)' : 'none'
        }}>
          <Flame size={24} color="#FF6B6B" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: profile?.role === 'captain' ? '#B8860B' : 'var(--text-primary)' }}>{profile?.streak || 0}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Day Streak</div>
        </div>
      </div>

      <div className="card" style={{ background: 'var(--card-bg)', marginBottom: '40px' }}>
        <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '16px' }}>Account Security & Information</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => onNavigate('habit-tracker')}
            style={{
              width: '100%',
              padding: '16px',
              background: 'white',
              color: '#9f4022',
              border: '1px solid rgba(159, 64, 34, 0.2)',
              borderRadius: '16px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(159, 64, 34, 0.05)'
            }}
          >
            <Activity size={20} /> Habit Tracker
          </button>
          <button
            onClick={() => setIsRulesOpen(true)}
            style={{
              width: '100%',
              padding: '16px',
              background: 'white',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
              marginBottom: '4px'
            }}
          >
            <ShieldCheck size={20} /> Rules & Guidelines
          </button>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '16px',
              background: 'rgba(159, 64, 34, 0.05)',
              color: 'var(--accent)',
              border: '1px solid rgba(159, 64, 34, 0.1)',
              borderRadius: '16px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}
          >
            <LogOut size={20} /> Sign Out of Account
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isRulesOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={{
                background: 'white',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '80vh',
                borderRadius: '24px',
                padding: '32px',
                position: 'relative',
                overflowY: 'auto',
                boxShadow: '0 30px 60px rgba(0,0,0,0.2)'
              }}
            >
              <button
                onClick={() => setIsRulesOpen(false)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'var(--hb-cream)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <ShieldCheck size={40} color="var(--accent)" style={{ marginBottom: '16px' }} />
                <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', margin: 0 }}>Rules & Guidelines</h2>
                <p style={{ fontSize: '13px', opacity: 0.6, marginTop: '4px' }}>Maintain these standards for elite status</p>
              </div>

              <RulesContent />

              <button
                onClick={() => setIsRulesOpen(false)}
                style={{ width: '100%', marginTop: '32px', padding: '16px', background: 'var(--text-primary)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                I Understand the Protocol
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isSaving && (
        <div style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', background: 'var(--text-primary)', color: 'white', padding: '12px 24px', borderRadius: '40px', fontSize: '12px', fontWeight: 'bold', zIndex: 5000, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
          Updating Profile...
        </div>
      )}
    </motion.div>
  );
};

const PointsLogPage = ({ profile }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [memberLogs, setMemberLogs] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMemberLogs, setIsLoadingMemberLogs] = useState(false);
  const [logLimit, setLogLimit] = useState(20);
  const [hasMoreLogs, setHasMoreLogs] = useState(true);

  const statusConfig = {
    approved: { label: 'Earned', color: '#6f8e7c', bg: 'rgba(111,142,124,0.12)', icon: '✓' },
    'under-review': { label: 'Reviewing', color: '#c99d5d', bg: 'rgba(201,157,93,0.12)', icon: '⏳' },
    retry: { label: 'Try Again', color: '#d27440', bg: 'rgba(210,116,64,0.10)', icon: '↩' },
    rejected: { label: 'Rejected', color: '#c0392b', bg: 'rgba(192,57,43,0.10)', icon: '✕' },
    pending: { label: 'Pending', color: 'rgba(83,55,43,0.3)', bg: 'rgba(83,55,43,0.05)', icon: '○' },
  };

  useEffect(() => {
    if (profile?.id) fetchTeamData();
  }, [profile?.id]);

  useEffect(() => {
    if (expanded) {
      setIsShowingHistory(false);
      setLogLimit(20);
      setHasMoreLogs(true);
      fetchMemberLogs(expanded, 'today');
    }
  }, [expanded]);

  const fetchTeamData = async () => {
    setIsLoading(true);
    try {
      const myTeamName = profile.team_name;
      const isRealTeam = myTeamName && myTeamName !== 'Independent';
      let myTeam = [];

      if (isRealTeam) {
        const allProfiles = await getAllEntities(TABLES.PROFILES);
        const members = allProfiles.filter(p => p.team_name === myTeamName && p.batch_id === profile.batch_id).map(p => ({
          id: p.rowKey,
          name: p.name,
          points: p.points,
          avatar_url: p.avatar_url,
          role: p.role,
          team_name: p.team_name
        }));
        myTeam = members || [];
      } else {
        myTeam = [{ id: profile.id, name: profile.name, points: profile.points, avatar_url: profile.avatar_url, role: profile.role, team_name: myTeamName }];
      }

      setTeamMembers(myTeam);
    } catch (e) {
      console.error('Team data error:', e);
    }
    setIsLoading(false);
  };

  const fetchMemberLogs = async (uid, mode, limit = 20) => {
    setIsLoadingMemberLogs(true);
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [allSubs, allAwards, allTasks, allFlashcards] = await Promise.all([
        getAllEntities(TABLES.SUBMISSIONS),
        getAllEntities(TABLES.MANUAL_AWARDS),
        getAllEntities(TABLES.TASKS),
        getAllEntities(TABLES.FLASHCARDS)
      ]);

      let userSubs = allSubs.filter(s => s.user_id === uid);
      let userAwards = allAwards.filter(a => a.user_id === uid);
      
      const batchTasks = allTasks.filter(t => t.batch_id === profile.batch_id);
      const batchFlashcards = allFlashcards.filter(f => f.batch_id === profile.batch_id);

      if (mode === 'today') {
        userSubs = userSubs.filter(s => new Date(s.created_at) >= startOfToday);
        userAwards = userAwards.filter(a => new Date(a.created_at || new Date()) >= startOfToday);
      } else {
        userSubs = userSubs.filter(s => new Date(s.created_at) < startOfToday);
        userSubs = userSubs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, limit);
        userAwards = userAwards.filter(a => new Date(a.created_at || new Date()) < startOfToday).slice(0, 10);
      }

      // Populate related data
      const populatedSubs = userSubs.map(s => {
        const result = { ...s, type: 'submission' };
        if (s.task_id) {
          const task = batchTasks.find(t => t.rowKey === s.task_id);
          if (task) result.tasks = { title: task.title, points: task.points, day: task.day, week: task.week };
        }
        if (s.flashcard_id) {
          const fc = batchFlashcards.find(f => f.rowKey === s.flashcard_id);
          if (fc) result.flashcards = { text: fc.text, points: fc.points };
        }
        return result;
      });

      const newLogs = [
        ...populatedSubs,
        ...userAwards.map(a => ({
          id: a.rowKey,
          created_at: a.created_at || new Date().toISOString(),
          status: 'approved',
          type: 'award',
          points: a.points,
          reason: a.reason,
          tasks: { title: `Award: ${a.reason || 'Admin Grant'}`, points: a.points }
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (mode === 'today') {
        setMemberLogs({ ...memberLogs, [uid]: newLogs });
        setHasMoreLogs(true);
      } else {
        setMemberLogs(prev => ({
          ...prev,
          [uid]: mode === 'history'
            ? [...(prev[uid] || []).filter(l => new Date(l.created_at) >= startOfToday), ...newLogs]
            : newLogs
        }));
        setHasMoreLogs(userSubs.length === limit);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoadingMemberLogs(false);
  };

  const handleLoadMore = (uid) => {
    if (!isShowingHistory) {
      setIsShowingHistory(true);
      fetchMemberLogs(uid, 'history', 20);
    } else {
      const newLimit = logLimit + 20;
      setLogLimit(newLimit);
      fetchMemberLogs(uid, 'history', newLimit);
    }
  };

  const teamTotal = teamMembers.reduce((acc, m) => acc + (m.points || 0), 0);
  const myTeamName = profile?.team_name || '—';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent)', marginBottom: '8px' }}>
          <BarChart3 size={16} />
          <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Team Audit</span>
        </div>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-heading)', margin: '0 0 6px 0' }}>Points Log</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>{myTeamName} · {teamMembers.length} members</p>
      </div>

      {/* Team Total Banner */}
      <div style={{ background: 'linear-gradient(135deg, #53372b 0%, #9f4022 100%)', borderRadius: '20px', padding: '20px 24px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Team Total Points</div>
          <div style={{ fontSize: '36px', fontWeight: '900', color: 'white', fontFamily: 'var(--font-heading)' }}>{teamTotal}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Active Members</div>
          <div style={{ fontSize: '36px', fontWeight: '900', color: 'white', fontFamily: 'var(--font-heading)' }}>{teamMembers.length}</div>
        </div>
      </div>

      {/* Member Cards */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.4, fontWeight: 'bold' }}>Loading team data...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {teamMembers
            .sort((a, b) => (b.points || 0) - (a.points || 0))
            .map((member, idx) => {
              const subs = memberLogs[member.id] || [];
              const isMe = member.id === profile?.id;
              return (
                <motion.div key={member.id} layout style={{ borderRadius: '20px', overflow: 'hidden', border: isMe ? '2px solid var(--accent)' : '1px solid rgba(83,55,43,0.08)', background: 'var(--card-bg)' }}>
                  {/* Member Header Row */}
                  <div
                    onClick={() => {
                      setExpanded(expanded === member.id ? null : member.id);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer' }}
                  >
                    {/* Rank */}
                    <div style={{ width: '28px', textAlign: 'center', fontWeight: '900', fontSize: '13px', color: idx === 0 ? '#c99d5d' : 'rgba(83,55,43,0.3)' }}>
                      #{idx + 1}
                    </div>

                    {/* Avatar */}
                    <div style={{ width: '40px', height: '40px', minWidth: '40px', borderRadius: '50%', background: isMe ? 'var(--accent)' : 'rgba(83,55,43,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '15px', color: isMe ? 'white' : 'var(--accent)', backgroundImage: member.avatar_url ? `url(${member.avatar_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                      {!member.avatar_url && (member.name?.[0] || '?').toUpperCase()}
                    </div>

                    {/* Name + Stats */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>{member.name}</span>
                        {isMe && <span style={{ fontSize: '9px', background: 'var(--accent)', color: 'white', padding: '2px 7px', borderRadius: '10px', fontWeight: '900' }}>YOU</span>}
                        {member.role === 'captain' && <span style={{ fontSize: '9px', background: 'rgba(255,215,0,0.15)', color: '#B8860B', padding: '2px 7px', borderRadius: '10px', fontWeight: '900' }}>⚑ CAPTAIN</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '3px' }}>
                        <span style={{ fontSize: '10px', color: '#6f8e7c', fontWeight: '700' }}>✓ Approved</span>
                        {member.points > 0 && <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: '700', marginLeft: 'auto' }}>{teamTotal > 0 ? Math.round((member.points / teamTotal) * 100) : 0}% contribution</span>}
                      </div>
                    </div>

                    {/* Total Points */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>{member.points || 0}</div>
                      <div style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '600' }}>pts</div>
                    </div>

                    {/* Expand chevron */}
                    <div style={{ color: 'rgba(83,55,43,0.3)', fontSize: '16px', transition: 'transform 0.2s', transform: expanded === member.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</div>
                  </div>

                  {/* Expanded Submission Log */}
                  <AnimatePresence>
                    {expanded === member.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ borderTop: '1px solid rgba(83,55,43,0.08)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(83,55,43,0.02)' }}>
                          {isLoadingMemberLogs ? (
                            <p style={{ textAlign: 'center', opacity: 0.4, fontSize: '12px', padding: '12px 0', margin: 0 }}>Syncing audit trail...</p>
                          ) : subs.length === 0 ? (
                            <p style={{ textAlign: 'center', opacity: 0.4, fontSize: '12px', padding: '12px 0', margin: 0 }}>No submissions yet</p>
                          ) : (
                            <>
                              {/* Today Section */}
                              {subs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length > 0 && (
                                <div style={{ fontSize: '9px', fontWeight: '900', color: 'var(--accent)', letterSpacing: '0.1em', padding: '4px 0' }}>TODAY'S OPERATIONS</div>
                              )}
                              {subs.map(sub => {
                                const cfg = statusConfig[sub.status] || statusConfig.pending;
                                const title = sub.tasks?.title || (sub.flashcards?.text ? `WILDCARD: ${sub.flashcards.text}` : 'Unknown');
                                const pts = sub.points || sub.tasks?.points || sub.flashcards?.points || 0;
                                const dayLabel = sub.tasks?.day ? `Day ${sub.tasks.day}` : 'Wildcard';
                                return (
                                  <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'white', borderRadius: '12px', border: `1px solid ${cfg.color}18` }}>
                                    <div style={{ width: '28px', height: '28px', minWidth: '28px', borderRadius: '8px', background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '12px' }}>
                                      {cfg.icon}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <p style={{ margin: '0 0 1px 0', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
                                      <p style={{ margin: 0, fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '600' }}>{dayLabel} · {new Date(sub.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                      {sub.rejection_comment && <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#d27440', fontStyle: 'italic' }}>"{sub.rejection_comment}"</p>}
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                      <div style={{ fontSize: '13px', fontWeight: '800', color: sub.status === 'approved' ? '#6f8e7c' : 'rgba(83,55,43,0.25)' }}>
                                        {sub.status === 'approved' ? `+${pts}` : pts}
                                      </div>
                                      <div style={{ fontSize: '8px', fontWeight: '700', color: cfg.color, textTransform: 'uppercase' }}>{cfg.label}</div>
                                    </div>
                                  </div>
                                );
                              })}
                              {hasMoreLogs && (
                                <button
                                  onClick={() => handleLoadMore(member.id)}
                                  disabled={isLoadingMemberLogs}
                                  style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px dashed var(--accent)', color: 'var(--accent)', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
                                >
                                  {isLoadingMemberLogs ? 'Retrieving...' : isShowingHistory ? 'Load More History ↓' : 'View Previous Days ↓'}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
        </div>
      )}
    </motion.div>
  );
};




// --- Habit Tracker Page ---
// --- Habit Tracker Page ---
// --- Habit Tracker Page ---
// --- Habit Tracker Page ---
const HabitTrackerPage = ({ profile, currentDay, onUpload, batch, allTasks = [], allSubmissions = [] }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  // Navigation State
  const initialWeek = Math.min(3, Math.ceil(currentDay / 7) || 1);
  const [selectedWeek, setSelectedWeek] = useState(initialWeek);
  const [viewDay, setViewDay] = useState(currentDay);

  const isStarted = batch?.is_active !== false; // More lenient check

  const activeDayTasks = allTasks.filter(t => t.day === viewDay);
  const activeTitles = [...new Set(activeDayTasks.map(t => t.title))];

  const getHabitStatus = (title, day) => {
    const task = allTasks.find(t => t.title === title && t.day === day);
    if (!task) return 'none';
    const sub = allSubmissions.find(s => s.task_id === task.rowKey);
    return sub?.status || 'pending';
  };

  const getStatusColor = (idx) => {
    const colors = ['#9f4022', '#6f8e7c', '#c99d5d', '#d27440', '#53372b', '#FF6B6B'];
    return colors[idx % colors.length];
  };

  const renderApprovedBadge = (color) => (
    <div className="scribble-container">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: '#9f4022',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(159, 64, 34, 0.2)'
        }}
      >
        <Check size={18} color="white" strokeWidth={3} />
      </motion.div>
    </div>
  );

  const weekStart = (selectedWeek - 1) * 7 + 1;
  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart + i);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container" style={{ paddingBottom: '120px' }}>
      <AnimatePresence>
        {selectedProtocol && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProtocol(null)}
              style={{ position: 'fixed', inset: 0, zIndex: 5000, background: 'rgba(83, 55, 43, 0.4)', backdropFilter: 'blur(8px)' }}
            />
            <div style={{ position: 'fixed', inset: 0, zIndex: 5001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', pointerEvents: 'none' }}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                style={{
                  width: '100%',
                  maxWidth: '440px',
                  maxHeight: '90vh',
                  background: 'white',
                  borderRadius: '32px',
                  padding: '32px',
                  boxShadow: '0 30px 60px rgba(83, 55, 43, 0.2)',
                  position: 'relative',
                  pointerEvents: 'auto',
                  overflowY: 'auto'
                }}
              >
                <button
                  onClick={() => setSelectedProtocol(null)}
                  style={{ position: 'absolute', top: '24px', right: '24px', background: '#f5f2e9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={20} color="#53372b" />
                </button>

                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#9f4022', letterSpacing: '0.1em' }}>PROTOCOL INTELLIGENCE</span>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', color: '#1a1a1a', margin: '4px 0' }}>{selectedProtocol.title}</h2>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <div style={{ background: '#ede0d0', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', color: '#53372b' }}>DAY {selectedProtocol.day}</div>
                    <div style={{ background: 'rgba(116, 116, 64, 0.1)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', color: '#747440' }}>{selectedProtocol.points} PTS</div>
                  </div>
                </div>

                <div style={{ background: '#f5f2e9', padding: '20px', borderRadius: '20px', marginBottom: '24px', border: '1px solid rgba(83, 55, 43, 0.05)' }}>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#53372b' }}>{selectedProtocol.description}</p>
                </div>

                <TaskCard
                  task={selectedProtocol}
                  minimal={true}
                  onAction={(task, file, consent) => {
                    onUpload(task, file, consent);
                    setSelectedProtocol(null);
                  }}
                  isLocked={selectedProtocol.day > currentDay}
                  isHistory={selectedProtocol.day < currentDay}
                />
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
      {!isStarted ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: '#ede0d0', borderRadius: '40px', border: '1px solid #c6c6c6', marginTop: '40px' }}>
          <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 10px 25px rgba(83, 55, 43, 0.05)' }}>
            <Clock size={40} color="#9f4022" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', color: '#53372b', marginBottom: '16px' }}>Tracker Standby</h2>
          <p style={{ color: '#53372b', opacity: 0.7, fontSize: '16px', lineHeight: '1.6', maxWidth: '400px', margin: '0 auto' }}>
            Operational consistency metrics will initialize once the tactical sequence for <strong>{batch?.name || 'your unit'}</strong> has been activated.
          </p>
        </div>
      ) : (
        <>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '56px', marginBottom: '12px', color: '#53372b' }}>Consistency Grid</h1>
            <p style={{ color: '#53372b', opacity: 0.6, fontSize: '18px', fontWeight: '500', maxWidth: '600px', margin: '0 auto' }}>Track your evolution through focused daily protocols.</p>

            <div className="premium-tab-container" style={{ marginTop: '40px' }}>
              {[1, 2, 3].map(w => {
                const isLockedWeek = currentDay < (w - 1) * 7 + 1;
                return (
                  <button
                    key={w}
                    disabled={isLockedWeek}
                    onClick={() => {
                      if (isLockedWeek) return;
                      setSelectedWeek(w);
                      setViewDay((w - 1) * 7 + 1);
                    }}
                    className={`premium-tab ${selectedWeek === w ? 'active' : ''} ${isLockedWeek ? 'locked' : ''}`}
                    style={{ position: 'relative', color: selectedWeek === w ? 'white' : '#53372b' }}
                  >
                    <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Week {w}
                      {isLockedWeek && <Lock size={12} />}
                    </span>
                    {selectedWeek === w && (
                      <motion.div
                        layoutId="weekTab"
                        className="tab-indicator"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        style={{ position: 'absolute', inset: 0, background: '#9f4022' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '120px' }}>
              <div className="loader" style={{ width: '48px', height: '48px', border: '3px solid #ede0d0', borderTop: '3px solid #9f4022', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : (
            <div className="habit-tracker-container">
              <div className="habit-table-wrapper">
                <table className="habit-table">
                  <thead>
                    <tr>
                      <th className="habit-col">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '0.1em' }}>PROTOCOLS FOR</span>
                          <span style={{ fontSize: '16px', color: '#9f4022', fontFamily: 'var(--font-heading)' }}>DAY {viewDay}</span>
                        </div>
                      </th>
                      {weekDays.map(d => (
                        <th
                          key={d}
                          onClick={() => setViewDay(d)}
                          style={{
                            textAlign: 'center',
                            cursor: 'pointer',
                            color: d === currentDay ? '#9f4022' : (viewDay === d ? '#1a1a1a' : '#c6c6c6'),
                            transition: 'all 0.3s'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}>
                            <span style={{ fontSize: '15px', fontWeight: viewDay === d ? '900' : '700' }}>{d}</span>
                            {d === currentDay && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#9f4022', marginTop: '6px' }} />}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {activeTitles.length > 0 ? activeTitles.map((title, idx) => {
                        return (
                          <motion.tr
                            key={title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <td
                              className="habit-name-cell"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                const t = allTasks.find(task => task.title === title && task.day === viewDay);
                                if (t) {
                                  const sub = allSubmissions.find(s => s.task_id === t.rowKey);
                                  setSelectedProtocol({ ...t, id: t.rowKey, status: sub?.status || 'pending', rejection_comment: sub?.rejection_comment });
                                }
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{title}</span>
                                <ChevronRight size={14} opacity={0.3} />
                              </div>
                            </td>
                            {weekDays.map(d => {
                              const status = getHabitStatus(title, d);
                              const isToday = d === currentDay;
                              const isLocked = d > currentDay;
                              const isApproved = status === 'approved';
                              const isSelectedDay = d === viewDay;


                              return (
                                <td
                                  key={d}
                                  className={`habit-status-cell ${isToday ? 'is-today' : ''} ${isLocked ? 'is-future' : ''} ${isApproved ? 'is-approved' : ''}`}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', position: 'relative' }}>
                                    {isApproved && renderApprovedBadge()}
                                    {status === 'under-review' && (
                                      <motion.div
                                        animate={{ rotate: [0, 180, 180, 360, 360] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.5, 0.9, 1] }}
                                        style={{ color: '#9f4022' }}
                                      >
                                        <Hourglass size={16} />
                                      </motion.div>
                                    )}
                                    {status === 'pending' && !isLocked && <div className="task-dot" style={{ background: '#747440', width: '6px', height: '6px' }} />}
                                    {isLocked && <Lock size={12} style={{ opacity: 0.1 }} />}
                                  </div>
                                </td>
                              );
                            })}
                          </motion.tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={8} style={{ padding: '80px', textAlign: 'center', color: '#53372b', opacity: 0.4, fontStyle: 'italic' }}>
                            Zero protocols detected for Day {viewDay}.
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!isLoading && (
            <div style={{
              marginTop: '60px',
              background: 'linear-gradient(135deg, #53372b 0%, #9f4022 100%)',
              color: 'white',
              padding: '48px',
              borderRadius: '40px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 25px 60px rgba(159, 64, 34, 0.2)'
            }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '11px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>Total Approved</p>
                <div style={{ fontSize: '36px', fontWeight: '900', fontFamily: 'var(--font-heading)' }}>{allSubmissions.filter(s => s.status === 'approved').length}</div>
              </div>
              <div style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '11px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>Active Streak</p>
                <div className="streak-highlight" style={{ fontSize: '36px', fontFamily: 'var(--font-heading)', color: '#fff !important' }}>{profile?.streak || 0} Days</div>
              </div>
              <div style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '11px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>Total Prowess</p>
                <div style={{ fontSize: '36px', fontWeight: '900', fontFamily: 'var(--font-heading)' }}>{profile?.points || 0} pts</div>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

/**
 * GoogleSignInSection
 * Renders a container div that Google GSI populates with the official Sign-In button.
 * Also triggers One Tap prompts via initGoogleAuth once the GSI script is ready.
 */
const GoogleSignInSection = ({ isGsiReady, onSignIn }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', marginTop: '0' }}>
      <button 
        onClick={() => signInWithGoogleCustom(onSignIn)}
        className="google-login-btn"
        disabled={!isGsiReady}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.14-4.53z" fill="#EA4335"/>
        </svg>
        <span style={{ marginLeft: '12px' }}>Sign in with Google</span>
      </button>
      
      <p style={{ 
        fontSize: '11px', 
        color: 'rgba(83, 55, 43, 0.4)', 
        textAlign: 'center', 
        margin: 0,
        maxWidth: '240px',
        lineHeight: '1.4',
        fontWeight: '500'
      }}>
        Your Google account must be linked to an active HB+ membership.
      </p>
    </div>
  );
};


const isVideoUrl = (url) => /\.(mp4|webm|ogg|mov)$/i.test(url);

const FeedPage = ({ profile }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [allSubs, allProfiles, allTasks, allCards] = await Promise.all([
          getAllEntities(TABLES.SUBMISSIONS),
          getAllEntities(TABLES.PROFILES),
          getAllEntities(TABLES.TASKS),
          getAllEntities(TABLES.FLASHCARDS),
        ]);

        const batchId = profile?.batch_id;
        const result = (allSubs || [])
          .filter(s => s.status === 'approved' && (s.published_to_feed === true || s.published_to_feed === 'true'))
          .map(s => {
            const sId = s.rowKey || s.RowKey || s.id;
            const prof = (allProfiles || []).find(p => (p.rowKey || p.RowKey || p.id) === s.user_id);
            if (prof?.batch_id !== batchId) return null;
            const task = (allTasks || []).find(t => (t.rowKey || t.RowKey || t.id) === s.task_id);
            const card = (allCards || []).find(c => (c.rowKey || c.RowKey || c.id) === s.flashcard_id);
            return { ...s, id: sId, prof, task, card };
          })
          .filter(Boolean)
          .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

        setPosts(result);
      } catch (e) {
        console.error('FeedPage load error:', e);
      }
      setIsLoading(false);
    };
    load();
  }, [profile?.batch_id]);

  if (isLoading) return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <RefreshCw size={28} className="animate-spin" style={{ color: '#9f4022', opacity: 0.5 }} />
    </div>
  );

  return (
    <motion.div
      key="feed"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="page-container"
    >
      <h1 className="section-title" style={{ marginBottom: '8px' }}>Batch Feed</h1>
      <p style={{ fontSize: '13px', color: 'rgba(83,55,43,0.45)', fontWeight: '600', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {posts.length} post{posts.length !== 1 ? 's' : ''} · visible only to your batch
      </p>

      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'rgba(83,55,43,0.35)' }}>
          <Instagram size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>No posts yet</p>
          <p style={{ margin: '8px 0 0', fontSize: '13px' }}>Completed tasks will appear here once published by your coach</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          {posts.map(post => (
            <motion.div
              key={post.id}
              whileHover={{ scale: 1.03 }}
              onClick={() => setSelected(post)}
              style={{ borderRadius: '14px', overflow: 'hidden', background: 'white', boxShadow: '0 2px 8px rgba(83,55,43,0.08)', cursor: 'pointer', border: '1px solid rgba(83,55,43,0.06)' }}
            >
              <div style={{ height: '160px', background: 'rgba(83,55,43,0.04)', overflow: 'hidden', position: 'relative' }}>
                {post.file_url ? (
                  isVideoUrl(post.file_url)
                    ? <video src={post.file_url} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <img src={post.file_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                    <Instagram size={28} />
                  </div>
                )}
              </div>
              <div style={{ padding: '10px 12px' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '800', color: '#53372b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.prof?.name || 'Member'}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'rgba(83,55,43,0.4)', fontWeight: '600', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.task?.title || post.card?.text || 'Submission'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(23,15,12,0.92)', backdropFilter: 'blur(10px)' }}
            />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', background: 'white', width: '100%', maxWidth: '480px' }}
            >
              <div style={{ background: 'black', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selected.file_url && (
                  isVideoUrl(selected.file_url)
                    ? <video src={selected.file_url} controls style={{ maxWidth: '100%', maxHeight: '60vh' }} />
                    : <img src={selected.file_url} alt="" style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }} />
                )}
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#9f4022', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '14px', flexShrink: 0 }}>
                    {(selected.prof?.name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#53372b' }}>{selected.prof?.name}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(83,55,43,0.45)', fontWeight: '600', textTransform: 'uppercase' }}>{selected.prof?.team_name || 'Independent'}</p>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#53372b', fontWeight: '600' }}>
                  {selected.task?.title || selected.card?.text || 'Submission'}
                </p>
                {selected.task?.points && (
                  <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#6f8e7c', fontWeight: '800' }}>+{selected.task.points} pts</p>
                )}
              </div>
              <button onClick={() => setSelected(null)}
                style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function App() {
  const [session, setSession] = useState(null);
  const [page, setPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [tasks, setTasks] = useState([]);
  const [flashCards, setFlashCards] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showRulesGatekeeper, setShowRulesGatekeeper] = useState(false);
  const [clan, setClan] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [fullTasks, setFullTasks] = useState([]); // All tasks for habit tracker
  const [userSubmissions, setUserSubmissions] = useState([]); // User's own subs
  const [feedPosts, setFeedPosts] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isGsiReady, setIsGsiReady] = useState(false);
  const [allBatches, setAllBatches] = useState([]);
  const [pendingUser, setPendingUser] = useState(null); // For registration
  const [urlBatchId, setUrlBatchId] = useState(null); // Batch ID from URL
  const alertTimerRef = useRef(null);
  const uploadInProgressRef = useRef(false);

  // Capture Batch ID from URL (e.g. /TWATA)
  useEffect(() => {
    const path = window.location.pathname.split('/').filter(Boolean)[0];
    if (path && path.length > 2 && !['home', 'profile', 'board', 'team', 'habit-tracker', 'captain-dashboard'].includes(path.toLowerCase())) {
      setUrlBatchId(path.toUpperCase());
    }
  }, []);

  // Enforce User's Batch URL
  useEffect(() => {
    if (profile?.batch_id) {
      const currentPath = window.location.pathname.split('/').filter(Boolean)[0];
      const targetPath = profile.batch_id.toLowerCase();
      
      if (currentPath?.toLowerCase() !== targetPath) {
        window.history.replaceState(null, '', `/${profile.batch_id}`);
        setUrlBatchId(profile.batch_id);
      }
    } else if (session?.user) {
      // Unassigned users MUST stay on root /
      if (window.location.pathname !== '/') {
        window.history.replaceState(null, '', '/');
        setUrlBatchId(null);
      }
    }
  }, [profile?.batch_id, session?.user]);

  // ── Google GSI: wait for script to load, then restore session or prompt sign-in
  useEffect(() => {
    // Restore persisted Google session
    const savedSession = localStorage.getItem('hb_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setSession(parsed);
        setProfile(parsed.profile || null);
      } catch (_) {
        localStorage.removeItem('hb_session');
      }
    }
    setIsInitializing(false);

    // Wait for the GSI script (loaded async in index.html)
    const checkGsi = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkGsi);
        setIsGsiReady(true);
      }
    }, 100);

    return () => clearInterval(checkGsi);
  }, []);

  // Shimmer Effects
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = globalStyles;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  // Polling removed — consolidated into the effect below to avoid triple-firing

  // Timer Tick (to update 'isNotYetLive' states every minute)
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNewAlert = (alertData) => {
    // alertData can be coming from fetch or realtime
    if (!alertData || !alertData.text) return;

    // Check if it's already dismissed by the user
    const dismissedId = localStorage.getItem('last_dismissed_alert');
    if (dismissedId === alertData.id?.toString()) return;

    // Check if it's actually alive
    if (new Date(alertData.deadline) < new Date()) return;

    setActiveAlert(alertData);

    // Auto-clear logic: the timer should match the remaining deadline or 60s max for non-persistent UI?
    // User wants it to "stay", so we only auto-clear when it hits the deadline.
    const remainingMs = new Date(alertData.deadline).getTime() - Date.now();

    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    alertTimerRef.current = setTimeout(() => {
      setActiveAlert(null);
    }, Math.min(remainingMs, 3600000)); // Max 1 hour auto-refresh check
  };

  const verifyUserExistence = async () => {
    if (!session?.user?.id) return;
    try {
      const allProfiles = await getAllEntities(TABLES.PROFILES);
      const exists = allProfiles.some(p => p.rowKey === session.user.id);
      if (!exists) {
        console.warn('Security Protocol: User record not found. Finalizing termination.');
        handleLogout();
      }
    } catch (e) {
      console.error("Existence check failed:", e);
    }
  };

  const fetchCurrentAlert = async () => {
    if (!profile?.batch_id) return;
    try {
      const allFlashcards = await getAllEntities(TABLES.FLASHCARDS);
      const now = new Date();
      const latestAlert = allFlashcards
        .filter(f => f.type === 'alert' && (f.batch_id === profile.batch_id) && new Date(f.deadline) > now)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

      if (latestAlert) {
        handleNewAlert(latestAlert);
      }
    } catch (e) {
      console.error("Alert fetch failed:", e);
    }
  };

  // 4. Identity-Based Realtime Listener (Polled)
  useEffect(() => {
    if (!session?.user?.id) return;
    const interval = setInterval(() => {
      // Just re-fetch basic profile data occasionally
      // (Mocked for now)
    }, 60000);

    return () => clearInterval(interval);
  }, [session?.user?.id]);

  // Periodic sync for alerts and challenge settings (separate from data polling)
  useEffect(() => {
    if (!session || !profile) return;
    const syncInterval = setInterval(() => {
        fetchCurrentAlert();
        if (profile.batch_id) fetchChallengeSettings(profile.batch_id);
    }, 8000);
    return () => clearInterval(syncInterval);
  }, [session, profile]);


  // 3. Re-fetch data whenever profile or selectedDay changes
  useEffect(() => {
    if (session?.user && profile) {
      fetchData(true); // Initial load shows skeleton
      const interval = setInterval(() => fetchData(false), 4000); // Polls are silent
      return () => clearInterval(interval);
    }
  }, [session?.user, profile?.rowKey, selectedDay]);

  // 3.1 Fetch Batch Settings whenever batch_id is available
  useEffect(() => {
    if (profile?.batch_id) {
      fetchChallengeSettings(profile.batch_id);
    }
  }, [profile?.batch_id]);

  const fetchChallengeSettings = async (batchId) => {
    console.log(`[BatchSync] Initializing settings for Batch: ${batchId}`);
    try {
      const allEntries = await getAllEntities(TABLES.FLASHCARDS);
      const batches = allEntries.filter(e => (e.partitionKey === "CONFIG_BATCH" || e.PartitionKey === "CONFIG_BATCH"));
      console.log(`[BatchSync] Found ${batches.length} batch configs in Flashcards table.`);
      setAllBatches(batches);
      
      const myBatch = batches.find(b => (b.rowKey || b.RowKey) === batchId);
      if (!myBatch) {
        console.warn(`[BatchSync] Batch ${batchId} not found in Flashcards table! Defaulting to Day 1.`);
        return;
      }

      console.log(`[BatchSync] Target Batch Found:`, myBatch);

      const startDateStr = myBatch.start_date || myBatch.StartDate || myBatch.startDate;
      const start = startDateStr ? new Date(startDateStr) : new Date();
      const now = new Date();

      const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const diffTime = nowDateOnly.getTime() - startDateOnly.getTime();
      const day = Math.max(1, Math.min(28, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1));

      console.log(`[BatchSync] Day Calculation: Start=${startDateOnly.toDateString()}, Now=${nowDateOnly.toDateString()}, Day=${day}`);

      setCurrentDay(day);
      if (selectedDay === 1 || selectedDay === currentDay) setSelectedDay(day);
    } catch (e) {
      console.error('[BatchSync] Critical Error in settings fetch:', e);
    }
  };

  const initUser = async (user) => {
    setAuthError(null);

    // 1. Fetch Batches First
    const allEntries = await getAllEntities(TABLES.FLASHCARDS);
    const batches = allEntries.filter(e => (e.partitionKey === "CONFIG_BATCH" || e.PartitionKey === "CONFIG_BATCH"));
    setAllBatches(batches);

    // 2. Fetch Profile
    const allProfiles = await getAllEntities(TABLES.PROFILES);
    const profileData = allProfiles.find(p => p.rowKey === user.id);

    if (profileData) {
      const isAdmin = profileData.role === 'admin' || profileData.is_admin === true;
      const isInternalDomain = user.email?.toLowerCase().endsWith('@hbplus.fit');

      if (isInternalDomain && !isAdmin) {
        localStorage.removeItem('hb_session');
        setSession(null);
        setProfile(null);
        if (user.email) signOutGoogle(user.email);
        setAuthError('Restricted Access: Internal accounts require Administrative clearance.');
        return;
      }

      if (profileData.is_allowed === false) {
        localStorage.removeItem('hb_session');
        setSession(null);
        setProfile(null);
        if (user.email) signOutGoogle(user.email);
        setAuthError(`PROTOCOL TERMINATED: You have been DISQUALIFIED! 🚫`);
        return;
      }

      // Restore User
      const resolvedProfile = { ...profileData, email: user.email, avatar_url: profileData.avatar_url || user.picture || null };
      setProfile(resolvedProfile);

      const newSession = { user: { id: user.id, email: user.email, picture: user.picture || null }, profile: resolvedProfile };
      setSession(newSession);
      localStorage.setItem('hb_session', JSON.stringify(newSession));

      const acceptedRules = localStorage.getItem(`rules_accepted_${user.id}`);
      if (acceptedRules !== 'true') {
        setShowRulesGatekeeper(true);
      }

      // Calculate Day based on their Batch
      if (resolvedProfile.batch_id) {
        const myBatch = batches.find(b => b.rowKey === resolvedProfile.batch_id || b.RowKey === resolvedProfile.batch_id);
        if (myBatch && myBatch.is_active === false) {
          localStorage.removeItem('hb_session');
          setSession(null);
          setProfile(null);
          if (user.email) signOutGoogle(user.email);
          setAuthError('PROTOCOL CONCLUDED: This challenge cycle is now INACTIVE. Contact support for details.');
          return;
        }

        // URL Enforcement check on login
        const currentPath = window.location.pathname.split('/').filter(Boolean)[0];
        if (currentPath?.toUpperCase() !== resolvedProfile.batch_id) {
           window.history.replaceState(null, '', `/${resolvedProfile.batch_id}`);
           setUrlBatchId(resolvedProfile.batch_id);
        }

        fetchChallengeSettings(resolvedProfile.batch_id);
      } else {
        // User has no batch assignment yet - Force Root URL
        if (window.location.pathname !== '/') {
           window.history.replaceState(null, '', '/');
           setUrlBatchId(null);
        }
      }

      fetchClanData(profileData.team_name);
    } else {
      // 3. New User Registration
      // Auto-register as "Independent" without a batch
      handleRegisterUser(user, null);
    }
  };

  const handleRegisterUser = async (user, requestedBatchId) => {
    if (user.email?.toLowerCase().endsWith('@hbplus.fit')) {
      setAuthError('Unauthorized: Internal domain accounts cannot register as clients.');
      localStorage.removeItem('hb_session');
      setSession(null);
      return;
    }
    try {
      const newProfile = {
        partitionKey: "Profile",
        rowKey: user.id,
        id: user.id,
        email: user.email,
        name: user.name || user.email.split('@')[0],
        avatar_url: user.picture || null,
        team_name: 'Independent',
        batch_id: null, // ALL new registrations go to the Waiting Room first
        requested_batch: urlBatchId || null, // Keep track of where they came from for admin
        points: 0,
        streak: 1,
        is_allowed: true,
        created_at: new Date().toISOString()
      };

      await upsertEntity(TABLES.PROFILES, newProfile);
      setProfile(newProfile);

      const newSession = { user: { id: user.id, email: user.email, picture: user.picture || null }, profile: newProfile };
      setSession(newSession);
      localStorage.setItem('hb_session', JSON.stringify(newSession));

      // Force Root URL for new registration
      window.history.replaceState(null, '', '/');
      setUrlBatchId(null);

      setShowRulesGatekeeper(true);
      setPendingUser(null);
    } catch (e) {
      alert("Registration failed: " + e.message);
    }
  };

  const fetchClanData = async (teamName) => {
    if (!teamName || teamName === 'Independent') {
      setClan(null);
      return;
    }
    try {
      const allClans = await getAllEntities(TABLES.CLANS);
      const data = allClans.find(c => c.name === teamName);
      if (data) setClan(data);
    } catch (e) {
      console.error("Clan fetch failed:", e);
    }
  };

  const handleFlashcardAction = async (cardId, action) => {
    console.log('Action Triggered:', action, cardId);
    if (!session?.user) return;

    try {
      if (action === 'interested') {
        await upsertEntity(TABLES.SUBMISSIONS, {
          partitionKey: "Submission",
          rowKey: `${session.user.id}_${cardId}`,
          user_id: session.user.id,
          flashcard_id: cardId,
          status: 'pending',
          created_at: new Date().toISOString()
        });
        setSuccessMessage('Challenge accepted!');
      } else {
        // Permanent Dismissal: Save as 'rejected' so it disappears forever for this user
        await upsertEntity(TABLES.SUBMISSIONS, {
          partitionKey: "Submission",
          rowKey: `${session.user.id}_${cardId}`,
          user_id: session.user.id,
          flashcard_id: cardId,
          status: 'rejected',
          updated_at: new Date().toISOString()
        });

        setSuccessMessage('Broadcast dismissed.');
      }

      // Optimistically update local state for immediate response
      setFlashCards(prev => prev.filter(f => f.id !== cardId));
      fetchData();
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (e) {
      console.error('Fatal interaction error:', e);
      alert(`System Error: ${e.message}`);
    }
  };

  const fetchData = async (isInitial = false) => {
    if (uploadInProgressRef.current) return;
    if (!session?.user) return;
    if (isInitial) setIsLoading(true);
    try {
      const day = selectedDay;
      const wk = Math.ceil(day / 7);

      // 1. Fetch from Azure Table Storage
      const allTasks = await getAllEntities(TABLES.TASKS);
      const allSubs = await getAllEntities(TABLES.SUBMISSIONS);
      const allProfiles = await getAllEntities(TABLES.PROFILES);
      const allFlashcards = await getAllEntities(TABLES.FLASHCARDS);

      // 1.1 Real-time Security Check (Force logout if deleted)
      const currentProfile = allProfiles.find(p => (p.rowKey || p.RowKey) === session.user.id);
      
      if (!currentProfile && session?.user) {
          console.log("Account Deactivated or Deleted! Force logging out...");
          handleLogout();
          return;
      }

      // 1.2 Real-time profile sync (Batch or Team assignment)
      const batchChanged = currentProfile && currentProfile.batch_id && currentProfile.batch_id !== (profile?.batch_id || null);
      const teamChanged = currentProfile && (currentProfile.team_name || 'Independent') !== (profile?.team_name || 'Independent');

      if (currentProfile && (batchChanged || teamChanged)) {
          console.log(`Profile Sync: ${batchChanged ? 'Batch' : ''} ${teamChanged ? 'Team' : ''} change detected!`);
          const resolvedProfile = { ...currentProfile, email: session.user.email, avatar_url: currentProfile.avatar_url || session.user.picture || null };
          setProfile(resolvedProfile);
          
          const newSession = { ...session, profile: resolvedProfile };
          setSession(newSession);
          localStorage.setItem('hb_session', JSON.stringify(newSession));
          
          if (batchChanged) {
            const bId = currentProfile.batch_id.toUpperCase();
            window.history.replaceState(null, '', `/${bId}`);
            setUrlBatchId(bId);
            fetchChallengeSettings(bId);
            return; 
          }
          
          if (teamChanged) {
            fetchClanData(currentProfile.team_name);
          }
      }

      // If we are still in the Waiting Queue (no batch_id), stop here
      if (!profile?.batch_id) return;

      setFullTasks(allTasks); // Cache all for tracker
      
      const batches = allFlashcards.filter(e => (e.partitionKey === "CONFIG_BATCH" || e.PartitionKey === "CONFIG_BATCH"));
      setAllBatches(batches);

      const myBatch = batches.find(b => (b.rowKey || b.RowKey) === profile.batch_id);
      const batchStart = myBatch?.start_date ? new Date(myBatch.start_date) : new Date(0);

      const mySubs = allSubs.filter(s => {
        const isMine = s.user_id === session.user.id;
        const subDate = new Date(s.created_at || s.Timestamp);
        return isMine && subDate >= batchStart;
      });
      setUserSubmissions(mySubs); 

      // FILTER BY BATCH (Include global tasks/flashcards with no batch_id)
      const batchTasks = allTasks.filter(t => {
        const tBatchId = t.batch_id || t.BatchId;
        return tBatchId === profile.batch_id;
      });
      const batchFlashcards = allFlashcards.filter(f => {
        const fBatchId = f.batch_id || f.BatchId;
        return fBatchId === profile.batch_id;
      });
      
      // Normalize and Deduplicate Day Tasks
      const seenTaskTitles = new Set();
      const dayTasks = batchTasks
        .filter(t => {
          const tDay = Number(t.day || t.Day || 1);
          const tWeek = Number(t.week || t.Week || 1);
          return tWeek == wk && tDay == day;
        })
        .map(t => {
          const tId = t.rowKey || t.RowKey || t.id;
          const liveTime = t.live_time || t.LiveTime || t.Live_time || "00:00";
          
          let goLiveAt = null;
          if (myBatch?.start_date) {
            try {
              const startDate = new Date(myBatch.start_date);
              const releaseDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
              releaseDate.setDate(releaseDate.getDate() + (Number(t.day || t.Day || 1) - 1));
              
              const [hours, minutes] = liveTime.split(':').map(Number);
              releaseDate.setHours(hours || 0, minutes || 0, 0, 0);
              goLiveAt = releaseDate.toISOString();
            } catch (e) {
              console.error("Date calculation error", e);
            }
          }

          const sub = mySubs.find(s => (s.task_id === tId) || (s.Task_id === tId));

          return {
            ...t,
            id: tId,
            title: t.title || t.Title || "Untitled Protocol",
            go_live_at: goLiveAt,
            go_live_time: liveTime,
            status: sub?.status || 'pending',
            rejection_comment: sub?.rejection_comment || sub?.Rejection_comment || null
          };
        })
        .filter(t => {
          if (seenTaskTitles.has(t.title)) return false;
          seenTaskTitles.add(t.title);
          return true;
        });

      const mergedTasks = dayTasks;

      // 2. Flashcards
      const now = new Date();
      let safeFlashcards = batchFlashcards.filter(f => {
        if (f.target_user_id && f.target_user_id !== session.user.id) return false;
        if (f.type === 'alert') return false;
        if (!f.deadline) return true;
        return new Date(f.deadline) > now;
      }).map(f => ({ ...f, id: f.rowKey || f.RowKey, text: f.text || f.title }));

      const interestedFlashcardIds = mySubs.filter(s => s.flashcard_id).map(s => s.flashcard_id);
      const flashcardTasks = safeFlashcards
        .filter(f => interestedFlashcardIds.includes(f.rowKey))
        .map(f => ({
          id: `fc-${f.rowKey}`,
          flashcard_id: f.rowKey,
          title: `WILDCARD: ${f.text}`,
          description: f.description,
          points: f.points || 50,
          proof_mode: f.proof_mode || 'both',
          status: mySubs.find(s => s.flashcard_id === f.rowKey)?.status || 'pending'
        }));

      setTasks([...mergedTasks, ...flashcardTasks]);
      setFlashCards(safeFlashcards.filter(f => !interestedFlashcardIds.includes(f.rowKey)));

      // Feed stories: approved + published + within 24h + same batch
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      const storyItems = allSubs
        .filter(s => {
          if (s.status !== 'approved') return false;
          if (!(s.published_to_feed === true || s.published_to_feed === 'true')) return false;
          const pubTime = new Date(s.feed_published_at || s.processed_at || s.created_at);
          return (Date.now() - pubTime.getTime()) < TWENTY_FOUR_HOURS;
        })
        .map(s => {
          const sId = s.rowKey || s.RowKey || s.id;
          const prof = allProfiles.find(p => (p.rowKey || p.RowKey || p.id) === s.user_id);
          if (prof?.batch_id !== profile.batch_id) return null;
          const task = allTasks.find(t => (t.rowKey || t.RowKey || t.id) === s.task_id);
          const card = allFlashcards.find(c => (c.rowKey || c.RowKey || c.id) === s.flashcard_id);
          return { ...s, id: sId, prof, task, card };
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.feed_published_at || b.processed_at || b.created_at) - new Date(a.feed_published_at || a.processed_at || a.created_at));
      setFeedPosts(storyItems);

      // 3. ENHANCED POINT CALCULATION (Live Sync - Filtered by Batch Start)
      const [allAwards] = await Promise.all([getAllEntities(TABLES.MANUAL_AWARDS)]);
      
      const batchProfiles = allProfiles.filter(p => p.batch_id === profile.batch_id);
      const enrichedProfiles = batchProfiles.map(p => {
        const uid = p.rowKey || p.RowKey;
        
        // Point calculation: be lenient with batch start date (compare by date, not time)
        const dayStart = new Date(batchStart);
        dayStart.setHours(0, 0, 0, 0);

        const userSubs = allSubs.filter(s => {
          const isMine = (s.user_id === uid) || (s.User_id === uid);
          const isApproved = s.status === 'approved' || s.Status === 'approved';
          return isMine && isApproved;
        });

        const userAwards = allAwards.filter(a => {
          const isMine = (a.user_id === uid) || (a.User_id === uid);
          return isMine;
        });
        
        let calculatedPoints = 0;
        userSubs.forEach(s => {
          const sTaskId = s.task_id || s.Task_id || s.TaskId;
          const sFlashId = s.flashcard_id || s.Flashcard_id || s.FlashcardId;

          if (sTaskId) {
            const t = allTasks.find(task => (task.rowKey || task.RowKey || task.id) === sTaskId);
            calculatedPoints += Number(t?.points || t?.Points || 0);
          } else if (sFlashId) {
            const f = allFlashcards.find(card => (card.rowKey || card.RowKey || card.id) === sFlashId);
            calculatedPoints += Number(f?.points || f?.Points || 0);
          }
        });
        userAwards.forEach(a => {
          calculatedPoints += Number(a.points || a.Points || 0);
        });

        return { ...p, points: calculatedPoints, id: uid };
      });

      const sortedLeaderboard = enrichedProfiles.sort((a, b) => b.points - a.points);
      setLeaderboard(sortedLeaderboard);

      const myEnrichedProfile = enrichedProfiles.find(u => u.id === session.user.id);
      if (myEnrichedProfile) {
        setProfile(myEnrichedProfile);
      }
    } catch (e) {
      console.error('Azure fetch failure', e);
    }
  };

  /**
   * Called by Google GSI after the user approves the sign-in consent.
   * `payload` is the decoded JWT: { sub, email, name, picture, email_verified }
   */
  const handleGoogleSignIn = async (payload) => {
    if (!payload?.sub || !payload?.email) {
      setAuthError('Google sign-in returned incomplete data. Please try again.');
      return;
    }
    setIsInitializing(true);
    setAuthError(null);
    try {
      const googleUser = {
        id: payload.sub,          // stable Google user ID
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture || null,
      };
      await initUser(googleUser);
      // initUser sets profile + session internally
    } catch (e) {
      console.error('Google sign-in error details:', e);
      setAuthError(`Authentication failed: ${e.message || 'Unknown error'}. Please check your connection or console.`);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleLogout = () => {
    const email = session?.user?.email;
    localStorage.removeItem('hb_session');
    setSession(null);
    setProfile(null);
    if (email) signOutGoogle(email);
  };

  const handleUploadAction = async (task, file, consentToFeed = false) => {
    if (!session?.user) return;
    uploadInProgressRef.current = true;
    try {
      let fUrl = null;
      if (file) {
        let fileToUpload = file;
        if (file.type.startsWith('image/')) {
          console.log('Compressing image...', file.name, file.size);
          const options = { 
            maxSizeMB: 1.0, 
            maxWidthOrHeight: 1920, 
            useWebWorker: true,
            initialQuality: 0.8
          };
          try {
            fileToUpload = await imageCompression(file, options);
            console.log('Compression complete', fileToUpload.size);
          } catch (cErr) {
            console.error('Compression failed', cErr);
          }
        }

        console.log('Initiating upload to Azure...');
        try {
          fUrl = await uploadToAzure(fileToUpload, 'proofs');
          console.log('Azure Upload Success:', fUrl);
        } catch (uploadErr) {
          console.error('Azure Upload Failed:', uploadErr);
          throw new Error(`Cloud Storage Error: ${uploadErr.message}. Please check your connection.`);
        }
      }

      const upsertData = {
        partitionKey: "Submission",
        rowKey: task.flashcard_id ? `${session.user.id}_${task.flashcard_id}` : `${session.user.id}_${task.id}`,
        user_id: session.user.id,
        status: task.proof_mode === 'checkbox' ? 'approved' : 'under-review',
        file_url: fUrl,
        consent_to_feed: consentToFeed,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      if (task.flashcard_id) upsertData.flashcard_id = task.flashcard_id;
      else upsertData.task_id = task.id;
      
      await upsertEntity(TABLES.SUBMISSIONS, upsertData);

      if (task.proof_mode === 'checkbox') {
          // Points are calculated on the fly in fetchData, so we don't need to manually update Profiles here anymore
          // But we still create the award for history
          await upsertEntity(TABLES.MANUAL_AWARDS, {
            partitionKey: "Award",
            rowKey: Date.now().toString(),
            user_id: session.user.id,
            points: task.points || 0,
            reason: `Self-declaration: ${task.title}`,
            created_at: new Date().toISOString()
          });
      }

      setSuccessMessage('Proof submitted successfully!');
      fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e) {
      console.error('Submission sequence failed:', e);
      alert(`Submission Error: ${e.message}`);
    } finally {
      uploadInProgressRef.current = false;
    }
  };

  const handleUpdateProfile = async ({ name, avatar }) => {
    if (!session?.user) return;
    try {
      let updates = {};
      if (name) updates.name = name;

      if (avatar) {
        let avatarToUpload = avatar;
        if (avatar.type.startsWith('image/')) {
          const options = { maxSizeMB: 0.05, maxWidthOrHeight: 400, useWebWorker: true };
          try {
            avatarToUpload = await imageCompression(avatar, options);
          } catch (e) {
            console.error('Avatar compression failed', e);
          }
        }
        updates.avatar_url = await uploadToAzure(avatarToUpload, 'avatars');
      }

      const allProfiles = await getAllEntities(TABLES.PROFILES);
      const profile = allProfiles.find(p => p.rowKey === session.user.id);
      if (profile) {
        await upsertEntity(TABLES.PROFILES, { ...profile, ...updates });
        setProfile(prev => ({ ...prev, ...updates }));
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (e) {
      console.error('Profile update failed:', e);
      alert(`Update Failed: ${e.message}`);
    }
  };


  if (isInitializing) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--hb-cream)', gap: '24px' }}>
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src={logoImg} alt="HB+" style={{ width: '80px', height: 'auto' }} />
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div className="loader" style={{ width: '24px', height: '24px', border: '2px solid rgba(159, 64, 34, 0.1)', borderTop: '2px solid var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', opacity: 0.6 }}>Synchronizing Protocol...</p>
        </div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="login-screen">
        <aside className="login-aside">
          <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2120&auto=format&fit=crop" alt="Wellness" />
          <div className="login-aside-overlay">
            <div className="login-aside-text">
              <h2>Elevate Your <br />Performance.</h2>
              <p>The science of wellness, <br />refined for the modern achiever.</p>
            </div>
          </div>
        </aside>

        <main className="login-main">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="login-card">
            <div className="login-logo"><img src={logoImg} alt="HB+" /></div>

            {pendingUser ? (
              <div style={{ textAlign: 'left', width: '100%' }}>
                <h1 style={{ fontSize: '24px' }}>Join a Batch</h1>
                <p>Welcome, {pendingUser.name}! Please select your tactical cycle to begin Day 1.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                  {allBatches.filter(b => !b.is_locked && b.is_active !== false && (!urlBatchId || b.rowKey === urlBatchId || b.RowKey === urlBatchId)).map(batch => (
                    <button
                      key={batch.rowKey || batch.RowKey}
                      onClick={() => handleRegisterUser(pendingUser, batch.rowKey || batch.RowKey)}
                      style={{
                        padding: '16px', background: 'white', border: urlBatchId === (batch.rowKey || batch.RowKey) ? '2px solid var(--accent)' : '1px solid #eee', borderRadius: '14px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', color: '#53372b', display: 'flex', justifyContent: 'space-between' }}>
                        {batch.name}
                        {urlBatchId === (batch.rowKey || batch.RowKey) && <span style={{ fontSize: '10px', color: 'var(--accent)' }}>RECOMMENDED</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: '#999' }}>Starts: {new Date(batch.start_date).toLocaleDateString()}</div>
                    </button>
                  ))}
                  {allBatches.filter(b => !b.is_locked && b.is_active !== false && (!urlBatchId || b.rowKey === urlBatchId || b.RowKey === urlBatchId)).length === 0 && (
                    <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 'bold' }}>This batch is currently locked or inactive. Contact support.</p>
                  )}
                  <button onClick={() => setPendingUser(null)} style={{ background: 'transparent', border: 'none', color: '#999', fontSize: '12px', cursor: 'pointer', marginTop: '12px' }}>Back to Sign In</button>
                </div>
              </div>
            ) : (
              <>
                <h1>Members Only</h1>
                <p>Welcome back. Please authenticate with your Google account to access your personalized protocol dashboard.</p>
                <AnimatePresence>
                  {authError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(159,64,34,0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '16px', borderRadius: '12px', fontSize: '13px', marginTop: '20px' }}>
                      {authError}
                    </motion.div>
                  )}
                </AnimatePresence>
                <GoogleSignInSection isGsiReady={isGsiReady} onSignIn={handleGoogleSignIn} />
              </>
            )}
            <div className="login-footer">HB+ PERFORMANCE SYSTEMS</div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="layout-root">
      
      <AnimatePresence>
        {showRulesGatekeeper && (
          <RulesGatekeeper onAccept={() => {
            if (session?.user?.id) {
              localStorage.setItem(`rules_accepted_${session.user.id}`, 'true');
            }
            setShowRulesGatekeeper(false);
          }} />
        )}
      </AnimatePresence>

      {isMenuOpen && <div className="overlay" onClick={() => setIsMenuOpen(false)} />}

      {profile?.batch_id && (
        <nav className={`bottom-nav ${isMenuOpen ? 'open' : ''}`}>
          <div className="nav-logo-section">
            <div className="logo-box" onClick={() => { setPage('home'); setIsMenuOpen(false); }} style={{ cursor: 'pointer' }}>
              <img src={logoImg} alt="HB+" />
            </div>
          </div>

          <div className="nav-items-container">
            <button className={`nav-item ${page === 'home' ? 'active' : ''}`} onClick={() => { setPage('home'); setIsMenuOpen(false); }}>
              <HomeIcon size={20} /> <span>Home</span>
            </button>
            {profile?.batch_id && (
              <>
                <button className={`nav-item ${page === 'board' ? 'active' : ''}`} onClick={() => { setPage('board'); setIsMenuOpen(false); }}>
                  <Trophy size={20} /> <span>Leaderboard</span>
                </button>
                <button className={`nav-item ${page === 'team' ? 'active' : ''}`} onClick={() => { setPage('team'); setIsMenuOpen(false); }}>
                  <Users size={20} /> <span>Team Hub</span>
                </button>
              </>
            )}
            {profile?.role === 'captain' && (
              <button className={`nav-item ${page === 'captain-dashboard' ? 'active' : ''}`} onClick={() => { setPage('captain-dashboard'); setIsMenuOpen(false); }}>
                <Award size={20} /> <span>Captain Console</span>
              </button>
            )}
            <button
              className={`nav-item ${page === 'profile' ? 'active' : ''}`}
              onClick={() => { setPage('profile'); setIsMenuOpen(false); }}
              style={profile?.role === 'captain' && page === 'profile' ? {
                background: 'rgba(255, 215, 0, 0.1)',
                color: '#B8860B',
                borderLeft: '4px solid #FFD700'
              } : profile?.role === 'captain' ? {
                color: '#B8860B'
              } : {}}
            >
              <User size={20} color={profile?.role === 'captain' ? '#B8860B' : 'currentColor'} /> <span>My Account</span>
            </button>

            {/* Mobile-only About Button */}
            <button className="nav-item mobile-only-btn" onClick={() => setIsAboutOpen(true)}>
              <Globe size={20} /> <span>About Us</span>
            </button>
          </div>

          {/* Social & Contact Section (Sidebar Footer - Hidden on Mobile) */}
          <div className="desktop-only-contact" style={{
            marginTop: 'auto',
            padding: '32px 24px',
            borderTop: '1px solid rgba(83, 55, 43, 0.15)',
            background: 'rgba(83, 55, 43, 0.02)',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <ContactSection logoImg={logoImg} />
          </div>

          <div className="logout-container">
            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={20} /> <span>Sign Out</span>
            </button>
          </div>
        </nav>
      )}

      <main className="main-content">
        {/* Persistent Branding Header / Lifestyle Test CTA (Responsive) */}
        <div className="header-cta-container">
          <button
            onClick={() => window.open('https://onboarding.hbplus.fit/', '_blank')}
            className="cta-lifestyle-btn"
          >
            Take the Lifestyle Test
          </button>
        </div>
        <AnimatePresence>
          {successMessage && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: '40px', left: '50%', transform: 'translateX(-50%)', background: 'var(--success-bg)', color: 'var(--success-text)', padding: '16px 32px', borderRadius: '16px', zIndex: 3000, fontWeight: '700', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* High-End Center Modal Broadcast (System Signal) */}
        <AnimatePresence>
          {activeAlert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10000,
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px'
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  background: '#1a1a1a',
                  width: '100%',
                  maxWidth: '450px',
                  borderRadius: '0', // Sharp/Premium look or very small radius
                  padding: '48px',
                  position: 'relative',
                  border: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center',
                  color: 'white',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
                }}
              >
                <button
                  onClick={() => {
                    localStorage.setItem('last_dismissed_alert', activeAlert.id?.toString());
                    setActiveAlert(null);
                  }}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'white',
                    color: 'black',
                    border: 'none',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  <X size={16} />
                </button>

                <div style={{ marginBottom: '32px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'white',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                  }}>
                    <img src={logoImg} alt="HB+" style={{ width: '40px' }} />
                  </div>

                  <div style={{ width: '40px', height: '2px', background: '#a04022', margin: '0 auto 24px' }} />

                  <p style={{
                    fontSize: '22px',
                    fontFamily: "'Bodoni Moda', serif",
                    fontStyle: 'italic',
                    lineHeight: '1.5',
                    color: 'white',
                    fontWeight: '500',
                    margin: 0,
                    letterSpacing: '-0.01em'
                  }}>
                    "{activeAlert.text}"
                  </p>
                </div>

                <div style={{ marginTop: '40px' }}>
                  <button
                    onClick={() => {
                      localStorage.setItem('last_dismissed_alert', activeAlert.id?.toString());
                      setActiveAlert(null);
                    }}
                    style={{
                      background: '#a04022',
                      color: 'white',
                      border: 'none',
                      padding: '16px 48px',
                      fontWeight: '900',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 10px 20px rgba(160, 64, 34, 0.3)',
                      borderRadius: '4px'
                    }}
                  >
                    Acknowledge Signal
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!profile?.batch_id ? (
            <WaitingScreen profile={profile} />
          ) : page === 'home' && (
            <HomePage
              tasks={tasks}
              flashCards={flashCards}
              currentDay={currentDay}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              onUpload={handleUploadAction}
              onFlashcardAction={handleFlashcardAction}
              profile={profile}
              batch={allBatches.find(b => b.rowKey === profile?.batch_id || b.RowKey === profile?.batch_id)}
              feedPosts={feedPosts}
            />
          )}
          {profile?.batch_id && page === 'board' && <BoardPage key="board" leaderboard={leaderboard} profile={profile} currentDay={currentDay} />}
          {profile?.batch_id && page === 'log' && <PointsLogPage key="log" profile={profile} />}
          {profile?.batch_id && page === 'habit-tracker' && (
            <HabitTrackerPage 
              key="habit-tracker" 
              profile={profile} 
              currentDay={currentDay} 
              onUpload={handleUploadAction} 
              batch={allBatches.find(b => b.rowKey === profile?.batch_id || b.RowKey === profile?.batch_id)}
              allTasks={fullTasks}
              allSubmissions={userSubmissions}
            />
          )}
          {profile?.batch_id && page === 'team' && <TeamPage key="team" profile={profile} leaderboard={leaderboard} clan={clan} />}
          {profile?.batch_id && page === 'feed' && <FeedPage key="feed" profile={profile} />}
          {profile?.batch_id && page === 'captain-dashboard' && <CaptainDashboard key="captain" profile={profile} leaderboard={leaderboard} />}
          {profile?.batch_id && page === 'profile' && <ProfilePage key="profile" profile={profile} onUpdate={handleUpdateProfile} onLogout={handleLogout} onNavigate={setPage} />}
        </AnimatePresence>

        {/* About Us Side Drawer (Mobile) */}
        <AnimatePresence>
          {isAboutOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAboutOpen(false)}
                className="overlay"
                style={{ zIndex: 4000 }}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '300px',
                  height: '100%',
                  background: 'var(--nav-bg)',
                  zIndex: 4001,
                  padding: '40px 24px',
                  boxShadow: '10px 0 30px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                  <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', margin: 0 }}>About Us</h2>
                  <button
                    onClick={() => setIsAboutOpen(false)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                  >
                    <X size={24} />
                  </button>
                </div>

                <ContactSection logoImg={logoImg} />

                <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '10px', opacity: 0.5, fontWeight: 'bold', letterSpacing: '0.1em' }}>
                  PROTOCOL VERSION 2.1.0
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Helper Sub-components ---
const ContactSection = ({ logoImg }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -3 }}
        onClick={() => window.open('https://hbplus.fit/hophome', '_blank')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer',
          padding: '16px 20px',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 8px 24px rgba(160, 64, 34, 0.08)',
          border: '1px solid rgba(160, 64, 34, 0.05)',
          width: '100%',
          marginBottom: '10px'
        }}
      >
        <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent)', borderRadius: '10px' }}>
          <img src={logoImg} style={{ width: '24px', mixBlendMode: 'screen' }} />
        </div>
        <span style={{ fontSize: '15px', fontWeight: '900', color: '#a04022', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Hop Studio</span>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 4px' }}>
        {/* Address Row */}
        <motion.div
          whileHover={{ x: 3 }}
          onClick={() => window.open('https://www.google.com/maps?ll=20.315335,85.820627&z=15&t=m&hl=en-US&gl=US&mapclient=embed&cid=3221341388707029373', '_blank')}
          style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}
        >
          <div style={{ width: '24px', display: 'flex', justifyContent: 'center', paddingTop: '2px' }}>
            <MapPin size={16} color="#a04022" />
          </div>
          <span style={{ fontSize: '12px', color: 'rgba(83, 55, 43, 0.7)', fontWeight: '600', lineHeight: '1.5' }}>
            HaSel Health and Wellness Pvt Ltd<br />Samanta Vihar, CS Pur, BBSR
          </span>
        </motion.div>

        {/* Phone Row */}
        <motion.div
          whileHover={{ x: 3 }}
          onClick={() => window.open('https://wa.me/917848094954', '_blank')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
            <Phone size={16} color="#a04022" />
          </div>
          <span style={{ fontSize: '12px', color: 'rgba(83, 55, 43, 0.7)', fontWeight: '600' }}>+91 7848094954</span>
        </motion.div>

        {/* Email Row */}
        <motion.div
          whileHover={{ x: 3 }}
          onClick={() => {
            copyToClipboard('info@hbplus.fit');
            window.location.href = 'mailto:info@hbplus.fit';
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
            <Mail size={16} color="#a04022" />
          </div>
          <span style={{ fontSize: '12px', color: 'rgba(83, 55, 43, 0.7)', fontWeight: '600' }}>info@hbplus.fit</span>
        </motion.div>
      </div>

      <div style={{ display: 'flex', gap: '20px', color: '#53372b', padding: '10px 4px', marginTop: '5px' }}>
        {[
          { Icon: Instagram, url: 'https://www.instagram.com/hopwith_hb/' },
          { Icon: Facebook, url: 'https://www.facebook.com/hbplus.fit' },
          { Icon: Linkedin, url: 'https://www.linkedin.com/company/hbplus/' },
          { Icon: Youtube, url: 'https://www.youtube.com/@hbplusofficial' },
          { Icon: Globe, url: 'https://hbplus.fit/' }
        ].map(({ Icon, url }, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -3, color: '#a04022' }}
            onClick={() => window.open(url, '_blank')}
            style={{ cursor: 'pointer', opacity: 0.6 }}
          >
            <Icon size={20} />
          </motion.div>
        ))}
      </div>
    </>
  );
};

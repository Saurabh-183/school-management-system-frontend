'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Tooltip,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  MenuBook as NotesIcon,
  VideoLibrary as VideoIcon,
  Description as DocumentIcon,
  CloudUpload as UploadIcon,
  PlayCircle as PlayIcon,
  Download as DownloadIcon,
  OpenInNew as OpenIcon,
  Add as AddIcon,
  Person as PersonIcon,
  CalendarToday as DateIcon,
  Schedule as TimeIcon,
  CheckCircle as CheckIcon,
  YouTube as YouTubeIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  AutoAwesome as SparklesIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';
import { Session, User, LectureNote, VideoLecture, SubjectDocument } from '@/lib/types';
import { api } from '@/lib/api';
import { formatTimeUTC, formatDate } from '@/lib/utils';

interface MuiLearningResourcesDialogProps {
  open: boolean;
  onClose: () => void;
  session: Session | null;
  currentUser: User | null;
  onResourceAdded?: () => void;
}

/**
 * Intelligent helper to convert raw user input into an in-app embeddable video URL.
 * Supports:
 * - Local blob / object URLs and direct MP4/WebM files (HTML5 video player)
 * - YouTube standard, short, and embed links (auto-converts to embed player)
 * - Google Drive video preview links (auto-converts to embed player)
 */
export function getEmbeddableVideoUrl(url: string): { embedUrl: string; isDirectVideo: boolean } {
  if (!url) return { embedUrl: '', isDirectVideo: false };
  const trimmed = url.trim();

  // If local blob URL or direct file extension
  if (
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:') ||
    /\.(mp4|webm|ogg|mov|mkv)(\?.*)?$/i.test(trimmed)
  ) {
    return { embedUrl: trimmed, isDirectVideo: true };
  }

  // YouTube match: watch?v=ID, youtu.be/ID, embed/ID
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0&enablejsapi=1`,
      isDirectVideo: false,
    };
  }

  // Google Drive video link
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    return {
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      isDirectVideo: false,
    };
  }

  return { embedUrl: trimmed, isDirectVideo: false };
}

/**
 * Intelligent helper to convert document URLs into embeddable in-app readers.
 * Uses Google Docs Viewer for external web PDFs to bypass X-Frame-Options (w3.org refusal).
 */
export function getEmbeddableDocUrl(url: string): { embedUrl: string; isBlobOrData: boolean } {
  if (!url) return { embedUrl: '', isBlobOrData: false };
  const trimmed = url.trim();

  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return { embedUrl: trimmed, isBlobOrData: true };
  }

  // Google Drive document link
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    return {
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      isBlobOrData: false,
    };
  }

  // If already google docs viewer
  if (trimmed.includes('docs.google.com/viewer')) {
    return { embedUrl: trimmed, isBlobOrData: false };
  }

  // Google Docs Embedded Viewer handles external PDFs without CORS or X-Frame-Options issues
  return {
    embedUrl: `https://docs.google.com/viewer?url=${encodeURIComponent(trimmed)}&embedded=true`,
    isBlobOrData: false,
  };
}

export function MuiLearningResourcesDialog({
  open,
  onClose,
  session,
  currentUser,
  onResourceAdded,
}: MuiLearningResourcesDialogProps) {
  const [tabIndex, setTabIndex] = useState<number>(0); // 0: Notes, 1: Videos, 2: Documents, 3: Teacher Upload
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Full session resources state
  const [notes, setNotes] = useState<LectureNote[]>([]);
  const [videos, setVideos] = useState<VideoLecture[]>([]);
  const [documents, setDocuments] = useState<SubjectDocument[]>([]);

  // Selected video for player
  const [selectedVideo, setSelectedVideo] = useState<VideoLecture | null>(null);
  // Selected document for preview
  const [selectedDoc, setSelectedDoc] = useState<SubjectDocument | null>(null);
  // Document viewer view mode: 'embed' | 'cheatsheet'
  const [docViewMode, setDocViewMode] = useState<'embed' | 'cheatsheet'>('embed');

  // Upload Form State (for Teachers & Admins)
  const [uploadType, setUploadType] = useState<'note' | 'video' | 'document'>('note');
  const [itemTitle, setItemTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Video Upload State
  const [videoSourceType, setVideoSourceType] = useState<'file' | 'link'>('file');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('45 mins');
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // Document Upload State
  const [docSourceType, setDocSourceType] = useState<'file' | 'link'>('file');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docFileUrl, setDocFileUrl] = useState('');
  const [docFileType, setDocFileType] = useState('PDF');
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch / Sync resources whenever session changes or dialog opens
  useEffect(() => {
    if (!open || !session?._id) return;

    const loadResources = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        const res = await api.getSessionResources(session._id);
        const nList = res.notes || session.notes || [];
        const vList = res.videoLectures || session.videoLectures || [];
        const dList = res.documents || session.documents || [];

        setNotes(nList);
        setVideos(vList);
        setDocuments(dList);

        if (vList.length > 0) setSelectedVideo(vList[0]);
        if (dList.length > 0) setSelectedDoc(dList[0]);
      } catch (err: any) {
        // Fallback to local session data if offline
        setNotes(session.notes || []);
        setVideos(session.videoLectures || []);
        setDocuments(session.documents || []);
        if (session.videoLectures && session.videoLectures.length > 0) setSelectedVideo(session.videoLectures[0]);
        if (session.documents && session.documents.length > 0) setSelectedDoc(session.documents[0]);
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [open, session]);

  if (!session) return null;

  const teacherName =
    typeof session.teacherId === 'object' && session.teacherId !== null
      ? (session.teacherId as any).fullName
      : session.teacher?.fullName || 'Assigned Mentor';

  const specialization =
    typeof session.teacherId === 'object' && session.teacherId !== null
      ? (session.teacherId as any).specialization
      : session.teacher?.specialization || 'Academic Subject';

  const canUpload =
    currentUser?.role === 'TEACHER' ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'SUPER_ADMIN';

  // Video Drag and Drop Handlers (Up to 200MB)
  const handleVideoFileSelect = (file: File) => {
    const maxVideoSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxVideoSize) {
      setErrorMsg(
        `Video file exceeds the 200MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a video up to 200MB or provide a link.`
      );
      return;
    }

    setVideoFile(file);
    const blobUrl = URL.createObjectURL(file);
    setVideoUrl(blobUrl);
    setErrorMsg(null);

    if (!itemTitle.trim()) {
      setItemTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  // Document Drag and Drop Handlers (Up to 50MB)
  const handleDocFileSelect = (file: File) => {
    const maxDocSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxDocSize) {
      setErrorMsg(`Document exceeds 50MB limit. Please select a smaller file.`);
      return;
    }

    setDocFile(file);
    const blobUrl = URL.createObjectURL(file);
    setDocFileUrl(blobUrl);
    setErrorMsg(null);

    const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
    setDocFileType(ext);

    if (!itemTitle.trim()) {
      setItemTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  // Handle Upload / Attach Material Submit
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim()) {
      setErrorMsg('Please provide a title for the resource.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      if (uploadType === 'note') {
        if (!noteContent.trim()) {
          setErrorMsg('Please enter the lecture note content.');
          return;
        }
        await api.addLectureNote(session._id, {
          title: itemTitle.trim(),
          content: noteContent.trim(),
        });
        setNotes((prev) => [
          ...prev,
          {
            title: itemTitle.trim(),
            content: noteContent.trim(),
            authorName: currentUser?.fullName || teacherName,
            createdAt: new Date().toISOString(),
          },
        ]);
        setSuccessMsg('Lecture notes published successfully for students!');
        setTabIndex(0);
      } else if (uploadType === 'video') {
        if (!videoUrl.trim()) {
          setErrorMsg('Please drop a video file (up to 200MB) or enter a YouTube/Drive link.');
          return;
        }

        const { embedUrl } = getEmbeddableVideoUrl(videoUrl);

        await api.addVideoLecture(session._id, {
          title: itemTitle.trim(),
          videoUrl: embedUrl,
          duration: videoDuration.trim() || '45 mins',
        });
        const newVid: VideoLecture = {
          title: itemTitle.trim(),
          videoUrl: embedUrl,
          duration: videoDuration.trim() || '45 mins',
          uploadedAt: new Date().toISOString(),
        };
        setVideos((prev) => [...prev, newVid]);
        setSelectedVideo(newVid);
        setSuccessMsg('Video lecture published successfully for in-app streaming!');
        setTabIndex(1);
      } else {
        if (!docFileUrl.trim()) {
          setErrorMsg('Please drop a document file or enter a document/Drive link.');
          return;
        }

        const { embedUrl } = getEmbeddableDocUrl(docFileUrl);

        await api.addSubjectDocument(session._id, {
          title: itemTitle.trim(),
          fileUrl: embedUrl,
          fileType: docFileType,
        });
        const newDoc: SubjectDocument = {
          title: itemTitle.trim(),
          fileUrl: embedUrl,
          fileType: docFileType,
          uploadedAt: new Date().toISOString(),
        };
        setDocuments((prev) => [...prev, newDoc]);
        setSelectedDoc(newDoc);
        setSuccessMsg('Subject document uploaded successfully for in-app viewing!');
        setTabIndex(2);
      }

      // Reset form states
      setItemTitle('');
      setNoteContent('');
      setVideoUrl('');
      setVideoFile(null);
      setDocFileUrl('');
      setDocFile(null);
      if (onResourceAdded) onResourceAdded();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeVideoInfo = selectedVideo ? getEmbeddableVideoUrl(selectedVideo.videoUrl) : null;
  const activeDocInfo = selectedDoc ? getEmbeddableDocUrl(selectedDoc.fileUrl) : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Header Banner */}
      <DialogTitle
        sx={{
          p: 2.5,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff' }}>
              📚 Learning Portal & Course Materials
            </Typography>
            <Chip
              label={specialization}
              size="small"
              sx={{ bgcolor: 'primary.main', color: '#ffffff', fontWeight: 700, fontSize: '0.7rem' }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
            <span>👨‍🏫 Mentor: <strong>{teacherName}</strong></span>
            <span>📅 {formatDate(session.startTime)}</span>
            <span>⏰ {formatTimeUTC(session.startTime)} – {formatTimeUTC(session.endTime)} (UTC)</span>
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
        <Tabs
          value={tabIndex}
          onChange={(_, val) => {
            setTabIndex(val);
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ px: 2 }}
        >
          <Tab
            icon={<NotesIcon fontSize="small" />}
            iconPosition="start"
            label={`Study Notes (${notes.length})`}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          />
          <Tab
            icon={<VideoIcon fontSize="small" />}
            iconPosition="start"
            label={`Video Lectures (${videos.length})`}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          />
          <Tab
            icon={<DocumentIcon fontSize="small" />}
            iconPosition="start"
            label={`Subject Documents (${documents.length})`}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          />
          {canUpload && (
            <Tab
              icon={<UploadIcon fontSize="small" />}
              iconPosition="start"
              label="+ Upload / Attach Material"
              sx={{ textTransform: 'none', fontWeight: 700, ml: 'auto', color: 'primary.main' }}
            />
          )}
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3, minHeight: 480 }}>
        {/* Notifications */}
        {errorMsg && (
          <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}

        {/* Loading Spinner */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
            <CircularProgress size={36} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Loading course resources for this session...
            </Typography>
          </Box>
        )}

        {/* TAB 0: STUDY NOTES */}
        {!loading && tabIndex === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {notes.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <NotesIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  No lecture notes published yet
                </Typography>
                <Typography variant="body2">
                  The instructor has not added study notes or summaries for this session yet.
                </Typography>
              </Box>
            ) : (
              notes.map((note, idx) => (
                <Paper
                  key={idx}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    bgcolor: '#ffffff',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      📝 {note.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {note.createdAt ? formatDate(note.createdAt) : 'Session Material'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="primary" sx={{ fontWeight: 600, display: 'block', mb: 1.5 }}>
                    Published by: {note.authorName || teacherName}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#334155',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      fontFamily: 'inherit',
                    }}
                  >
                    {note.content}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<CheckIcon />}
                      onClick={() => {
                        navigator.clipboard.writeText(note.content);
                        setSuccessMsg('Notes copied to clipboard for offline revision!');
                      }}
                      sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      Copy Notes
                    </Button>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        )}

        {/* TAB 1: VIDEO LECTURES */}
        {!loading && tabIndex === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {videos.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <VideoIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  No video lectures uploaded yet
                </Typography>
                <Typography variant="body2">
                  Recorded video lectures will appear here once published by the teacher.
                </Typography>
              </Box>
            ) : (
              <Box>
                {/* Embedded In-App Video Player */}
                {selectedVideo && activeVideoInfo && (
                  <Paper
                    elevation={0}
                    sx={{
                      mb: 3,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0',
                      bgcolor: '#000000',
                    }}
                  >
                    <Box sx={{ position: 'relative', width: '100%', pt: '56.25%', bgcolor: '#000000' }}>
                      {activeVideoInfo.isDirectVideo ? (
                        <video
                          controls
                          src={activeVideoInfo.embedUrl}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#000000',
                          }}
                        >
                          Your browser does not support HTML5 video streaming.
                        </video>
                      ) : (
                        <iframe
                          src={activeVideoInfo.embedUrl}
                          title={selectedVideo.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 0,
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ p: 2, bgcolor: '#0f172a', color: '#ffffff' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          ▶️ In-App Stream: {selectedVideo.title}
                        </Typography>
                        <Chip
                          label={selectedVideo.duration || '45 mins'}
                          size="small"
                          color="secondary"
                          sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>
                        Protected In-App Playback • Screen Recording and Screenshot Protections Active
                      </Typography>
                    </Box>
                  </Paper>
                )}

                {/* Playlist of available video lectures */}
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>
                  Recorded Class Playlist ({videos.length} Lectures)
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {videos.map((vid, idx) => (
                    <Paper
                      key={idx}
                      elevation={0}
                      onClick={() => setSelectedVideo(vid)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: selectedVideo?.videoUrl === vid.videoUrl ? 'primary.main' : '#e2e8f0',
                        bgcolor: selectedVideo?.videoUrl === vid.videoUrl ? '#eff6ff' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        '&:hover': { bgcolor: '#f1f5f9' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <PlayIcon color={selectedVideo?.videoUrl === vid.videoUrl ? 'primary' : 'action'} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {vid.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Duration: {vid.duration || '45 mins'} • In-App HD Stream
                          </Typography>
                        </Box>
                      </Box>
                      <Button size="small" variant="text" sx={{ textTransform: 'none', fontWeight: 600 }}>
                        {selectedVideo?.videoUrl === vid.videoUrl ? 'Playing' : 'Play Now'}
                      </Button>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* TAB 2: SUBJECT DOCUMENTS */}
        {!loading && tabIndex === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {documents.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <DocumentIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  No subject documents attached yet
                </Typography>
                <Typography variant="body2">
                  Course handouts, PDF slides, and syllabus documents will appear here.
                </Typography>
              </Box>
            ) : (
              <Box>
                {/* Active Document In-App Reader Header & View Mode Switcher */}
                {selectedDoc && (
                  <Paper
                    elevation={0}
                    sx={{
                      mb: 3,
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid #e2e8f0',
                      bgcolor: '#f8fafc',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DocumentIcon color="primary" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          📑 In-App Document Viewer: {selectedDoc.title}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant={docViewMode === 'embed' ? 'contained' : 'outlined'}
                          onClick={() => setDocViewMode('embed')}
                          sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          In-App Reader
                        </Button>
                        <Button
                          size="small"
                          variant={docViewMode === 'cheatsheet' ? 'contained' : 'outlined'}
                          color="secondary"
                          startIcon={<SparklesIcon sx={{ fontSize: 15 }} />}
                          onClick={() => setDocViewMode('cheatsheet')}
                          sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          Interactive Cheatsheet
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<OpenIcon />}
                          onClick={() => window.open(selectedDoc.fileUrl, '_blank')}
                          sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          Open Direct
                        </Button>
                      </Box>
                    </Box>

                    {/* View Mode 1: Embedded In-App Document Reader */}
                    {docViewMode === 'embed' && activeDocInfo && (
                      <Box
                        sx={{
                          width: '100%',
                          height: 440,
                          border: '1px solid #cbd5e1',
                          borderRadius: 1.5,
                          overflow: 'hidden',
                          bgcolor: '#ffffff',
                          position: 'relative',
                        }}
                      >
                        <iframe
                          src={activeDocInfo.embedUrl}
                          title={selectedDoc.title}
                          style={{ width: '100%', height: '100%', border: 0 }}
                        />
                      </Box>
                    )}

                    {/* View Mode 2: Interactive In-App Quick Revision Cheatsheet */}
                    {docViewMode === 'cheatsheet' && (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          border: '1px solid #cbd5e1',
                          borderRadius: 2,
                          bgcolor: '#ffffff',
                          maxHeight: 440,
                          overflowY: 'auto',
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          ⚡ Dynamic Programming Formula & State Recurrence Cheatsheet
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                          Standard reference formulas verified by faculty for examination preparation.
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {/* 0/1 Knapsack */}
                          <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0284c7' }}>
                                1. 0/1 Knapsack Problem (Bounded)
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.5 }}>
                                Recurrence Relation:
                              </Typography>
                              <Box sx={{ p: 1.5, bgcolor: '#0f172a', color: '#38bdf8', borderRadius: 1.5, fontFamily: 'monospace', fontSize: '0.82rem', mt: 0.5 }}>
                                DP[i][w] = max(DP[i-1][w], DP[i-1][w - wt[i-1]] + val[i-1]) &nbsp; (if w &gt;= wt[i-1])
                              </Box>
                              <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block' }}>
                                Time Complexity: O(N × W) • Space Complexity: O(W) (with 1D array space optimization)
                              </Typography>
                            </CardContent>
                          </Card>

                          {/* Longest Common Subsequence */}
                          <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#7c3aed' }}>
                                2. Longest Common Subsequence (LCS)
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.5 }}>
                                Recurrence Relation:
                              </Typography>
                              <Box sx={{ p: 1.5, bgcolor: '#0f172a', color: '#a78bfa', borderRadius: 1.5, fontFamily: 'monospace', fontSize: '0.82rem', mt: 0.5 }}>
                                DP[i][j] = (s1[i-1] == s2[j-1]) ? 1 + DP[i-1][j-1] : max(DP[i-1][j], DP[i][j-1])
                              </Box>
                              <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block' }}>
                                Time Complexity: O(N × M) • Space Complexity: O(M)
                              </Typography>
                            </CardContent>
                          </Card>

                          {/* Coin Change */}
                          <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#059669' }}>
                                3. Coin Change (Unbounded Knapsack)
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.5 }}>
                                Minimum Coins Required:
                              </Typography>
                              <Box sx={{ p: 1.5, bgcolor: '#0f172a', color: '#34d399', borderRadius: 1.5, fontFamily: 'monospace', fontSize: '0.82rem', mt: 0.5 }}>
                                DP[a] = min(DP[a], 1 + DP[a - coin]) &nbsp; for each coin &lt;= a
                              </Box>
                              <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block' }}>
                                Base Case: DP[0] = 0; initialize all other states to Infinity.
                              </Typography>
                            </CardContent>
                          </Card>

                          {/* Matrix Chain Multiplication */}
                          <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#d97706' }}>
                                4. Matrix Chain Multiplication (MCM Partition)
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.5 }}>
                                Optimal Parenthesization Recurrence:
                              </Typography>
                              <Box sx={{ p: 1.5, bgcolor: '#0f172a', color: '#fbbf24', borderRadius: 1.5, fontFamily: 'monospace', fontSize: '0.82rem', mt: 0.5 }}>
                                DP[i][j] = min_{'{i &lt;= k &lt; j}'} (DP[i][k] + DP[k+1][j] + p[i-1] * p[k] * p[j])
                              </Box>
                            </CardContent>
                          </Card>
                        </Box>
                      </Paper>
                    )}
                  </Paper>
                )}

                {/* Document List */}
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>
                  Available Reference Documents & Slides ({documents.length})
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {documents.map((doc, idx) => (
                    <Paper
                      key={idx}
                      elevation={0}
                      onClick={() => setSelectedDoc(doc)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: selectedDoc?.fileUrl === doc.fileUrl ? 'primary.main' : '#e2e8f0',
                        bgcolor: selectedDoc?.fileUrl === doc.fileUrl ? '#eff6ff' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        '&:hover': { bgcolor: '#f1f5f9' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <DocumentIcon color="action" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {doc.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Format: {doc.fileType || 'PDF'} • In-App Verified Viewer
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}>
                          {selectedDoc?.fileUrl === doc.fileUrl ? 'Viewing' : 'Preview In-App'}
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* TAB 3: TEACHER UPLOAD FORM */}
        {!loading && tabIndex === 3 && canUpload && (
          <Box component="form" onSubmit={handleUploadSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Publish Academic Material for this Session
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload video lectures (drag & drop up to 200MB or YouTube link), subject documents, or lecture notes. Everything opens and plays inside the app.
              </Typography>
            </Box>

            {/* Type selector */}
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip
                icon={<NotesIcon />}
                label="Lecture Notes"
                color={uploadType === 'note' ? 'primary' : 'default'}
                onClick={() => setUploadType('note')}
                sx={{ fontWeight: 700, px: 1 }}
              />
              <Chip
                icon={<VideoIcon />}
                label="Video Lecture (Drag & Drop / YT)"
                color={uploadType === 'video' ? 'secondary' : 'default'}
                onClick={() => setUploadType('video')}
                sx={{ fontWeight: 700, px: 1 }}
              />
              <Chip
                icon={<DocumentIcon />}
                label="Subject Document (PDF/Slides/Drive)"
                color={uploadType === 'document' ? 'warning' : 'default'}
                onClick={() => setUploadType('document')}
                sx={{ fontWeight: 700, px: 1 }}
              />
            </Box>

            <TextField
              label="Resource Title *"
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              placeholder="e.g. Unit 4: Graph Traversals & Breadth-First Search"
              fullWidth
              required
              size="small"
            />

            {/* NOTES FORM */}
            {uploadType === 'note' && (
              <TextField
                label="Study Notes / Summary Content *"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write detailed revision notes, key concepts, formulas, and takeaways..."
                multiline
                rows={6}
                fullWidth
                required
              />
            )}

            {/* VIDEO LECTURE FORM WITH DRAG & DROP UP TO 200MB */}
            {uploadType === 'video' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    VIDEO SOURCE:
                  </Typography>
                  <Chip
                    label="📁 Drag & Drop File (Max 200MB)"
                    variant={videoSourceType === 'file' ? 'filled' : 'outlined'}
                    color="secondary"
                    size="small"
                    onClick={() => setVideoSourceType('file')}
                    sx={{ fontWeight: 700 }}
                  />
                  <Chip
                    icon={<YouTubeIcon />}
                    label="🔗 YouTube / Drive / MP4 URL"
                    variant={videoSourceType === 'link' ? 'filled' : 'outlined'}
                    color="secondary"
                    size="small"
                    onClick={() => setVideoSourceType('link')}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>

                {videoSourceType === 'file' ? (
                  <Box>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska,.mp4,.webm,.mov,.mkv"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleVideoFileSelect(e.target.files[0]);
                        }
                      }}
                    />
                    <Box
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingVideo(true);
                      }}
                      onDragLeave={() => setIsDraggingVideo(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingVideo(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleVideoFileSelect(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => videoInputRef.current?.click()}
                      sx={{
                        p: 4,
                        border: '2px dashed',
                        borderColor: isDraggingVideo ? 'secondary.main' : '#cbd5e1',
                        borderRadius: 3,
                        bgcolor: isDraggingVideo ? '#fdf2f8' : '#f8fafc',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: '#f1f5f9',
                          borderColor: 'secondary.main',
                        },
                      }}
                    >
                      <VideoIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        Drag & drop video lecture here, or browse files
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Supported formats: MP4, WebM, MOV, MKV • <strong>Maximum file size: 200MB</strong>
                      </Typography>
                      {videoFile && (
                        <Box sx={{ mt: 2, display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: '#ffffff', px: 2, py: 1, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                          <FileIcon color="secondary" fontSize="small" />
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setVideoFile(null);
                              setVideoUrl('');
                            }}
                          >
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <TextField
                    label="Video Lecture URL (YouTube Embed / Direct Link)"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="e.g. https://www.youtube.com/watch?v=gcULXE7ViZw or https://drive.google.com/file/d/.../view"
                    fullWidth
                    required
                    size="small"
                    helperText="YouTube and Google Drive links will automatically be transformed into in-app embed streams."
                  />
                )}

                <TextField
                  label="Estimated Lecture Duration"
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(e.target.value)}
                  placeholder="e.g. 45 mins"
                  size="small"
                />
              </Box>
            )}

            {/* SUBJECT DOCUMENT FORM WITH DRAG & DROP & DRIVE LINK */}
            {uploadType === 'document' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    DOCUMENT SOURCE:
                  </Typography>
                  <Chip
                    label="📄 Drag & Drop Document"
                    variant={docSourceType === 'file' ? 'filled' : 'outlined'}
                    color="warning"
                    size="small"
                    onClick={() => setDocSourceType('file')}
                    sx={{ fontWeight: 700 }}
                  />
                  <Chip
                    label="🔗 Google Drive / PDF Web Link"
                    variant={docSourceType === 'link' ? 'filled' : 'outlined'}
                    color="warning"
                    size="small"
                    onClick={() => setDocSourceType('link')}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>

                {docSourceType === 'file' ? (
                  <Box>
                    <input
                      ref={docInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,application/pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleDocFileSelect(e.target.files[0]);
                        }
                      }}
                    />
                    <Box
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingDoc(true);
                      }}
                      onDragLeave={() => setIsDraggingDoc(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingDoc(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleDocFileSelect(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => docInputRef.current?.click()}
                      sx={{
                        p: 4,
                        border: '2px dashed',
                        borderColor: isDraggingDoc ? 'warning.main' : '#cbd5e1',
                        borderRadius: 3,
                        bgcolor: isDraggingDoc ? '#fffbeb' : '#f8fafc',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: '#f1f5f9',
                          borderColor: 'warning.main',
                        },
                      }}
                    >
                      <DocumentIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        Drag & drop subject document here, or browse files
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Supported formats: PDF, DOCX, PPT, TXT • <strong>Up to 50MB</strong>
                      </Typography>
                      {docFile && (
                        <Box sx={{ mt: 2, display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: '#ffffff', px: 2, py: 1, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                          <DocumentIcon color="warning" fontSize="small" />
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {docFile.name} ({(docFile.size / (1024 * 1024)).toFixed(2)} MB)
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setDocFile(null);
                              setDocFileUrl('');
                            }}
                          >
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <TextField
                    label="Document File URL (Google Drive / Web PDF)"
                    value={docFileUrl}
                    onChange={(e) => setDocFileUrl(e.target.value)}
                    placeholder="e.g. https://drive.google.com/file/d/.../view or direct PDF URL"
                    fullWidth
                    required
                    size="small"
                    helperText="Google Drive and Web PDF links will render seamlessly inside the In-App Document Viewer."
                  />
                )}

                <TextField
                  label="Document Type / Format"
                  value={docFileType}
                  onChange={(e) => setDocFileType(e.target.value)}
                  placeholder="PDF, DOCX, SLIDES"
                  size="small"
                />
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <UploadIcon />}
              sx={{ fontWeight: 700, py: 1.2, borderRadius: 2 }}
            >
              {isSubmitting ? 'Publishing Material...' : 'Publish to Students'}
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} variant="contained" color="inherit" sx={{ fontWeight: 600 }}>
          Close Portal
        </Button>
      </DialogActions>
    </Dialog>
  );
}

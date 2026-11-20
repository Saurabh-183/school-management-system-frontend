'use client';

import React, { useState, useEffect } from 'react';
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

  // Upload Form State (for Teachers & Admins)
  const [uploadType, setUploadType] = useState<'note' | 'video' | 'document'>('note');
  const [itemTitle, setItemTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('45 mins');
  const [docFileUrl, setDocFileUrl] = useState('');
  const [docFileType, setDocFileType] = useState('PDF');
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

  // Handle Teacher Upload Submit
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
          setErrorMsg('Please provide a video URL or YouTube embed link.');
          return;
        }
        await api.addVideoLecture(session._id, {
          title: itemTitle.trim(),
          videoUrl: videoUrl.trim(),
          duration: videoDuration.trim() || '45 mins',
        });
        const newVid: VideoLecture = {
          title: itemTitle.trim(),
          videoUrl: videoUrl.trim(),
          duration: videoDuration.trim() || '45 mins',
          uploadedAt: new Date().toISOString(),
        };
        setVideos((prev) => [...prev, newVid]);
        setSelectedVideo(newVid);
        setSuccessMsg('Video lecture published successfully for students!');
        setTabIndex(1);
      } else {
        if (!docFileUrl.trim()) {
          setErrorMsg('Please provide a document file URL or reference link.');
          return;
        }
        await api.addSubjectDocument(session._id, {
          title: itemTitle.trim(),
          fileUrl: docFileUrl.trim(),
          fileType: docFileType,
        });
        const newDoc: SubjectDocument = {
          title: itemTitle.trim(),
          fileUrl: docFileUrl.trim(),
          fileType: docFileType,
          uploadedAt: new Date().toISOString(),
        };
        setDocuments((prev) => [...prev, newDoc]);
        setSelectedDoc(newDoc);
        setSuccessMsg('Subject document uploaded successfully for students!');
        setTabIndex(2);
      }

      // Reset form
      setItemTitle('');
      setNoteContent('');
      setVideoUrl('');
      setDocFileUrl('');
      if (onResourceAdded) onResourceAdded();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload resource');
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc', px: 2 }}>
        <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)} variant="scrollable" scrollButtons="auto">
          <Tab
            icon={<NotesIcon fontSize="small" />}
            iconPosition="start"
            label={`Study Notes (${notes.length})`}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }}
          />
          <Tab
            icon={<VideoIcon fontSize="small" />}
            iconPosition="start"
            label={`Video Lectures (${videos.length})`}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }}
          />
          <Tab
            icon={<DocumentIcon fontSize="small" />}
            iconPosition="start"
            label={`Subject Documents (${documents.length})`}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }}
          />
          {canUpload && (
            <Tab
              icon={<UploadIcon fontSize="small" />}
              iconPosition="start"
              label="+ Upload / Attach Material"
              sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.85rem', color: 'primary.main' }}
            />
          )}
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: '#ffffff', minHeight: 400 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg(null)}>
            {successMsg}
          </Alert>
        )}
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMsg(null)}>
            {errorMsg}
          </Alert>
        )}

        {/* TAB 0: STUDY NOTES */}
        {!loading && tabIndex === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {notes.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <NotesIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  No study notes uploaded yet
                </Typography>
                <Typography variant="body2">
                  The teacher has not published written notes for this session yet. Check back soon!
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
                    bgcolor: '#f8fafc',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>
                      {note.title}
                    </Typography>
                    <Chip
                      label={`Author: ${note.authorName || teacherName}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.72rem', fontWeight: 600 }}
                    />
                  </Box>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#334155',
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
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
                {selectedVideo && (
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
                    <Box sx={{ position: 'relative', width: '100%', pt: '56.25%' }}>
                      <iframe
                        src={selectedVideo.videoUrl}
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
                    </Box>
                    <Box sx={{ p: 2, bgcolor: '#0f172a', color: '#ffffff' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          ▶️ Now Playing: {selectedVideo.title}
                        </Typography>
                        <Chip
                          label={selectedVideo.duration || '45 mins'}
                          size="small"
                          color="secondary"
                          sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                        />
                      </Box>
                      {selectedVideo.description && (
                        <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>
                          {selectedVideo.description}
                        </Typography>
                      )}
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
                        {selectedVideo?.videoUrl === vid.videoUrl ? 'Active' : 'Play Now'}
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
                {/* Active Document In-App Reader */}
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DocumentIcon color="primary" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          📑 In-App Document Viewer: {selectedDoc.title}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<OpenIcon />}
                          onClick={() => window.open(selectedDoc.fileUrl, '_blank')}
                          sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          Open in Tab
                        </Button>
                      </Box>
                    </Box>

                    {/* In-app iframe document viewer */}
                    <Box
                      sx={{
                        width: '100%',
                        height: 380,
                        border: '1px solid #cbd5e1',
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        bgcolor: '#ffffff',
                      }}
                    >
                      <iframe
                        src={selectedDoc.fileUrl}
                        title={selectedDoc.title}
                        style={{ width: '100%', height: '100%', border: 0 }}
                      />
                    </Box>
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
                            Format: {doc.fileType || 'PDF'} • Size: {doc.fileSize || '2.5 MB'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
                          Preview In-App
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
                Upload lecture notes, video recordings, or reference documents that enrolled students can view in real time.
              </Typography>
            </Box>

            {/* Type selector */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Chip
                icon={<NotesIcon />}
                label="Lecture Notes"
                color={uploadType === 'note' ? 'primary' : 'default'}
                onClick={() => setUploadType('note')}
                sx={{ fontWeight: 700, px: 1 }}
              />
              <Chip
                icon={<VideoIcon />}
                label="Video Lecture"
                color={uploadType === 'video' ? 'secondary' : 'default'}
                onClick={() => setUploadType('video')}
                sx={{ fontWeight: 700, px: 1 }}
              />
              <Chip
                icon={<DocumentIcon />}
                label="Subject Document (PDF/Slides)"
                color={uploadType === 'document' ? 'warning' : 'default'}
                onClick={() => setUploadType('document')}
                sx={{ fontWeight: 700, px: 1 }}
              />
            </Box>

            <TextField
              label="Resource Title"
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              placeholder="e.g. Unit 4: Graph Traversals & Breadth-First Search"
              fullWidth
              required
              size="small"
            />

            {uploadType === 'note' && (
              <TextField
                label="Study Notes / Summary Content"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write detailed revision notes, key concepts, formulas, and takeaways..."
                multiline
                rows={6}
                fullWidth
                required
              />
            )}

            {uploadType === 'video' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Video Lecture URL (YouTube Embed / MP4 Link)"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/embed/gcULXE7ViZw"
                  fullWidth
                  required
                  size="small"
                  helperText="Enter a standard embeddable video URL"
                />
                <TextField
                  label="Duration"
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(e.target.value)}
                  placeholder="e.g. 50 mins"
                  size="small"
                />
              </Box>
            )}

            {uploadType === 'document' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Document File URL (PDF / Slides / Handout)"
                  value={docFileUrl}
                  onChange={(e) => setDocFileUrl(e.target.value)}
                  placeholder="e.g. https://arxiv.org/pdf/math/0211159.pdf"
                  fullWidth
                  required
                  size="small"
                  helperText="Enter a direct PDF or document URL"
                />
                <TextField
                  label="Document Type"
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

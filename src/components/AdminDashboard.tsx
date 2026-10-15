import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Sparkles,
  Camera,
  Layers,
  Settings,
  Shield,
  Clock,
  Heart,
  Calendar,
  Trash2,
  Edit3,
  CheckCircle,
  AlertCircle,
  LogOut,
  RefreshCw,
  Download,
  Upload,
  X,
  Plus,
  Compass,
  Smile,
  FileText,
  RotateCw,
  Crop,
} from 'lucide-react';
import {
  BabySettings,
  CategoryItem,
  Memory,
  TimelineMilestone,
  BlessingItem,
  SystemStatus,
  AICaptionResponse,
  BabyTheme,
} from '../types';
import { api } from '../services/api';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BabySettings;
  categories: CategoryItem[];
  memories: Memory[];
  timeline: TimelineMilestone[];
  blessings: BlessingItem[];
  status: SystemStatus | null;
  onRefreshAll: () => Promise<void>;
  onLogout: () => void;
}

type TabType =
  | 'overview'
  | 'upload'
  | 'memories'
  | 'timeline'
  | 'blessings'
  | 'categories'
  | 'settings'
  | 'security';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  settings: initialSettings,
  categories,
  memories,
  timeline,
  blessings,
  status,
  onRefreshAll,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadRotation, setUploadRotation] = useState<number>(0);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadCaption, setUploadCaption] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<string>(categories[0]?.name || 'Hamari Nanhi Jaan');
  const [uploadDate, setUploadDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [uploadTags, setUploadTags] = useState<string>('nanhi-jaan, baby-memories');
  const [uploadStatus, setUploadStatus] = useState<'published' | 'draft'>('published');
  const [uploadIsFavorite, setUploadIsFavorite] = useState<boolean>(false);
  const [uploadOwnerNotes, setUploadOwnerNotes] = useState<string>('');
  const [alternativeCaptions, setAlternativeCaptions] = useState<Array<{ style: string; text: string }>>([]);
  const [visualDetailsObserved, setVisualDetailsObserved] = useState<string>('');

  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Edit Memory State
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Timeline Add/Edit state
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState(new Date().toISOString().split('T')[0]);
  const [newMilestoneLabel, setNewMilestoneLabel] = useState('');
  const [newMilestonePhoto, setNewMilestonePhoto] = useState('');

  // Blessing Add state
  const [newBlessingText, setNewBlessingText] = useState('');
  const [newBlessingAuthor, setNewBlessingAuthor] = useState('Walidain Ki Dua');

  // Category Add state
  const [newCategoryName, setNewCategoryName] = useState('');

  // Settings State Form
  const [settingsForm, setSettingsForm] = useState<BabySettings>(initialSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Security Credentials form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [ownerNameInput, setOwnerNameInput] = useState('');
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Image File Selection & Preview
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotice('error', 'Sirf image files (JPEG, PNG, WebP) chuniye.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showNotice('error', 'Tasveer ka size 15MB se kam hona chahiye.');
      return;
    }

    setUploadFile(file);
    setUploadRotation(0);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadPreview(result);
    };
    reader.readAsDataURL(file);
  };

  // Rotate image preview
  const handleRotateImage = () => {
    setUploadRotation((prev) => (prev + 90) % 360);
  };

  // AI Roman Urdu Caption Generator
  const handleGenerateAICaption = async () => {
    if (!uploadPreview) {
      showNotice('error', 'Pehle koi tasveer chuniye taake AI caption bana sake.');
      return;
    }

    try {
      setIsGeneratingAI(true);
      const res: AICaptionResponse = await api.generateAICaption(
        uploadPreview,
        uploadFile?.type || 'image/jpeg',
        uploadCategory,
        settingsForm.babyName || 'Baby'
      );

      if (res.title) setUploadTitle(res.title);
      if (res.caption) setUploadCaption(res.caption);
      if (res.suggestedCategory) setUploadCategory(res.suggestedCategory);
      if (res.suggestedTags) setUploadTags(res.suggestedTags.join(', '));
      if (res.alternativeCaptions) setAlternativeCaptions(res.alternativeCaptions);
      if (res.visualDetailsObserved) setVisualDetailsObserved(res.visualDetailsObserved);

      showNotice('success', `Gemini AI (${res.modelUsed || 'Vision'}) ne Roman Urdu caption kamyabi se generate kar liya!`);
    } catch (err: any) {
      showNotice('error', err.message || 'AI caption service is waqt masroof hai. Aap apna Roman Urdu caption neeche khud type kar ke asani se save kar sakte hain.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Submit Memory Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadPreview) {
      showNotice('error', 'Tasveer upload karna zaroori hai.');
      return;
    }

    try {
      setIsUploading(true);

      // Step 1: Upload Image to secure backend
      const uploadRes = await api.uploadImage(uploadPreview, uploadFile?.name || 'baby-photo.jpg');

      // Step 2: Create Memory record
      const tagsArray = uploadTags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      await api.createMemory({
        title: uploadTitle.trim() || 'Nanhi Si Yaad',
        caption: uploadCaption.trim() || 'Hamare pyare baby ka ek anmol lamha.',
        imageUrl: uploadRes.url,
        thumbnailUrl: uploadRes.url,
        category: uploadCategory,
        tags: tagsArray,
        memoryDate: uploadDate,
        status: uploadStatus,
        isFavorite: uploadIsFavorite,
        ownerNotes: uploadOwnerNotes,
        alternativeCaptions,
        visualDetailsObserved,
      });

      showNotice('success', 'Tasveer kamyabi se gallery mein shamil ho gayi!');

      // Reset form
      setUploadFile(null);
      setUploadPreview(null);
      setUploadTitle('');
      setUploadCaption('');
      setAlternativeCaptions([]);
      setUploadOwnerNotes('');
      setVisualDetailsObserved('');

      await onRefreshAll();
      setActiveTab('memories');
    } catch (err: any) {
      showNotice('error', err.message || 'Upload mein masla aya.');
    } finally {
      setIsUploading(false);
    }
  };

  // Edit Memory Save
  const handleSaveEditedMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemory) return;

    try {
      await api.updateMemory(editingMemory.id, editingMemory);
      showNotice('success', 'Tasveer ki tafseelat update ho gayi!');
      setEditingMemory(null);
      await onRefreshAll();
    } catch (err: any) {
      showNotice('error', err.message || 'Update karte waqt masla aya.');
    }
  };

  // Delete Memory
  const handleDeleteMemory = async (id: string) => {
    try {
      await api.deleteMemory(id);
      showNotice('success', 'Tasveer delete ho gayi.');
      setDeleteConfirmId(null);
      await onRefreshAll();
    } catch (err: any) {
      showNotice('error', err.message || 'Delete mein masla aya.');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingSettings(true);
      await api.updateSettings(settingsForm);
      showNotice('success', 'Website settings kamyabi se mehfooz ho gayi!');
      await onRefreshAll();
    } catch (err: any) {
      showNotice('error', err.message || 'Settings save karte waqt masla aya.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Add Milestone
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle || !newMilestoneDesc) return;
    try {
      await api.createTimeline({
        title: newMilestoneTitle,
        description: newMilestoneDesc,
        date: newMilestoneDate,
        milestoneLabel: newMilestoneLabel,
        photoUrl: newMilestonePhoto,
      });
      setNewMilestoneTitle('');
      setNewMilestoneDesc('');
      setNewMilestoneLabel('');
      setNewMilestonePhoto('');
      showNotice('success', 'Timeline milestone kamyabi se shamil ho gaya!');
      await onRefreshAll();
    } catch (err: any) {
      showNotice('error', err.message || 'Milestone add karne mein masla hua.');
    }
  };

  // Delete Milestone
  const handleDeleteMilestone = async (id: string) => {
    try {
      await api.deleteTimeline(id);
      showNotice('success', 'Milestone delete ho gaya.');
      await onRefreshAll();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  // Add Blessing
  const handleAddBlessing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlessingText) return;
    try {
      await api.createBlessing({
        text: newBlessingText,
        author: newBlessingAuthor,
      });
      setNewBlessingText('');
      showNotice('success', 'Dua shamil kar li gayi!');
      await onRefreshAll();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  // Delete Blessing
  const handleDeleteBlessing = async (id: string) => {
    try {
      await api.deleteBlessing(id);
      showNotice('success', 'Dua delete ho gayi.');
      await onRefreshAll();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      await api.createCategory({ name: newCategoryName });
      setNewCategoryName('');
      showNotice('success', 'Category shamil ho gayi!');
      await onRefreshAll();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string) => {
    try {
      await api.deleteCategory(id);
      showNotice('success', 'Category delete ho gayi.');
      await onRefreshAll();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  // Update Owner Credentials
  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingCreds(true);
      await api.updateCredentials({
        currentPassword,
        newPassword,
        ownerName: ownerNameInput,
      });
      showNotice('success', 'Owner security credentials kamyabi se tabdeel ho gaye!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      showNotice('error', err.message || 'Credentials tabdeel nahi ho sake.');
    } finally {
      setIsUpdatingCreds(false);
    }
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    window.open(api.exportBackupUrl(), '_blank');
  };

  // Import JSON Backup
  const handleBackupFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await api.importBackup(json);
        showNotice('success', 'Metadata backup kamyabi se restore ho gaya!');
        await onRefreshAll();
      } catch (err: any) {
        showNotice('error', 'Ghalat backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-rose-200 flex flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
              👑
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold flex items-center gap-2">
                <span>Owner Private Dashboard</span>
                <span className="text-[10px] bg-white/30 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-sans font-semibold">
                  Authorized
                </span>
              </h2>
              <p className="text-xs text-white/90">
                Baby Memories, Photo Uploads, Roman Urdu AI Captions & Settings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshAll}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Logout Karein"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/20 hover:bg-black/30 text-white transition-colors ml-1"
              title="Dashboard Band Karein"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Notification Banner */}
        {notification && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center gap-2 shrink-0 ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-b border-rose-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 py-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-white text-rose-600 shadow-sm border border-rose-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Khulasa (Overview)</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-white text-rose-600 shadow-sm border border-rose-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-rose-500" />
            <span>Photo Upload Karein</span>
          </button>

          <button
            onClick={() => setActiveTab('memories')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'memories'
                ? 'bg-white text-rose-600 shadow-sm border border-rose-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Yaadein ({memories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'bg-white text-rose-600 shadow-sm border border-rose-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Timeline Safar</span>
          </button>

          <button
            onClick={() => setActiveTab('blessings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'blessings'
                ? 'bg-white text-rose-600 shadow-sm border border-rose-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Duayein (Blessings)</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'bg-white text-rose-600 shadow-sm border border-rose-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-white text-rose-600 shadow-sm border border-rose-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Website Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-white text-rose-600 shadow-sm border border-rose-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Security & Backup</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100">
                  <div className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
                    Total Yaadein
                  </div>
                  <div className="font-serif text-3xl font-bold text-slate-800 mt-1">
                    {memories.length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {status?.publishedCount || 0} Published • {status?.draftCount || 0} Drafts
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100">
                  <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                    Timeline Milestones
                  </div>
                  <div className="font-serif text-3xl font-bold text-slate-800 mt-1">
                    {timeline.length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Khoobsurat manazil
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-sky-50 border border-sky-100">
                  <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider">
                    Babarkat Duayein
                  </div>
                  <div className="font-serif text-3xl font-bold text-slate-800 mt-1">
                    {blessings.length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Khush-naseebi ke kalmaat
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-purple-50 border border-purple-100">
                  <div className="text-xs font-semibold text-purple-800 uppercase tracking-wider">
                    Gemini Vision AI
                  </div>
                  <div className="text-sm font-bold text-slate-800 mt-2 flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${status?.hasGeminiKey ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    <span>{status?.hasGeminiKey ? "Fa'al (Active)" : "Key Configured (Fallback ready)"}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Roman Urdu Vision Models
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900">
                    Nayi Yaad Upload Karein ✨
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Baby ki nayi tasveer muntakhib karein aur Gemini AI se khud-kar Roman Urdu caption hasil karein.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold text-xs sm:text-sm shadow-md transition-all shrink-0 flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Page Par Jayein</span>
                </button>
              </div>

              {/* Default Password Reminder */}
              {status?.isDefaultPassword && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Security Mashwara: </span>
                    Aap ka dashboard abhi default password par chal raha hai. Kisi bhi ghair mutaliqa shakhs se bachne ke liye Security tab se apna naya password zaroor set karein.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PHOTO UPLOAD WORKFLOW WITH GEMINI AI CAPTION */}
          {activeTab === 'upload' && (
            <form onSubmit={handleUploadSubmit} className="space-y-6">
              
              {/* File Dropzone & Preview */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Upload Picker Card */}
                <div className="md:col-span-5 space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[260px] ${
                      uploadPreview
                        ? 'border-rose-300 bg-rose-50/40'
                        : 'border-slate-300 hover:border-rose-400 bg-slate-50/60 hover:bg-rose-50/30'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {uploadPreview ? (
                      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
                        <img
                          src={uploadPreview}
                          alt="Preview"
                          className="w-full h-full object-cover transition-transform"
                          style={{ transform: `rotate(${uploadRotation}deg)` }}
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                          Tasveer Tabdeel Karein
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
                          <Camera className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">
                            Baby Ki Tasveer Chuniye
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Click karein ya drag and drop karein (JPEG, PNG, WebP)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {uploadPreview && (
                    <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                      <button
                        type="button"
                        onClick={handleRotateImage}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 font-medium"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Rotate (Ghumayein)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadPreview(null);
                          setUploadFile(null);
                        }}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium"
                      >
                        Hata dein
                      </button>
                    </div>
                  )}

                  {/* Gemini AI Caption Action Button */}
                  {uploadPreview && (
                    <button
                      type="button"
                      onClick={handleGenerateAICaption}
                      disabled={isGeneratingAI}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGeneratingAI ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Gemini AI Tasveer Ka Tajziya Kar Raha Hai...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>AI Se Roman Urdu Caption Banwayein ✨</span>
                        </>
                      )}
                    </button>
                  )}

                  {visualDetailsObserved && (
                    <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
                      <div className="font-semibold text-purple-950 mb-0.5">
                        Tasveer Mein Dekha Gaya:
                      </div>
                      <p className="italic">{visualDetailsObserved}</p>
                    </div>
                  )}
                </div>

                {/* Form Fields Column */}
                <div className="md:col-span-7 space-y-4">
                  
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                      Tasveer Ka Unwan (Title in Roman Urdu) *
                    </label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="e.g. Meri Jaan Ki Pyari Si Neend"
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-serif"
                      required
                    />
                  </div>

                  {/* Caption */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                      Roman Urdu Caption *
                    </label>
                    <textarea
                      value={uploadCaption}
                      onChange={(e) => setUploadCaption(e.target.value)}
                      rows={3}
                      placeholder="e.g. Is nanhi si jaan ki masoom neend dekh kar dil ko ajeeb sa sukoon milta hai..."
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-serif leading-relaxed"
                      required
                    />
                  </div>

                  {/* Alternative AI Captions if generated */}
                  {alternativeCaptions.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2">
                      <div className="text-xs font-semibold text-rose-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Mutabadil AI Captions (Click kar ke pasand karein):</span>
                      </div>
                      <div className="space-y-1.5">
                        {alternativeCaptions.map((alt, idx) => (
                          <div
                            key={idx}
                            onClick={() => setUploadCaption(alt.text)}
                            className="p-2.5 rounded-xl bg-white border border-rose-100 hover:border-rose-400 text-xs text-slate-700 cursor-pointer transition-colors shadow-xs"
                          >
                            <span className="font-bold text-rose-700 mr-1.5">[{alt.style}]:</span>
                            <span>"{alt.text}"</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category & Memory Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                        Category
                      </label>
                      <select
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                        Yaad Ki Tareekh (Date)
                      </label>
                      <input
                        type="date"
                        value={uploadDate}
                        onChange={(e) => setUploadDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                      Tags (Comma se alag karein)
                    </label>
                    <input
                      type="text"
                      value={uploadTags}
                      onChange={(e) => setUploadTags(e.target.value)}
                      placeholder="masoomiyat, neend, pyar, pehla-din"
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  {/* Visibility & Favorite Status */}
                  <div className="flex flex-wrap items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={uploadStatus === 'published'}
                        onChange={(e) => setUploadStatus(e.target.checked ? 'published' : 'draft')}
                        className="rounded text-rose-500 focus:ring-rose-400 w-4 h-4"
                      />
                      <span>Website Par Foran Publish Karein (Public)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={uploadIsFavorite}
                        onChange={(e) => setUploadIsFavorite(e.target.checked)}
                        className="rounded text-rose-500 focus:ring-rose-400 w-4 h-4"
                      />
                      <span>Favorites Mein Shamil Karein ❤️</span>
                    </label>
                  </div>

                  {/* Owner Notes (Private) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                      Owner Private Notes (Sirf aap ke liye)
                    </label>
                    <input
                      type="text"
                      value={uploadOwnerNotes}
                      onChange={(e) => setUploadOwnerNotes(e.target.value)}
                      placeholder="e.g. Yeh dress Nani ne bheji thi"
                      className="w-full px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isUploading || !uploadPreview}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isUploading ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Tasveer Upload Aur Save Ho Rahi Hai...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Yaad Gallery Mein Shamil Karein ✨</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>

              </div>

            </form>
          )}

          {/* TAB 3: MANAGE EXISTING MEMORIES */}
          {activeTab === 'memories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900">
                    Tamam Uploaded Yaadein ({memories.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Aap kisi bhi tasveer ke caption, category, tareekh ko edit ya delete kar sakte hain.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nayi Yaad</span>
                </button>
              </div>

              {/* Memories List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memories.map((mem) => (
                  <div
                    key={mem.id}
                    className="p-4 rounded-3xl bg-slate-50 border border-slate-200 flex gap-4 items-start shadow-xs hover:border-rose-200 transition-colors"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-rose-100 shadow-xs border border-white">
                      <img
                        src={mem.thumbnailUrl || mem.imageUrl}
                        alt={mem.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-serif text-sm font-bold text-slate-900 truncate">
                          {mem.title}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                            mem.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {mem.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 italic font-serif">
                        "{mem.caption}"
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-500">
                        <span>{mem.category}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingMemory(mem)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-white transition-colors"
                            title="Edit Caption / Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(mem.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Modal */}
              {editingMemory && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-rose-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-lg font-bold text-slate-900">
                        Yaad Edit Karein
                      </h4>
                      <button
                        onClick={() => setEditingMemory(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditedMemory} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Title (Roman Urdu)
                        </label>
                        <input
                          type="text"
                          value={editingMemory.title}
                          onChange={(e) =>
                            setEditingMemory({ ...editingMemory, title: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Caption (Roman Urdu)
                        </label>
                        <textarea
                          rows={3}
                          value={editingMemory.caption}
                          onChange={(e) =>
                            setEditingMemory({ ...editingMemory, caption: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Category
                          </label>
                          <select
                            value={editingMemory.category}
                            onChange={(e) =>
                              setEditingMemory({ ...editingMemory, category: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Status
                          </label>
                          <select
                            value={editingMemory.status}
                            onChange={(e) =>
                              setEditingMemory({
                                ...editingMemory,
                                status: e.target.value as 'published' | 'draft',
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                          >
                            <option value="published">Published</option>
                            <option value="draft">Draft (Private)</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingMemory(null)}
                          className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold shadow"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Delete Confirmation Modal */}
              {deleteConfirmId && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-rose-200 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif text-lg font-bold text-slate-900">
                      Tasveer Delete Karein?
                    </h4>
                    <p className="text-xs text-slate-500">
                      Kya aap waqai is tasveer ko gallery se hatana chahte hain? Yeh amal wapas nahi ho sakega.
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-medium"
                      >
                        Nahi, Rehne Dein
                      </button>
                      <button
                        onClick={() => handleDeleteMemory(deleteConfirmId)}
                        className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold shadow hover:bg-rose-700"
                      >
                        Haan, Delete Karein
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TIMELINE MANAGEMENT */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Hamare Baby Ka Khoobsurat Safar (Timeline)
                </h3>
                <p className="text-xs text-slate-500">
                  Khaas manazil (milestones) shamil karein ya tabdeel karein.
                </p>
              </div>

              {/* Add Milestone Form */}
              <form onSubmit={handleAddMilestone} className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Naya Milestone Shamil Karein
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    placeholder="Title (e.g. Pehli Pyari Muskurahat)"
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                    required
                  />
                  <input
                    type="date"
                    value={newMilestoneDate}
                    onChange={(e) => setNewMilestoneDate(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newMilestoneLabel}
                    onChange={(e) => setNewMilestoneLabel(e.target.value)}
                    placeholder="Milestone Label (e.g. Pehli Smile)"
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    value={newMilestonePhoto}
                    onChange={(e) => setNewMilestonePhoto(e.target.value)}
                    placeholder="Optional Photo URL (e.g. /sample-art/smiling-baby.svg)"
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  />
                </div>
                <textarea
                  rows={2}
                  value={newMilestoneDesc}
                  onChange={(e) => setNewMilestoneDesc(e.target.value)}
                  placeholder="Roman Urdu Tafseelat (e.g. Aaj subah baby ne pehli dafa khilkhila kar smile di...)"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Milestone Shamil Karein</span>
                </button>
              </form>

              {/* Milestone list */}
              <div className="space-y-3">
                {timeline.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-slate-800">{m.title}</span>
                        {m.milestoneLabel && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                            {m.milestoneLabel}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">({m.date})</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 italic font-serif">"{m.description}"</p>
                    </div>

                    <button
                      onClick={() => handleDeleteMilestone(m.id)}
                      className="p-2 text-slate-400 hover:text-rose-600"
                      title="Delete Milestone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BLESSINGS MANAGEMENT */}
          {activeTab === 'blessings' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Hamari Jaan Ke Liye Pyari Si Duayein (Blessings)
                </h3>
                <p className="text-xs text-slate-500">
                  Duaon ke mutoon aur haseen Roman Urdu kalmaat ko manage karein.
                </p>
              </div>

              {/* Add Blessing form */}
              <form onSubmit={handleAddBlessing} className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Nayi Dua Shamil Karein
                </div>
                <input
                  type="text"
                  value={newBlessingAuthor}
                  onChange={(e) => setNewBlessingAuthor(e.target.value)}
                  placeholder="Author (e.g. Mama Aur Papa Ki Dua, Dadi Ki Dua)"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                />
                <textarea
                  rows={2}
                  value={newBlessingText}
                  onChange={(e) => setNewBlessingText(e.target.value)}
                  placeholder="Dua ka Roman Urdu matan (e.g. Ya Allah, is nanhi si jaan ko har buri nazar se mehfooz rakh. Ameen.)"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Dua Shamil Karein</span>
                </button>
              </form>

              {/* List */}
              <div className="space-y-3">
                {blessings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4 shadow-xs"
                  >
                    <div>
                      <div className="text-xs font-bold text-rose-700">{b.author}</div>
                      <p className="text-xs text-slate-700 font-serif italic mt-0.5">"{b.text}"</p>
                    </div>
                    <button
                      onClick={() => handleDeleteBlessing(b.id)}
                      className="p-2 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Photo Categories
                </h3>
                <p className="text-xs text-slate-500">
                  Nayi category shamil karein ya purani categories ko tarteeb dein.
                </p>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nayi category ka naam (e.g. Dadi Aur Nani Ke Sath)"
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs"
                  required
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Shamil Karein</span>
                </button>
              </form>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-medium text-slate-800"
                  >
                    <span>{c.name}</span>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="text-slate-400 hover:text-rose-600"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: WEBSITE SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Website Maloomat & Theme
                </h3>
                <p className="text-xs text-slate-500">
                  Baby ka naam, pedaish ki tareekh, welcome message aur display preferences tabdeel karein.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Baby Ka Naam *
                  </label>
                  <input
                    type="text"
                    value={settingsForm.babyName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, babyName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-serif"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Walidain Ke Naam (Parents' Names)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.parentsNames}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, parentsNames: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tareekh-e-Pedaish (Birth Date) *
                  </label>
                  <input
                    type="date"
                    value={settingsForm.birthDate}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, birthDate: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pedaish Ka Waqt (Birth Time)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.birthTime || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, birthTime: e.target.value })
                    }
                    placeholder="e.g. 06:45 AM"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Wazan (Birth Weight)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.birthWeight || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, birthWeight: e.target.value })
                    }
                    placeholder="e.g. 3.4 kg"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Qad (Birth Length)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.birthLength || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, birthLength: e.target.value })
                    }
                    placeholder="e.g. 51 cm"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm"
                  />
                </div>
              </div>

              {/* Welcome Title & Message */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Welcome Title Heading (Roman Urdu)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.welcomeTitle}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, welcomeTitle: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Welcome Roman Urdu Message Paragraph
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.welcomeMessage}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, welcomeMessage: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-serif leading-relaxed"
                  />
                </div>
              </div>

              {/* Theme & Hero image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Website Theme
                  </label>
                  <select
                    value={settingsForm.theme}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, theme: e.target.value as BabyTheme })
                    }
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm"
                  >
                    <option value="cream">Champagne Gold & Cream</option>
                    <option value="pink">Soft Baby Pink</option>
                    <option value="blue">Pastel Sky Blue</option>
                    <option value="lavender">Dreamy Lavender</option>
                    <option value="mint">Fresh Mint Green</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hero Frame Baby Photo URL (Khali chhorne par illustrated art dikhegi)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.heroImageUrl || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, heroImageUrl: e.target.value })
                    }
                    placeholder="e.g. /uploads/baby-123.jpg ya khali rakhein"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Public Visibility Checkboxes */}
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Public Display Toggles
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.showAge}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, showAge: e.target.checked })
                      }
                      className="rounded text-rose-500"
                    />
                    <span>Baby Ki Umar (Age) Public Ko Dikhayein</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.showBirthDetails}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, showBirthDetails: e.target.checked })
                      }
                      className="rounded text-rose-500"
                    />
                    <span>Pedaish Ka Waqt, Wazan & Qad Dikhayein</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.showCountdown}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, showCountdown: e.target.checked })
                      }
                      className="rounded text-rose-500"
                    />
                    <span>Birthday Countdown Dikhayein</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.allowVisitorDownloads}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          allowVisitorDownloads: e.target.checked,
                        })
                      }
                      className="rounded text-rose-500"
                    />
                    <span>Visitors Ko Tasveerein Download Karne Ki Ijazat Dein</span>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Settings Mehfooz Karein (Save Settings)</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 8: SECURITY & BACKUP */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              
              {/* Password Change Card */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-rose-500" />
                  <span>Owner Password Tabdeel Karein</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Apne owner account ko mehfooz rakhne ke liye ek mazboot naya password muntakhib karein.
                </p>

                <form onSubmit={handleUpdateCredentials} className="space-y-3 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mojooda Password (Current Password)
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Naya Password (New Password, min 6 characters)
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter strong new password"
                      className="w-full px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Owner Naam (Display Name)
                    </label>
                    <input
                      type="text"
                      value={ownerNameInput}
                      onChange={(e) => setOwnerNameInput(e.target.value)}
                      placeholder="e.g. Baby Ayaan Walidain"
                      className="w-full px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingCreds}
                    className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <span>Password Tabdeel Karein</span>
                  </button>
                </form>
              </div>

              {/* Metadata Backup Export & Import */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Download className="w-5 h-5 text-amber-500" />
                  <span>Metadata Backup & Restore</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Website ki tamam yaadon, captions, settings aur timeline ka mukammal JSON backup export ya import karein.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <button
                    onClick={handleExportBackup}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-semibold text-xs shadow-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Backup</span>
                  </button>

                  <div>
                    <input
                      ref={backupInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleBackupFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => backupInputRef.current?.click()}
                      className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300 shadow-sm flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Restore Backup (File Chuniye)</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

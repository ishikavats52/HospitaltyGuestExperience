import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BedDouble,
  Plus,
  Check,
  RefreshCw,
  Sparkles,
  Filter,
  AlertCircle,
  CheckCircle2,
  Building2,
  Image as ImageIcon,
  Package,
  Layers,
  Eye,
  Trash2,
  X,
  Search,
  DollarSign,
  Maximize2,
  ChevronRight,
  Upload,
  Camera,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

// Curated high-resolution hospitality photo presets
const PHOTO_PRESETS = [
  {
    name: 'Luxury Executive Suite',
    url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Grand King Bedroom',
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Balcony View Suite',
    url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Modern Minimalist Deluxe',
    url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Heritage Royal Bedroom',
    url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
  },
];

const PRESET_AMENITIES = [
  'King Size Bed',
  'Smart 4K Ultra-HD TV',
  'High-Speed Wi-Fi 6',
  'Mini Bar & Refrigerator',
  'Private City View Balcony',
  'Climate Controlled AC',
  'Nespresso Machine',
  'Electronic Safe Locker',
  'Luxury Marble Bathtub',
  'Plush Bathrobes & Slippers',
];

export const RoomManager = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const initialPropId = searchParams.get('propertyId') || 'ALL';

  const [rooms, setRooms] = useState([]);
  const [properties, setProperties] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState(initialPropId);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Room Inspector Modal
  const [inspectedRoom, setInspectedRoom] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Add Room Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetPropertyId, setTargetPropertyId] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newFloor, setNewFloor] = useState('');
  const [newRoomTypeName, setNewRoomTypeName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [customAmenity, setCustomAmenity] = useState('');

  // Room Inventory State for New Room
  const [roomInventory, setRoomInventory] = useState([]);
  const [newInvName, setNewInvName] = useState('');
  const [newInvQty, setNewInvQty] = useState('1');
  const [newInvCat, setNewInvCat] = useState('Linen');

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Camera & Gallery File Input Refs & Live Viewfinder State
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Compress & convert file to DataURL
  const compressImageFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingPhotos(true);
    try {
      const validFiles = files.filter((f) => f.type.startsWith('image/'));
      const converted = [];
      for (const file of validFiles) {
        const dataUrl = await compressImageFile(file);
        if (dataUrl && !selectedImages.includes(dataUrl)) {
          converted.push(dataUrl);
        }
      }
      setSelectedImages((prev) => [...prev, ...converted]);
      showToast(`Added ${converted.length} photo(s) from gallery!`);
    } catch (err) {
      console.error('Gallery upload error:', err);
      alert('Failed to process uploaded photos.');
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const handleCameraFileInput = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingPhotos(true);
    try {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const dataUrl = await compressImageFile(file);
        if (dataUrl) {
          setSelectedImages((prev) => [...prev, dataUrl]);
          showToast('Camera photo captured and attached!');
        }
      }
    } catch (err) {
      console.error('Camera input error:', err);
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const startLiveCamera = async () => {
    setIsLiveCameraOpen(true);
    try {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Live camera viewfinder unavailable, falling back to camera selector:', err);
      stopLiveCamera();
      cameraInputRef.current?.click();
    }
  };

  const stopLiveCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    setIsLiveCameraOpen(false);
  };

  const captureLivePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

    setSelectedImages((prev) => [...prev, dataUrl]);
    showToast('Photo captured and attached to room!');
    stopLiveCamera();
  };

  const triggerCameraCapture = () => {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobileDevice) {
      cameraInputRef.current?.click();
    } else {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        startLiveCamera();
      } else {
        cameraInputRef.current?.click();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Background scroll lock when any modal is open
  useEffect(() => {
    if (isAddModalOpen || inspectedRoom || lightboxImage || isLiveCameraOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAddModalOpen, inspectedRoom, lightboxImage, isLiveCameraOpen]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchRoomsAndProperties = async () => {
    try {
      setLoading(true);
      const [roomsRes, propsRes, typesRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/properties').catch(() => ({ data: [] })),
        api.get('/rooms/types').catch(() => ({ data: [] })),
      ]);

      setRooms(roomsRes.data || []);
      setProperties(propsRes.data || []);
      setRoomTypes(typesRes.data || []);

      if (propsRes.data?.length > 0 && !targetPropertyId) {
        setTargetPropertyId(propsRes.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load rooms and properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsAndProperties();
  }, []);

  const handleStatusChange = async (roomId, nextStatus) => {
    setUpdatingId(roomId);
    try {
      await api.patch(`/rooms/${roomId}/status`, { status: nextStatus });
      showToast(`Room marked as ${nextStatus}`);
      await fetchRoomsAndProperties();
      if (inspectedRoom && inspectedRoom._id === roomId) {
        setInspectedRoom((prev) => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenAddModal = () => {
    setNewRoomNumber('');
    setNewFloor('');
    setNewRoomTypeName('');
    setNewPrice('');
    setSelectedImages([]);
    setCustomImageUrl('');
    setSelectedAmenities([]);
    setCustomAmenity('');
    setRoomInventory([]);
    setNewInvName('');
    setNewInvQty('1');
    setNewInvCat('Linen');
    setCreateError(null);
    if (selectedPropertyFilter && selectedPropertyFilter !== 'ALL') {
      setTargetPropertyId(selectedPropertyFilter);
    } else if (properties.length > 0) {
      setTargetPropertyId(properties[0]._id);
    }
    setIsAddModalOpen(true);
  };

  const handleAddPresetPhoto = (url) => {
    if (!selectedImages.includes(url)) {
      setSelectedImages([...selectedImages, url]);
    }
  };

  const handleRemovePhoto = (urlToRemove) => {
    setSelectedImages(selectedImages.filter((u) => u !== urlToRemove));
  };

  const handleAddCustomPhoto = () => {
    if (customImageUrl.trim() && !selectedImages.includes(customImageUrl.trim())) {
      setSelectedImages([...selectedImages, customImageUrl.trim()]);
      setCustomImageUrl('');
    }
  };

  const toggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleAddCustomAmenity = () => {
    if (customAmenity.trim() && !selectedAmenities.includes(customAmenity.trim())) {
      setSelectedAmenities([...selectedAmenities, customAmenity.trim()]);
      setCustomAmenity('');
    }
  };

  const handleAddInventoryItem = () => {
    if (!newInvName.trim()) return;
    setRoomInventory([
      ...roomInventory,
      {
        name: newInvName.trim(),
        quantity: Number(newInvQty) || 1,
        category: newInvCat,
      },
    ]);
    setNewInvName('');
    setNewInvQty('2');
  };

  const handleRemoveInventoryItem = (index) => {
    setRoomInventory(roomInventory.filter((_, i) => i !== index));
  };

  const handleCreateRoom = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newRoomNumber.trim()) {
      setCreateError('Please provide a room number.');
      return;
    }
    if (!targetPropertyId) {
      setCreateError('Please select a property for this room.');
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      await api.post('/rooms', {
        roomNumber: newRoomNumber.trim(),
        floor: Number(newFloor) || 1,
        propertyId: targetPropertyId,
        roomTypeName: newRoomTypeName.trim() || 'Deluxe Suite',
        pricePerNight: Number(newPrice) || 4500,
        images: selectedImages,
        amenities: selectedAmenities,
        inventory: roomInventory,
        status: 'AVAILABLE',
      });

      showToast(`Room ${newRoomNumber.trim()} added with images & inventory!`);
      setIsAddModalOpen(false);
      await fetchRoomsAndProperties();
    } catch (err) {
      setCreateError(err.message || 'Failed to add room');
    } finally {
      setCreating(false);
    }
  };

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesProperty =
      selectedPropertyFilter === 'ALL' ||
      String(r.propertyId?._id || r.propertyId) === String(selectedPropertyFilter);

    const matchesSearch =
      r.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roomTypeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.propertyName?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesProperty && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return { label: 'Available', bg: '#E6F7F7', color: '#008489', border: 'rgba(0,132,137,0.3)' };
      case 'OCCUPIED':
        return { label: 'Occupied', bg: '#FFF0F3', color: 'var(--gold-dark)', border: 'rgba(217,4,41,0.3)' };
      case 'CLEANING':
        return { label: 'Cleaning', bg: '#E0F2FE', color: '#0284C7', border: 'rgba(2,132,199,0.3)' };
      case 'MAINTENANCE':
        return { label: 'Maintenance', bg: '#FEF3C7', color: '#D97706', border: 'rgba(217,119,6,0.3)' };
      default:
        return { label: status, bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: 'var(--border-color)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: 'var(--text-primary)',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 9999,
            fontSize: '0.9rem',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <CheckCircle2 size={20} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Main Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--gold-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              fontWeight: 800,
            }}
          >
            Property Units & Inventory
          </div>
          <h1
            className="title-gold page-title"
            style={{ fontSize: '2.2rem', margin: '4px 0 8px', letterSpacing: '-0.02em', fontWeight: 800 }}
          >
            Rooms & Inventory Management
          </h1>
          <p className="page-subtitle" style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Every single detail of your rooms: high-res photos, in-room amenities, and inventory items.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="btn btn-gold"
          style={{
            padding: '14px 24px',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-gold)',
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <Plus size={18} />
          <span>Add Room to Property</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 22px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '14px', flex: 1, minWidth: '280px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
            <Search size={18} color="var(--gold-primary)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
            <input
              type="text"
              placeholder="Search by room #, suite type, property..."
              className="input-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '42px', borderRadius: 'var(--radius-full)' }}
            />
          </div>

          {/* Property Selector Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              Property:
            </span>
            <select
              className="input-control"
              value={selectedPropertyFilter}
              onChange={(e) => setSelectedPropertyFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '180px', borderRadius: 'var(--radius-full)' }}
            >
              <option value="ALL">All Properties ({properties.length})</option>
              {properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              Status:
            </span>
            <select
              className="input-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: 'auto', minWidth: '130px', borderRadius: 'var(--radius-full)' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="CLEANING">Cleaning</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Showcase Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '12px' }}>
            <BedDouble size={36} color="var(--gold-primary)" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading rooms and inventory...</div>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-color)',
          }}
        >
          <BedDouble size={44} color="var(--gold-primary)" style={{ margin: '0 auto 16px', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>No rooms match your filter</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 20px' }}>
            {searchTerm || filterStatus !== 'ALL' || selectedPropertyFilter !== 'ALL'
              ? 'Try adjusting your search criteria or resetting filters.'
              : 'Add your first room unit to this property.'}
          </p>
          <button type="button" onClick={handleOpenAddModal} className="btn btn-gold">
            <Plus size={16} /> Add New Room
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '26px',
          }}
        >
          {filteredRooms.map((room) => {
            const badge = getStatusBadge(room.status);
            const mainImage = room.images?.[0] || PHOTO_PRESETS[0].url;

            return (
              <div
                key={room._id}
                className="glass-panel"
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* Room Photo Gallery Hero */}
                <div
                  style={{
                    position: 'relative',
                    height: '210px',
                    width: '100%',
                    overflow: 'hidden',
                    background: '#000000',
                  }}
                >
                  <img
                    src={mainImage}
                    alt={`Room ${room.roomNumber}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                    }}
                    onClick={() => setLightboxImage(mainImage)}
                  />

                  {/* Top Badges Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      left: '14px',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        padding: '5px 12px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        color: 'var(--gold-dark)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}
                    >
                      Room {room.roomNumber}
                    </span>
                    <span
                      style={{
                        padding: '4px 10px',
                        background: 'rgba(31, 36, 33, 0.75)',
                        color: '#FFFFFF',
                        backdropFilter: 'blur(4px)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                      }}
                    >
                      Floor {room.floor || 1}
                    </span>
                  </div>

                  {/* Status Badge Top Right */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                    }}
                  >
                    <span
                      style={{
                        padding: '5px 12px',
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Photos count pill if multiple */}
                  {room.images && room.images.length > 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        padding: '3px 9px',
                        background: 'rgba(0,0,0,0.65)',
                        color: '#FFFFFF',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.7rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <ImageIcon size={12} />
                      <span>{room.images.length} Photos</span>
                    </div>
                  )}
                </div>

                {/* Room Info Content */}
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                      {room.propertyName || 'Primary Property'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        {room.roomTypeName || 'Deluxe Heritage Suite'}
                      </h3>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold-dark)' }}>
                        ₹{(room.pricePerNight || 4500).toLocaleString('en-IN')}
                        <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>/night</span>
                      </div>
                    </div>
                  </div>

                  {/* What's in the room (Amenities Preview) */}
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      ✨ What's in the Room:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(room.amenities || []).slice(0, 4).map((amenity, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '3px 8px',
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            border: '1px solid var(--border-color)',
                          }}
                        >
                          {amenity}
                        </span>
                      ))}
                      {(room.amenities || []).length > 4 && (
                        <span
                          style={{
                            padding: '3px 8px',
                            background: 'var(--gold-soft)',
                            color: 'var(--gold-primary)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          +{room.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Room Inventory Summary */}
                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      <Package size={16} color="var(--gold-primary)" />
                      <span>Room Inventory:</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {(room.inventory || []).length} Verified Items
                    </span>
                  </div>
                </div>

                {/* Footer Controls: Live Status Selector & Details button */}
                <div
                  style={{
                    padding: '14px 22px',
                    background: '#FFFFFF',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
                    <select
                      value={room.status}
                      disabled={updatingId === room._id}
                      onChange={(e) => handleStatusChange(room._id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="OCCUPIED">Occupied</option>
                      <option value="CLEANING">Cleaning</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInspectedRoom(room)}
                    className="btn btn-gold"
                    style={{
                      padding: '8px 14px',
                      fontSize: '0.78rem',
                      borderRadius: 'var(--radius-full)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Eye size={13} />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Room Full Details Inspector Modal */}
      {inspectedRoom && (
        <div className="modal-backdrop active" onClick={() => setInspectedRoom(null)}>
          <div
            className="modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '720px',
              width: '90%',
              padding: '36px',
              borderRadius: 'var(--radius-lg)',
              background: '#FFFFFF',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ padding: '3px 10px', background: 'var(--gold-soft)', color: 'var(--gold-primary)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 800 }}>
                    Room {inspectedRoom.roomNumber}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Floor {inspectedRoom.floor || 1} • {inspectedRoom.propertyName}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '6px 0 0', color: 'var(--text-primary)' }}>
                  {inspectedRoom.roomTypeName || 'Deluxe Heritage Suite'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInspectedRoom(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Photos Strip */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                📸 Room Photography
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                {(inspectedRoom.images || [PHOTO_PRESETS[0].url]).map((img, i) => (
                  <div
                    key={i}
                    style={{
                      height: '110px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '1px solid var(--border-color)',
                    }}
                    onClick={() => setLightboxImage(img)}
                  >
                    <img src={img} alt={`Room ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* What's in the room */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                ✨ What's in the Room (Amenities & Comforts)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(inspectedRoom.amenities || []).map((amenity, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '5px 12px',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: '1px solid var(--border-color)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Sparkles size={13} color="var(--gold-primary)" />
                    <span>{amenity}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Room Inventory Table */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
                📦 Room Inventory Items
              </div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '10px 14px' }}>Item Name</th>
                      <th style={{ padding: '10px 14px' }}>Category</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(inspectedRoom.inventory || []).map((inv, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', background: idx % 2 === 0 ? '#FFFFFF' : 'var(--bg-primary)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>{inv.name}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{inv.category || 'General'}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--gold-dark)' }}>
                          {inv.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setInspectedRoom(null)} className="btn btn-outline" style={{ padding: '10px 22px' }}>
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setLightboxImage(null)}
        >
          <div style={{ position: 'relative', maxWidth: '900px', width: '100%' }}>
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <X size={28} />
            </button>
            <img
              src={lightboxImage}
              alt="Room view"
              style={{
                width: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              }}
            />
          </div>
        </div>
      )}

      {/* Add Room to Property Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '800px',
              width: '96%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 'var(--radius-lg)',
              background: '#FFFFFF',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
            }}
          >
            {/* Fixed Modal Header */}
            <div
              className="modal-header"
              style={{
                padding: '18px 26px',
                background: '#FFFFFF',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BedDouble size={22} color="var(--gold-primary)" />
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Add Room to Property
                  </h2>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  Upload photos (gallery & camera), configure room specifications, amenities, and inventory.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                aria-label="Close modal"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Form with Scrollable Body & Sticky Footer */}
            <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {/* Scrollable Body */}
              <div
                className="modal-body"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '22px 26px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                {createError && (
                  <div
                    style={{
                      padding: '12px 16px',
                      background: 'var(--danger-bg)',
                      color: 'var(--danger)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>{createError}</span>
                  </div>
                )}

                {/* Section 1: Basic Specifications */}
                <div style={{ padding: '18px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--gold-primary)', textTransform: 'uppercase', marginBottom: '14px', letterSpacing: '0.05em' }}>
                    1. Room Specifications & Property Assignment
                  </div>

                  <div className="responsive-form-grid-2" style={{ marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Target Property *
                      </label>
                      <select
                        className="input-control"
                        value={targetPropertyId}
                        onChange={(e) => setTargetPropertyId(e.target.value)}
                        required
                      >
                        {properties.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({p.city || 'Main'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Room Number *
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        value={newRoomNumber}
                        onChange={(e) => setNewRoomNumber(e.target.value)}
                        placeholder="e.g. 101, Villa-A, Suite 402"
                        required
                      />
                    </div>
                  </div>

                  <div className="responsive-form-grid-3">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Floor
                      </label>
                      <input
                        type="number"
                        className="input-control"
                        value={newFloor}
                        onChange={(e) => setNewFloor(e.target.value)}
                        placeholder="e.g. 1"
                        min="1"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Room / Suite Category
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        value={newRoomTypeName}
                        onChange={(e) => setNewRoomTypeName(e.target.value)}
                        placeholder="e.g. Deluxe Suite, Presidential"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Tariff Per Night (₹)
                      </label>
                      <input
                        type="number"
                        className="input-control"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="e.g. 3500"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Room Photography & Visuals (Camera & Gallery) */}
                <div style={{ padding: '18px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ImageIcon size={16} />
                      <span>2. Room Photography & Visuals</span>
                    </div>
                    {selectedImages.length > 0 && (
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--gold-dark)', background: 'var(--gold-soft)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                        {selectedImages.length} Photo{selectedImages.length === 1 ? '' : 's'} Selected
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    Upload photos directly from your device gallery or take live photos using the camera.
                  </div>

                  {/* Hidden File Inputs for Native Camera & Gallery Pickers */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    style={{ display: 'none' }}
                  />
                  <input
                    type="file"
                    ref={cameraInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={handleCameraFileInput}
                    style={{ display: 'none' }}
                  />

                  {/* Prominent Action Cards for Gallery & Camera */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    {/* Gallery Upload Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhotos}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: '#FFFFFF',
                        border: '1.5px solid var(--border-active)',
                        borderRadius: 'var(--radius-md)',
                        cursor: uploadingPhotos ? 'wait' : 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        boxShadow: 'var(--shadow-xs)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--gold-primary)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-active)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--gold-primary)' }}>
                        <Upload size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          Upload from Gallery
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Choose files from device
                        </div>
                      </div>
                    </button>

                    {/* Camera Capture Button */}
                    <button
                      type="button"
                      onClick={triggerCameraCapture}
                      disabled={uploadingPhotos}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: '#FFFFFF',
                        border: '1.5px solid var(--border-active)',
                        borderRadius: 'var(--radius-md)',
                        cursor: uploadingPhotos ? 'wait' : 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        boxShadow: 'var(--shadow-xs)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--gold-primary)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-active)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--gold-primary)' }}>
                        <Camera size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          Take Camera Photo
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Capture live room picture
                        </div>
                      </div>
                    </button>
                  </div>

                  {uploadingPhotos && (
                    <div style={{ padding: '8px 12px', background: 'var(--gold-soft)', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--gold-dark)', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={14} className="spin" />
                      <span>Processing and optimizing photo(s)...</span>
                    </div>
                  )}

                  {/* Preset Chips */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Or select curated luxury presets:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {PHOTO_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddPresetPhoto(preset.url)}
                          style={{
                            padding: '5px 11px',
                            background: selectedImages.includes(preset.url) ? 'var(--gold-soft)' : '#FFFFFF',
                            color: selectedImages.includes(preset.url) ? 'var(--gold-primary)' : 'var(--text-primary)',
                            border: selectedImages.includes(preset.url) ? '1px solid var(--border-active)' : '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          + {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom URL Input */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    <input
                      type="url"
                      className="input-control"
                      placeholder="Or paste web image URL (https://...)"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      style={{ flex: '1 1 240px' }}
                    />
                    <button type="button" onClick={handleAddCustomPhoto} className="btn btn-outline" style={{ padding: '8px 16px', flex: '0 0 auto', fontSize: '0.8rem' }}>
                      + Add URL
                    </button>
                  </div>

                  {/* Selected Images Grid */}
                  {selectedImages.length > 0 ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-dark)' }}>
                          Attached Photos ({selectedImages.length}):
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedImages([])}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Remove All
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: '10px' }}>
                        {selectedImages.map((url, i) => (
                          <div
                            key={i}
                            style={{
                              position: 'relative',
                              height: '75px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: i === 0 ? '2px solid var(--gold-primary)' : '1px solid var(--border-color)',
                              boxShadow: 'var(--shadow-xs)',
                              background: '#000000',
                            }}
                          >
                            <img src={url} alt={`Room photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {i === 0 && (
                              <span style={{ position: 'absolute', bottom: '3px', left: '3px', padding: '1px 5px', background: 'var(--gold-primary)', color: '#FFFFFF', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 800 }}>
                                Cover
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(url)}
                              style={{
                                position: 'absolute',
                                top: '3px',
                                right: '3px',
                                background: 'rgba(217, 4, 41, 0.88)',
                                border: 'none',
                                color: '#FFFFFF',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                              aria-label="Remove photo"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '16px', background: '#FFFFFF', borderRadius: '8px', border: '1px dashed var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      No photos added yet. Click <strong>Upload from Gallery</strong> or <strong>Take Camera Photo</strong> above to add room visuals.
                    </div>
                  )}
                </div>

                {/* Section 3: What's in the room (Amenities) */}
                <div style={{ padding: '18px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      3. What's in the Room (Amenities & Comforts)
                    </div>
                    {selectedAmenities.length > 0 && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-dark)' }}>
                        {selectedAmenities.length} selected
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Click presets to toggle amenities, or add custom room features below.
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                    {PRESET_AMENITIES.map((amenity, idx) => {
                      const isSelected = selectedAmenities.includes(amenity);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          style={{
                            padding: '6px 12px',
                            background: isSelected ? 'var(--gold-primary)' : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                            border: isSelected ? '1px solid var(--gold-primary)' : '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          {isSelected && <Check size={13} />}
                          <span>{amenity}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="Add custom amenity (e.g. Jacuzzi, City Balcony, Soundbar)..."
                      value={customAmenity}
                      onChange={(e) => setCustomAmenity(e.target.value)}
                      style={{ flex: '1 1 240px' }}
                    />
                    <button type="button" onClick={handleAddCustomAmenity} className="btn btn-outline" style={{ padding: '8px 16px', flex: '0 0 auto' }}>
                      Add
                    </button>
                  </div>
                </div>

                {/* Section 4: Room Inventory Option */}
                <div style={{ padding: '18px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      4. Room Inventory Items
                    </div>
                    {roomInventory.length > 0 && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-dark)' }}>
                        {roomInventory.length} items logged
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Track linens, appliances, furniture, and amenities assigned specifically to this room.
                  </div>

                  {/* Add Item Row with responsive wrapping */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="Item name (e.g. Bath Towels, Nespresso Machine)..."
                      value={newInvName}
                      onChange={(e) => setNewInvName(e.target.value)}
                      style={{ flex: '2 1 180px' }}
                    />
                    <input
                      type="number"
                      className="input-control"
                      placeholder="Qty"
                      value={newInvQty}
                      onChange={(e) => setNewInvQty(e.target.value)}
                      min="1"
                      style={{ flex: '1 1 70px' }}
                    />
                    <select
                      className="input-control"
                      value={newInvCat}
                      onChange={(e) => setNewInvCat(e.target.value)}
                      style={{ flex: '1 1 120px' }}
                    >
                      <option value="Linen">Linen</option>
                      <option value="Bedding">Bedding</option>
                      <option value="Appliances">Appliances</option>
                      <option value="Access">Access / Key</option>
                      <option value="Toiletries">Toiletries</option>
                      <option value="Furniture">Furniture</option>
                    </select>
                    <button type="button" onClick={handleAddInventoryItem} className="btn btn-gold" style={{ padding: '8px 16px', flex: '0 0 auto' }}>
                      Add Item
                    </button>
                  </div>

                  {/* Inventory Table */}
                  {roomInventory.length > 0 ? (
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '8px 12px' }}>Item Name</th>
                            <th style={{ padding: '8px 12px' }}>Category</th>
                            <th style={{ padding: '8px 12px' }}>Quantity</th>
                            <th style={{ padding: '8px 12px', textAlign: 'right' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roomInventory.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', background: '#FFFFFF' }}>
                              <td style={{ padding: '8px 12px', fontWeight: 600 }}>{item.name}</td>
                              <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{item.category}</td>
                              <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--gold-dark)' }}>{item.quantity}</td>
                              <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInventoryItem(idx)}
                                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                                  aria-label="Delete item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                      No inventory items added yet. Add items above to track room stock.
                    </div>
                  )}
                </div>
              </div>

              {/* Sticky Footer: Always 100% visible on all screen sizes & laptops */}
              <div
                className="modal-footer"
                style={{
                  padding: '16px 26px',
                  background: '#FFFFFF',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexShrink: 0,
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 30,
                  boxShadow: '0 -4px 16px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    Room {newRoomNumber || '---'}
                  </span>
                  <span>•</span>
                  <span style={{ color: selectedImages.length > 0 ? 'var(--gold-dark)' : 'var(--text-muted)', fontWeight: 700 }}>
                    {selectedImages.length} Photo{selectedImages.length === 1 ? '' : 's'}
                  </span>
                  <span>•</span>
                  <span style={{ color: roomInventory.length > 0 ? 'var(--gold-dark)' : 'var(--text-muted)', fontWeight: 700 }}>
                    {roomInventory.length} Item{roomInventory.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="btn btn-outline"
                    style={{ padding: '9px 18px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="btn btn-gold"
                    style={{
                      padding: '10px 24px',
                      fontSize: '0.88rem',
                      borderRadius: 'var(--radius-full)',
                      boxShadow: 'var(--shadow-gold)',
                      fontWeight: 700,
                      cursor: creating ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {creating ? 'Saving Room...' : 'Save & Publish Room'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Camera Viewfinder Modal Overlay */}
      {isLiveCameraOpen && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 100000, background: 'rgba(0, 0, 0, 0.85)' }}
          onClick={stopLiveCamera}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '560px',
              width: '92%',
              background: '#111827',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={20} color="var(--gold-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#FFFFFF', fontWeight: 700 }}>
                  Live Camera Viewfinder
                </h3>
              </div>
              <button
                type="button"
                onClick={stopLiveCamera}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
                aria-label="Close camera"
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '320px',
                background: '#000000',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={stopLiveCamera}
                className="btn btn-outline"
                style={{ padding: '10px 20px', color: '#FFFFFF', borderColor: '#4B5563', background: 'transparent' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={captureLivePhoto}
                className="btn btn-gold"
                style={{ padding: '10px 26px', borderRadius: 'var(--radius-full)' }}
              >
                <Camera size={18} />
                <span>Snap Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManager;

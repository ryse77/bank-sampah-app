'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { JenisSampah } from '@/lib/types';
import { Settings, Save, Loader2, Phone, Package, Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function SettingsPage() {
  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'general' | 'jenis-sampah'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [csWhatsapp, setCsWhatsapp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Jenis Sampah states
  const [jenisSampahList, setJenisSampahList] = useState<JenisSampah[]>([]);
  const [showJenisSampahForm, setShowJenisSampahForm] = useState(false);
  const [editingJenisSampah, setEditingJenisSampah] = useState<JenisSampah | null>(null);
  const [jenisSampahForm, setJenisSampahForm] = useState({
    nama: '',
    harga_per_kg: '',
    deskripsi: '',
    is_active: true
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }
    fetchSettings();
    fetchJenisSampah();
  }, [user]);

  const fetchSettings = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Gagal memuat settings');

      const data = await response.json();
      setCsWhatsapp(data.cs_whatsapp_number?.value || '');
    } catch (err: any) {
      setError(err.message || 'Gagal memuat settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchJenisSampah = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/jenis-sampah', {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store' // Prevent caching
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal memuat jenis sampah');
      }

      const result = await response.json();
      console.log('Fetched jenis sampah:', result.data); // Debug log
      setJenisSampahList(result.data || []);
    } catch (err: any) {
      console.error('Fetch jenis sampah error:', err);
      setError('Gagal memuat data jenis sampah');
    }
  };

  const handleJenisSampahSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const url = '/api/jenis-sampah';
      const method = editingJenisSampah ? 'PUT' : 'POST';

      const body = editingJenisSampah
        ? {
            id: editingJenisSampah.id,
            nama: jenisSampahForm.nama.trim(),
            is_active: jenisSampahForm.is_active
          }
        : {
            nama: jenisSampahForm.nama.trim(),
            is_active: jenisSampahForm.is_active
          };

      console.log('Submitting jenis sampah:', method, body); // Debug log

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
        cache: 'no-store'
      });

      const responseData = await response.json();
      console.log('Response:', response.status, responseData); // Debug log

      if (!response.ok) {
        throw new Error(responseData.error || 'Gagal menyimpan jenis sampah');
      }

      const successMsg = editingJenisSampah ? 'Jenis sampah berhasil diupdate!' : 'Jenis sampah berhasil ditambahkan!';
      setSuccess(successMsg);

      // Reset form and hide it
      setJenisSampahForm({ nama: '', harga_per_kg: '', deskripsi: '', is_active: true });
      setEditingJenisSampah(null);
      setShowJenisSampahForm(false);

      // Refresh the list
      await fetchJenisSampah();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Submit error:', err); // Debug log
      setError(err.message || 'Gagal menyimpan jenis sampah');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJenisSampah = async (id: string) => {
    if (!token) return;
    if (!confirm('Apakah Anda yakin ingin menghapus jenis sampah ini?')) return;

    setError('');
    setSuccess('');

    try {
      console.log('Deleting jenis sampah:', id); // Debug log

      const response = await fetch(`/api/jenis-sampah?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });

      const responseData = await response.json();
      console.log('Delete response:', response.status, responseData); // Debug log

      if (!response.ok) {
        throw new Error(responseData.error || 'Gagal menghapus jenis sampah');
      }

      setSuccess('Jenis sampah berhasil dihapus!');

      // Refresh the list
      await fetchJenisSampah();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Delete error:', err); // Debug log
      setError(err.message || 'Gagal menghapus jenis sampah');
    }
  };

  const handleToggleActive = async (item: JenisSampah) => {
    if (!token) return;

    setError('');

    try {
      console.log('Toggle active:', item.id, !item.is_active); // Debug log

      const response = await fetch('/api/jenis-sampah', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: item.id,
          is_active: !item.is_active
        }),
        cache: 'no-store'
      });

      const responseData = await response.json();
      console.log('Toggle response:', response.status, responseData); // Debug log

      if (!response.ok) {
        throw new Error(responseData.error || 'Gagal mengubah status');
      }

      // Refresh the list
      await fetchJenisSampah();
    } catch (err: any) {
      console.error('Toggle error:', err); // Debug log
      setError(err.message || 'Gagal mengubah status');
    }
  };

  const handleEditJenisSampah = (item: JenisSampah) => {
    setEditingJenisSampah(item);
    setJenisSampahForm({
      nama: item.nama,
      harga_per_kg: '', // Not used in form
      deskripsi: '', // Not used in form
      is_active: item.is_active
    });
    setShowJenisSampahForm(true);
  };

  const handleCancelEdit = () => {
    setEditingJenisSampah(null);
    setJenisSampahForm({ nama: '', harga_per_kg: '', deskripsi: '', is_active: true });
    setShowJenisSampahForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Save WhatsApp number
      const whatsappResponse = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          setting_key: 'cs_whatsapp_number',
          setting_value: csWhatsapp.replace(/\D/g, '') // Remove non-numeric characters
        })
      });

      if (!whatsappResponse.ok) throw new Error('Gagal menyimpan nomor WhatsApp');

      setSuccess('Settings berhasil disimpan!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan settings');
    } finally {
      setSaving(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');

    // Add 62 prefix if not present and starts with 0
    if (numbers.startsWith('0')) {
      return '62' + numbers.substring(1);
    }

    // Add 62 prefix if not present
    if (!numbers.startsWith('62')) {
      return '62' + numbers;
    }

    return numbers;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setCsWhatsapp(formatted);
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Settings className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pengaturan Aplikasi</h1>
          <p className="text-gray-600">Kelola pengaturan sistem Bank Sampah</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'general'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Pengaturan Umum
              </div>
            </button>
            <button
              onClick={() => setActiveTab('jenis-sampah')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'jenis-sampah'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Jenis Sampah
              </div>
            </button>
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Service</h2>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                  <p className="font-medium">Berhasil</p>
                  <p className="text-sm">{success}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor WhatsApp Customer Service
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={csWhatsapp}
                    onChange={handlePhoneChange}
                    placeholder="628123456789"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Nomor akan ditampilkan sebagai tombol "Hubungi CS" di dashboard user.
                  Format: 628xxxxxxxxxx (dengan kode negara 62)
                </p>
              </div>

              {/* Preview */}
              {csWhatsapp && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">Preview Link WhatsApp:</p>
                  <a
                    href={`https://wa.me/${csWhatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline text-sm break-all"
                  >
                    https://wa.me/{csWhatsapp}
                  </a>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={fetchSettings}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium"
                disabled={saving}
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Simpan Pengaturan
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Section for General Tab */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Informasi</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Customer Service:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Nomor WhatsApp akan digunakan untuk tombol "Hubungi CS" di dashboard user</li>
                  <li>• Format nomor harus menggunakan kode negara (62 untuk Indonesia)</li>
                  <li>• Contoh: 628123456789 (untuk nomor 0812-3456-789)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jenis Sampah Tab */}
      {activeTab === 'jenis-sampah' && (
        <div>
          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
              <p className="font-medium">Berhasil</p>
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* Add/Edit Form */}
          {showJenisSampahForm && (
            <div className="bg-white rounded-lg shadow mb-6">
              <form onSubmit={handleJenisSampahSubmit}>
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    {editingJenisSampah ? 'Edit Jenis Sampah' : 'Tambah Jenis Sampah Baru'}
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Jenis Sampah *
                      </label>
                      <input
                        type="text"
                        value={jenisSampahForm.nama}
                        onChange={(e) => setJenisSampahForm({ ...jenisSampahForm, nama: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        placeholder="Contoh: Plastik PET"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={jenisSampahForm.is_active}
                        onChange={(e) => setJenisSampahForm({ ...jenisSampahForm, is_active: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                        Status Aktif (tampilkan dalam pilihan)
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium"
                    disabled={saving}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editingJenisSampah ? 'Update' : 'Tambah'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Jenis Sampah */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Daftar Jenis Sampah</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Total: {jenisSampahList.length} jenis sampah
                </p>
              </div>
              {!showJenisSampahForm && (
                <button
                  onClick={() => setShowJenisSampahForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Tambah Baru
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jenisSampahList.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>Belum ada jenis sampah. Klik "Tambah Baru" untuk menambahkan.</p>
                      </td>
                    </tr>
                  ) : (
                    jenisSampahList.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{item.nama}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(item)}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              item.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {item.is_active ? (
                              <>
                                <ToggleRight className="w-4 h-4" />
                                Aktif
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4" />
                                Nonaktif
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditJenisSampah(item)}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteJenisSampah(item.id)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Section for Jenis Sampah Tab */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Informasi</h3>
            <div className="space-y-2">
              <p className="text-sm text-blue-800">• Jenis sampah yang aktif akan muncul di form setor sampah</p>
              <p className="text-sm text-blue-800">• Anda bisa menonaktifkan jenis sampah tanpa menghapusnya</p>
              <p className="text-sm text-blue-800">• Jenis sampah yang sudah digunakan dalam transaksi tidak bisa dihapus</p>
            </div>
          </div>
        </div>
      )}
    </>
      )}
    </div>
  );
}

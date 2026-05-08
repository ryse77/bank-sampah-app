'use client';

import { useCallback, useEffect, useState } from 'react';
import { setoranService } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import { Setoran } from '@/lib/types';
import { ListChecks, Package, Truck, MessageCircle, Search } from 'lucide-react';

export default function AntrianSampahPage() {
  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
  };

  const [antrianPickup, setAntrianPickup] = useState<Setoran[]>([]);
  const [antrianDropoff, setAntrianDropoff] = useState<Setoran[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSetoran, setSelectedSetoran] = useState<Setoran | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [hargaPerKgMap, setHargaPerKgMap] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState({
    berat_sampah: ''
  });
  const { token } = useAuthStore();

  const loadAntrian = useCallback(async () => {
    try {
      const data = await setoranService.list();
      const pending = data.filter((s: Setoran) => s.status === 'pending');
      
      setAntrianPickup(pending.filter((s: Setoran) => s.metode === 'pick-up'));
      setAntrianDropoff(pending.filter((s: Setoran) => s.metode === 'antar-langsung' || s.metode === 'drop-off'));
    } catch (error) {
      console.error('Load antrian error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAntrian();

    // Auto-refresh setiap 3 detik untuk near-realtime updates
    const refreshInterval = setInterval(() => {
      void loadAntrian();
    }, 3000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [loadAntrian]);

  useEffect(() => {
    if (!token) return;

    const loadHargaJenisSampah = async () => {
      try {
        const response = await fetch('/api/jenis-sampah?active=true', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store'
        });
        if (!response.ok) return;

        const result = (await response.json()) as {
          data?: Array<{ nama: string; harga_per_kg: number }>;
        };

        const priceMap: Record<string, number> = {};
        (result.data ?? []).forEach((item) => {
          priceMap[item.nama] = Number(item.harga_per_kg ?? 0);
        });
        setHargaPerKgMap(priceMap);
      } catch (error) {
        console.error('Load harga jenis sampah error:', error);
      }
    };

    void loadHargaJenisSampah();
  }, [token]);

  const handleValidasi = (setoran: Setoran) => {
    console.log('Selected setoran:', setoran);
    console.log('Setoran ID:', setoran.id);
    if (!setoran.id) {
      alert('Error: Data setoran tidak lengkap (ID tidak ditemukan)');
      return;
    }
    setSelectedSetoran(setoran);
    setShowModal(true);
  };

  const handleSubmitValidasi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSetoran || !selectedSetoran.id) {
      alert('Data setoran tidak valid');
      return;
    }

    try {
      await setoranService.validate(selectedSetoran.id, {
        berat_sampah: Number(formData.berat_sampah),
      });
      alert('Setoran berhasil divalidasi!');
      setShowModal(false);
      setFormData({ berat_sampah: '' });
      setSelectedSetoran(null);
      void loadAntrian();
    } catch (error: unknown) {
      console.error('Validasi error:', error);
      alert(getErrorMessage(error, 'Gagal validasi setoran'));
    }
  };

  const handleWhatsApp = (noHp: string | undefined, nama: string) => {
    if (!noHp) {
      alert('Nomor HP tidak tersedia');
      return;
    }

    // Format nomor HP untuk WhatsApp (hapus karakter selain angka)
    let phoneNumber = noHp.replace(/\D/g, '');

    // Jika dimulai dengan 0, ganti dengan 62 (kode negara Indonesia)
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '62' + phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith('62')) {
      phoneNumber = '62' + phoneNumber;
    }

    const message = `Halo ${nama}, kami dari Bank Sampah ingin menghubungi Anda terkait setoran sampah Anda.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  // Filter data berdasarkan search query
  const filteredPickup = antrianPickup.filter((item) =>
    item.users?.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDropoff = antrianDropoff.filter((item) =>
    item.users?.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedHargaPerKg = selectedSetoran ? (hargaPerKgMap[selectedSetoran.jenis_sampah] ?? 0) : 0;
  const estimasiTotal = Number(formData.berat_sampah || 0) * selectedHargaPerKg;

  const SetoranCard = ({ item }: { item: Setoran }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{item.users?.nama_lengkap}</h3>
          <p className="text-sm text-gray-500">{item.users?.email}</p>
          <p className="text-sm text-gray-500 mt-1">{item.users?.no_hp || 'No HP tidak tersedia'}</p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          {item.jenis_sampah}
        </span>
      </div>

      <div className="flex justify-between items-center gap-2">
        <p className="text-sm text-gray-600">
          {new Date(item.tanggal_setor).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </p>
        <div className="flex gap-2">
          {item.users?.no_hp && (
            <button
              onClick={() => handleWhatsApp(item.users?.no_hp, item.users?.nama_lengkap || 'Member')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              title="Hubungi via WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              Hubungi
            </button>
          )}
          <button
            onClick={() => handleValidasi(item)}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
          >
            Validasi
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
          <ListChecks className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Antrian Sampah</h1>
          <p className="text-gray-600">Validasi setoran sampah dari member</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama member..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pick-up */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Pick-up ({filteredPickup.length})
            </h2>
          </div>
          <div className="space-y-3">
            {filteredPickup.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">
                  {searchQuery ? 'Tidak ada hasil pencarian' : 'Tidak ada antrian pick-up'}
                </p>
              </div>
            ) : (
              filteredPickup.map((item) => (
                <SetoranCard key={item.id} item={item} />
              ))
            )}
          </div>
        </div>

        {/* Drop-off */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Drop-off ({filteredDropoff.length})
            </h2>
          </div>
          <div className="space-y-3">
            {filteredDropoff.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">
                  {searchQuery ? 'Tidak ada hasil pencarian' : 'Tidak ada antrian drop-off'}
                </p>
              </div>
            ) : (
              filteredDropoff.map((item) => (
                <SetoranCard key={item.id} item={item} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Validasi */}
      {showModal && selectedSetoran && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Validasi Setoran</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Nama Member</p>
              <p className="font-medium text-gray-800">{selectedSetoran.users?.nama_lengkap}</p>
              
              <p className="text-sm text-gray-600 mb-1 mt-3">Jenis Sampah</p>
              <p className="font-medium text-gray-800">{selectedSetoran.jenis_sampah}</p>
              
              <p className="text-sm text-gray-600 mb-1 mt-3">Metode</p>
              <p className="font-medium text-gray-800 capitalize">{selectedSetoran.metode === 'antar-langsung' ? 'Drop Off' : 'Pick Up'}</p>
            </div>

            <form onSubmit={handleSubmitValidasi} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Berat Sampah (kg)
                </label>
                <input
                  type="number"
                  value={formData.berat_sampah}
                  onChange={(e) => setFormData({ ...formData, berat_sampah: e.target.value })}
                  step="0.1"
                  min="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-800">Harga per Kg (Master)</span>
                  <span className="font-semibold text-blue-900">
                    Rp {selectedHargaPerKg.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-800">Estimasi Total</span>
                  <span className="font-bold text-blue-900">
                    Rp {estimasiTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ berat_sampah: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Validasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

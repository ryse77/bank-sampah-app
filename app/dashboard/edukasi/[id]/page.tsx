'use client';

import { useEffect, useState } from 'react';
import { artikelService } from '@/lib/api';
import { BookOpen, Calendar, User, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ArtikelData {
  id: string;
  judul: string;
  konten: string;
  gambar?: string;
  created_at: string;
  admin?: {
    nama_lengkap: string;
  };
}

export default function ArtikelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [artikel, setArtikel] = useState<ArtikelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [artikelId, setArtikelId] = useState<string>('');

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setArtikelId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!artikelId) return;

    const loadArtikel = async () => {
      try {
        setLoading(true);
        // Fetch all articles and find the one with matching ID
        const response = await artikelService.list(100, 0);
        const data = response?.data ?? [];
        const found = data.find((a: ArtikelData) => a.id === artikelId);

        if (found) {
          setArtikel(found);
        } else {
          console.error('Artikel tidak ditemukan');
        }
      } catch (error) {
        console.error('Load artikel error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArtikel();
  }, [artikelId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!artikel) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium mb-4">Artikel tidak ditemukan</p>
          <button
            onClick={() => router.push('/dashboard/edukasi')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Kembali ke Daftar Artikel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-6 text-green-600 hover:text-green-700 flex items-center gap-2 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        {artikel.gambar && (
          <div className="w-full h-64 bg-gray-200 overflow-hidden">
            <img
              src={artikel.gambar}
              alt={artikel.judul}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{artikel.judul}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{artikel.admin?.nama_lengkap || 'Admin'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(artikel.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <div style={{ whiteSpace: 'pre-wrap' }}>{artikel.konten}</div>
          </div>
        </div>
      </article>
    </div>
  );
}

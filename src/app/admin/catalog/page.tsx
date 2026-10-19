'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Tag,
  DollarSign,
  Package,
  X,
  Bot,
  Send,
  Check,
  Smartphone,
  Laptop,
  Gamepad2,
  Cpu,
} from 'lucide-react';
import AdminNav from '@/components/AdminNav';
import {
  fetchCatalogItems,
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
  chatWithAi,
} from '../../../lib/api';
import { CatalogItem, CreateCatalogItemInput, UpdateCatalogItemInput } from '../../../types/catalog';
import { createSupabaseBrowserClient } from '../../../lib/supabase/client';

const CATEGORIES = [
  'Smartphones',
  'Notebooks & PC',
  'Consolas',
  'Microelectrónica',
] as const;

export default function AdminCatalogPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [formNombre, setFormNombre] = useState('');
  const [formModelo, setFormModelo] = useState('');
  const [formCategoria, setFormCategoria] = useState<string>('Smartphones');
  const [formPrecio, setFormPrecio] = useState('');
  const [formTiempo, setFormTiempo] = useState('');
  const [formStock, setFormStock] = useState('0');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formPalabrasClave, setFormPalabrasClave] = useState('');
  const [formActivo, setFormActivo] = useState(true);

  // Delete Modal
  const [deletingItem, setDeletingItem] = useState<CatalogItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // AI Preview Modal
  const [aiPreviewItem, setAiPreviewItem] = useState<CatalogItem | null>(null);
  const [aiCustomQuestion, setAiCustomQuestion] = useState('');
  const [aiChatResponse, setAiChatResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const getAuthToken = async (): Promise<string | undefined> => {
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.access_token;
    } catch {
      return undefined;
    }
  };

  const loadCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCatalogItems();
      setItems(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al cargar catálogo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormNombre('');
    setFormModelo('');
    setFormCategoria('Smartphones');
    setFormPrecio('');
    setFormTiempo('');
    setFormStock('5');
    setFormDescripcion('');
    setFormPalabrasClave('');
    setFormActivo(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: CatalogItem) => {
    setEditingItem(item);
    setFormNombre(item.nombre);
    setFormModelo(item.modelo || '');
    setFormCategoria(item.categoria);
    setFormPrecio(String(item.precio));
    setFormTiempo(item.tiempo_estimado);
    setFormStock(String(item.stock));
    setFormDescripcion(item.descripcion);
    setFormPalabrasClave(item.palabras_clave?.join(', ') || '');
    setFormActivo(item.activo);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim() || !formCategoria || !formPrecio || !formTiempo) {
      alert('Por favor complete los campos obligatorios: Nombre, Categoría, Precio y Tiempo.');
      return;
    }

    setSaving(true);
    try {
      const token = await getAuthToken();
      const palabras = formPalabrasClave
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      if (editingItem) {
        const updatePayload: UpdateCatalogItemInput = {
          nombre: formNombre.trim(),
          modelo: formModelo.trim() || undefined,
          categoria: formCategoria,
          precio: parseFloat(formPrecio),
          tiempo_estimado: formTiempo.trim(),
          stock: parseInt(formStock, 10) || 0,
          descripcion: formDescripcion.trim(),
          palabras_clave: palabras,
          activo: formActivo,
        };
        await updateCatalogItem(editingItem.id, updatePayload, token);
      } else {
        const createPayload: CreateCatalogItemInput = {
          nombre: formNombre.trim(),
          modelo: formModelo.trim() || undefined,
          categoria: formCategoria,
          precio: parseFloat(formPrecio),
          tiempo_estimado: formTiempo.trim(),
          stock: parseInt(formStock, 10) || 0,
          descripcion: formDescripcion.trim(),
          palabras_clave: palabras,
          activo: formActivo,
        };
        await createCatalogItem(createPayload, token);
      }

      setIsModalOpen(false);
      await loadCatalog();
    } catch (err: unknown) {
      alert((err as Error).message || 'Error al guardar servicio en el catálogo');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: CatalogItem) => {
    try {
      const token = await getAuthToken();
      await updateCatalogItem(item.id, { activo: !item.activo }, token);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, activo: !item.activo } : i)),
      );
    } catch (err: unknown) {
      alert((err as Error).message || 'Error al cambiar estado');
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      const token = await getAuthToken();
      await deleteCatalogItem(deletingItem.id, token);
      setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
      setDeletingItem(null);
    } catch (err: unknown) {
      alert((err as Error).message || 'Error al eliminar servicio');
    } finally {
      setDeleting(false);
    }
  };

  const openAiPreview = (item: CatalogItem) => {
    setAiPreviewItem(item);
    setAiCustomQuestion(`¿Cuánto cuesta y cuánto demora el ${item.nombre} para ${item.modelo || 'mi equipo'}?`);
    setAiChatResponse(null);
  };

  const handleRunAiPreview = async () => {
    if (!aiCustomQuestion.trim() || aiLoading) return;
    setAiLoading(true);
    try {
      const res = await chatWithAi(aiCustomQuestion);
      setAiChatResponse(res.reply || 'Sin respuesta del agente IA');
    } catch {
      setAiChatResponse('Error conectando con el cotizador IA');
    } finally {
      setAiLoading(false);
    }
  };

  // Filtered List
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== 'ALL' && item.categoria.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Active filter
      if (activeFilter === 'ACTIVE' && !item.activo) return false;
      if (activeFilter === 'INACTIVE' && item.activo) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const searchable = `${item.nombre} ${item.modelo || ''} ${item.categoria} ${item.descripcion} ${(item.palabras_clave || []).join(' ')}`.toLowerCase();
        return searchable.includes(q);
      }
      return true;
    });
  }, [items, selectedCategory, activeFilter, searchQuery]);

  const getCategoryBadge = (categoria: string) => {
    const c = categoria.toLowerCase();
    if (c.includes('smart') || c.includes('celular') || c.includes('phone')) {
      return {
        icon: Smartphone,
        classes: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60',
      };
    }
    if (c.includes('note') || c.includes('pc') || c.includes('comput')) {
      return {
        icon: Laptop,
        classes: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
      };
    }
    if (c.includes('cons')) {
      return {
        icon: Gamepad2,
        classes: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
      };
    }
    return {
      icon: Cpu,
      classes: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
    };
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <AdminNav
        title="ElectroFix OS"
        subtitle="Gestor de Catálogo Oficial & Cotizaciones IA"
        badge="CATÁLOGO IA"
        badgeColor="from-cyan-500 to-indigo-600"
      />

      <main className="flex-1 max-w-[1780px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Catálogo de Servicios & Cotizaciones IA
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  {items.length} {items.length === 1 ? 'servicio' : 'servicios'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Precios oficiales de lista, control de repuestos en stock e inyección contextual en el agente de cotización inteligente.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadCatalog}
              disabled={loading}
              className="p-2.5 text-slate-400 hover:text-white bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/70 rounded-xl transition disabled:opacity-50"
              title="Recargar catálogo"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/20 transition transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nuevo Servicio</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900/40 border border-slate-800/60 p-3.5 rounded-2xl">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por servicio, modelo, palabra clave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Select */}
          <div className="md:col-span-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Todas las Categorías</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Active Status Filter */}
          <div className="md:col-span-3 flex rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-0.5 text-xs">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                activeFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({items.length})
            </button>
            <button
              onClick={() => setActiveFilter('ACTIVE')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                activeFilter === 'ACTIVE'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setActiveFilter('INACTIVE')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                activeFilter === 'INACTIVE'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Inactivos
            </button>
          </div>
        </div>

        {/* Catalog Table / Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-sm">Cargando catálogo oficial de servicios...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-rose-950/30 border border-rose-800/50 rounded-2xl text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm text-rose-300">{error}</p>
            <button
              onClick={loadCatalog}
              className="text-xs text-rose-400 underline hover:text-rose-200"
            >
              Reintentar
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 bg-slate-900/30 border border-slate-800/60 rounded-2xl text-center space-y-3">
            <Package className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">
              No se encontraron servicios con los filtros seleccionados
            </p>
            <p className="text-xs text-slate-500">
              Probá limpiando los filtros o agregá un nuevo servicio al catálogo.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Primer Servicio</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const catBadge = getCategoryBadge(item.categoria);
              const CatIcon = catBadge.icon;
              const hasStock = item.stock > 0;

              return (
                <div
                  key={item.id}
                  className={`relative flex flex-col justify-between rounded-2xl border transition shadow-lg ${
                    item.activo
                      ? 'bg-slate-900/70 border-slate-800/90 hover:border-cyan-500/40 hover:shadow-cyan-500/5'
                      : 'bg-slate-950/40 border-slate-800/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* Top Bar: Category & Stock & Active Switch */}
                  <div className="p-4 sm:p-5 space-y-3 border-b border-slate-800/60">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${catBadge.classes}`}
                      >
                        <CatIcon className="w-3.5 h-3.5" />
                        <span>{item.categoria}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Stock Badge */}
                        {hasStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>En Stock ({item.stock} u.)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>Sin Stock (A Pedido)</span>
                          </span>
                        )}

                        {/* Active Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            item.activo ? 'bg-cyan-500' : 'bg-slate-700'
                          }`}
                          title={item.activo ? 'Desactivar servicio' : 'Activar servicio'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              item.activo ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Title & Model */}
                    <div>
                      <h3 className="font-bold text-base text-white tracking-tight leading-snug">
                        {item.nombre}
                      </h3>
                      {item.modelo && (
                        <p className="text-xs text-cyan-400 font-medium mt-0.5 flex items-center gap-1">
                          <span>Modelo:</span>
                          <span className="text-slate-300 font-semibold">{item.modelo}</span>
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.descripcion}
                    </p>

                    {/* Keywords tags */}
                    {item.palabras_clave && item.palabras_clave.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.palabras_clave.slice(0, 4).map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-400"
                          >
                            #{kw}
                          </span>
                        ))}
                        {item.palabras_clave.length > 4 && (
                          <span className="px-1.5 py-0.5 text-[10px] text-slate-500">
                            +{item.palabras_clave.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pricing, Estimated Time & Actions */}
                  <div className="p-4 sm:p-5 bg-slate-950/40 rounded-b-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                          Precio Oficial
                        </span>
                        <div className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-1">
                          <span className="text-cyan-400">$</span>
                          <span>{Number(item.precio).toLocaleString('es-AR')}</span>
                          <span className="text-[11px] text-slate-500 font-medium ml-1">ARS</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                          Demora Estimada
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{item.tiempo_estimado}</span>
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openAiPreview(item)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-800/60 text-xs font-semibold transition"
                        title="Simular cómo cotiza el Asistente IA este servicio"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Vista previa IA</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                          title="Editar servicio"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingItem(item)}
                          className="p-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 border border-rose-800/60 transition"
                          title="Eliminar servicio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editingItem ? 'Editar Servicio de Catálogo' : 'Nuevo Servicio de Catálogo'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Definí precios de lista, repuestos y términos clave para el cotizador IA.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nombre del Servicio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Cambio Módulo OLED iPhone 13/14"
                    value={formNombre}
                    onChange={(e) => setFormNombre(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Categoría *
                  </label>
                  <select
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Modelo / Equipo Compatible
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: iPhone 13, Galaxy A54, PS5"
                    value={formModelo}
                    onChange={(e) => setFormModelo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Precio Oficial ($ ARS) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    placeholder="Ej: 85000"
                    value={formPrecio}
                    onChange={(e) => setFormPrecio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tiempo Estimado de Laboratorio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 2 a 3 horas, 24 a 48 hs"
                    value={formTiempo}
                    onChange={(e) => setFormTiempo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Stock de Repuestos en Taller (unidades)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formActivo}
                      onChange={(e) => setFormActivo(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-800 focus:ring-cyan-500"
                    />
                    <span className="text-xs font-semibold text-slate-200">
                      Servicio Activo en Catálogo y Cotizador
                    </span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Descripción Técnica y Alcance de la Garantía
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detalles del repuesto, tecnología empleada (OLED, microsoldadura, pasta térmica) y garantía..."
                    value={formDescripcion}
                    onChange={(e) => setFormDescripcion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Palabras Clave para el Motor IA (separadas por coma)
                  </label>
                  <input
                    type="text"
                    placeholder="pantalla, modulo, rotura, display, oled, vidrio, tactil, no da imagen"
                    value={formPalabrasClave}
                    onChange={(e) => setFormPalabrasClave(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    El asistente IA buscará coincidencia con estas palabras cuando el cliente haga preguntas informales.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{editingItem ? 'Actualizar Servicio' : 'Crear Servicio'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Eliminar Servicio</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente{' '}
              <span className="font-bold text-white">"{deletingItem.nombre}"</span>? El asistente IA
              ya no podrá cotizar este servicio de forma automática.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteItem}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Definitivamente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI PREVIEW MODAL */}
      {aiPreviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Vista Previa de Cotización con Gemini IA
                  </h2>
                  <p className="text-xs text-cyan-400 font-medium">
                    Servicio: {aiPreviewItem.nombre} {aiPreviewItem.modelo && `(${aiPreviewItem.modelo})`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAiPreviewItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Injected Context Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                Contexto Inyectado en el Prompt de Gemini
              </span>
              <pre className="text-[11px] font-mono text-emerald-400 bg-black/40 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap">
{JSON.stringify(
  {
    servicio: aiPreviewItem.nombre,
    modelo_aplicable: aiPreviewItem.modelo,
    categoria: aiPreviewItem.categoria,
    precio_ars: aiPreviewItem.precio,
    tiempo_estimado: aiPreviewItem.tiempo_estimado,
    stock_unidades: aiPreviewItem.stock,
    disponibilidad:
      aiPreviewItem.stock > 0
        ? `En Stock (${aiPreviewItem.stock} unidades en taller)`
        : 'Sin Stock inmediato (ingreso a pedido)',
    descripcion: aiPreviewItem.descripcion,
    palabras_clave: aiPreviewItem.palabras_clave,
  },
  null,
  2,
)}
              </pre>
            </div>

            {/* Interactive Query Simulator */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Pregunta del Cliente (Prueba Interactiva):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiCustomQuestion}
                  onChange={(e) => setAiCustomQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunAiPreview()}
                  placeholder="Escribí una consulta como cliente..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleRunAiPreview}
                  disabled={aiLoading || !aiCustomQuestion.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {aiLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Cotizar</span>
                </button>
              </div>

              {/* Sample or Live Response */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 text-xs space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {aiChatResponse ? 'Respuesta en Vivo de Gemini:' : 'Respuesta Modelo Esperada:'}
                </span>
                <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                  {aiChatResponse ||
                    `¡Hola! Para ${aiPreviewItem.nombre}${aiPreviewItem.modelo ? ` (${aiPreviewItem.modelo})` : ''}, el valor de lista oficial es de $${Number(aiPreviewItem.precio).toLocaleString('es-AR')} ARS, con un tiempo estimado de demora de ${aiPreviewItem.tiempo_estimado}. ${aiPreviewItem.stock > 0 ? `Contamos con repuestos disponibles en stock (${aiPreviewItem.stock} unidades)` : 'Actualmente el repuesto se encarga a pedido (24-48 hs)'}. ${aiPreviewItem.descripcion} ¡Podés acercar tu equipo al taller para revisarlo e ingresarlo a laboratorio sin cargo!`}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAiPreviewItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

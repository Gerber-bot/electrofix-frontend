'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Sparkles,
  Bot,
  Send,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Laptop,
  Gamepad2,
  Cpu,
  Package,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { chatWithAi, fetchCatalogItems } from '../../lib/api';
import { CatalogItem } from '../../types/catalog';

export default function CotizadorPage() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: '¡Hola! Soy el Agente Cotizador IA de ElectroFix. Consultame por el modelo de tu celular, notebook o consola y la falla que presenta para darte un presupuesto exacto con repuestos en stock al instante.',
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCatalogLoading(true);
    fetchCatalogItems(true)
      .then((data) => setCatalog(data))
      .catch(() => setCatalog([]))
      .finally(() => setCatalogLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (presetText?: string) => {
    const text = (presetText || inputMessage).trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    if (!presetText) setInputMessage('');
    setLoading(true);

    try {
      const history = messages.slice(1).map((m) => ({ role: m.role, content: m.text }));
      const res = await chatWithAi(text, undefined, history);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: res.reply || 'No pude procesar la cotización en este momento.' },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Hubo una intermitencia al conectar con el motor de cotización. Por favor intentá nuevamente.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Group catalog items by category
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    catalog.forEach((item) => set.add(item.categoria));
    return Array.from(set);
  }, [catalog]);

  const groupedCatalog = useMemo(() => {
    const groups: Record<string, CatalogItem[]> = {};
    catalog.forEach((item) => {
      if (selectedCategory !== 'ALL' && item.categoria !== selectedCategory) {
        return;
      }
      if (!groups[item.categoria]) {
        groups[item.categoria] = [];
      }
      groups[item.categoria].push(item);
    });
    return groups;
  }, [catalog, selectedCategory]);

  const getCategoryIcon = (categoria: string) => {
    const c = categoria.toLowerCase();
    if (c.includes('smart') || c.includes('celular') || c.includes('phone')) return Smartphone;
    if (c.includes('note') || c.includes('pc') || c.includes('comput')) return Laptop;
    if (c.includes('cons')) return Gamepad2;
    return Cpu;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20">
              <Wrench className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">ElectroFix</span>
              <span className="text-xs text-cyan-400 block -mt-1 font-medium">
                Cotizador Inteligente 24/7
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al Inicio</span>
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-cyan-500/30 hover:border-cyan-400 transition"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Acceso Taller / Admin</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat Column (7 cols on lg) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl flex flex-col h-[660px] shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-sm text-white">Asistente de Presupuestos con IA</h1>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sincronizado con el catálogo de repuestos y stock oficial
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-semibold rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span>Cotizando en base al catálogo...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-950 flex gap-2">
            <input
              type="text"
              placeholder="Ej: ¿Cuánto sale cambiar la pantalla de un iPhone 13?"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !inputMessage.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Consultar</span>
            </button>
          </div>
        </div>

        {/* Dynamic Catalog Column (5 cols on lg) */}
        <aside className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 flex flex-col h-[660px]">
          <div className="border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Catálogo de Servicios Oficial</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                {catalog.length} servicios
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Tocá cualquier servicio para cotizar y chequear repuestos en tiempo real:
            </p>

            {/* Category tabs */}
            {categoriesList.length > 1 && (
              <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition ${
                    selectedCategory === 'ALL'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Todas
                </button>
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition ${
                      selectedCategory === cat
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {catalogLoading ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60 animate-pulse space-y-2"
                  >
                    <div className="h-4 bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                    <div className="h-3 bg-slate-800/40 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : Object.keys(groupedCatalog).length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <Package className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">No hay servicios disponibles en esta categoría.</p>
              </div>
            ) : (
              Object.entries(groupedCatalog).map(([category, items]) => {
                const CatIcon = getCategoryIcon(category);

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                      <CatIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{category}</span>
                    </div>

                    <div className="space-y-2">
                      {items.map((item) => {
                        const hasStock = item.stock > 0;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              handleSend(
                                `Hola, quiero consultar por ${item.nombre}${item.modelo ? ` para ${item.modelo}` : ''}`,
                              )
                            }
                            className="w-full text-left p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 transition group space-y-1.5 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition">
                                  {item.nombre}
                                </span>
                                {item.modelo && (
                                  <p className="text-[11px] text-slate-400 font-medium">
                                    {item.modelo}
                                  </p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-extrabold text-xs text-cyan-400 block">
                                  ${Number(item.precio).toLocaleString('es-AR')}
                                </span>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {item.descripcion}
                            </p>

                            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/50">
                              <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                                <Clock className="w-3 h-3 text-cyan-400" />
                                <span>{item.tiempo_estimado}</span>
                              </span>

                              {hasStock ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>En Stock ({item.stock} u.)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Repuesto a pedido</span>
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

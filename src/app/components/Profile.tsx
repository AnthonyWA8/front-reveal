import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Settings, Edit, Star, TrendingUp, Heart, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router";
import { BottomNav } from "./BottomNav";
import { userService } from "../../services/api";

const LOGROS_INFO: Record<string, string> = {
  "Racha 5 días": "Iniciaste sesión 5 días seguidos. ¡La constancia es clave para encontrar tu match!",
  "Conversador": "Iniciaste más de 3 conversaciones con tus matches. ¡Sigue así!",
  "Top Match": "Tuviste una compatibilidad mayor al 90% con alguien. ¡Conexión especial!",
  "Compatibilidad Alta": "Tu promedio de compatibilidad supera el 80%. ¡Tus intereses conectan muy bien!",
};

export function Profile() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<any>(null);
  const [intereses, setIntereses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fotoVisor, setFotoVisor] = useState<number | null>(null);
  const [statModal, setStatModal] = useState<{ title: string; description: string } | null>(null);

  useEffect(() => {
    const cargarPerfil = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      try {
        const resp = await userService.obtenerPerfil(userId);
        const data = resp.data.data;
        setPerfil(data);
        setIntereses([]);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarPerfil();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="text-purple-600 font-semibold">Cargando perfil...</div>
      </div>
    );
  }

  const inicial = perfil?.nombre?.[0]?.toUpperCase() || "?";
  const fotos: string[] = perfil?.fotos?.length > 0 ? perfil.fotos : (perfil?.foto_url ? [perfil.foto_url] : []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-900">Mi Perfil</span>
          <button onClick={() => navigate("/settings")} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-purple-600 to-indigo-600" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-16 mb-4">
              {fotos.length > 0 ? (
                <img src={fotos[0]} alt="Foto de perfil" onClick={() => setFotoVisor(0)} className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl cursor-pointer hover:opacity-90 transition-opacity" />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-3xl border-4 border-white shadow-xl flex items-center justify-center text-white text-5xl font-bold">
                  {inicial}
                </div>
              )}
              <div className="flex-1 pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{perfil?.nombre || "Usuario"}</h2>
                    <p className="text-gray-600">{perfil?.universidad || ""}</p>
                  </div>
                  <button onClick={() => navigate("/completar-perfil")} className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="text-sm text-gray-600"><span className="font-medium">📚 {perfil?.carrera || "Carrera no especificada"}</span></div>
              <div className="text-sm text-gray-600"><span className="font-medium">🎂 {perfil?.edad ? `${perfil.edad} años` : ""}</span></div>
            </div>

            {perfil?.bio && <p className="text-gray-700 mb-4">{perfil.bio}</p>}

            {perfil?.prompt_pregunta && perfil?.prompt_respuesta && (
              <div className="bg-purple-50 rounded-2xl p-4 mb-4 border border-purple-100">
                <p className="text-purple-600 text-sm font-medium mb-2">💬 {perfil.prompt_pregunta}</p>
                <p className="text-gray-800 font-medium">"{perfil.prompt_respuesta}"</p>
              </div>
            )}

            {fotos.length > 1 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Mis fotos ({fotos.length})</p>
                <div className="grid grid-cols-3 gap-2">
                  {fotos.map((foto, index) => (
                    <img key={index} src={foto} alt={`Foto ${index + 1}`} onClick={() => setFotoVisor(index)} className="w-full aspect-square object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity" />
                  ))}
                </div>
              </div>
            )}

            {intereses.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {intereses.map((interest: string) => (
                  <span key={interest} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium capitalize">{interest}</span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Heart className="w-5 h-5" />} label="Matches" value={String(perfil?.matches || 0)} color="bg-red-100 text-red-600" onPress={() => setStatModal({ title: "Matches", description: "Cantidad de personas con las que has hecho match. Un match ocurre cuando ambos se dan like mutuamente." })} />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Compatibilidad" value={perfil?.compatibilidad ? `${perfil.compatibilidad}%` : "—"} color="bg-green-100 text-green-600" onPress={() => setStatModal({ title: "Compatibilidad", description: "Porcentaje promedio de compatibilidad con tus matches, calculado según intereses, carrera y universidad en común." })} />
          <StatCard icon={<Star className="w-5 h-5" />} label="Conversaciones" value={String(perfil?.conversaciones || 0)} color="bg-blue-100 text-blue-600" onPress={() => setStatModal({ title: "Conversaciones", description: "Total de conversaciones iniciadas con tus matches. Aumenta cada vez que empiezas a chatear con alguien nuevo." })} />
          <StatCard icon={<Calendar className="w-5 h-5" />} label="Planes exitosos" value={String(perfil?.planes_exitosos || 0)} color="bg-purple-100 text-purple-600" onPress={() => setStatModal({ title: "Planes exitosos", description: "Número de planes o citas que coordinaste con tus matches a través de la app." })} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Logros</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Achievement emoji="🔥" label="Racha 5 días" onPress={() => setStatModal({ title: "Racha 5 días", description: LOGROS_INFO["Racha 5 días"] })} />
            <Achievement emoji="💬" label="Conversador" onPress={() => setStatModal({ title: "Conversador", description: LOGROS_INFO["Conversador"] })} />
            <Achievement emoji="⭐" label="Top Match" onPress={() => setStatModal({ title: "Top Match", description: LOGROS_INFO["Top Match"] })} />
            <Achievement emoji="🎯" label="Compatibilidad Alta" onPress={() => setStatModal({ title: "Compatibilidad Alta", description: LOGROS_INFO["Compatibilidad Alta"] })} />
          </div>
        </motion.div>

        {perfil?.verificado && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="bg-green-50 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-800">Estudiante verificado</p>
              <p className="text-sm text-green-600">Tu carnet universitario fue verificado exitosamente</p>
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />

      <AnimatePresence>
        {statModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStatModal(null)} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">{statModal.title}</h3>
                <button onClick={() => setStatModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{statModal.description}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fotoVisor !== null && fotos.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFotoVisor(null)} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} src={fotos[fotoVisor]} alt="Foto ampliada" className="max-w-full max-h-full rounded-2xl object-contain" onClick={(e) => e.stopPropagation()} />
            {fotos.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setFotoVisor((fotoVisor - 1 + fotos.length) % fotos.length); }} className="absolute left-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setFotoVisor((fotoVisor + 1) % fotos.length); }} className="absolute right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
            <button onClick={() => setFotoVisor(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="absolute bottom-6 flex gap-2">
              {fotos.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === fotoVisor ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, color, onPress }: { icon: React.ReactNode; label: string; value: string; color: string; onPress: () => void }) {
  return (
    <button onClick={onPress} className="bg-white rounded-2xl p-4 shadow-sm text-left hover:shadow-md transition-shadow w-full">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-2`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </button>
  );
}

function Achievement({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <button onClick={onPress} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 text-center hover:shadow-md transition-shadow w-full">
      <div className="text-3xl mb-2">{emoji}</div>
      <p className="text-xs font-medium text-gray-700">{label}</p>
    </button>
  );
}

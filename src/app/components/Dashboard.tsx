import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Sparkles, Users, TrendingUp, MessageCircle, Settings, Crown, MapPin, X, Heart, XCircle } from "lucide-react";
import { statsService, matchService } from "../../services/api";
import { BottomNav } from "./BottomNav";

const GOOGLE_API_KEY = "AIzaSyBsbzIDndMeF6J6qp8teCwtS1a8x7WyGoI"; 

export function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"matches" | "discover">("matches");
  const [ciudad, setCiudad] = useState<string>("");
  const [ciudadInput, setCiudadInput] = useState<string>("");
  const [mostrarInputCiudad, setMostrarInputCiudad] = useState(false);
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [descubrir, setDescubrir] = useState<any[]>([]);
  const [matchNotif, setMatchNotif] = useState<string | null>(null);

  const userId = localStorage.getItem("userId") || "";

  useEffect(() => {
    if (!userId) return;
    matchService.misMatches(userId).then(r => setMatches(r.data.data)).catch(() => {});
    matchService.descubrir(userId).then(r => setDescubrir(r.data.data)).catch(() => {});
  }, [userId]);

  useEffect(() => {
    const ciudadGuardada = localStorage.getItem("ciudad");
    if (ciudadGuardada) {
      setCiudad(ciudadGuardada);
    } else {
      pedirUbicacion();
    }
  }, []);

  const pedirUbicacion = () => {
    setCargandoUbicacion(true);
    if (!navigator.geolocation) {
      setMostrarInputCiudad(true);
      setCargandoUbicacion(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const resp = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}&language=es`
          );
          const data = await resp.json();
          
          if (data.results && data.results.length > 0) {
            // buscar la ciudad en los componentes de la dirección
            let ciudadEncontrada = "";
            for (const result of data.results) {
              for (const component of result.address_components) {
                if (component.types.includes("locality") || 
                    component.types.includes("administrative_area_level_2")) {
                  ciudadEncontrada = component.long_name;
                  break;
                }
              }
              if (ciudadEncontrada) break;
            }

            if (ciudadEncontrada) {
              const ciudadCompleta = `${ciudadEncontrada}, Colombia`;
              setCiudad(ciudadCompleta);
              localStorage.setItem("ciudad", ciudadCompleta);
            } else {
              setMostrarInputCiudad(true);
            }
          } else {
            setMostrarInputCiudad(true);
          }
        } catch (error) {
          setMostrarInputCiudad(true);
        } finally {
          setCargandoUbicacion(false);
        }
      },
      () => {
        // usuario rechazó la ubicación
        setCargandoUbicacion(false);
        setMostrarInputCiudad(true);
      }
    );
  };

  const guardarCiudadManual = () => {
    if (!ciudadInput.trim()) return;
    const ciudadCompleta = `${ciudadInput}, Colombia`;
    setCiudad(ciudadCompleta);
    localStorage.setItem("ciudad", ciudadCompleta);
    setMostrarInputCiudad(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">REVEAL</span>
          </div>
          <div className="flex items-center gap-2">
            {ciudad && (
              <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <MapPin className="w-3 h-3" />
                <span>{ciudad.split(",")[0]}</span>
              </div>
            )}
            <button
              onClick={() => navigate("/settings")}
              className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Banner cargando ubicación */}
      {cargandoUbicacion && (
        <div className="bg-purple-600 text-white text-center py-2 text-sm">
          📍 Obteniendo tu ubicación...
        </div>
      )}

      {/* Modal ciudad manual */}
      {mostrarInputCiudad && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">¿En qué ciudad estás?</h3>
              <button onClick={() => setMostrarInputCiudad(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Necesitamos tu ciudad para recomendarte lugares cercanos cuando tengas buena conexión con alguien.
            </p>
            <input
              type="text"
              value={ciudadInput}
              onChange={(e) => setCiudadInput(e.target.value)}
              placeholder="Ej: Ibagué, Bogotá, Medellín..."
              onKeyDown={(e) => e.key === "Enter" && guardarCiudadManual()}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-purple-400 mb-4"
            />
            <button
              onClick={guardarCiudadManual}
              disabled={!ciudadInput.trim()}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              Confirmar ciudad
            </button>
          </motion.div>
        </motion.div>
      )}

      <div className="max-w-4xl mx-auto p-6 pb-24">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <StatCard icon={<Users />} label="Matches" value="12" />
          <StatCard icon={<TrendingUp />} label="Compatibilidad Avg" value="84%" />
          <StatCard icon={<MessageCircle />} label="Conversaciones" value="5" />
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab("matches")}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === "matches"
                ? "bg-purple-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Tus Matches
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === "discover"
                ? "bg-purple-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Descubrir
          </button>
        </div>

        {/* AI Insight Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 mb-6 text-white"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Sugerencia de IA</h3>
              <p className="text-sm text-white/90">
                Carlos tiene 92% de compatibilidad contigo. Ya llevan 3 días conversando.
                ¿Qué tal sugerir ir por café? ☕
              </p>
            </div>
          </div>
        </motion.div>

        {/* Matches Grid / Discover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {activeTab === "matches" ? (
            matches.length === 0 ? (
              <div className="col-span-2 text-center py-16 text-gray-400">
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aún no tienes matches. ¡Ve a Descubrir!</p>
              </div>
            ) : (
              matches.map((match, index) => (
                <MatchCard key={match.id} match={match} index={index} navigate={navigate} />
              ))
            )
          ) : (
            descubrir.length === 0 ? (
              <div className="col-span-2 text-center py-16 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay más usuarios por descubrir</p>
              </div>
            ) : (
              descubrir.map((user, index) => (
                <DiscoverCard
                  key={user.id}
                  user={user}
                  index={index}
                  onLike={async () => {
                    const r = await matchService.like(userId, String(user.id));
                    setDescubrir(prev => prev.filter(u => u.id !== user.id));
                    if (r.data.match) {
                      setMatchNotif(user.nombre || "Usuario");
                      matchService.misMatches(userId).then(res => setMatches(res.data.data)).catch(() => {});
                      setTimeout(() => setMatchNotif(null), 3000);
                    }
                  }}
                  onSkip={() => setDescubrir(prev => prev.filter(u => u.id !== user.id))}
                />
              ))
            )
          )}
        </motion.div>
      </div>

      {/* Premium Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        onClick={() => navigate("/premium")}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-10"
      >
        <Crown className="w-7 h-7 text-white" />
      </motion.button>

      <BottomNav />

      <AnimatePresence>
        {matchNotif && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 text-center"
          >
            <p className="text-2xl mb-1">🎉</p>
            <p className="font-bold">¡Match con {matchNotif}!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2 text-purple-600">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}

function DiscoverCard({ user, index, onLike, onSkip }: { user: any; index: number; onLike: () => void; onSkip: () => void }) {
  const foto = user.fotos?.[0] || user.foto_url;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm"
    >
      <div className="relative h-48 bg-gradient-to-br from-purple-400 to-indigo-400">
        {foto ? (
          <img src={foto} alt={user.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold opacity-40">
            {user.nombre?.[0] || "?"}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{user.nombre || "Usuario"}</h3>
        <p className="text-sm text-gray-500 mb-3">{user.universidad || ""} {user.carrera ? `· ${user.carrera}` : ""}</p>
        <div className="flex gap-3">
          <button onClick={onSkip} className="flex-1 py-3 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition-all">
            <XCircle className="w-5 h-5 text-gray-400" />
          </button>
          <button onClick={onLike} className="flex-1 py-3 rounded-xl bg-purple-600 flex items-center justify-center hover:bg-purple-700 transition-all">
            <Heart className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function MatchCard({ match, index, navigate }: { match: any; index: number; navigate: any }) {
  const handleClick = async () => {
    const key = `conv_${match.id}`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, '1');
      await statsService.incrementar('conversaciones');
    }
    navigate(`/chat/${match.id}`);
  };

  const foto = match.fotos?.[0] || match.foto_url;
  const nombre = match.nombre || "Usuario";
  const intereses: string[] = match.intereses || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={handleClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="relative h-48 bg-gradient-to-br from-purple-400 to-indigo-400">
        {foto ? (
          <img src={foto} alt={nombre} className="w-full h-full object-cover" style={{ filter: "blur(12px)", transform: "scale(1.1)" }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold opacity-20">
            {nombre[0]}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Revelación</span>
            <span className="text-white font-bold">0%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-white h-full rounded-full w-0" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">{nombre}</h3>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-gray-600">Activo</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3">{match.universidad || ""}</p>
        {intereses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {intereses.slice(0, 3).map((interest: string) => (
              <span key={interest} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">{interest}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
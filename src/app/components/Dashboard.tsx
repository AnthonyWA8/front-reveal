import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Sparkles, Users, TrendingUp, MessageCircle, Settings, Crown, MapPin, X } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { obtenerMatches } from "../../services/api";




const GOOGLE_API_KEY = "AIzaSyBsbzIDndMeF6J6qp8teCwtS1a8x7WyGoI"; 

export function Dashboard() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"matches" | "discover">("matches");
  const [ciudad, setCiudad] = useState<string>("");
  const [ciudadInput, setCiudadInput] = useState<string>("");
  const [mostrarInputCiudad, setMostrarInputCiudad] = useState(false);
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false);

  useEffect(() => {
  const cargarMatches = async () => {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) return;

      const response = await obtenerMatches(userId);

      setMatches(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  cargarMatches();
}, []);

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


  const compatibilidadPromedio =
  matches.length > 0
    ? Math.round(
        matches.reduce(
          (acc, match) => acc + match.compatibilidad,
          0
        ) / matches.length
      )
    : 0;

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
          <StatCard
            icon={<Users />}
            label="Matches"
            value={matches.length.toString()}
          />

          <StatCard
            icon={<TrendingUp />}
            label="Compatibilidad Avg"
            value={`${compatibilidadPromedio}%`}
          />

          <StatCard
            icon={<MessageCircle />}
            label="Conversaciones"
            value="0"
/>
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

        {/* Matches Grid */}
        <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.3 }}
  className="grid grid-cols-1 md:grid-cols-2 gap-4"
>
  {activeTab === "matches" &&
    matches.map((match) => (
      <div
        key={match.id}
        className="bg-zinc-900 rounded-xl p-4"
      >
        <img
          src={match.foto_url}
          className="w-full h-52 object-cover rounded-lg blur-sm"
        />

        <h3 className="text-white mt-3 font-semibold">
          {match.universidad}
        </h3>

        <p className="text-pink-400">
          {match.compatibilidad}% compatible
        </p>

        <div className="flex flex-wrap gap-2 mt-2">
          {match.intereses_comunes.map((i: string) => (
            <span
              key={i}
              className="bg-zinc-800 px-2 py-1 rounded text-sm"
            >
              {i}
            </span>
          ))}
        </div>
      </div>
    ))}
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

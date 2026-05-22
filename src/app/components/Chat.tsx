import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Send, Info, Sparkles, Lock } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { userService, statsService } from "../../services/api";

const CHAT_URL = "http://localhost:3005";

interface Mensaje {
  id: number;
  text: string;
  sender: "me" | "them";
  time: string;
}

export function Chat() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [nivel, setNivel] = useState(2);
  const [blur, setBlur] = useState(20);
  const [puntaje, setPuntaje] = useState(0);
  const [razon, setRazon] = useState("");
  const [lugares, setLugares] = useState<any[]>([]);
  const [showLugares, setShowLugares] = useState(false);
  const [perfilOtro, setPerfilOtro] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = localStorage.getItem("userId") || "";
  const otroUserId = id || "";
  const nombrePropio = localStorage.getItem("nombre") || "Yo";

  useEffect(() => {
    const cargarPerfilOtro = async () => {
      try {
        const resp = await userService.obtenerPerfilConNivel(otroUserId, nivel);
        setPerfilOtro(resp.data.data);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      }
    };

    if (otroUserId) cargarPerfilOtro();
  }, [otroUserId, nivel]);

  useEffect(() => {
    const s = io(CHAT_URL);
    setSocket(s);

    s.emit("unirse", {
      user_id: userId,
      otro_user_id: otroUserId,
      intereses_comunes: ["música", "café", "tecnología"],
      ciudad: localStorage.getItem("ciudad") || "Ibagué, Colombia"
    });

    s.on("estado_sala", (data) => {
      setNivel(data.nivel);
      setBlur(data.blur);
    });

    s.on("nuevo_mensaje", (msg) => {
      setMessages((prev) => [...prev, {
        id: prev.length + 1,
        text: msg.texto,
        sender: msg.autor === nombrePropio ? "me" : "them",
        time: new Date(msg.timestamp).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })
      }]);
    });

    s.on("actualizacion_nivel", (data) => {
      setNivel(data.nivel);
      setBlur(data.blur);
      setPuntaje(data.puntaje);
      setRazon(data.razon);
    });

    s.on("recomendacion_lugares", (data) => {
      setLugares(data.lugares);
      setShowLugares(true);
      statsService.incrementar('planes_exitosos');
    });

    return () => { s.disconnect(); };
  }, [userId, otroUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !socket) return;

    socket.emit("mensaje", {
      user_id: userId,
      otro_user_id: otroUserId,
      texto: message,
      autor: nombrePropio
    });

    setMessage("");
  };

  const revealStage = Math.min(100, puntaje);
  const esBorrosa = perfilOtro?.foto_borrosa === true;
  const tienefoto = !!perfilOtro?.foto_url;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="relative">
            {tienefoto ? (
              <img
                src={perfilOtro.foto_url}
                alt="Foto"
                className="w-12 h-12 rounded-full object-cover"
                style={{ filter: esBorrosa ? `blur(8px)` : 'none' }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white font-bold text-lg">
                {perfilOtro?.nombre?.[0] || "?"}
              </div>
            )}
            {nivel < 4 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                <Lock className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              {nivel >= 4
                ? (perfilOtro?.nombre || "Usuario desbloqueado")
                : nivel >= 3
                ? (perfilOtro?.nombre ? `${perfilOtro.nombre.split(' ')[0]}` : "Usuario anónimo")
                : "Usuario anónimo"}
            </h3>
            <p className="text-xs text-gray-500">Nivel {nivel} · Puntaje {puntaje}</p>
          </div>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <Info className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-white">
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <p>
            {razon || "Conversá para que la IA analice tu conexión"}
            <span className="font-semibold ml-1">Nivel {nivel}</span>
          </p>
        </div>
        <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
          <motion.div
            animate={{ width: `${revealStage}%` }}
            className="bg-white h-full rounded-full"
          />
        </div>
      </div>

      {showLugares && lugares.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border-b border-green-200 px-4 py-3"
        >
          <p className="text-green-800 font-semibold text-sm mb-2">🎉 ¡Gran conexión! Lugares recomendados:</p>
          {lugares.map((l, i) => (
            <p key={i} className="text-green-700 text-xs">📍 {l.nombre} — {l.direccion}</p>
          ))}
          <button onClick={() => setShowLugares(false)} className="text-green-500 text-xs mt-1">Cerrar</button>
        </motion.div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>¡Empezá la conversación!</p>
            <p className="text-xs mt-1">La IA analizará la conexión cada 5 mensajes</p>
          </div>
        )}
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.sender === "me"
                  ? "bg-purple-600 text-white rounded-br-sm"
                  : "bg-white text-gray-900 rounded-bl-sm shadow-sm"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender === "me" ? "text-purple-200" : "text-gray-500"}`}>
                {msg.time}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <button
            onClick={handleSend}
            className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center hover:bg-purple-700 transition-colors disabled:opacity-50"
            disabled={!message.trim()}
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="absolute top-0 right-0 bottom-0 w-80 bg-white shadow-2xl border-l border-gray-200 z-20"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Información</h3>
                <button onClick={() => setShowInfo(false)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">✕</button>
              </div>

              {tienefoto ? (
                <img
                  src={perfilOtro.foto_url}
                  alt="Foto"
                  className="w-32 h-32 mx-auto rounded-2xl object-cover mb-4"
                  style={{ filter: esBorrosa ? `blur(8px)` : 'none' }}
                />
              ) : (
                <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white text-5xl font-bold mb-4">
                  {perfilOtro?.nombre?.[0] || "?"}
                </div>
              )}

              <div className="text-center mb-6">
                <p className="text-purple-600 font-medium">Nivel {nivel} de conexión</p>
                <p className="text-sm text-gray-500 mt-1">{razon}</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-xs text-purple-900">
                  💡 A mayor conexión, más información se revela automáticamente.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
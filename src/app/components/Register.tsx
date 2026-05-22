import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Mail, Lock, User, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router";
import { authService, userService } from "../../services/api";

export function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    nombre: "",
    edad: "",
    universidad: "",
    carrera: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Registrar en auth-service
      const authResp = await authService.register({
        email: form.email,
        password: form.password,
        nombre: form.nombre,
        universidad: form.universidad,
        carrera: form.carrera,
      });

      const { userId, token } = authResp.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("email", form.email);
      localStorage.setItem("nombre", form.nombre);

      navigate("/verificar");
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-lg rounded-3xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Crear cuenta</h1>
          <p className="text-white/70 mt-1">Solo para estudiantes universitarios</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-white text-sm">
              {error}
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="email"
              placeholder="Email universitario (.edu.co)"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
            />
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Nombre completo"
              value={form.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
            />
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="number"
              placeholder="Edad"
              value={form.edad}
              onChange={(e) => handleChange("edad", e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
            />
          </div>

          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Universidad"
              value={form.universidad}
              onChange={(e) => handleChange("universidad", e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
            />
          </div>

          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Carrera"
              value={form.carrera}
              onChange={(e) => handleChange("carrera", e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-white text-purple-600 py-4 rounded-2xl font-semibold text-lg hover:bg-white/90 transition-all shadow-xl disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full bg-white/10 text-white py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all"
          >
            Ya tengo cuenta
          </button>
        </div>
      </motion.div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { supabase, getUserId } from "../supabase";

const VACIO = { nombre: "", descripcion: "", precio: "" };

function IconoEditar() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconoEliminar() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export default function Servicios({ soloLectura }) {
  const [servicios, setServicios] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [selId, setSelId] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [esNuevo, setEsNuevo] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [confirmEliminar, setConfirmEliminar] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    const { data, error } = await supabase
      .from("servicios")
      .select("*")
      .order("nombre");
    if (error) setError("Error al cargar servicios");
    else setServicios(data);
    setCargando(false);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function seleccionar(s) {
    setSelId(s.id);
    setForm({
      nombre: s.nombre,
      descripcion: s.descripcion || "",
      precio: s.precio || "",
    });
    setModoEdicion(false);
    setEsNuevo(false);
    setError("");
    setOk("");
  }

  function nuevo() {
    setSelId(null);
    setForm(VACIO);
    setModoEdicion(true);
    setEsNuevo(true);
    setError("");
    setOk("");
  }

  function cancelar() {
    if (esNuevo) {
      setSelId(null);
      setForm(VACIO);
      setModoEdicion(false);
      setEsNuevo(false);
    } else {
      const s = servicios.find((x) => x.id === selId);
      if (s) seleccionar(s);
      setModoEdicion(false);
    }
    setError("");
    setOk("");
  }

  async function guardar() {
    setError("");
    setOk("");
    if (!form.nombre.trim()) return setError("El nombre es obligatorio");
    if (!form.precio || isNaN(form.precio))
      return setError("El precio debe ser un número");

    const userId = await getUserId();
    const datos = {
      user_id: userId,
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: parseFloat(form.precio),
    };

    if (!esNuevo && selId) {
      const { error } = await supabase
        .from("servicios")
        .update(datos)
        .eq("id", selId);
      if (error) return setError("Error al actualizar");
      setOk("Servicio actualizado");
      setModoEdicion(false);
    } else {
      const { data, error } = await supabase
        .from("servicios")
        .insert([datos])
        .select()
        .single();
      if (error) return setError("Error al guardar");
      setOk("Servicio agregado");
      setEsNuevo(false);
      setModoEdicion(false);
      setSelId(data.id);
    }

    setForm(VACIO);
    cargar();
  }

  async function eliminar(id) {
    const { error } = await supabase.from("servicios").delete().eq("id", id);
    if (error) {
      setError("Error al eliminar");
      return;
    }
    setSelId(null);
    setForm(VACIO);
    setModoEdicion(false);
    setConfirmEliminar(null);
    cargar();
  }

  const filtrados = servicios.filter((s) => {
    if (!busqueda) return true;
    const t = busqueda.toLowerCase();
    return (
      s.nombre?.toLowerCase().includes(t) ||
      s.descripcion?.toLowerCase().includes(t)
    );
  });

  const formularioVacio = !selId && !esNuevo;

  return (
    <div className="md-layout">
      <div className="md-form-area">
        <div className="md-form-header">
          <h2 className={formularioVacio ? "" : "activo"}>
            {esNuevo
              ? "Nuevo servicio"
              : selId
                ? "Datos del servicio"
                : "Seleccioná un servicio"}
          </h2>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {error && <span className="msg-error">{error}</span>}
            {ok && <span className="msg-ok">{ok}</span>}
            {!soloLectura && !modoEdicion && (
              <button className="btn btn-primary" onClick={nuevo}>
                + Nuevo
              </button>
            )}
            {!soloLectura && selId && !modoEdicion && !esNuevo && (
              <button
                className="btn btn-secondary"
                onClick={() => setModoEdicion(true)}
              >
                <IconoEditar /> Editar
              </button>
            )}
            {!soloLectura && selId && !esNuevo && !modoEdicion && (
              <button
                className="btn btn-danger"
                onClick={() => setConfirmEliminar(selId)}
              >
                <IconoEliminar /> Eliminar
              </button>
            )}
            {modoEdicion && (
              <>
                <button className="btn btn-primary" onClick={guardar}>
                  Guardar
                </button>
                <button className="btn btn-secondary" onClick={cancelar}>
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        <input
          name="nombre"
          placeholder="Nombre (ej: Armado, Pintado, Soldadura) *"
          value={form.nombre}
          onChange={handleChange}
          readOnly={!modoEdicion}
        />

        <input
          name="descripcion"
          placeholder="Descripción opcional"
          value={form.descripcion}
          onChange={handleChange}
          readOnly={!modoEdicion}
          style={{ marginTop: "0.65rem" }}
        />

        <input
          name="precio"
          type="number"
          placeholder="Precio ($) *"
          value={form.precio}
          onChange={handleChange}
          readOnly={!modoEdicion}
          style={{ marginTop: "0.65rem" }}
        />
      </div>

      <div className="md-search-area">
        <input
          placeholder="Buscar servicio..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="md-list-area">
        {cargando ? (
          <p style={{ color: "#888", padding: "1rem" }}>Cargando...</p>
        ) : filtrados.length === 0 ? (
          <p style={{ color: "#888", padding: "1rem" }}>No hay servicios</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((s) => (
                <tr
                  key={s.id}
                  className={selId === s.id ? "seleccionado" : ""}
                  onClick={() => seleccionar(s)}
                >
                  <td>
                    {s.nombre}
                    {s.descripcion && (
                      <div style={{ fontSize: "0.75rem", color: "#888" }}>
                        {s.descripcion}
                      </div>
                    )}
                  </td>
                  <td style={{ color: "#888" }}>{s.descripcion || "—"}</td>
                  <td>${parseFloat(s.precio).toLocaleString("es-AR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirmEliminar && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>¿Eliminar servicio?</h3>
            <p
              style={{
                color: "#888",
                fontSize: "0.9rem",
                margin: "0.5rem 0 1rem",
              }}
            >
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="btn btn-danger"
                onClick={() => eliminar(confirmEliminar)}
              >
                Eliminar
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmEliminar(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

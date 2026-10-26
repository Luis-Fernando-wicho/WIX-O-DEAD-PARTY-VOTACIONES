import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import "./AdminDashboard.css";

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("agregar"); // 'agregar' | 'votaciones'
  const [category, setCategory] = useState("individual"); // 'individual' | 'duo'

  // Formulario de participante
  const [name, setName] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [code1, setCode1] = useState("");
  const [code2, setCode2] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Lista de participantes registrados en tiempo real desde Firestore
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    // Escuchar actualizaciones en vivo de la base de datos
    const q = query(collection(db, "participants"), orderBy("points", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setParticipants(docs);
    });
    return () => unsubscribe();
  }, []);

  // Comprimir imagen y convertirla a Base64 de tamaño seguro (< 1MB)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400; // Ancho máximo seguro
          const MAX_HEIGHT = 400; // Alto máximo seguro
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Comprimir a JPEG con calidad 0.7 para asegurar que pese muy poco
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setImageBase64(dataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Guardar participante en Firebase con validaciones
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !imageBase64 || !code1 || (category === "duo" && !code2)) {
      setMessage({
        type: "error",
        text: "Por favor completa todos los campos requeridos e incluye una foto.",
      });
      return;
    }

    const upperCode1 = code1.toUpperCase();
    const upperCode2 = category === "duo" ? code2.toUpperCase() : null;

    // Validar que los códigos de un dúo no sean iguales
    if (category === "duo" && upperCode1 === upperCode2) {
      setMessage({
        type: "error",
        text: "Los códigos para el dúo no pueden ser iguales.",
      });
      return;
    }

    // Validar nombre duplicado (ignorando mayúsculas/minúsculas y espacios extra)
    const trimmedName = name.trim().toLowerCase();
    const nameExists = participants.some(
      (p) => p.name.trim().toLowerCase() === trimmedName,
    );
    if (nameExists) {
      setMessage({
        type: "error",
        text: "Ya existe un participante registrado con este nombre.",
      });
      return;
    }

    // Validar códigos duplicados existentes en la base de datos
    const allExistingCodes = participants.flatMap((p) => p.assignedCodes || []);
    if (
      allExistingCodes.includes(upperCode1) ||
      (upperCode2 && allExistingCodes.includes(upperCode2))
    ) {
      setMessage({
        type: "error",
        text: "Uno o más códigos ya están asignados a otro participante.",
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      // 1. Armar array de códigos asignados
      const assignedCodes =
        category === "individual" ? [upperCode1] : [upperCode1, upperCode2];

      // 2. Crear registro en Firestore
      await addDoc(collection(db, "participants"), {
        name: name.trim(),
        photoURL: imageBase64,
        category, // 'individual' o 'duo'
        assignedCodes,
        points: 0,
        createdAt: new Date().toISOString(),
      });

      // 3. Registrar códigos en colección 'valid_codes' para control de votaciones
      for (const c of assignedCodes) {
        await setDoc(doc(db, "valid_codes", c), {
          code: c,
          category,
          votedIndividual: false,
          votedDuo: false,
        });
      }

      setMessage({
        type: "success",
        text: "¡Participante agregado correctamente!",
      });
      setName("");
      setImageBase64("");
      setCode1("");
      setCode2("");
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Error al registrar participante en Firestore.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar participante y liberar sus códigos
  const handleDeleteParticipant = async (participant) => {
    if (
      window.confirm(
        `¿Estás seguro de eliminar a "${participant.name}" de la base de datos?`,
      )
    ) {
      try {
        // Eliminar de la colección 'participants'
        await deleteDoc(doc(db, "participants", participant.id));

        // Eliminar sus códigos de 'valid_codes' para que queden disponibles si se desea
        if (participant.assignedCodes) {
          for (const c of participant.assignedCodes) {
            await deleteDoc(doc(db, "valid_codes", c));
          }
        }
      } catch (err) {
        console.error(err);
        alert("Ocurrió un error al intentar eliminar al participante.");
      }
    }
  };

  // Filtrar participantes por categoría para la lista
  const filteredParticipants = participants.filter(
    (p) => p.category === category,
  );

  return (
    <div className="admin-dashboard-container">
      {/* Botones de navegación interna */}
      <div className="admin-nav-tabs">
        <button
          className={`tab-btn ${activeTab === "agregar" ? "active" : ""}`}
          onClick={() => setActiveTab("agregar")}
        >
          AGREGAR
        </button>
        <span className="tab-separator">|</span>
        <button
          className={`tab-btn ${activeTab === "votaciones" ? "active" : ""}`}
          onClick={() => setActiveTab("votaciones")}
        >
          VOTACIONES
        </button>
      </div>

      {/* PESTAÑA: AGREGAR PARTICIPANTE */}
      {activeTab === "agregar" && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-left">
              <input
                type="text"
                placeholder="NOMBRE"
                className="admin-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                type="text"
                placeholder="CÓDIGO 1"
                className="admin-input"
                value={code1}
                onChange={(e) => setCode1(e.target.value.toUpperCase())}
              />

              {category === "duo" && (
                <input
                  type="text"
                  placeholder="CÓDIGO 2"
                  className="admin-input"
                  value={code2}
                  onChange={(e) => setCode2(e.target.value.toUpperCase())}
                />
              )}
            </div>

            <div className="form-right">
              <label htmlFor="file-upload" className="image-dropzone">
                {imageBase64 ? (
                  <img
                    src={imageBase64}
                    alt="Preview"
                    className="preview-img"
                  />
                ) : (
                  <span>FOTO</span>
                )}
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* Selector de Categoría */}
          <div className="category-selector">
            <button
              type="button"
              className={`cat-btn ${category === "individual" ? "selected" : ""}`}
              onClick={() => setCategory("individual")}
            >
              REY CALABAZA
            </button>
            <span className="tab-separator">|</span>
            <button
              type="button"
              className={`cat-btn ${category === "duo" ? "selected" : ""}`}
              onClick={() => setCategory("duo")}
            >
              DUO HALLOWEEN TOWN
            </button>
          </div>

          {message.text && (
            <div className={`status-msg ${message.type}`}>{message.text}</div>
          )}

          <button type="submit" className="admin-submit-btn" disabled={loading}>
            {loading ? "GUARDANDO..." : "AGREGAR PARTICIPANTE"}
          </button>
        </form>
      )}

      {/* PESTAÑA: VOTACIONES EN VIVO */}
      {activeTab === "votaciones" && (
        <div className="live-votes-container">
          <div className="rankings-list">
            {filteredParticipants.map((p, index) => (
              <div key={p.id} className="ranking-card">
                <div className="rank-number">{index + 1}.º</div>
                <img src={p.photoURL} alt={p.name} className="rank-photo" />
                <div className="rank-details">
                  <span className="rank-name">{p.name}</span>
                  <span className="rank-points">{p.points || 0} PUNTOS</span>
                  <div className="rank-codes">
                    Códigos: {p.assignedCodes?.join(", ")}
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteParticipant(p)}
                  title="Eliminar participante"
                >
                  ELIMINAR
                </button>
              </div>
            ))}

            {filteredParticipants.length === 0 && (
              <p className="no-participants">
                No hay participantes registrados en esta categoría.
              </p>
            )}
          </div>

          {/* Selector de Categoría Inferior */}
          <div className="category-selector bottom-selector">
            <button
              type="button"
              className={`cat-btn ${category === "individual" ? "selected" : ""}`}
              onClick={() => setCategory("individual")}
            >
              REY CALABAZA
            </button>
            <span className="tab-separator">|</span>
            <button
              type="button"
              className={`cat-btn ${category === "duo" ? "selected" : ""}`}
              onClick={() => setCategory("duo")}
            >
              DUO HALLOWEEN TOWN
            </button>
          </div>
        </div>
      )}

      <button className="logout-btn" onClick={onLogout}>
        Cerrar Sesión Admin
      </button>
    </div>
  );
}

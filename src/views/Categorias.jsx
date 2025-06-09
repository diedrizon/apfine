import React, { useState, useEffect } from "react";
import { db, auth } from "../database/firebaseconfig";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Container, Button, Card } from "react-bootstrap";
import * as FaIcons from "react-icons/fa";
import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
import ModalEdicionCategoria from "../components/categorias/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../components/categorias/ModalEliminacionCategoria";
import ModalMensaje from "../components/ModalMensaje";
import ToastFlotante from "../components/ui/ToastFlotante";
import "../styles/Categorias.css";
import { onAuthStateChanged } from "firebase/auth";
import ReactGA from "react-ga4";
import Paginacion from "../components/ordenamiento/Paginacion"; // 🔸 A. Importa el componente de paginación

function getIconComponent(iconName) {
  const IconComponent = FaIcons[iconName];
  return IconComponent ? <IconComponent /> : <FaIcons.FaQuestion />;
}

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Nuevo estado para búsqueda
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3); 
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalMensaje, setShowModalMensaje] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [categoriaNueva, setCategoriaNueva] = useState({
    nombre: "",
    color: "",
    icono: "",
    aplicacion: "",
  });

  const [categoriaEditada, setCategoriaEditada] = useState(null);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const categoriasCollection = collection(db, "categorias");

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuarioId(user.uid);
      }
    });
  }, []);

  useEffect(() => {
    if (usuarioId) {
      const cleanup = fetchCategorias();
      return () => cleanup();
    }
  });

  function fetchCategorias() {
    const stopListening = onSnapshot(
      categoriasCollection,
      (snapshot) => {
        const fetched = snapshot.docs
          .map((docu) => ({ ...docu.data(), id: docu.id }))
          .filter((cat) => cat.usuarioId === usuarioId);

        setCategorias(fetched);
      },
      (error) => {
        console.error("Error al escuchar categorías:", error);
        setMensaje("Error al cargar las categorías: " + error.message);
        setShowModalMensaje(true);
      }
    );
    return stopListening;
  }

  function handleOpenAddModal() {
    setCategoriaNueva({ nombre: "", color: "", icono: "", aplicacion: "" });
    setShowModalAdd(true);
  }

  function handleCloseAddModal() {
    setShowModalAdd(false);
  }

  function handleOpenEditModal(categoria) {
    setCategoriaEditada({ ...categoria });
    setShowModalEdit(true);
  }

  function handleCloseEditModal() {
    setShowModalEdit(false);
  }

  function handleOpenDeleteModal(categoria) {
    setCategoriaAEliminar(categoria);
    setShowModalDelete(true);
  }

  function handleCloseDeleteModal() {
    setShowModalDelete(false);
  }

  function handleChangeNueva(e) {
    const { name, value } = e.target;
    setCategoriaNueva((prev) => ({ ...prev, [name]: value }));
  }

  function handleChangeEditada(e) {
    const { name, value } = e.target;
    setCategoriaEditada((prev) => ({ ...prev, [name]: value }));
  }

  async function handleAddCategoria() {
    if (
      !categoriaNueva.nombre ||
      !categoriaNueva.color ||
      !categoriaNueva.icono
    ) {
      setMensaje("Por favor completá todos los campos obligatorios.");
      setShowModalMensaje(true);
      return;
    }

    handleCloseAddModal(); // ✅ Cerramos modal inmediatamente

    const nuevaCategoria = { ...categoriaNueva, usuarioId };
    const tempId = `temp_${Date.now()}`;

    if (isOffline) {
      setCategorias((prev) => [...prev, { ...nuevaCategoria, id: tempId }]);
    }

    setMensaje(`La categoría "${categoriaNueva.nombre}" se creó exitosamente.`);
    setShowModalMensaje(true);

    try {
      await addDoc(categoriasCollection, nuevaCategoria);
    } catch (error) {
      console.error("Error al agregar categoría:", error);
    }

    ReactGA.event({
      category: "Categoría",
      action: "Categoría agregada",
      label: categoriaNueva.nombre || "Sin nombre",
    });
  }

  async function handleEditCategoria() {
    if (
      !categoriaEditada.nombre ||
      !categoriaEditada.color ||
      !categoriaEditada.icono
    ) {
      setMensaje("Por favor completá todos los campos obligatorios.");
      setShowModalMensaje(true);
      return;
    }

    handleCloseEditModal(); // ✅ Cerramos modal inmediatamente

    if (isOffline) {
      setCategorias((prev) =>
        prev.map((cat) =>
          cat.id === categoriaEditada.id ? { ...categoriaEditada } : cat
        )
      );
    }

    setMensaje(
      `La categoría "${categoriaEditada.nombre}" se editó correctamente.`
    );
    setShowModalMensaje(true);

    if (!categoriaEditada.id.startsWith("temp_")) {
      try {
        const refDoc = doc(db, "categorias", categoriaEditada.id);
        await updateDoc(refDoc, {
          nombre: categoriaEditada.nombre,
          color: categoriaEditada.color,
          icono: categoriaEditada.icono,
          aplicacion: categoriaEditada.aplicacion || "",
        });
      } catch (error) {
        console.error("Error al editar categoría:", error);
      }
    }

    ReactGA.event({
      category: "Categoría",
      action: "Categoría editada",
      label: categoriaEditada.nombre || "Sin nombre",
    });
  }

  async function handleDeleteCategoria() {
    if (!categoriaAEliminar) return;

    handleCloseDeleteModal(); // ✅ Cerramos modal inmediatamente

    if (isOffline) {
      setCategorias((prev) =>
        prev.filter((cat) => cat.id !== categoriaAEliminar.id)
      );
    }

    setMensaje(
      `La categoría "${categoriaAEliminar.nombre}" se eliminó exitosamente.`
    );
    setShowModalMensaje(true);

    if (!categoriaAEliminar.id.startsWith("temp_")) {
      try {
        const refDoc = doc(db, "categorias", categoriaAEliminar.id);
        await deleteDoc(refDoc);
      } catch (error) {
        console.error("Error al eliminar categoría:", error);
      }
    }

    ReactGA.event({
      category: "Categoría",
      action: "Categoría eliminada",
      label: categoriaAEliminar.nombre || "Sin nombre",
    });
  }

  function toggleExpandedCategory(categoria) {
    setExpandedCategory(
      expandedCategory === categoria.id ? null : categoria.id
    );
  }

  function handleCopy(texto, mensaje) {
    navigator.clipboard.writeText(texto).then(() => {
      setToastMsg(mensaje);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    });
  }

  const totalCategorias = categorias.length;
  const mayorGasto = categorias[0] ? categorias[0].nombre : "N/A";

  const filteredCategorias = categorias.filter((cat) =>
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔸 D. Aplica la paginación a las categorías filtradas
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategorias = filteredCategorias.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  useEffect(() => {
    const updateItemsPerPage = () => {
      const isSmallScreen = window.innerWidth <= 768;
      setItemsPerPage(isSmallScreen ? 5 : 3);
    };

    updateItemsPerPage(); // valor inicial
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []); // 🔸 C. Detecta tamaño de pantalla para cambiar itemsPerPage

  return (
    <Container fluid className="categorias-container">
      <div className="categorias-header">
        <h5>Lista de Categorías</h5>
        <Button variant="primary" onClick={handleOpenAddModal}>
          Agregar
        </Button>
      </div>

      <div className="floating-label-input">
        <input
          id="busqueda"
          type="text"
          className="search-input"
          placeholder="Buscar categoría"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <label htmlFor="busqueda">Buscar categoría</label>
      </div>

      <div className="categorias-content">
        <div className="categorias-list">
          {currentCategorias.map((cat) => {
            const isExpanded = expandedCategory === cat.id;
            return (
              <div
                className={`categoria-item ${isExpanded ? "expanded" : ""}`}
                key={cat.id}
                style={{ borderColor: cat.color }}
                onClick={() => toggleExpandedCategory(cat)}
              >
                <div className="categoria-top">
                  <div
                    className="categoria-icon"
                    style={{ backgroundColor: cat.color }}
                  >
                    {getIconComponent(cat.icono)}
                  </div>
                  <span className="categoria-nombre">{cat.nombre}</span>
                </div>
                {isExpanded && (
                  <div className="categoria-actions-expanded">
                    <p style={{ margin: "5px 0 10px 0" }}>
                      <strong>Aplicación:</strong>{" "}
                      {cat.aplicacion ? cat.aplicacion : "Sin definir"}
                    </p>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(
                          `Nombre: ${cat.nombre}, Aplicación: ${
                            cat.aplicacion || "Sin definir"
                          }`,
                          "Categoría copiada"
                        );
                      }}
                    >
                      <FaIcons.FaClipboard />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDeleteModal(cat);
                      }}
                    >
                      <FaIcons.FaTrash />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(cat);
                      }}
                    >
                      <FaIcons.FaEdit />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
          <Paginacion // 🔸 F. Agrega el componente Paginacion al final de la lista
            itemsPerPage={itemsPerPage}
            totalItems={filteredCategorias.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>

        <div className="categorias-summary">
          <Card className="summary-card">
            <Card.Body>
              <Card.Title className="summary-title">
                <span>Total Categorías</span>
                <FaIcons.FaListUl className="summary-icon" />
              </Card.Title>
              <Card.Text className="summary-value">{totalCategorias}</Card.Text>
            </Card.Body>
          </Card>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title className="summary-title">
                <span>Mayor Gasto</span>
                <FaIcons.FaMoneyBillAlt className="summary-icon" />
              </Card.Title>
              <Card.Text className="summary-value">
                <FaIcons.FaArrowUp style={{ marginRight: 5 }} />
                {mayorGasto}
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>

      <ModalRegistroCategoria
        show={showModalAdd}
        handleClose={handleCloseAddModal}
        categoriaNueva={categoriaNueva}
        setCategoriaNueva={setCategoriaNueva}
        handleChangeNueva={handleChangeNueva}
        handleAddCategoria={handleAddCategoria}
      />
      <ModalEdicionCategoria
        show={showModalEdit}
        handleClose={handleCloseEditModal}
        categoriaEditada={categoriaEditada}
        setCategoriaEditada={setCategoriaEditada}
        handleChangeEditada={handleChangeEditada}
        handleEditCategoria={handleEditCategoria}
      />
      <ModalEliminacionCategoria
        show={showModalDelete}
        handleClose={handleCloseDeleteModal}
        handleDeleteCategoria={handleDeleteCategoria}
      />
      <ModalMensaje
        show={showModalMensaje}
        handleClose={() => setShowModalMensaje(false)}
        message={mensaje}
      />
      <ToastFlotante mensaje={toastMsg} visible={toastVisible} />
    </Container>
  );
}

export default Categorias;

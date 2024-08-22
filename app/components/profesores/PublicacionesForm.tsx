
import { useParams } from "next/navigation";
import React, { useState } from "react";


export default function PublicacionesForm() {
    const [publicacion, setPublicacion] = useState({
        titulo: "",
        contenido: "",
       
    });
 
    const [archivo, setArchivo] = useState({
        file_name: "",
        file_path: "",
    });
    
    const [error, setError] = useState(false);
    const params = useParams();
    // @ts-ignore
    const { materiaId } = params.id;
    const { titulo, contenido} = publicacion;
    const { file_name, file_path } = archivo;
    
    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        setPublicacion({
        ...publicacion,
        [e.target.name]: e.target.value,
        });
    };
    
    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
    
        if (
        titulo.trim() === "" ||
        contenido.trim() === "" 
        ) {
        setError(true);
        return;
        }
    
        setError(false);
    
        // Agregar la publicacion al state
        setPublicacion({
        titulo: "",
        contenido: "",
        });
    };
    
    return (
        <div className="flex  justify-between items-center bg-gray-100 p-4 rounded shadow-md cursor-pointer container">
        <form onSubmit={handleSubmit}>
            <div className="form-group my-4">
            <label>Titulo</label>
            <input
                type="text"
                className="form-control ml-12"
                placeholder="Titulo de la publicacion..."
                name="titulo"
                value={titulo}
                onChange={handleChange}
            />
            </div>

            <div className="form-group my-4">
            <label>Subir archivo</label>
            <input
                type="file"
                className="form-control ml-4"
                name="archivo"
                onChange={handleChange}
            />
            </div>
            <div className="form-group my-4">
            <label>Contenido</label>
            <input
                type="text-area"
                className="form-control ml-4"
                placeholder="Descripcion"
                name="descripcion"
                value={contenido}
                onChange={handleChange}
            />
            </div>
            
           
           
            <button type="submit" className="btn btn-primary">
            Agregar Publicacion
            </button>
        </form>
        {error ? (
            <div className="alert alert-danger mt-2" role="alert">
            Todos los campos son obligatorios
            </div>
        ) : null}
        </div>
    );
    }
    

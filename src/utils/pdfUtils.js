// src/utils/pdfUtils.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from '../assets/logo.jpg'; // Ajusta ruta si es necesario

async function convertirImagenABase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export async function exportarBoletaPDF({
    alumno,
    grupo,
    materias,
    periodosOrdenados,
    calificaciones,
    mostrarToast = () => { },
}) {
    if (!alumno) {
        mostrarToast("Alumno no especificado para generar PDF", "error");
        return;
    }

    const doc = new jsPDF();

    // Convierte logo local a base64
    const logoBase64 = await convertirImagenABase64(logo);

    // Logos a ambos lados del título
    const logoSize = 25;
    doc.addImage(logoBase64, "PNG", 14, 10, logoSize, logoSize);
    doc.addImage(logoBase64, "PNG", 195 - 14 - logoSize, 10, logoSize, logoSize);

    // Título centrado, más abajo para no tapar logos
    doc.setFontSize(16);
    doc.setTextColor(30, 61, 88);
    doc.text("Boleta de Calificaciones", 105, 25, { align: "center" });

    // Información del alumno
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Nombre del Alumno: ${alumno.nombre}`, 14, 45);
    doc.text(`CURP: ${alumno.curp || "No registrada"}`, 14, 51);
    doc.text(`Grado: ${grupo?.grados?.nombre || "Sin grado"}`, 14, 57);
    doc.text(`Grupo: ${grupo?.nombre || "-"}`, 14, 63);
    doc.text(`Profesor: ${grupo?.usuarios?.nombre || "-"}`, 14, 69);

    // Línea separadora
    doc.setDrawColor(30, 61, 88);
    doc.setLineWidth(0.5);
    doc.line(14, 72, 195, 72);

    // Tabla
    const startY = 75;
    const head = [["Materia", ...periodosOrdenados.map((p) => p.clave), " PF"]];

    const body = materias.map((materia) => {
        const fila = [materia.materias.nombre];

        const califsMateria = periodosOrdenados.map((periodo) => {
            const calif = calificaciones.find(
                (c) =>
                    c.alumno_id === alumno.id &&
                    c.materia_id === materia.materia_id &&
                    c.periodo_id === periodo.id
            );
            return calif ? calif.calificacion : null;
        });

        califsMateria.forEach((c) => {
            fila.push(c !== null ? c.toString() : "-");
        });

        const todasCalifLlenas = califsMateria.every((c) => c !== null);

        if (todasCalifLlenas) {
            const suma = califsMateria.reduce((acc, c) => acc + c, 0);
            const promedio = Math.round(suma / califsMateria.length);
            fila.push(promedio.toString());
        } else {
            fila.push("-");
        }

        return fila;
    });

    const totalCols = head[0].length;
    const columnStyles = {
        0: { cellWidth: 25, halign: "left", overflow: "ellipsize" },
    };
    for (let i = 1; i < totalCols; i++) {
        columnStyles[i] = { cellWidth: 9.9, halign: "center" };
    }

    autoTable(doc, {
        startY,
        head,
        body,
        styles: {
            fontSize: 7,
            cellPadding: 2,
            valign: "middle",
        },
        headStyles: {
            fillColor: [30, 61, 88],
            textColor: 255,
            fontStyle: "bold",
            lineWidth: 0.5,
            lineColor: [0, 0, 0],
        },
        columnStyles,
        margin: { left: 14, right: 14 },
        tableWidth: "auto",
    });

    // Firmas debajo de la tabla, lado a lado
    const finalY = doc.lastAutoTable.finalY || startY + 40;

    // Firma Profesor (izquierda)
    const firmaProfesorX = 20;
    doc.text("_____________________________", firmaProfesorX, finalY + 25);
    doc.text("Firma del Profesor", firmaProfesorX + 20, finalY + 31);

    // Firma Directora (derecha)
    const firmaDirectoraX = 120;
    doc.text("_____________________________", firmaDirectoraX, finalY + 25);
    doc.text("Firma de la Directora", firmaDirectoraX + 20, finalY + 31);

    doc.save(
        `Boleta_${alumno.nombre}_${alumno.curp || "curp"}_${grupo?.nombre || "grupo"}.pdf`
    );

    mostrarToast(`PDF generado para ${alumno.nombre}`, "success");
}

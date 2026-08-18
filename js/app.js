
/* =========================================================
   ESTADO DE LA APLICACIÓN
   ========================================================= */

let series = [];
let datos = [];

let chart = null;


/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    document
        .getElementById("titleIndent")
        .addEventListener("input", function () {

            document.getElementById("indentValue").textContent =
                this.value;

            actualizarTitulo();

        });


    actualizarVistaPrevia();

});


/* =========================================================
   TITULO
   ========================================================= */

function actualizarTitulo() {

    const title =
        document.getElementById("chartTitle").value
        || "Evolución de las series de tiempo";


    const alignment =
        document.getElementById("titleAlignment").value;


    const indent =
        document.getElementById("titleIndent").value;


    const row =
        parseInt(
            document.getElementById("titleRow").value
        ) || 1;


    const titleElement =
        document.getElementById("previewTitle");


    titleElement.textContent = title;

    titleElement.style.textAlign = alignment;

    titleElement.style.marginTop =
        `${(row - 1) * 10}px`;

    titleElement.style.paddingLeft =
        `${indent * 10}px`;
}


/* =========================================================
   AGREGAR SERIE
   ========================================================= */

function agregarSerie() {

    const id =
        document.getElementById("seriesId").value.trim();

    const name =
        document.getElementById("seriesName").value.trim();

    const variable =
        document.getElementById("seriesVariable").value.trim();

    const unit =
        document.getElementById("seriesUnit").value;

    const frequency =
        document.getElementById("seriesFrequency").value;

    const start =
        document.getElementById("startPeriod").value;

    const end =
        document.getElementById("endPeriod").value;

    const source =
        document.getElementById("seriesSource").value.trim();


    if (!id || !name) {

        mostrarMensaje(
            "Debe capturar el identificador y nombre de la serie.",
            "warning"
        );

        return;
    }


    const nuevaSerie = {

        id,
        name,
        variable,
        unit,
        frequency,
        start,
        end,
        source

    };


    series.push(nuevaSerie);


    renderizarSeries();

    actualizarVistaPrevia();


    limpiarFormularioSerie();
}


/* =========================================================
   RENDERIZAR SERIES
   ========================================================= */

function renderizarSeries() {

    const container =
        document.getElementById("seriesContainer");


    if (series.length === 0) {

        container.innerHTML = `
            <div class="empty-message">
                No existen series configuradas.
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    series.forEach((serie, index) => {

        const element =
            document.createElement("div");


        element.className = "series-item";


        element.innerHTML = `

            <div class="d-flex justify-content-between">

                <div>

                    <div class="series-item-title">
                        ${serie.name}
                    </div>

                    <div class="series-item-meta">
                        ${serie.id} · ${serie.frequency}
                    </div>

                </div>

                <span class="badge text-bg-light">
                    ${serie.unit}
                </span>

            </div>


            <div class="series-actions">

                <button
                    class="btn btn-outline-danger btn-sm"
                    onclick="eliminarSerie(${index})">

                    <i class="bi bi-trash"></i>

                </button>

            </div>

        `;


        container.appendChild(element);

    });

}


/* =========================================================
   ELIMINAR SERIE
   ========================================================= */

function eliminarSerie(index) {

    series.splice(index, 1);

    renderizarSeries();

    actualizarVistaPrevia();

}


/* =========================================================
   AGREGAR DATO
   ========================================================= */

function agregarDato() {

    const period =
        document.getElementById("dataPeriod").value;

    const value =
        document.getElementById("dataValue").value;


    if (!period || value === "") {

        mostrarMensaje(
            "Debe indicar el periodo y el valor.",
            "warning"
        );

        return;
    }


    datos.push({

        period,
        value: Number(value)

    });


    datos.sort(
        (a, b) =>
            a.period.localeCompare(b.period)
    );


    renderizarDatos();

    actualizarVistaPrevia();


    document.getElementById("dataPeriod").value = "";

    document.getElementById("dataValue").value = "";

}


/* =========================================================
   RENDERIZAR DATOS
   ========================================================= */

function renderizarDatos() {

    const tbody =
        document.getElementById("dataTableBody");


    tbody.innerHTML = "";


    datos.forEach((dato, index) => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${formatearPeriodo(dato.period)}
            </td>

            <td class="text-end">
                ${dato.value.toLocaleString(
            "es-MX"
        )}
            </td>

            <td class="text-end">

                <button
                    class="btn btn-sm btn-link text-danger"
                    onclick="eliminarDato(${index})">

                    <i class="bi bi-trash"></i>

                </button>

            </td>

        `;


        tbody.appendChild(row);

    });

}


/* =========================================================
   ELIMINAR DATO
   ========================================================= */

function eliminarDato(index) {

    datos.splice(index, 1);

    renderizarDatos();

    actualizarVistaPrevia();

}


/* =========================================================
   ACTUALIZAR VISTA PREVIA
   ========================================================= */

function actualizarVistaPrevia() {

    actualizarTitulo();


    const frecuencia =
        document.getElementById(
            "seriesFrequency"
        ).value;


    const fuente =
        document.getElementById(
            "seriesSource"
        ).value || "—";


    document.getElementById("previewMeta").innerHTML = `

        <span>
            <i class="bi bi-calendar3"></i>
            Periodicidad: ${frecuencia}
        </span>

        <span>
            <i class="bi bi-database"></i>
            Fuente: ${fuente}
        </span>

    `;


    actualizarVistaPreviaSeries();

    actualizarGrafica();

    actualizarNotas();

}


/* =========================================================
   GRAFICA
   ========================================================= */

function actualizarGrafica() {

    const canvas =
        document.getElementById(
            "timeSeriesChart"
        );


    if (chart) {

        chart.destroy();

    }


    let labels = [];

    let values = [];


    if (datos.length > 0) {

        labels =
            datos.map(
                dato => formatearPeriodo(dato.period)
            );

        values =
            datos.map(
                dato => dato.value
            );

    } else {

        labels = [
            "Ene 2025",
            "Feb 2025",
            "Mar 2025",
            "Abr 2025",
            "May 2025",
            "Jun 2025"
        ];


        values = [
            820,
            850,
            875,
            910,
            950,
            980
        ];

    }


    const datasets = [];


    if (series.length === 0) {

        datasets.push({

            label: "Serie de ejemplo",

            data: values,

            borderWidth: 2,

            tension: 0.35,

            pointRadius: 3,

            fill: false

        });

    } else {

        series.forEach((serie, index) => {

            let serieData;


            if (index === 0) {

                serieData = values;

            } else {

                serieData =
                    values.map(
                        value =>
                            value *
                            (1 + index * 0.08)
                    );

            }


            datasets.push({

                label: serie.name,

                data: serieData,

                borderWidth: 2,

                tension: 0.35,

                pointRadius: 3,

                fill: false

            });

        });

    }


    chart = new Chart(canvas, {

        type: "line",

        data: {

            labels,

            datasets

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {

                intersect: false,

                mode: "index"

            },

            plugins: {

                legend: {

                    position: "bottom",

                    labels: {

                        boxWidth: 12,

                        font: {

                            size: 11

                        }

                    }

                },

                tooltip: {

                    callbacks: {

                        label: function (context) {

                            return `${context.dataset.label}: ${Number(
                                context.raw
                            ).toLocaleString("es-MX")
                                }`;

                        }

                    }

                }

            },

            scales: {

                x: {

                    grid: {

                        display: false

                    },

                    ticks: {

                        font: {

                            size: 10

                        }

                    }

                },

                y: {

                    beginAtZero: false,

                    ticks: {

                        font: {

                            size: 10

                        },

                        callback: function (value) {

                            return value.toLocaleString(
                                "es-MX"
                            );

                        }

                    }

                }

            }

        }

    });

}


/* =========================================================
   NOTAS
   ========================================================= */

function actualizarNotas() {

    const notes =
        document.getElementById(
            "chartNotes"
        ).value.trim();


    const source =
        document.getElementById(
            "chartSource"
        ).value.trim();


    const notesElement =
        document.getElementById(
            "previewNotes"
        );


    const footer =
        document.getElementById(
            "previewFooter"
        );


    notesElement.innerHTML = `

        <div class="notes-title">
            Notas
        </div>

        <p>
            ${notes ||
        "Configure las notas y fuentes desde el panel izquierdo."
        }
        </p>

    `;


    footer.textContent =
        `Fuente: ${source || "—"}`;

}


/* =========================================================
   VISTA COMPLETA
   ========================================================= */

function vistaCompleta() {

    const documentPreview =
        document.getElementById(
            "previewDocument"
        );


    const content =
        document.getElementById(
            "fullPreviewContent"
        );


    content.innerHTML =
        documentPreview.outerHTML;


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "fullPreviewModal"
            )
        );


    modal.show();

}


/* =========================================================
   GUARDAR CONFIGURACION
   ========================================================= */

function guardarConfiguracion() {

    const configuracion = {

        titulo:
            document.getElementById(
                "chartTitle"
            ).value,

        renglón:
            document.getElementById(
                "titleRow"
            ).value,

        alineacion:
            document.getElementById(
                "titleAlignment"
            ).value,

        sangria:
            document.getElementById(
                "titleIndent"
            ).value,

        series,

        datos,

        notas:
            document.getElementById(
                "chartNotes"
            ).value,

        fuente:
            document.getElementById(
                "chartSource"
            ).value

    };


    localStorage.setItem(
        "configuracionSeriesTiempo",
        JSON.stringify(configuracion)
    );


    mostrarMensaje(
        "Configuración guardada correctamente.",
        "success"
    );

}


/* =========================================================
   RESTABLECER
   ========================================================= */

// function limpiarConfiguracion() {

//     if (
//         !confirm(
//             "¿Desea eliminar toda la configuración actual?"
//         )
//     ) {

//         return;

//     }


//     series = [];

//     datos = [];


//     document.querySelectorAll(
//         "input, textarea"
//     ).forEach(element => {

//         if (
//             element.type !== "range" &&
//             element.type !== "number"
//         ) {

//             element.value = "";

//         }

//     });


//     document.getElementById(
//         "titleRow"
//     ).value = 1;


//     document.getElementById(
//         "titleIndent"
//     ).value = 0;


//     document.getElementById(
//         "indentValue"
//     ).textContent = "0";


//     document.getElementById(
//         "titleAlignment"
//     ).value = "center";


//     renderizarSeries();

//     renderizarDatos();

//     actualizarVistaPrevia();

// }


// /* =========================================================
//    FORMULARIO DE SERIE
//    ========================================================= */

// function limpiarFormularioSerie() {

//     document.getElementById(
//         "seriesId"
//     ).value = "";

//     document.getElementById(
//         "seriesName"
//     ).value = "";

//     document.getElementById(
//         "seriesVariable"
//     ).value = "";

//     document.getElementById(
//         "seriesSource"
//     ).value = "";

// }


/* =========================================================
   UTILIDADES
   ========================================================= */

function formatearPeriodo(periodo) {

    if (!periodo) {
        return "";
    }


    const partes =
        periodo.split("-");


    const meses = [

        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic"

    ];


    const año = partes[0];

    const mes =
        parseInt(partes[1]) - 1;


    return `${meses[mes]} ${año}`;

}


/* =========================================================
   MENSAJES
   ========================================================= */

function mostrarMensaje(
    mensaje,
    tipo
) {

    const alert =
        document.createElement(
            "div"
        );


    alert.className =
        `alert alert-${tipo} position-fixed shadow`;

    alert.style.top = "90px";

    alert.style.right = "25px";

    alert.style.zIndex = "9999";

    alert.style.fontSize = "12px";


    alert.innerHTML = `

        <i class="bi bi-info-circle"></i>

        ${mensaje}

    `;


    document.body.appendChild(alert);


    setTimeout(() => {

        alert.remove();

    }, 3000);

}


/* ========================================================= 
    CONFIGURACIÓN GENERAL DE LA SERIE 
========================================================= */

let configuracionSerie = {
    descripcion: "",
    añoBase: "",
    decimales: 2,
    tipoCifra: "",
    periodicidad: "",
    periodoInicio: "",
    periodoFin: "",
    unidad: ""
};

/* ========================================================= 
    AGREGAR CONFIGURACIÓN A PREVISUALIZACIÓN 
========================================================= */

function agregarConfiguracionSerie() {

    configuracionSerie = {
        descripcion:
            document.getElementById("seriesDescription").value.trim(),
        añoBase:
            document.getElementById("baseYear").value,
        decimales:
            document.getElementById("decimalPlaces").value,
        tipoCifra:
            document.getElementById("figureType").value,
        periodicidad:
            document.getElementById("seriesFrequency").value,
        periodoInicio:
            document.getElementById("availablePeriodStart").value,
        periodoFin:
            document.getElementById("availablePeriodEnd").value,
        unidad:
            document.getElementById("seriesUnit").value
    };

    actualizarInformacionSerie();

    mostrarMensaje("La configuración de la serie fue enviada a la previsualización.", "success");
}

/* ========================================================= 
    ACTUALIZAR INFORMACIÓN EN PREVISUALIZACIÓN 
========================================================= */

function actualizarInformacionSerie() {

    const existing = document.getElementById("seriesInformation");

    if (existing) {

        existing.remove();
    }

    const chartTitle = document.getElementById("previewTitle");
    const information = document.createElement("div");

    information.id = "seriesInformation";
    information.className = "series-information";
    information.innerHTML = ` <div class="series-information-title"> 
                                <i class="bi bi-info-circle"></i> Información del cuadro / serie </div> <div class="series-information-grid"> 
                                <div class="series-information-item"> 
                                <div class="series-information-label"> Descripción </div> 
                                <div class="series-information-value"> ${configuracionSerie.descripcion || "—"} </div> 
                                </div> <div class="series-information-item"> 
                                <div class="series-information-label"> Año base </div> 
                                <div class="series-information-value"> ${configuracionSerie.añoBase || "—"} </div> </div> 
                                <div class="series-information-item"> <div class="series-information-label"> Decimales </div> 
                                <div class="series-information-value"> ${configuracionSerie.decimales} </div> 
                                </div> <div class="series-information-item"> <div class="series-information-label"> Tipo de cifra </div> 
                                <div class="series-information-value"> ${configuracionSerie.tipoCifra || "—"} </div> </div> 
                                <div class="series-information-item"> <div class="series-information-label"> Periodicidad </div> 
                                <div class="series-information-value"> ${configuracionSerie.periodicidad || "—"} </div> </div> 
                                <div class="series-information-item"> <div class="series-information-label"> Periodo disponible </div> 
                                <div class="series-information-value"> ${formatearPeriodo(configuracionSerie.periodoInicio)} - ${formatearPeriodo(configuracionSerie.periodoFin)} </div> </div> 
                                <div class="series-information-item"> <div class="series-information-label"> Unidad de medida </div> 
                                <div class="series-information-value"> ${configuracionSerie.unidad || "—"} </div> </div> </div> `;

    /* * La ficha se coloca inmediatamente después * del título del cuadro. */

    chartTitle.insertAdjacentElement("afterend", information);
}


/* ========================================================= 
    FORMATEAR PERIODO 
========================================================= */

function formatearPeriodo(periodo) {

    if (!periodo) {
        return "—";
    }

    const partes = periodo.split("-");

    if (partes.length < 2) {
        return periodo;
    }

    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const año = partes[0];
    const mes = parseInt(partes[1], 10) - 1; if (mes < 0 || mes > 11) { return periodo; } return `${meses[mes]} ${año}`;

}


/* =========================================================
   SERIES JERÁRQUICAS
   ========================================================= */

let seriesDatos = [];

let siguienteSerieId = 1;


/* =========================================================
   ACTUALIZAR SANGRIA
   ========================================================= */

document
    .getElementById("dataSeriesIndent")
    .addEventListener("input", function () {

        document.getElementById(
            "dataSeriesIndentValue"
        ).textContent = this.value;

    });


/* =========================================================
   OBTENER AFORES SELECCIONADAS
   ========================================================= */

function obtenerAforesSeleccionadas() {

    const checks =
        document.querySelectorAll(
            ".afore-check:checked"
        );


    return Array.from(checks)
        .map(check => check.value);

}


/* =========================================================
   ACTUALIZAR TEXTO DEL SELECTOR
   ========================================================= */

document.addEventListener(
    "change",
    function (event) {

        if (
            event.target.classList.contains(
                "afore-check"
            )
        ) {

            actualizarTextoAfores();

        }

    }
);


function actualizarTextoAfores() {

    const afores =
        obtenerAforesSeleccionadas();


    const text =
        document.getElementById(
            "selectedAforesText"
        );


    if (afores.length === 0) {

        text.textContent =
            "Seleccionar AFORE";

        return;

    }


    if (afores.length === 10) {

        text.textContent =
            "Todas las AFORE seleccionadas";

        return;

    }


    text.textContent =
        `${afores.length} AFORE seleccionadas`;

}


/* =========================================================
   SELECCIONAR TODAS
   ========================================================= */

function seleccionarTodasAfores() {

    document
        .querySelectorAll(".afore-check")
        .forEach(check => {

            check.checked = true;

        });


    actualizarTextoAfores();

}


/* =========================================================
   DESELECCIONAR TODAS
   ========================================================= */

function deseleccionarTodasAfores() {

    document
        .querySelectorAll(".afore-check")
        .forEach(check => {

            check.checked = false;

        });


    actualizarTextoAfores();

}


/* =========================================================
   AGREGAR SERIE
   ========================================================= */

function agregarSerieDatos() {

    const title =
        document.getElementById(
            "dataSeriesTitle"
        ).value.trim();


    const indent =
        parseInt(
            document.getElementById(
                "dataSeriesIndent"
            ).value
        ) || 0;


    const parentIdValue =
        document.getElementById(
            "parentSeries"
        ).value;


    const parentId =
        parentIdValue === ""
            ? null
            : Number(parentIdValue);


    const afores =
        obtenerAforesSeleccionadas();


    /* =============================================
       VALIDACIONES
       ============================================= */

    if (!title) {

        mostrarMensaje(
            "Debe indicar el título de la serie.",
            "warning"
        );

        return;

    }


    if (afores.length === 0) {

        mostrarMensaje(
            "Debe seleccionar al menos una AFORE.",
            "warning"
        );

        return;

    }


    /* =============================================
       VALIDAR RELACIÓN PADRE
       ============================================= */

    if (parentId !== null) {

        const parent =
            seriesDatos.find(
                serie =>
                    serie.id === parentId
            );


        if (!parent) {

            mostrarMensaje(
                "La serie padre seleccionada no existe.",
                "warning"
            );

            return;

        }

        /*
         * La serie hija debe tener una sangría
         * mayor que la de su padre.
         */

        if (indent <= parent.indent) {

            mostrarMensaje(
                "La serie hija debe tener una sangría mayor que la serie padre.",
                "warning"
            );

            return;

        }

    }


    /* =============================================
       CREAR SERIE
       ============================================= */

    const nuevaSerie = {

        id: siguienteSerieId++,

        parentId,

        title,

        indent,

        afores

    };


    seriesDatos.push(
        nuevaSerie
    );


    /* =============================================
       ACTUALIZAR INTERFAZ
       ============================================= */

    renderizarSeriesConfiguradas();

    actualizarCatalogoSeriesPadre();

    actualizarVistaPreviaSeries();


    limpiarFormularioSerieDatos();


    mostrarMensaje(
        "Serie agregada correctamente.",
        "success"
    );

}


/* =========================================================
   CATALOGO DE SERIES PADRE
   ========================================================= */

function actualizarCatalogoSeriesPadre() {

    const select =
        document.getElementById(
            "parentSeries"
        );


    const selectedValue =
        select.value;


    select.innerHTML = `

        <option value="">
            Serie principal / sin padre
        </option>

    `;


    seriesDatos.forEach(serie => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            serie.id;


        option.textContent =
            `${"— ".repeat(serie.indent)}${serie.title}`;


        select.appendChild(
            option
        );

    });


    if (
        seriesDatos.some(
            serie =>
                String(serie.id) ===
                selectedValue
        )
    ) {

        select.value =
            selectedValue;

    }

}


/* =========================================================
   RENDERIZAR SERIES CONFIGURADAS
   ========================================================= */

function renderizarSeriesConfiguradas() {

    const container =
        document.getElementById(
            "configuredSeriesContainer"
        );


    if (seriesDatos.length === 0) {

        container.innerHTML = `

            <div class="empty-message">

                No existen series configuradas.

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    const roots =
        seriesDatos.filter(
            serie =>
                serie.parentId === null
        );


    roots.forEach(root => {

        renderizarNodoSerie(
            root,
            container
        );

    });

}


/* =========================================================
   RENDERIZAR NODO
   ========================================================= */

function renderizarNodoSerie(
    serie,
    container
) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        serie.parentId !== null
            ? "series-tree-line"
            : "";


    const item =
        document.createElement(
            "div"
        );


    item.className =
        "configured-series-item";


    item.style.marginLeft =
        `${serie.indent * 12}px`;


    item.innerHTML = `

        <div class="d-flex justify-content-between
                    align-items-start">

            <div>

                <div class="configured-series-title">

                    ${serie.parentId !== null
            ? '<span class="series-parent-indicator">↳</span>'
            : ''
        }

                    ${escapeHtml(serie.title)}

                </div>


                <div class="configured-series-meta">

                    Nivel de sangría:
                    ${serie.indent}

                    &nbsp; · &nbsp;

                    ${serie.afores.length}
                    AFORE(s)

                </div>

            </div>


            <button
                class="btn btn-sm btn-outline-danger"
                onclick="eliminarSerieDatos(${serie.id})">

                <i class="bi bi-trash"></i>

            </button>

        </div>


        <div class="configured-series-meta mt-2">

            ${serie.afores
            .map(
                afore =>
                    `<span class="badge text-bg-light me-1">
                            ${escapeHtml(afore)}
                        </span>`
            )
            .join("")}

        </div>

    `;


    wrapper.appendChild(item);

    container.appendChild(wrapper);


    /*
     * Buscar hijos de la serie.
     */

    const children =
        seriesDatos.filter(
            child =>
                child.parentId === serie.id
        );


    children.forEach(child => {

        renderizarNodoSerie(
            child,
            container
        );

    });

}


/* =========================================================
   ELIMINAR SERIE
   ========================================================= */

function eliminarSerieDatos(id) {

    const hasChildren =
        seriesDatos.some(
            serie =>
                serie.parentId === id
        );


    if (hasChildren) {

        mostrarMensaje(
            "No se puede eliminar la serie porque tiene series hijas.",
            "warning"
        );

        return;

    }


    seriesDatos =
        seriesDatos.filter(
            serie =>
                serie.id !== id
        );


    renderizarSeriesConfiguradas();

    actualizarCatalogoSeriesPadre();

    actualizarVistaPreviaSeries();

}


/* =========================================================
   LIMPIAR FORMULARIO
   ========================================================= */

function limpiarFormularioSerieDatos() {

    document.getElementById(
        "dataSeriesTitle"
    ).value = "";


    document.getElementById(
        "dataSeriesIndent"
    ).value = 0;


    document.getElementById(
        "dataSeriesIndentValue"
    ).textContent = "0";


    document.getElementById(
        "parentSeries"
    ).value = "";


    deseleccionarTodasAfores();

}


/* =========================================================
   ESCAPAR HTML
   ========================================================= */

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}

/* =========================================================
   ACTUALIZAR PREVISUALIZACIÓN DE SERIES
   ========================================================= */

function actualizarVistaPreviaSeries() {

    const existing =
        document.getElementById(
            "previewSeriesData"
        );


    if (existing) {

        existing.remove();

    }


    if (seriesDatos.length === 0) {

        return;

    }


    const chartContainer =
        document.querySelector(
            ".chart-container"
        );


    const seriesContainer =
        document.createElement(
            "div"
        );


    seriesContainer.id =
        "previewSeriesData";


    seriesContainer.className =
        "preview-series-data";


    seriesContainer.innerHTML = `

        <div class="preview-series-header">

            <div class="preview-concept">

                CONCEPTO

            </div>

            <div>JUNIO 2025</div>

            <div>MAYO 2026</div>

            <div>JUNIO 2026</div>

        </div>

    `;


    const roots =
        seriesDatos.filter(
            serie =>
                serie.parentId === null
        );


    roots.forEach(
        root => {

            renderizarSeriePreview(
                root,
                seriesContainer
            );

        }
    );


    /*
     * La tabla se coloca antes de la gráfica.
     */

    chartContainer.insertAdjacentElement(
        "beforebegin",
        seriesContainer
    );

}


/* =========================================================
   RENDERIZAR SERIE EN PREVISUALIZACIÓN
   ========================================================= */

function renderizarSeriePreview(
    serie,
    container
) {

    /*
     * Título de la serie.
     */

    const titleRow =
        document.createElement(
            "div"
        );


    titleRow.className =
        "preview-series-row preview-series-title-row";


    titleRow.style.paddingLeft =
        `${serie.indent * 24}px`;


    titleRow.innerHTML = `

        <div class="preview-concept">

            <span class="preview-checkbox">
                □
            </span>

            ${escapeHtml(serie.title)}

        </div>

        <div></div>

        <div></div>

        <div></div>

    `;


    container.appendChild(
        titleRow
    );


    /*
     * AFORE pertenecientes a la serie.
     */

    serie.afores.forEach(
        (afore, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "preview-series-row preview-afore-row";


            /*
             * La AFORE tiene la misma sangría
             * de la serie.
             */

            row.style.paddingLeft =
                `${(serie.indent + 1) * 24}px`;


            const baseValue =
                obtenerValorEjemplo(
                    serie.id,
                    index
                );


            row.innerHTML = `

                <div class="preview-concept">

                    <span class="preview-checkbox">
                        □
                    </span>

                    ${escapeHtml(afore)}

                </div>


                <div>
                    ${formatearNumero(
                baseValue
            )}
                </div>


                <div>
                    ${formatearNumero(
                baseValue * 1.035
            )}
                </div>


                <div>
                    ${formatearNumero(
                baseValue * 1.041
            )}
                </div>

            `;


            container.appendChild(
                row
            );

        }
    );


    /*
     * Buscar series hijas.
     */

    const children =
        seriesDatos.filter(
            child =>
                child.parentId === serie.id
        );


    children.forEach(
        child => {

            renderizarSeriePreview(
                child,
                container
            );

        }
    );

}


/* =========================================================
   VALORES DE EJEMPLO
   ========================================================= */

function obtenerValorEjemplo(
    serieId,
    index
) {

    const valores = [

        76918549,
        68799591,
        17038522,
        8561379,
        11868514,
        1108447,
        1864292,
        2520067,
        2291840,
        8387899

    ];


    const base =
        valores[index % valores.length];


    return base *
        (1 + ((serieId - 1) * 0.025));

}


/* =========================================================
   FORMATEAR NUMERO
   ========================================================= */

function formatearNumero(numero) {

    const decimals =
        configuracionSerie &&
            configuracionSerie.decimales !== undefined
            ? Number(
                configuracionSerie.decimales
            )
            : 0;


    return Number(numero)
        .toLocaleString(
            "es-MX",
            {
                minimumFractionDigits:
                    decimals,

                maximumFractionDigits:
                    decimals
            }
        );

}

/* =========================================================
   EXPORTAR A EXCEL
   ========================================================= */

function exportarExcel() {

    if (seriesDatos.length === 0) {

        mostrarMensaje(
            "No existen series de datos para exportar.",
            "warning"
        );

        return;

    }


    const filas =
        construirDatosExportacion();


    const worksheet =
        XLSX.utils.json_to_sheet(
            filas
        );


    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Series de datos"
    );


    const titulo =
        obtenerTituloExportacion();


    const nombreArchivo =
        sanitizarNombreArchivo(
            titulo
        );


    XLSX.writeFile(
        workbook,
        `${nombreArchivo}.xlsx`
    );


    mostrarMensaje(
        "El archivo Excel fue generado correctamente.",
        "success"
    );

}

/* =========================================================
   CONSTRUIR DATOS DE EXPORTACIÓN
   ========================================================= */

function construirDatosExportacion() {

    const filas = [];


    seriesDatos.forEach(
        serie => {

            /*
             * La serie se exporta como un registro.
             */

            serie.afores.forEach(
                afore => {

                    filas.push({

                        "Serie":
                            obtenerRutaSerie(
                                serie.id
                            ),

                        "AFORE":
                            afore,

                        "Sangría":
                            serie.indent,

                        "Junio 2025":
                            obtenerValorEjemplo(
                                serie.id,
                                0
                            ),

                        "Mayo 2026":
                            obtenerValorEjemplo(
                                serie.id,
                                0
                            ) * 1.035,

                        "Junio 2026":
                            obtenerValorEjemplo(
                                serie.id,
                                0
                            ) * 1.041

                    });

                }

            );

        }
    );


    return filas;
}

/* =========================================================
   OBTENER RUTA DE LA SERIE
   ========================================================= */

function obtenerRutaSerie(id) {

    const serie =
        seriesDatos.find(
            item => item.id === id
        );


    if (!serie) {

        return "";

    }


    if (serie.parentId === null) {

        return serie.title;

    }


    return (
        obtenerRutaSerie(
            serie.parentId
        )
        +
        " > "
        +
        serie.title
    );

}

/* =========================================================
   EXPORTAR CSV
   ========================================================= */

function exportarCSV() {

    if (seriesDatos.length === 0) {

        mostrarMensaje(
            "No existen series de datos para exportar.",
            "warning"
        );

        return;

    }


    const filas =
        construirDatosExportacion();


    if (filas.length === 0) {

        return;

    }


    const headers =
        Object.keys(
            filas[0]
        );


    const csv = [

        headers.join(","),

        ...filas.map(
            fila =>
                headers
                    .map(
                        header =>
                            escaparCSV(
                                fila[header]
                            )
                    )
                    .join(",")
        )

    ].join("\n");


    const blob =
        new Blob(
            [
                "\uFEFF" + csv
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    descargarArchivo(
        blob,
        `${sanitizarNombreArchivo(
            obtenerTituloExportacion()
        )}.csv`
    );


    mostrarMensaje(
        "El archivo CSV fue generado correctamente.",
        "success"
    );

}

function escaparCSV(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    const texto =
        String(valor);


    if (
        texto.includes(",") ||
        texto.includes('"') ||
        texto.includes("\n")
    ) {

        return `"${texto.replace(
            /"/g,
            '""'
        )}"`;

    }


    return texto;

}

/* =========================================================
   EXPORTAR PDF
   ========================================================= */

function exportarPDF() {

    if (seriesDatos.length === 0) {

        mostrarMensaje(
            "No existen series de datos para exportar.",
            "warning"
        );

        return;

    }


    const {
        jsPDF
    } = window.jspdf;


    const doc =
        new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "letter"
        });


    const titulo =
        obtenerTituloExportacion();


    /*
     * Título
     */

    doc.setFontSize(15);

    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.text(
        titulo,
        15,
        15
    );


    /*
     * Información general
     */

    doc.setFontSize(8);

    doc.setFont(
        "helvetica",
        "normal"
    );


    let y = 23;


    if (
        configuracionSerie.descripcion
    ) {

        doc.text(
            configuracionSerie.descripcion,
            15,
            y,
            {
                maxWidth: 250
            }
        );

        y += 7;

    }


    doc.text(
        `Periodicidad: ${configuracionSerie.periodicidad || "—"
        }`,
        15,
        y
    );


    doc.text(
        `Unidad: ${configuracionSerie.unidad || "—"
        }`,
        100,
        y
    );


    doc.text(
        `Año base: ${configuracionSerie.añoBase || "—"
        }`,
        180,
        y
    );


    y += 8;


    /*
     * Tabla
     */

    const filas =
        construirDatosExportacion();


    const body =
        filas.map(
            fila => [

                fila["Serie"],

                fila["AFORE"],

                fila["Junio 2025"],

                fila["Mayo 2026"],

                fila["Junio 2026"]

            ]
        );


    doc.autoTable({

        startY: y,

        head: [[

            "Serie",

            "AFORE",

            "Junio 2025",

            "Mayo 2026",

            "Junio 2026"

        ]],

        body,

        styles: {

            fontSize: 7,

            cellPadding: 2

        },

        headStyles: {

            fontStyle: "bold"

        },

        columnStyles: {

            0: {
                cellWidth: 85
            },

            1: {
                cellWidth: 45
            },

            2: {
                halign: "right"
            },

            3: {
                halign: "right"
            },

            4: {
                halign: "right"
            }

        }

    });


    const nombreArchivo =
        sanitizarNombreArchivo(
            titulo
        );


    doc.save(
        `${nombreArchivo}.pdf`
    );


    mostrarMensaje(
        "El archivo PDF fue generado correctamente.",
        "success"
    );

}

/* =========================================================
   EXPORTAR IQY
   ========================================================= */

function exportarIQY() {

    const titulo =
        obtenerTituloExportacion();


    /*
     * URL del servicio que posteriormente
     * proporcionará los datos.
     *
     * En producción esta URL deberá sustituirse
     * por el API real del sistema.
     */

    const url =
        "https://ejemplo.consar.gob.mx/api/series";


    const iqy =

        `WEB
1
${url}

Selection=Entire Page
Formatting=None
PreFormattedTextToColumns=True
ConsecutiveDelimitersAsOne=True
SingleBlockTextImport=False
DisableDateRecognition=False
DisableRedirections=False`;


    const blob =
        new Blob(
            [iqy],
            {
                type:
                    "application/x-iqy"
            }
        );


    descargarArchivo(
        blob,
        `${sanitizarNombreArchivo(
            titulo
        )}.iqy`
    );


    mostrarMensaje(
        "El archivo IQY fue generado correctamente.",
        "success"
    );

}

/* =========================================================
   DESCARGAR ARCHIVO
   ========================================================= */

function descargarArchivo(
    blob,
    nombre
) {

    const url =
        URL.createObjectURL(
            blob
        );


    const enlace =
        document.createElement(
            "a"
        );


    enlace.href = url;

    enlace.download = nombre;


    document.body.appendChild(
        enlace
    );


    enlace.click();


    document.body.removeChild(
        enlace
    );


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   OBTENER TITULO
   ========================================================= */

function obtenerTituloExportacion() {

    const titulo =
        document.getElementById(
            "previewTitle"
        );


    if (
        titulo &&
        titulo.textContent.trim()
    ) {

        return titulo.textContent.trim();

    }


    return "serie_tiempo";

}


/* =========================================================
   SANITIZAR NOMBRE
   ========================================================= */

function sanitizarNombreArchivo(
    nombre
) {

    return nombre

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .replace(
            /[^a-zA-Z0-9_-]+/g,
            "_"
        )

        .replace(
            /^_+|_+$/g,
            ""
        )

        .substring(
            0,
            80
        )

        || "serie_tiempo";

}



const btnCalcular = document.getElementById("btnCalcular");
const inputsPorcentaje = document.querySelectorAll(".input-porcentaje");
const textoSuma = document.getElementById("texto-suma");
const cajaErrores = document.getElementById("cajaErrores");
const listaErrores = document.getElementById("listaErrores");
const cajaResultados = document.getElementById("cajaResultados");
const contenidoResultados = document.getElementById("contenidoResultados");
const totalClicsMesSpan = document.getElementById("totalClicsMes");

// Actualizar la suma en tiempo real
function actualizarSuma() {
  let suma = 0;
  inputsPorcentaje.forEach(input => {
    const valor = parseFloat(input.value) || 0;
    suma += valor;
  });

  textoSuma.textContent = `${suma}%`;
  
  if (suma === 100) {
    textoSuma.className = "texto-verde";
  } else {
    textoSuma.className = "texto-rojo";
  }
}

inputsPorcentaje.forEach(input => {
  input.addEventListener("input", actualizarSuma);
});

// Función para dar formato moneda (CLP)
function formatearCLP(valor) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor);
}

btnCalcular.addEventListener("click", function() {
  // Limpiar estados previos
  listaErrores.innerHTML = "";
  cajaResultados.classList.add("oculto");
  const errores = [];

  const cliente = document.getElementById("cliente").value.trim();
  const presupuesto = parseFloat(document.getElementById("presupuesto").value);

  // 1. Validaciones generales
  if (cliente === "") {
    errores.push("El nombre del cliente no puede estar vacío.");
  }
  if (isNaN(presupuesto) || presupuesto <= 0) {
    errores.push("El presupuesto total debe ser un número mayor que 0.");
  }

  let sumaPorcentajes = 0;
  const canales = [];

  // 2. Validaciones cíclicas por canal (1 al 5)
  for (let i = 1; i <= 5; i++) {
    const nombreCanal = document.getElementById(`canal${i}`).value.trim();
    const porcInput = document.getElementById(`porc${i}`).value;
    const cpcInput = document.getElementById(`cpc${i}`).value;
    
    const porc = parseFloat(porcInput);
    const cpc = parseFloat(cpcInput);

    if (nombreCanal === "") {
      errores.push(`El nombre del canal ${i} no puede estar vacío.`);
    }

    // Mensajes de error literales del requerimiento
    if (porcInput === "" || isNaN(porc) || porc < 0 || porc > 100) {
      errores.push(`El % del canal ${i} debe estar entre 0 y 100.`);
    } else {
      sumaPorcentajes += porc;
    }

    if (cpcInput === "" || isNaN(cpc) || cpc <= 0) {
      errores.push(`El CPC del canal ${i} debe ser mayor que 0.`);
    }

    // Si todo va bien, guardamos los datos para procesarlos
    if (errores.length === 0) {
      canales.push({ nombre: nombreCanal, porcentaje: porc, cpc: cpc });
    }
  }

  // Validación final de la suma exacta
  if (errores.length === 0 && sumaPorcentajes !== 100) {
    errores.push(`Los porcentajes deben sumar 100% (actual: ${sumaPorcentajes}%).`);
  }

  // 3. Manejo de Errores (Mostrar u Ocultar)
  if (errores.length > 0) {
    errores.forEach(error => {
      const li = document.createElement("li");
      li.textContent = error;
      listaErrores.appendChild(li);
    });
    cajaErrores.classList.remove("oculto");
    return; // Evita que siga calculando
  }

  // Si pasa validaciones, ocultar errores y calcular
  cajaErrores.classList.add("oculto");
  let totalClics = 0;

  // 4. Calcular Montos y Clics (entero)
  canales.forEach(canal => {
    canal.monto = presupuesto * (canal.porcentaje / 100);
    canal.clics = Math.round(canal.monto / canal.cpc);
    totalClics += canal.clics;
  });

  // 5. Categorización y búsqueda del mayor alcance
  let maxClics = -1;
  let indiceMayor = -1;

  canales.forEach((canal, index) => {
    let porcentajeDeClics = totalClics > 0 ? (canal.clics / totalClics) * 100 : 0;

    // Lógica if/else de categorías
    if (porcentajeDeClics > 50) {
      canal.categoria = "Canal Estrella";
    } else if (porcentajeDeClics >= 20 && porcentajeDeClics <= 50) {
      canal.categoria = "Canal Principal";
    } else if (porcentajeDeClics >= 10 && porcentajeDeClics < 20) {
      canal.categoria = "Canal Secundario";
    } else {
      canal.categoria = "Canal Marginal";
    }

    if (canal.clics > maxClics) {
      maxClics = canal.clics;
      indiceMayor = index;
    }
  });

  // 6. Renderizar resultados en el DOM dinámicamente
  contenidoResultados.innerHTML = "";
  
  canales.forEach((canal, index) => {
    const div = document.createElement("div");
    div.className = "fila-resultado";
    
    // Destacar el que más aporta
    if (index === indiceMayor && maxClics > 0) {
      div.classList.add("canal-destacado");
    }

    div.innerHTML = `
      <div>
        <strong>${canal.nombre}</strong> <br>
        <span class="categoria-badge">${canal.categoria}</span>
      </div>
      <div class="datos-derecha">
        Inversión: <strong>${formatearCLP(canal.monto)}</strong> <br>
        Clics estimados: <strong>${canal.clics}</strong>
      </div>
    `;
    contenidoResultados.appendChild(div);
  });

  // Mostrar totales y caja completa
  totalClicsMesSpan.textContent = totalClics.toLocaleString('es-CL');
  cajaResultados.classList.remove("oculto");
});
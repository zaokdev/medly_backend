import { Schema, model } from "mongoose";

// Sub-documento: Estructura de UNA consulta (No se guarda en colección aparte)
const ConsultaSchema = new Schema({
  id_cita_sql: { type: Number, required: true },
  id_medico_sql: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  diagnostico: { type: String, required: true },
  receta: [
    {
      medicamento: String,
      dosis: String,
      frecuencia: String,
    },
  ],
  notas_adicionales: String,
});

const ExpedienteSchema = new Schema({
  id_paciente_sql: { type: Number, required: true, unique: true },
  nombre_paciente: { type: String, required: true },
  tipo_sangre: String,
  alergias: [String],

  historial_consultas: [ConsultaSchema],
});

export default model("Expediente", ExpedienteSchema);

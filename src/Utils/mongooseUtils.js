const mongoose = require('mongoose');
// Configuración común para esquemas
const commonSchemaOptions = {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  };
  
  // Validaciones comunes
  const stringRequired = (fieldName, maxLength = 255) => ({
    type: String,
    required: [true, `${fieldName} es requerido.`],
    maxlength: [maxLength, `${fieldName} no puede exceder ${maxLength} caracteres.`]
  });
  
  const booleanDefault = (defaultValue = true) => ({
    type: Boolean,
    default: defaultValue
  });
  
  module.exports = { commonSchemaOptions, stringRequired, booleanDefault };
  
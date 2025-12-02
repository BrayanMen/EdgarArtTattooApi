const mongoose = require('mongoose');

// Función para generar slugs (URLs amigables)
const slugify = (text) => {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Reemplazar espacios con -
    .replace(/[^\w\-]+/g, '')       // Eliminar caracteres no alfanuméricos
    .replace(/\-\-+/g, '-')         // Reemplazar múltiples - con uno solo
    .replace(/^-+/, '')             // Cortar - del inicio
    .replace(/-+$/, '');            // Cortar - del final
};

const commonSchemaOptions = {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
};

const stringRequired = (fieldName, maxLength = 255) => ({
    type: String,
    required: [true, `${fieldName} es requerido.`],
    trim: true,
    maxlength: [maxLength, `${fieldName} no puede exceder ${maxLength} caracteres.`]
});

// Helper para precios y números positivos
const numberRequired = (fieldName) => ({
    type: Number,
    required: [true, `${fieldName} es requerido.`],
    min: [0, `${fieldName} no puede ser negativo.`]
});

module.exports = { 
    commonSchemaOptions, 
    stringRequired, 
    numberRequired, 
    slugify // Exportamos para usar en los hooks
};
const mongoose = require("mongoose");

 const isUnique = async (Model, values) => {
    const orConditions = values.map(([field, value]) => ({ [field]: value }));
    const query = { $or: orConditions };
  
    try {
      const existingDocuments = await Model.find(query);
  
      if (existingDocuments.length > 0) {
        const conflictField = values.find(([field, value]) =>
          existingDocuments.some(doc => doc[field] === value)
        );


  //fix this
        return {
          isUnique: false,
          conflictField: conflictField ? conflictField[0] : null,
          message: conflictField
            ? `The provided ${conflictField[0]} is already in use.`
            : 'Conflict in one or more fields.',
        };
      } else {
        return { isUnique: true };
      }
    } catch (error) {
      console.error('Error checking uniqueness:', error);
      throw error;
    }
  };
  

module.exports = isUnique;
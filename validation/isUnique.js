const mongoose = require("mongoose");

 const isUnique = async (Model, values) => {
    const orConditions = values.map(([field, value]) => ({ [field]: value }));
    const query = { $or: orConditions };
  
    try {
      const existingDocuments = await Model.find(query);
  
      //todo - clean this up
      if (existingDocuments.length > 0) {
        const conflictFields = values.reduce((acc, [field, value]) => {
            if (existingDocuments.some(doc => doc[field] === value)) {
              acc.push({ [field]: value });
            }
            return acc;
          }, []);        
          
        const conflicts = conflictFields.map(field => Object.keys(field)).flat()


        console.log(conflicts)

  //fix this
        return {
          isUnique: false,
          conflicts: conflicts,
          message: `Values already in use.`,
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
const ProductAttribute = require('../models/productAttribute'); 
const mongoose = require('mongoose');
// Add productAttribute
exports.showProductAttribute = async (req, res) => {
  try {
    // Fetch attributes with status "show"
    const attributes = await ProductAttribute.find({ status: 'show' });

    // Transform the data
    const formattedAttributes = attributes.map((attribute) => ({
      id: attribute._id,
      _id: attribute._id,
      name: attribute.name,
      title: attribute.title,
      option: attribute.option,
      type: attribute.type,
      variants: attribute.variants.map((variant) => ({
        id: variant._id,
        _id: variant._id,
        name: variant.name,
      })),
    }));

    
    res.status(200).json(formattedAttributes);
  } catch (error) {
    console.error('Error fetching attributes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attributes',
      error: error.message,
    });
  }
};
exports.addProductAttribute = async (req, res) => {
  try {
    const { title, name, option, type, variants } = req.body;

     // Validate data on the server side
    if (!title || !type) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
	
    // Check if name exists
    const existingProductAttribute = await ProductAttribute.findOne({ name });
    if (existingProductAttribute) return res.status(400).json({ message: 'Product attribute name already exists' });
	
    // Custom Validation
    if((!variants || variants.length === 0)) {
        return res.status(400).json({
          message: 'Values feild is required.',
        });
    }
     
    // Create a new Product Attribute with the calculated position
    const productAttribute = new ProductAttribute({
      title,
      name,
      option,
      type,
      variants
    });

    // Save to database
    await productAttribute.save();

    res.status(200).json({ message: 'Product Attribute added successfully', productAttribute });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Update productAttribute
exports.updateProductAttribute = async (req, res) => {
  try { 
    const { title, name, option, type } = req.body; //, variants

     // Validate data on the server side
    if (!title || !type) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
	
    // Check if name exists
    const existingProductAttribute = await ProductAttribute.findOne({ name });
    if (existingProductAttribute) return res.status(400).json({ message: 'Product attribute name already exists' });
	
      
    /* 
    if ((!variants || variants.length === 0)) {
        return res.status(400).json({
            error: 'variants feild is required.',
        });
    } */

    const updatedProductAttribute = await ProductAttribute.findByIdAndUpdate(
      req.params.id,
      { title, name, option, type }, //, variants
      { new: true }
    );

    if (!updatedProductAttribute) return res.status(404).json({ message: 'Product Attribute not found' });

    res.status(200).json({ message: 'Product Attribute updated successfully', product: updatedProductAttribute });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const { start, length, search } = req.query;

    const orderColumnIndex = req?.query?.order[0]?.column; // Column index
    const orderDirection = req?.query?.order[0]?.dir; // 'asc' or 'desc'
    const columns = ['_id', 'name', 'attribute_type', 'values', 'status'];

    const sortColumn = columns[orderColumnIndex] || '_id'; // Default sorting column
    const sortOrder = orderDirection === 'desc' ? -1 : 1;
    
    // Paginate and filter Product Attributes
    const query = search?.value
      ? { $or: [{ name: new RegExp(search.value, 'i') }, { attribute_type: new RegExp(search.value, 'i') }] }
      : {};

    const total = await ProductAttribute.countDocuments(query);
    const productAttributes = await ProductAttribute.find(query).skip(Number(start)).limit(Number(length)).sort({ [sortColumn]: sortOrder });

    res.json({
      draw: req.query.draw,
      recordsTotal: total,
      recordsFiltered: total,
      data: productAttributes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching Product Attributes' });
  }
};

// Get productAttribute
exports.getAllProductAttribute = async (req, res) => {
  
  try {
    const productAttribute = await ProductAttribute.find();
    
    if (!productAttribute) {
      return res.status(200).json({ message: 'Product attribute is empty' });
    }

    res.status(200).json(productAttribute);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove productAttribute
exports.removeProductAttribute = async (req, res) => {
  
  try {

    const productAttribute = await ProductAttribute.deleteOne({ _id:req.params.id });
  
    res.status(200).json({ message: 'Product Attribute removed successfully', productAttribute });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

 
exports.addChildAttribute = async (req, res) => {
  const { parentId } = req.params;
  const { name } = req.body; // Expected: { name: { en: "Variant Name" } }

  try {
    // Validate `parentId`
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ success: false, message: 'Invalid parentId' });
    }

    // Validate `name`
    if (!name || typeof name !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid name. It should be an object.' });
    }

    // Find parent attribute
    const parentAttribute = await ProductAttribute.findById(parentId);

    if (!parentAttribute) {
      return res.status(404).json({ success: false, message: 'Parent attribute not found' });
    }

    // Add the new variant
    const newVariant = {
      _id: new mongoose.Types.ObjectId(), // Generate a new unique ObjectId
      name: new Map(Object.entries(name)), // Convert the name object to a Map
    };

    parentAttribute.variants.push(newVariant);

    // Save updated parent attribute
    await parentAttribute.save();

    // Prepare response by converting `Map` back to an object
    const addedVariant = {
      id: newVariant._id,
      name: Object.fromEntries(newVariant.name), // Convert Map to plain object
    };

    res.status(201).json({
      success: true,
      message: 'Child variant added successfully',
      data: {
        parentId: parentAttribute._id,
        variant: addedVariant,
      },
    });
  } catch (error) {
    console.error('Error adding child variant:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}
exports.getChildAttribute = async (req, res) => {
  const { parentId, childId } = req.params;

  try {
    // Validate `parentId`
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ success: false, message: 'Invalid parentId' });
    }

    // Fetch parent attribute
    const parentAttribute = await ProductAttribute.findById(parentId);

    if (!parentAttribute) {
      return res.status(404).json({ success: false, message: 'Parent attribute not found' });
    }

    let childVariants = parentAttribute.variants;

    // If `childId` is provided, filter the variants
    if (childId && mongoose.Types.ObjectId.isValid(childId)) {
      childVariants = childVariants.filter((variant) => variant._id.toString() === childId);

      if (childVariants.length === 0) {
        return res.status(404).json({ success: false, message: 'Child variant not found' });
      }
    }

    // Format response
    const response = {
      parentId: parentAttribute._id,
      parentName: parentAttribute.name,
      parentTitle: parentAttribute.title,
      childVariants: childVariants.map((variant) => ({
        id: variant._id,
        name: Object.fromEntries(variant.name), // Convert Map to object
      })),
    };

    res.status(200).json(parentAttribute);
  } catch (error) {
    console.error('Error fetching attributes:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.deleteManyChildAttribute = async (req, res) => {
    try {
      const { id, ids } = req.body; // Expect attributeId and variantIds as array

      if (!id || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Invalid request data' });
      }

      // Update the document by filtering out the specified variant IDs
      const updatedAttribute = await ProductAttribute.findByIdAndUpdate(
        id,
        { $pull: { variants: { _id: { $in: ids } } } },
        { new: true }
      );

      if (!updatedAttribute) {
        return res.status(404).json({ message: 'Attribute not found' });
      }

      res.status(200).json({
        message: 'Variants successfully deleted',
        updatedAttribute,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error', error: err.message });
    }
}
exports.deleteChildAttribute = async (req, res) => {
  const { parentId, childId } = req.params;

  try {
    // Validate `parentId` and `childId`
    if (!mongoose.Types.ObjectId.isValid(parentId) || !mongoose.Types.ObjectId.isValid(childId)) {
      return res.status(400).json({ success: false, message: 'Invalid parentId or childId' });
    }

    // Find the parent attribute
    const parentAttribute = await ProductAttribute.findById(parentId);

    if (!parentAttribute) {
      return res.status(404).json({ success: false, message: 'Parent attribute not found' });
    }

    // Find the index of the child variant to delete
    const childIndex = parentAttribute.variants.findIndex(
      (variant) => variant._id.toString() === childId
    );

    if (childIndex === -1) {
      return res.status(404).json({ success: false, message: 'Child variant not found' });
    }

    // Remove the child variant from the array
    parentAttribute.variants.splice(childIndex, 1);

    // Save the updated document
    await parentAttribute.save();

    res.status(200).json({
      success: true,
      message: 'Child variant deleted successfully',
      data: {
        parentId: parentAttribute._id,
        deletedChildId: childId,
      },
    });
  } catch (error) {
    console.error('Error deleting child variant:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}
exports.deleteAttribute = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the input
    if (!id) {
      return res.status(400).json({ message: 'Attribute ID is required' });
    }

    // Find and delete the attribute
    const deletedAttribute = await ProductAttribute.findByIdAndDelete(id);

    if (!deletedAttribute) {
      return res.status(404).json({ message: 'Attribute not found' });
    }

    res.status(200).json({
      message: 'Attribute successfully deleted',
      deletedAttribute,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
}
exports.deleteManyAttribute = async (req, res) => {
  try {
    const { ids } = req.body; // Expect an array of IDs in the request body

    // Validate the input
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs array is required and must not be empty' });
    }

    // Delete attributes with the provided IDs
    const result = await ProductAttribute.deleteMany({
      _id: { $in: ids },
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No attributes found to delete' });
    }

    res.status(200).json({
      message: 'Attributes successfully deleted',
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
}
exports.editForm = async (req, res) => {
  try {
    // Fetch the Product Attribute by ID
    const productAttribute = await ProductAttribute.findById(req.params.id);

    // Check if Product Attribute exists
    if (!productAttribute) {
      return res.status(404).json({ message: 'Product Attribute not found' });
    }

    // Send the Product Attribute data to the client
    res.status(200).json(productAttribute);
  } catch (error) {
    console.error('Error fetching Product Attribute:', error);
    res.status(500).json({ message: 'Error fetching Product Attribute for editing' });
  }
};
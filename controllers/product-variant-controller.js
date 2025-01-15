const Product = require('../models/products');
const ProductAttribute = require('../models/productAttribute'); 


const validateAttributeByValue = async (name, value) => {
    const attribute = await ProductAttribute.findOne({
        name: name,
        values: { $in: [value] }, // Check if value exists in the values array
    });
    return attribute;
};

// Add product variant
exports.addProductVariant = async (req, res) => {
    try {
        const { productId, variants } = req.body;

        // Validate the variants' attributes
        for (const variant of variants) {
            for (const attr of variant.attributes) {
                const attributeExists = await validateAttributeByValue(attr.name, attr.value);
                if (!attributeExists) {
                    return res.status(400).json({
                        error: `Variant attribute with name "${attr.name}" and value "${attr.value}" does not exist.`,
                    });
                }
            }
        }


        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }


        product.variants.push(...variants);


        await product.save();

        res.status(200).json({ message: 'Product variants added successfully', product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update product variant
exports.updateProductVariant = async (req, res) => {
    try {
        const { productId, variantId, updatedVariant } = req.body;


        for (const attr of updatedVariant.attributes) {
            const attributeExists = await validateAttributeByValue(attr.name, attr.value);
            if (!attributeExists) {
                return res.status(400).json({
                    error: `Variant attribute with name "${attr.name}" and value "${attr.value}" does not exist.`,
                });
            }
        }


        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }


        const variantIndex = product.variants.findIndex((variant) => variant._id.toString() === variantId);
        if (variantIndex === -1) {
            return res.status(404).json({ message: 'Variant not found' });
        }

        product.variants[variantIndex] = { ...product.variants[variantIndex], ...updatedVariant };

        // Save the updated product
        await product.save();

        res.status(200).json({ message: 'Product variant updated successfully', product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete product variant
exports.deleteProductVariant = async (req, res) => {
    try {
        const { productId, variantId } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }


        const variantIndex = product.variants.findIndex((variant) => variant._id.toString() === variantId);
        if (variantIndex === -1) {
            return res.status(404).json({ message: 'Variant not found' });
        }

        product.variants.splice(variantIndex, 1);


        await product.save();

        res.status(200).json({ message: 'Product variant removed successfully', product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all variants of a product
exports.getProductVariants = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ variants: product.variants });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

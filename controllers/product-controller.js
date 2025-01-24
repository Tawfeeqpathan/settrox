const Product = require('../models/products');
const DButils=require('../utils/DButils')
const ProductAttribute = require('../models/productAttribute');
const Brand = require('../models/brand');

// Helper function to validate attribute by value
const validateAttributeByValue = async (name, value) => {
    const attribute = await ProductAttribute.findOne({
        name: name,
        values: { $in: [value] }, // Check if value exists in the values array
    });
    return attribute;
};

// Helper function to getAttributeByValue
const getAttributeByValue = async (attributeId) => {
  const attribute = await ProductAttribute.findOne({ _id: attributeId });
  return attribute;
};

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const { title, description,product_feature, features,features_video, slug, category, barcode, productId, 
      stock, image, sku, tag, isCombination, meta_title,  meta_description,topSeller } = req.body;
     
    const price = req.body?.prices.price;
    const originalPrice = req.body?.prices.originalPrice;
    const discount = req.body?.prices.discount;
     
    // Check if product exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) return res.status(400).json({ message: 'Product already exists' });

      

    // Parse attributes and variants from form-data
    //const attributes = req.body.attributes !== null && Array.isArray(req.body.attributes) && req.body.attributes.length > 0 ? JSON.parse(req.body.attributes) : [];
    //const variants = req.body.variants !== null && Array.isArray(req.body.variants) && req.body.variants.length > 0 ? JSON.parse(req.body.variants) : [];
    const attributes = [];
    const variants = [];
    const categories = req.body.categories ? req.body.categories : [];
    const brand = req.body.brand ? req.body.brand : [];
    const specification = req.body.specification ? req.body.specification : [];
   
     // Validate attributes
     if (attributes.length > 0) {
      for (const attr of attributes) {
            const attributeExists = await validateAttributeByValue(attr.name, attr.value);
            if (!attributeExists) {
                return res.status(400).json({ 
                    error: `Attribute with name "${attr.name}" and value "${attr.value}" does not exist.` 
                });
            }
        }
      }

    // Validate variants
    if (variants.length > 0) {
      for (const variant of variants) {
          for (const attr of variant.attributes) {
              const attributeExists = await validateAttributeByValue(attr.name, attr.value);
              if (!attributeExists) {
                  return res.status(400).json({ 
                      error: `Variant attribute with name "${attr.name}" and value "${attr.value}" does not exist.` 
                  });
              }
          }
      }
    } 
 
    const newProduct = new Product({
      title,
      description,
      product_feature,
      features_video,
      features,
      slug,
      category,
      barcode,
      productId,
      brand,
      price,
      originalPrice,
      discount,
      stock,
      image,
      sku, 
	  topSeller,
      categories,
      tag,
      isCombination,
      attributes,
      variants,
      meta_title,
      meta_description,
      specification
    });

    await newProduct.save();

    res.status(201).json({ message: 'Product created successfully', productId: newProduct._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.insertManyProducts = async (req, res) => {
  try {
    const products = await Product.insertMany(await req.body);
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, title, price } = req.query;

    // Prepare pagination
    const skip = (page - 1) * limit;
    const paginationOptions = {
      skip,
      limit: parseInt(limit),
    };

    // Build the filter query dynamically
    let filter = {};

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by title (e.g., partial match)
    if (title) {
      filter.title = { $regex: title, $options: 'i' }; // Case-insensitive match
    }

    // Filter by price (range)
    if (price) {
      const [minPrice, maxPrice] = price.split(',').map(Number);
      if (minPrice && maxPrice) {
        filter.price = { $gte: minPrice, $lte: maxPrice };
      }
    }

    // Get filtered products with pagination
    const products = await Product.find(filter).populate({
      path: 'category',   // Populate single category
      select: 'name _id', // Include only the 'name' and '_id' fields from Category
    })
      .skip(paginationOptions.skip)
      .limit(paginationOptions.limit);

    // Get the total count of matching products for pagination
    const totalDoc = await Product.countDocuments(filter);

    // Send the response with products and pagination data
    res.status(200).json({
      products,
      totalDoc,  // Total number of matching products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProductWithAttributeDetails = async (product) => {
  try {
    const attributeDetailsArray = [];
    // Loop through variants to fetch attribute names and values
    for (const variant of product.variants) {
      const attributeDetails = {};

      for (const [key, value] of variant.attributes.entries()) {
        console.log('keykey',key)
        console.log('valuevalue',value)
        if(key != '_id'){
            // Fetch attribute key name
        const attrKeyObj = await ProductAttribute.findById(key).lean(); 
        let attrValObj = await ProductAttribute.findOne({ "variants._id": value.toString() })
        console.log('attrKeyObj',attrKeyObj)
        console.log('attrValObj',attrValObj)
        if (attrKeyObj && attrValObj) {
          let colorArray = [];
          attributeDetails[value.toString()] = {};
          for (const [key2, value2] of attrValObj.variants.entries()) {
            if(value.toString() == value2._id.toString()){
                value2.status = variant.image;
                colorArray.push(value2)
            }
          }
          attributeDetails[value.toString()].name = attrValObj.name
          attributeDetails[value.toString()].values = colorArray
        }
        }
        
      }
      attributeDetailsArray.push(attributeDetails) 
    }

    return attributeDetailsArray;
  } catch (error) {
    console.error("Error fetching attribute details:", error.message);
    throw error;
  }
};

// Get Product by ID
exports.getProductById = async (req, res) => {
  try { 
    const product = await Product.findOne({ _id: req.params.id }).populate({
      path: 'category',   // Populate single category
      select: 'name _id', // Include only the 'name' and '_id' fields from Category
    })
    .populate({
      path: 'categories', // Populate multiple categories
      select: 'name _id', // Include only the 'name' and '_id' fields from Category
    }).populate({
      path: 'brand', // Populate multiple brand
      select: 'name _id', // Include only the 'name' and '_id' fields from brand
    }).populate({
      path: 'specification', // Populate multiple brand
      select: 'title _id', // Include only the 'name' and '_id' fields from brand
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });

 
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Product by ID
exports.getProductByIdFront = async (req, res) => {
  try { 
    const product = await Product.findOne({ _id: req.params.id }).populate({
      path: 'category',   // Populate single category
      select: 'name _id', // Include only the 'name' and '_id' fields from Category
    })
    .populate({
      path: 'categories', // Populate multiple categories
      select: 'name _id', // Include only the 'name' and '_id' fields from Category
    }).populate({
      path: 'brand', // Populate multiple brand
      select: 'name _id', // Include only the 'name' and '_id' fields from brand
    }).populate({
      path: 'specification', // Populate multiple brand
      select: 'title attributes _id', // Include only the 'name' and '_id' fields from brand
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    // Get filtered products with pagination
    const similarProducts = await Product.find()
      .skip(0)
      .limit(10);

    const bestProducts = await Product.find()
      .skip(0)
      .limit(10);
      
    res.status(200).json({product:product,similarProducts:similarProducts,bestProducts:bestProducts});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get Product by Slug
exports.getProductBySlug = async (req, res) => {
  try {
    console.log('req.params.slug',req.params.slug)
    const product = await Product.findOne({ slug: req.params.slug }).populate({
      path: 'category',   // Populate single category
      select: 'name _id', // Include only the 'name' and '_id' fields from Category
    })
    .populate({
      path: 'categories', // Populate multiple categories
      select: 'name _id', // Include only the 'name' and '_id' fields from Category
    }).populate({
      path: 'brand', // Populate multiple categories
      select: 'name _id', // Include only the 'name' and '_id' fields from Category
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
 

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      product_feature, 
      features_video, 
      features, 
      slug, 
      category, 
      barcode, 
      productId, 
      stock, 
      image, 
      sku, 
      tag, 
      isCombination, 
      meta_title, 
      meta_description,
      prices,
      categories, 
      brand, 
      specification, 
      attributes
    } = req.body;
    
    // Price, originalPrice, and discount from prices object
    const price = prices?.price;
    const originalPrice = prices?.originalPrice;
    const discount = prices?.discount;

    // Find the product by ID
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    } 
    //const variants = transformToAttributes(req.body.variants); 
   //console.log(variants);
    
    
    // Update the product with the new values
    product.title = title || product.title;
    product.description = description || product.description;
    product.product_feature = product_feature || product.product_feature;
    product.features_video = features_video || product.features_video;
    product.features = features || product.features;
    product.slug = slug || product.slug;
    product.category = category || product.category;
    product.barcode = barcode || product.barcode;
    product.productId = productId || product.productId;
    product.brand = brand || product.brand;
    product.price = price || product.price;
    product.originalPrice = originalPrice || product.originalPrice;
    product.discount = discount || product.discount;
    product.stock = stock || product.stock;
    product.image = image || product.image;
    product.sku = sku || product.sku;
    product.categories = categories || product.categories;
    product.specification = specification || product.specification;
    product.tag = tag || product.tag;
    product.isCombination = isCombination || product.isCombination;
    product.meta_title = meta_title || product.meta_title;
    product.meta_description = meta_description || product.meta_description;
    product.attributes = attributes || product.attributes;
    //product.variants = variants || product.variants;

    // Save the updated product
   
    const updatedProduct =  await product.save(); 

    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addVariantProduct = async (req, res) => {
  try {
    const data  = req.body;
    const { productId } = req.params;
    const product = await Product.findById(productId.toString());
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    // Separate primary and non-primary objects
    const primaryVariants = data?.filter((item) => item.primary === true);
    const subAttributes = data?.filter((item) => item.primary === false);

    // Add primary variants to the product
    primaryVariants.forEach((variant) => {
      const newVariant = {
        originalPrice: product.originalPrice || 0,
        price: product.price || 0,
        quantity: product.stock || 0,
        discount: product.discount || 0,
        productId: productId,
        barcode: product.barcode || '',
        sku: product.sku || '',
        image: variant.image || '',
        attributeName: variant.name || '',
        attributeValue: variant.value || '',
        attributeImage: variant.image || '',
        attributeType: variant.type || '',
        subAttributes: [], 
      };

      // Add the new variant to the product's variants array
      product.variants.push(newVariant);
    });


    // Add all non-primary objects to the subAttributes array of every primary variant
    subAttributes.forEach((subAttr) => {
      product.variants?.forEach((variant) => {
        variant.subAttributes.push({
          type: subAttr.type || '',
          name: subAttr.name || '',
          value: subAttr.value || '',
          image: subAttr.image || '',
        });
      });
    });

    // Save the updated product
    await product.save();

    res.status(200).json({
      message: 'Variants and subAttributes added successfully',
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error adding variants:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
exports.updateVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const updatedData = req.body;

    // Find product by ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    product.variants = updatedData || product.variants;
   
    // Save the updated product
    await product.save();
    product.variants =  product.variants?.map((i)=>{
      if(i.quantity>0){
        i.preOrder= false;
        i.preOrderPrice = 0;
        i.preOrderDate = null;
      }
      return i
    })
    await product.save();
    res.status(200).json({
      message: 'Variant updated successfully',
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error updating variant:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
exports.deleteVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find the variant by ID
    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' });
    }

    // Remove the variant using Mongoose pull method
    product.variants.pull({ _id: variantId });

    // Save the updated product
    await product.save();

    res.status(200).json({
      message: 'Variant deleted successfully',
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error deleting variant:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};




function transformToAttributes(variantData) {

  return variantData.map(variant => {
    if(variant.attributes){
      return variant;
    }else{
      const { 
        originalPrice, 
        price, 
        quantity, 
        discount, 
        productId,
        barcode, 
        sku, 
        image,
        
        ...attributes 
      } = variant;
  
      return {
        attributes, // All dynamic key-value pairs
        originalPrice: parseFloat(originalPrice),
        price: parseFloat(price),
        quantity,
        discount: parseFloat(discount),
        productId,
        barcode,
        sku,
        image,
      };
    }
    
  });
}
// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.deleteOne({ _id: req.params.id });
    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search Products
exports.searchProducts = async (req, res) => {
 
  try {
  
    const { category, brand, price_min, price_max ,pageNumber,limit} = req.query;

    const filter = {};
   // if (category) filter.category = category;
   // Add filter for category name
    if (category) {
      // Check if "categories" filter already exists
      if (!filter["categories"]) {
          filter["categories"] = { $elemMatch: {} };
      }

      filter["categories"].$elemMatch["name.en"] = category;
    }
    if (brand){
		const brandObj = await Brand.findOne({ slug: brand });
		if(brandObj){
			filter.brand = brandObj?._id;	
		}
	}
    if (price_min && price_max) filter.price = { $gte: price_min, $lte: price_max };
    DButils.findWithSkipAndLimit(
      req,
      res,
      Product,
      filter,
      pageNumber,
      limit
    );
    // const products = await Product.find(filter);
    // res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProductsByBrand = async (req, res) => {
  try {
    const { brand } = req.params; 
    // Step 1: Find the brand by slug
    const brandObj = await Brand.findOne({ slug: brand });
    if (!brandObj) {
      res.status(200).json({ message: 'Brand not found' }); 
    }
    const products = await Product.find({ brand: brandObj._id }).populate('brand');

    if (!products || products.length === 0) {
      return res.status(200).json({ message: 'No products found for the specified Brand' });
  }
    const bestSellerProducts = await getBestSellerProducts();

    res.status(200).json({products:products,bestSellerProducts:bestSellerProducts});

  } catch (error) {
    res.status(500).json({ message: 'Error fetching products by brand', error: error.message });
  }
};

const getBestSellerProducts = async () => { 
  try {
      const bestProducts = await Product.find() //{topSeller:true}
      .skip(0)
      .limit(10);
        return bestProducts;
    } catch (error) {
      return false;
    }

}  
exports.getProductsByCategory = async (req, res) => {
  try {
      const { categoryId } = req.params; 
      console.log('categoryId',categoryId)
      const products = await Product.find({ categories: categoryId }).populate('categories');
      
      if (!products || products.length === 0) {
          return res.status(200).json({ message: 'No products found for the specified category' });
      }
      const bestSellerProducts = await getBestSellerProducts();

      res.status(200).json({products:products,bestSellerProducts:bestSellerProducts});
      
  } catch (error) {
      res.status(500).json({ message: 'Error fetching products by category', error: error.message });
  }
};
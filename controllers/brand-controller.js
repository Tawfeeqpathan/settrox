 const Brand = require('../models/brand'); // Import the Brand model

const DButils=require('../utils/DButils') 

// Method to add a brand

exports.addBrand = async (req, res) => {

  try {

    // Ensure image file exists

    //if (!req.file) {

    //  return res.status(400).json({ message: 'Image file is required' });

    //}



    const { name,description,categories, status } = req.body;

    //const image = req.files.map(file => file.filename);

	 

	  let slug = name.en.toLowerCase();  

	  slug = slug.replace(/\s+/g, '-');

	  slug = slug.replace(/[^a-z0-9\-]/g, '');

	  slug = slug.replace(/^-+|-+$/g, '');

   

	const image = req.body.logo;

    const newBrand = new Brand({

      name,

      slug,

      description,

      categories,

      image,

      status: status || 'active', // Default status is 'active'

    });



    // Save brand to the database

    await newBrand.save();



    res.status(201).json({ message: 'Brand added successfully', brand: newBrand });

  } catch (error) {

    console.error(error);

    res.status(500).json({ message: 'Error adding brand', error: error.message });

  }

};

exports. addAllBrands = async (req, res) => {

  try {

    await Brand.deleteMany();

    await Brand.insertMany(req.body);

    res.status(200).send({

      message: "Brands Added Successfully!",

    });

  } catch (err) {

    res.status(500).send({

      message: err.message,

    });

  }

};

// Method to list all brands

exports.listBrands = async (req, res) => {

  try {

    const brands = await Brand.find(); // Fetch all brands

    res.status(200).json({ brands });

  } catch (error) {

    console.error(error);

    res.status(500).json({ message: 'Error fetching brands', error: error.message });

  }

};



// Method to delete a brand

exports.deleteBrand = async (req, res) => {

  try {

    const brandId = req.params.id;



    // Find the brand to delete

    const brand = await Brand.findById(brandId);

    if (!brand) {

      return res.status(404).json({ message: 'Brand not found' });

    } 



    // Delete the brand from the database

    await Brand.findByIdAndDelete(brandId);



    res.status(200).json({ message: 'Brand deleted successfully' });

  } catch (error) {

    console.error(error);

    res.status(500).json({ message: 'Error deleting brand', error: error.message });

  }

};





exports. getActiveBrands = async (req, res) => {

  try {

    const brands = await Brand.find({ status: "active" }).sort({ _id: -1 });

    res.send(brands);

  } catch (err) {

    res.status(500).send({

      message: err.message,

    });

  }

};



// Get all brands with parent and child hierarchy

exports. getAllBrands = async (req, res) => {

  try {

    const brands = await Brand.find({}).sort({ _id: -1 });

    const brandList = brands;

    res.send(brandList);

  } catch (err) {

    res.status(500).send({

      message: err.message,

    });

  }

};



// Get all brands without hierarchy

exports. getAllSimpleBrands = async (req, res) => {

  try {

    const brands = await Brand.find({}).sort({ _id: -1 });

    res.send(brands);

  } catch (err) {

    res.status(500).send({

      message: err.message,

    });

  }

};



// Get a single brand by ID

exports. getBrandById = async (req, res) => {

  try {

    const brand = await Brand.findById(req.params.id).populate({
      path: 'categories', // Populate multiple categories
      select: 'name _id', // Include only the 'name' and '_id' fields from Category
    });

    res.send(brand);

  } catch (err) {

    res.status(500).send({

      message: err.message,

    });

  }

};



// Update a single brand

exports. updateBrand = async (req, res) => {

  try {

    const brand = await Brand.findById(req.params.id);

    if (brand) {

      brand.name = req.body.name;

      brand.description = req.body.description;

      brand.logo = req.body.logo;

      brand.status = req.body.status;

	  brand.categories = req.body.categories

        ? req.body.categories

        : brand.categories;

      //brand.parentId = req.body.parentId ? req.body.parentId : brand.parentId;

      //brand.parentName = req.body.parentName;



      await brand.save();

      res.send({ message: "Brand Updated Successfully!" });

    }

  } catch (err) {

    res.status(500).send({

      message: err.message,

    });

  }

};



// Update multiple brands

exports. updateManyBrands = async (req, res) => {

  try {

    const updatedData = {};

    for (const key of Object.keys(req.body)) {

      if (

        req.body[key] !== "[]" &&

        Object.entries(req.body[key]).length > 0 &&

        req.body[key] !== req.body.ids

      ) {

        updatedData[key] = req.body[key];

      }

    }



    await Brand.updateMany(

      { _id: { $in: req.body.ids } },

      {

        $set: updatedData,

      },

      {

        multi: true,

      }

    );



    res.send({

      message: "Brands Updated Successfully!",

    });

  } catch (err) {

    res.status(500).send({

      message: err.message,

    });

  }

};



// Update brand status

exports. updateBrandStatus = async (req, res) => {

  try {

    const newStatus = req.body.status;



    await Brand.updateOne(

      { _id: req.params.id },

      {

        $set: {

          status: newStatus,

        },

      }

    );

    res.status(200).send({

      message: `Brand ${

        newStatus === "active" ? "Activated" : "Deactivated"

      } Successfully!`,

    });

  } catch (err) {

    res.status(500).send({

      message: err.message,

    });

  }

};



// Delete a single brand

exports. deleteBrand = async (req, res) => {

  try {

    await Brand.deleteOne({ _id: req.params.id });

    await Brand.deleteMany({ parentId: req.params.id });

    res.status(200).send({

      message: "Brand Deleted Successfully!",

    });

  } catch (err) {

    res.status(500).send({

      message: err.message,

    });

  }

};



// Delete multiple brands

exports. deleteManyBrands = async (req, res) => {

  try {

    await Brand.deleteMany({ parentId: req.body.ids });

    await Brand.deleteMany({ _id: req.body.ids });



    res.status(200).send({

      message: "Brands Deleted Successfully!",

    });

  } catch (err) {

    res.status(500).send({

      message: err.message,

    });

  }

};



// Prepare brands with parent-child hierarchy

exports. readyToParentAndChildrenBrand = (brands, parentId = null) => {

  const brandList = [];

  let filteredBrands;



  if (parentId == null) {

    filteredBrands = brands.filter((brand) => !brand.parentId);

  } else {

    filteredBrands = brands.filter((brand) => brand.parentId === parentId);

  }



  for (let brand of filteredBrands) {

    brandList.push({

      _id: brand._id,

      name: brand.name,

      parentId: brand.parentId,

      parentName: brand.parentName,

      description: brand.description,

      logo: brand.logo,

      status: brand.status,

      children: readyToParentAndChildrenBrand(brands, brand._id),

    });

  }



  return brandList;

};

exports. updateStatus = async (req, res) => {

    try {

      const newStatus = req.body.status;

  

      await Brand.updateOne(

        { _id: req.params.id },

        {

          $set: {

            status: newStatus,

          },

        }

      );

      res.status(200).send({

        message: `Brand ${

          newStatus === "show" ? "Published" : "Un-Published"

        } Successfully!`,

      });

    } catch (err) {

      res.status(500).send({

        message: err.message,

      });

    }

  };

  exports. getShowingBrands = async (req, res) => {

    try {

      const brands = await Brand.find({ status: "show" }).sort({ _id: -1 });

      res.send(brands);

    } catch (err) {

      res.status(500).send({

        message: err.message,

      });

    }

  };
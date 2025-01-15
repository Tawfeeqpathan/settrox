const Category = require("../models/category");
const Brand = require("../models/brand");

const addCategory = async (req, res) => {
  try {
  
 
  const { name,description,icon, status } = req.body;
  let slug = name.en.toLowerCase();  
  slug = slug.replace(/\s+/g, '-');
  slug = slug.replace(/[^a-z0-9\-]/g, '');
  slug = slug.replace(/^-+|-+$/g, '');
  let parentId = req.body.parentName == "Home" ? '' : req.body.parentId;
  let parentName = req.body.parentName == "Home" ? '' : req.body.parentName;
  
  
   if(req.body.parentName == "Home"){
        const newCategory2 = new Category({
          name,
          description,
          icon,
          status: status || 'active', // Default status is 'active'
        });
        await newCategory2.save();
        res.status(200).send({
          message: "Category Added Successfully!",
        });
   }else{
        const newCategory = new Category({
          name,
          description,
          parentId,
          parentName,
          icon,
          status: status || 'active', // Default status is 'active'
        });
        await newCategory.save();
        res.status(200).send({
          message: "Category Added Successfully!",
        });
   }
    
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// all multiple category
const addAllCategory = async (req, res) => {
  // console.log("category", req.body);
  try {
    await Category.deleteMany();

    await Category.insertMany(req.body);

    res.status(200).send({
      message: "Category Added Successfully!",
    });
  } catch (err) {
    console.log(err.message);

    res.status(500).send({
      message: err.message,
    });
  }
};

// get status show category
const getShowingCategory = async (req, res) => {
  try {
    const categories = await Category.find({ status: "show" }).sort({
      _id: -1,
    });

    const categoryList = readyToParentAndChildrenCategory(categories);
    // console.log("category list", categoryList.length);
    res.send(categoryList);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// get all category parent and child
const getAllCategory = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ _id: -1 });

    const categoryList = readyToParentAndChildrenCategory(categories);
    //  console.log('categoryList',categoryList)
    res.send(categoryList);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ _id: -1 });

    res.send(categories);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getHomeCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ _id: -1 });
    const homeCategories = [];
    categories.forEach(category => {
      if (category?.isHome === true) {
        homeCategories.push(category);
      }
    });
    res.send(homeCategories);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getHeaderCategories = async (req, res) => {
  try {
    // Fetch top-level categories (parentId is null or doesn't exist)
    const categories = await Category.find({
      $or: [{ parentId: { $exists: false } }, { parentId: null }]
    }).sort({ _id: 1 });

    // Create the JSON structure with subcategories and brands
    const categoryData = await Promise.all(categories.map(async (category) => {
      // Fetch second-level subcategories (parentId points to the current category)
      const subcategories = await Category.find({ parentId: category._id }).sort({ _id: -1 });

      // For each subcategory, fetch associated brands
      const subcategoryData = await Promise.all(subcategories.map(async (subcategory) => {
        // Fetch brands for the current subcategory
        const brands = await Brand.find({ categories: subcategory._id });

        return {
          subcategory: subcategory.name.en, // Assuming name is a string, modify if it's an object with multiple languages
          subcategory_image: subcategory.icon, // Assuming each subcategory has an image field
          brands: brands.map(brand => ({
			brandId:brand._id,				  
            name: brand.name,
            slug: brand.slug
          }))
        };
      }));

      return {
        category: category.name.en, // Top-level category name
        subcategories: subcategoryData // Second-level subcategories with brands
      };
    }));

    // Send the structured JSON response
    res.send(categoryData);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    res.send(category);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// category update
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      category.name = { ...category.name, ...req.body.name };
      category.description = {
        ...category.description,
        ...req.body.description,
      };
      category.icon = req.body.icon;
      category.status = req.body.status;
      category.parentId = req.body.parentId
        ? req.body.parentId
        : category.parentId;
      category.parentName = req.body.parentName;

      await category.save();
      res.send({ message: "Category Updated Successfully!" });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// udpate many category
const updateManyCategory = async (req, res) => {
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

    await Category.updateMany(
      { _id: { $in: req.body.ids } },
      {
        $set: updatedData,
      },
      {
        multi: true,
      }
    );

    res.send({
      message: "Categories update successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// category update status
const updateStatus = async (req, res) => {
  // console.log('update status')
  try {
    const newStatus = req.body.status;

    await Category.updateOne(
      { _id: req.params.id },
      {
        $set: {
          status: newStatus,
        },
      }
    );
    res.status(200).send({
      message: `Category ${
        newStatus === "show" ? "Published" : "Un-Published"
      } Successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};
//single category delete
const deleteCategory = async (req, res) => {
  try {
    console.log("id cat >>", req.params.id);
    await Category.deleteOne({ _id: req.params.id });
    await Category.deleteMany({ parentId: req.params.id });
    res.status(200).send({
      message: "Category Deleted Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }

  //This is for delete children category
  // Category.updateOne(
  //   { _id: req.params.id },
  //   {
  //     $pull: { children: req.body.title },
  //   },
  //   (err) => {
  //     if (err) {
  //       res.status(500).send({ message: err.message });
  //     } else {
  //       res.status(200).send({
  //         message: 'Category Deleted Successfully!',
  //       });
  //     }
  //   }
  // );
};

// all multiple category delete
const deleteManyCategory = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ _id: -1 });

    await Category.deleteMany({ parentId: req.body.ids });
    await Category.deleteMany({ _id: req.body.ids });

    res.status(200).send({
      message: "Categories Deleted Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};
const readyToParentAndChildrenCategory = (categories, parentId = null) => {
  const categoryList = [];
  let Categories;
  if (parentId == null) {
    Categories = categories.filter((cat) => cat.parentId == undefined);
  } else {
    Categories = categories.filter((cat) => cat.parentId == parentId);
  }

  for (let cate of Categories) {
    categoryList.push({
      _id: cate._id,
      name: cate.name,
      parentId: cate.parentId,
      parentName: cate.parentName,
      description: cate.description,
      icon: cate.icon,
      status: cate.status,
      children: readyToParentAndChildrenCategory(categories, cate._id),
    });
  }

  return categoryList;
};

module.exports = {
  addCategory,
  addAllCategory,
  getAllCategory,
  getShowingCategory,
  getCategoryById,
  updateCategory,
  updateStatus,
  deleteCategory,
  deleteManyCategory,
  getAllCategories,
  getHeaderCategories,
  updateManyCategory,
  getHomeCategories
};

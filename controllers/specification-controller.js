const Specification = require("../models/specification");
const Category = require("../models/category");

exports.addSpecification = async (req, res) => {
  try {
 
    const { title, categoryId, status, parentName, attributes } = req.body;

    // Validate if the category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    // Validate input
    if (!title || !status || !Array.isArray(attributes)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const specification = new Specification({
      title,
      categoryId,
      parentName,
      status,
      attributes
    });
    await specification.save();

    res
      .status(201)
      .json({ message: "Specification created successfully", specification });
  } catch (error) {
    res.status(500).json({ message: "Error creating specification", error });
  }
};

exports.allSpecificationsBycategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const specifications = await Specification.find({ categoryId }).populate(
      "categoryId",
      "name"
    );

    res.status(200).json({
      categoryName: category.name,
      specifications: specifications.map((spec) => ({
        title: spec.title,
        label: spec.label,
        value: spec.value,
      })),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching specifications by category", error });
  }
};

exports.allSpecifications = async (req, res) => {
  try {
    const specifications = await Specification.find().populate({
      path: 'categoryId', // Field to populate
      select: 'name',     // Only include the 'name' field from Categories
    });
    if(specifications.length > 0){
      res.status(200).json(
        specifications.map((spec) => ({
          _id: spec._id,
          title: spec.title,
          categoryName: spec.categoryId ? spec.categoryId.name : 'Category not found',
          label: spec.label,
          value: spec.value,
          status: spec.status,
        }))
      );
    }else{
      res.status(200).json([]);
    }
    
  } catch (error) {
    res.status(500).json({ message: "Error fetching specifications", error });
  }
};

exports.getSpecificationById = async (req, res) => {
  try {
    const specification = await Specification.findById(req.params.id);
    res.send(specification);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};


// specification update
exports.updateSpecification = async (req, res) => {
  try {
    const specification = await Specification.findById(req.params.id);

    const { title, categoryId, status, attributes } = req.body;

    // Validate if the category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    // Validate input
    if (!title || !status || !Array.isArray(attributes)) {
      return res.status(400).json({ error: 'Invalid input' });
    }


    if (specification) {
      specification.title = { ...specification.title, ...req.body.title };
       
      specification.status = req.body.status;
      specification.categoryId = req.body.categoryId
        ? req.body.categoryId
        : specification.categoryId;
      specification.parentName = req.body.parentName;
      specification.attributes = req.body.attributes;

      await specification.save();
      res.send({ message: "Specification Updated Successfully!" });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// update status
exports.updateStatus = async (req, res) => {
  // console.log('update status')
  try {
    const newStatus = req.body.status;

    await Specification.updateOne(
      { _id: req.params.id },
      {
        $set: {
          status: newStatus,
        },
      }
    );
    res.status(200).send({
      message: `Specification ${
        newStatus === "show" ? "Published" : "Un-Published"
      } Successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
}; 


//single specification delete
exports.deleteSpecification = async (req, res) => {
  try {
    console.log("id cat >>", req.params.id);
    await Specification.deleteOne({ _id: req.params.id });
    await Specification.deleteMany({ categoryId: req.params.id });
    res.status(200).send({
      message: "Specification Deleted Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }

};
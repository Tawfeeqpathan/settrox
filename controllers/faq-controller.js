const Faq = require('../models/faq'); 

// Add faq
exports.addFaq = async (req, res) => {
  try {
    const { title, description } = req.body;

     // Validate data on the server side
    if (!title || !description) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    
    // Find the current maximum position in the database
    const lastFaq = await Faq.findOne().sort({ position: -1 }); // Get the last FAQ by position descending
    const nextPosition = lastFaq ? lastFaq.position + 1 : 1; // Increment position or start at 1

    // Create a new FAQ with the calculated position
    const faq = new Faq({
      title,
      description,
      position: nextPosition,
    });

    // Save to database
    await faq.save();

    res.status(200).json({ message: 'FAQ added successfully', faq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Update faq
exports.updateFaq = async (req, res) => {
  try {
    const { title, description, position ,status } = req.body;

      // Validate data on the server side
      if (!title || !description) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const updatedFaq = await Faq.findByIdAndUpdate(
      req.body.id,
      { title, description, position ,status },
      { new: true }
    );

    if (!updatedFaq) return res.status(404).json({ message: 'Faq not found' });

    res.status(200).json({ message: 'Faq updated successfully', product: updatedFaq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const { start, length, search } = req.query;

    const orderColumnIndex = req.query.order[0].column; // Column index
    const orderDirection = req.query.order[0].dir; // 'asc' or 'desc'
    const columns = ['_id', 'title', 'description', 'position', 'status'];

    const sortColumn = columns[orderColumnIndex] || '_id'; // Default sorting column
    const sortOrder = orderDirection === 'desc' ? -1 : 1;
    
    // Paginate and filter FAQs
    const query = search?.value
      ? { $or: [{ title: new RegExp(search.value, 'i') }, { description: new RegExp(search.value, 'i') }] }
      : {};

    const total = await Faq.countDocuments(query);
    const faqs = await Faq.find(query).skip(Number(start)).limit(Number(length)).sort({ [sortColumn]: sortOrder });

    res.json({
      draw: req.query.draw,
      recordsTotal: total,
      recordsFiltered: total,
      data: faqs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching FAQs' });
  }
};

// Get faq
exports.getAllFaq = async (req, res) => {
  
  try {
    const faq = await Faq.find();
    
    if (!faq) {
      return res.status(200).json({ message: 'Faq is empty' });
    }

    res.status(200).json({ faq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove faq
exports.removeFaq = async (req, res) => {
  const { faqId } = req.body;

  try {

    const faq = await Faq.deleteOne({ _id:faqId });
 

    res.status(200).json({ message: 'FAQ removed successfully', faq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.toggleStatus = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    faq.status = faq.status === 'active' ? 'inactive' : 'active';
    await faq.save();

    res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating status' });
  }
};

exports.editForm = async (req, res) => {
  try {
    // Fetch the FAQ by ID
    const faq = await Faq.findById(req.params.id);

    // Check if FAQ exists
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    // Send the FAQ data to the client
    res.status(200).json({ faq });
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    res.status(500).json({ message: 'Error fetching FAQ for editing' });
  }
};
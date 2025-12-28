const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const { 
      parent,      // Filter by parent category
      active,      // Filter by active status
      withCount    // Include quiz count
    } = req.query;
    
    // Build query
    const query = {};
    
    if (parent === 'null' || parent === 'root') {
      query.parent = null;  // Get only root categories
    } else if (parent) {
      query.parent = parent;
    }
    
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    // Execute query
    let categoriesQuery = Category.find(query)
      .sort({ order: 1, name: 1 });
    
    // Populate quiz count if requested
    if (withCount === 'true') {
      categoriesQuery = categoriesQuery.populate('quizCount');
    }
    
    // Populate subcategories
    categoriesQuery = categoriesQuery.populate({
      path: 'subcategories',
      match: { isActive: true },
      select: 'name slug icon'
    });
    
    const categories = await categoriesQuery;
    
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find by ID or slug
    const category = await Category.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { slug: id }
      ]
    })
      .populate('subcategories')
      .populate('quizCount');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get Category Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category'
    });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin/Instructor)
const createCategory = async (req, res) => {
  try {
    const { name, description, icon, image, color, parent, order } = req.body;
    
    // Check if category with same name exists
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    const category = await Category.create({
      name,
      description,
      icon,
      image,
      color,
      parent: parent || null,
      order: order || 0,
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Create Category Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin/Instructor)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Prevent changing slug manually
    delete updates.slug;
    
    const category = await Category.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Update Category Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has subcategories
    const hasSubcategories = await Category.countDocuments({ parent: id });
    if (hasSubcategories > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories. Delete subcategories first.'
      });
    }
    
    // Check if category has quizzes
    const Quiz = require('../models/Quiz');
    const hasQuizzes = await Quiz.countDocuments({ category: id });
    if (hasQuizzes > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with quizzes. Move or delete quizzes first.'
      });
    }
    
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete Category Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

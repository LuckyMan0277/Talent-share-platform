const Talent = require('../models/Talent');
const Schedule = require('../models/Schedule');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all talents
// @route   GET /api/talents
// @access  Public
exports.getTalents = asyncHandler(async (req, res, next) => {
  const { category, location, search, isOnline } = req.query;

  let query = {};

  if (category) query.category = category;
  if (location) query.location = { $regex: location, $options: 'i' };
  if (isOnline !== undefined) query.isOnline = isOnline === 'true';
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const talents = await Talent.find(query)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: talents.length,
    data: talents
  });
});

// @desc    Get single talent
// @route   GET /api/talents/:id
// @access  Public
exports.getTalent = asyncHandler(async (req, res, next) => {
  const talent = await Talent.findById(req.params.id)
    .populate('userId', 'name email');

  if (!talent) {
    return res.status(404).json({
      success: false,
      error: '재능을 찾을 수 없습니다'
    });
  }

  // Get schedules for this talent
  const schedules = await Schedule.find({ talentId: req.params.id })
    .sort({ date: 1, startTime: 1 });

  res.status(200).json({
    success: true,
    data: {
      ...talent.toObject(),
      schedules
    }
  });
});

// @desc    Create new talent
// @route   POST /api/talents
// @access  Private
exports.createTalent = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    category,
    location,
    isOnline,
    maxParticipants
  } = req.body;

  // Parse schedules if it's a string (from FormData)
  let schedules = req.body.schedules;
  if (typeof schedules === 'string') {
    schedules = JSON.parse(schedules);
  }

  // Validate schedules
  if (!schedules || schedules.length === 0) {
    return res.status(400).json({
      success: false,
      error: '최소 1개 이상의 일정을 추가해주세요'
    });
  }

  // Create talent
  const talentData = {
    userId: req.user.id,
    title,
    description,
    category,
    location,
    isOnline,
    maxParticipants
  };

  // Add image if uploaded
  if (req.file) {
    talentData.image = `/uploads/talents/${req.file.filename}`;
  }

  const talent = await Talent.create(talentData);

  // Create schedules if provided
  if (schedules && schedules.length > 0) {
    const schedulePromises = schedules.map(schedule =>
      Schedule.create({
        talentId: talent._id,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime
      })
    );

    await Promise.all(schedulePromises);
  }

  // Get talent with populated schedules
  const talentWithSchedules = await Talent.findById(talent._id)
    .populate('userId', 'name email');

  const createdSchedules = await Schedule.find({ talentId: talent._id });

  res.status(201).json({
    success: true,
    data: {
      ...talentWithSchedules.toObject(),
      schedules: createdSchedules
    }
  });
});

// @desc    Update talent
// @route   PUT /api/talents/:id
// @access  Private
exports.updateTalent = asyncHandler(async (req, res, next) => {
  let talent = await Talent.findById(req.params.id);

  if (!talent) {
    return res.status(404).json({
      success: false,
      error: '재능을 찾을 수 없습니다'
    });
  }

  // Check ownership
  if (talent.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: '권한이 없습니다'
    });
  }

  const { title, description, category, location, isOnline, maxParticipants } = req.body;

  const updateData = { title, description, category, location, isOnline, maxParticipants };

  // Add image if uploaded
  if (req.file) {
    updateData.image = `/uploads/talents/${req.file.filename}`;
  }

  talent = await Talent.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).populate('userId', 'name email');

  res.status(200).json({
    success: true,
    data: talent
  });
});

// @desc    Delete talent
// @route   DELETE /api/talents/:id
// @access  Private
exports.deleteTalent = asyncHandler(async (req, res, next) => {
  const talent = await Talent.findById(req.params.id);

  if (!talent) {
    return res.status(404).json({
      success: false,
      error: '재능을 찾을 수 없습니다'
    });
  }

  // Check ownership
  if (talent.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: '권한이 없습니다'
    });
  }

  // Delete associated schedules
  await Schedule.deleteMany({ talentId: req.params.id });

  await talent.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get schedules for a talent
// @route   GET /api/talents/:id/schedules
// @access  Public
exports.getSchedules = asyncHandler(async (req, res, next) => {
  const talent = await Talent.findById(req.params.id);

  if (!talent) {
    return res.status(404).json({
      success: false,
      error: '재능을 찾을 수 없습니다'
    });
  }

  const schedules = await Schedule.find({ talentId: req.params.id })
    .sort({ date: 1, startTime: 1 });

  res.status(200).json({
    success: true,
    count: schedules.length,
    data: schedules
  });
});

// @desc    Add schedule to talent
// @route   POST /api/talents/:id/schedules
// @access  Private
exports.addSchedule = asyncHandler(async (req, res, next) => {
  const talent = await Talent.findById(req.params.id);

  if (!talent) {
    return res.status(404).json({
      success: false,
      error: '재능을 찾을 수 없습니다'
    });
  }

  // Check ownership
  if (talent.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: '권한이 없습니다'
    });
  }

  const { date, startTime, endTime } = req.body;

  const schedule = await Schedule.create({
    talentId: req.params.id,
    date,
    startTime,
    endTime
  });

  res.status(201).json({
    success: true,
    data: schedule
  });
});

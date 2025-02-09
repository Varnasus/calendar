const { ContentItem, Campaign } = require('../models');

exports.getAllContentItems = async (req, res, next) => {
  try {
    const items = await ContentItem.findAll({
      include: [{ model: Campaign }]
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

exports.createContentItem = async (req, res, next) => {
  try {
    const item = await ContentItem.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.updateContentItem = async (req, res, next) => {
  try {
    const [updated] = await ContentItem.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const item = await ContentItem.findByPk(req.params.id);
      res.json(item);
    } else {
      res.status(404).json({ message: 'Content item not found' });
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteContentItem = async (req, res, next) => {
  try {
    const deleted = await ContentItem.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Content item not found' });
    }
  } catch (error) {
    next(error);
  }
}; 
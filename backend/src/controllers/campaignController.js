const { Campaign, ContentItem, SocialPost } = require('../models');

exports.getAllCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.findAll({
      include: [
        { model: ContentItem },
        { model: SocialPost }
      ]
    });
    res.json(campaigns);
  } catch (error) {
    next(error);
  }
};

exports.createCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.create(req.body);
    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
};

exports.updateCampaign = async (req, res, next) => {
  try {
    const [updated] = await Campaign.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const campaign = await Campaign.findByPk(req.params.id);
      res.json(campaign);
    } else {
      res.status(404).json({ message: 'Campaign not found' });
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteCampaign = async (req, res, next) => {
  try {
    const deleted = await Campaign.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Campaign not found' });
    }
  } catch (error) {
    next(error);
  }
}; 
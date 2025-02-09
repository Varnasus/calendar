const { SocialPost, Campaign } = require('../models');

exports.getAllSocialPosts = async (req, res, next) => {
  try {
    const posts = await SocialPost.findAll({
      include: [{ model: Campaign }]
    });
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

exports.createSocialPost = async (req, res, next) => {
  try {
    const post = await SocialPost.create(req.body);
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

exports.updateSocialPost = async (req, res, next) => {
  try {
    const [updated] = await SocialPost.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const post = await SocialPost.findByPk(req.params.id);
      res.json(post);
    } else {
      res.status(404).json({ message: 'Social post not found' });
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteSocialPost = async (req, res, next) => {
  try {
    const deleted = await SocialPost.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Social post not found' });
    }
  } catch (error) {
    next(error);
  }
}; 
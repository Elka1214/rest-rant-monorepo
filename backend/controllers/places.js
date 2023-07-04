const router = require("express").Router();
const db = require("../models");

const { Place, Comment, User } = db;

router.post("/", async (req, res) => {
  if (req.currentUser?.role !== "admin") {
    return res
      .status(403)
      .json({ message: "You are not allowed to add a place" });
  }

  try {
    const place = await Place.create(req.body);
    res.json(place);
  } catch (error) {
    res.status(500).json({ message: "Failed to add a place" });
  }
});

router.get("/", async (req, res) => {
  try {
    const places = await Place.findAll();
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: "Failed to get places" });
  }
});

router.get("/:placeId", async (req, res) => {
  const placeId = Number(req.params.placeId);

  if (isNaN(placeId)) {
    res.status(400).json({ message: "Invalid place ID" });
    return;
  }

  try {
    const place = await Place.findOne({
      where: { placeId },
      include: {
        model: Comment,
        include: User,
      },
    });

    if (!place) {
      res.status(404).json({ message: "Place not found" });
    } else {
      res.json(place);
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to get the place" });
  }
});

router.put("/:placeId", async (req, res) => {
  const placeId = Number(req.params.placeId);

  if (isNaN(placeId)) {
    res.status(400).json({ message: "Invalid place ID" });
    return;
  }

  if (req.currentUser?.role !== "admin") {
    res.status(403).json({ message: "You are not allowed to edit places" });
    return;
  }

  try {
    const place = await Place.findByPk(placeId);

    if (!place) {
      res.status(404).json({ message: "Place not found" });
    } else {
      await place.update(req.body);
      res.json(place);
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update the place" });
  }
});

router.delete("/:placeId", async (req, res) => {
  const placeId = Number(req.params.placeId);

  if (isNaN(placeId)) {
    res.status(400).json({ message: "Invalid place ID" });
    return;
  }

  if (req.currentUser?.role !== "admin") {
    res.status(403).json({ message: "You are not allowed to delete places" });
    return;
  }

  try {
    const place = await Place.findByPk(placeId);

    if (!place) {
      res.status(404).json({ message: "Place not found" });
    } else {
      await place.destroy();
      res.json(place);
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete the place" });
  }
});

router.post("/:placeId/comments", async (req, res) => {
  const placeId = Number(req.params.placeId);

  if (isNaN(placeId)) {
    res.status(400).json({ message: "Invalid place ID" });
    return;
  }

  try {
    const place = await Place.findByPk(placeId);

    if (!place) {
      res.status(404).json({ message: "Place not found" });
      return;
    }

    const authorId = req.currentUser?.id;

    if (!authorId) {
      res
        .status(403)
        .json({ message: "You must be logged in to add a comment" });
      return;
    }

    const comment = await Comment.create({
      ...req.body,
      placeId,
      authorId,
    });

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: "Failed to add the comment" });
  }
});

router.delete("/:placeId/comments/:commentId", async (req, res) => {
  const placeId = Number(req.params.placeId);
  const commentId = Number(req.params.commentId);

  if (isNaN(placeId)) {
    res.status(400).json({ message: "Invalid place ID" });
    return;
  }

  if (isNaN(commentId)) {
    res.status(400).json({ message: "Invalid comment ID" });
    return;
  }

  try {
    const comment = await Comment.findOne({
      where: { commentId, placeId },
    });

    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
    } else {
      await comment.destroy();
      res.json(comment);
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete the comment" });
  }
});

module.exports = router;

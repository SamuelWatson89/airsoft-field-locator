const mongoose = require("mongoose");
const Field = mongoose.model("Field");

exports.home = async (req, res) => {
  const fields = await Field.aggregate([{ $sample: { size: 6 } }]);
  res.render("home", { title: "Welcome!", fields });
};

exports.getFields = async (req, res) => {
  const fields = await Field.find();
  res.render("fields", { title: "All Sites", fields });
};

exports.addField = (req, res) => {
  res.render("editField", { title: "Add Field" });
};

exports.createField = async (req, res) => {
  req.body.author = req.user._id;
  const field = await new Field(req.body);
  await field.save();
  req.flash("success", `Successfully Created ${field.name}.`);
  res.redirect(`/`);
};

exports.getFieldBySlug = async (req, res, next) => {
  const field = await Field.findOne({ slug: req.params.slug });
  if (!field) {
    next();
    return;
  }
  res.render("field", { field, title: field.name });
};

const confirmOwner = (field, user) => {
  if (!field.author.equals(user._id)) {
    throw Error("You must own the field to edit it.");
  }
};

exports.editField = async (req, res) => {
  const field = await Field.findOne({ _id: req.params.id });
  confirmOwner(field, req.user);
  res.render("editField", { title: `Edit ${field.name}`, field });
};

exports.updateField = async (req, res) => {
  req.body.location.type = "Point";

  const field = await Field.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  }).exec();

  req.flash(
    "success",
    `Successfully updated <strong>${field.name}</strong>! <a href="/field/${field.slug}">View Field →</a>`
  );

  res.redirect(`/fields/${field._id}/edit`);
};

exports.searchFields = async (req, res) => {
  const fields = await Field.find(
    {
      $text: { $search: req.query.q },
    },
    {
      score: { $meta: "textScore" },
    }
  ).sort({
    score: { $meta: "textScore" },
  });
  res.json(fields);
};

exports.mapPage = (req, res) => {
  res.render("map", { title: "Map view" });
};

exports.mapFields = async (req, res) => {
  const fields = await Field.find().select(
    "slug name location siteType gameTypes"
  );

  res.json(fields);
};

exports.mapSearchFields = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const q = {
    location: {
      $near: {
        $geometry: {
          type: "point",
          coordinates,
        },
        $maxDistance: 16093, //10 miles in meters
      },
    },
  };

  const fields = await Field.find(q).select(
    "slug name location siteType gameTypes"
  );
  res.json(fields);
};

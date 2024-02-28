const express = require("express");
const router = express.Router();
const fieldController = require("../controllers/fieldController");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { catchErrors } = require("../handlers/errorHandlers");

// Field related routes
router.get("/", catchErrors(fieldController.home));
router.get("/add", authController.isLoggedIn, fieldController.addField);
router.post(
  "/add",
  authController.isLoggedIn,
  catchErrors(fieldController.createField)
);
router.post(
  "/add/:id",
  authController.isLoggedIn,
  catchErrors(fieldController.updateField)
);

router.get("/fields", catchErrors(fieldController.getFields));
router.get("/field/:slug", catchErrors(fieldController.getFieldBySlug));
router.get("/fields/:id/edit", catchErrors(fieldController.editField));

router.get("/map", fieldController.mapPage);

// User related routes
router.get("/login", userController.loginForm);
router.post("/login", authController.login);
router.get("/register", userController.registerForm);
router.post(
  "/register",
  userController.validateRegister,
  userController.register,
  authController.login
);
router.get("/logout", authController.logout);
router.get("/account", authController.isLoggedIn, userController.account);
router.post("/account", catchErrors(userController.updateAccount));
router.post("/account/forgot", catchErrors(authController.forgot));
router.get("/account/reset/:token", catchErrors(authController.reset));
router.post(
  "/account/reset/:token",
  authController.confirmedPasswords,
  catchErrors(authController.update)
);

// API related routes
router.get("/api/fields/all", catchErrors(fieldController.mapFields));
router.get("/api/fields/near", catchErrors(fieldController.mapSearchFields));
router.get("/api/search", catchErrors(fieldController.searchFields));

module.exports = router;

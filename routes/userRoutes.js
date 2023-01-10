const express = require("express");
const { registerUser, loginUser, allUsers } = require("../controllers/userControllers");
const { protect } = require("../middlewares/jwtMiddleware")
const router = express.Router();

router.route("/").post(registerUser);
router.post("/login", loginUser);
router.route('/').get(protect, allUsers);


module.exports = router;

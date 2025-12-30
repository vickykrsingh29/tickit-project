import { Router } from "express";
import { checkJwt } from "../middlewares/auth";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  checkUser,
  checkUserNoAuth,
  getUsersByCompany,
  approveUsers,
  getAllCompanies,
  getTeamsByCompany,
  getUsersForReactSelect
} from "../controllers/userController";

const router = Router();

// Place public routes BEFORE the JWT middleware
router.post("/checkUserNoAuth", checkUserNoAuth);

// JWT protected routes below
router.use(checkJwt);

// Public endpoint to check user (can be secured as needed)
router.post("/checkUser", checkUser);
router.post("/getcompanyusers", getUsersByCompany);
router.post("/approve", approveUsers);
router.get("/companies", getAllCompanies);
router.get("/getusersforselect", getUsersForReactSelect);
router.get('/teams/:companyName', getTeamsByCompany);


// Protect other user routes

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/", deleteUser);

export default router;
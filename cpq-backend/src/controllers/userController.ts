import { Request,Response, NextFunction } from "express";
import { User } from "../models/User";
import { AuthenticatedRequest } from "../middlewares/auth";

// Get all users
export const getUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// Get users by company
export const getUsersByCompany = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email, id } = req.body;
    let user;

    console.log("Request body:", req.body);
    console.log("Authenticated user ID (sub):", req.auth?.sub);

    if (email) {
      user = await User.findOne({ where: { email } });
    } else if (id) {
      user = await User.findByPk(id);
    } else if (req.auth?.sub) {
      user = await User.findByPk(req.auth.sub);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const usersInCompany = await User.findAll({ where: { companyName: user.companyName } });
    res.status(200).json(usersInCompany);
  } catch (error) {
    console.error("Error fetching users by company:", error);
    next(error);
  }
};

// Get user by ID
export const getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction):Promise<any>  => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Create new user (approvalByAdmin is set to false by default)
export const createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id, email, firstName, lastName, designation, companyName, teamName } = req.body;
    const newUser = await User.create({
      id,
      email,
      firstName,
      lastName,
      designation,
      companyName,
      teamName,
      approvalByAdmin: false, // Set default value
    });
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

// Update existing user (excludes updating approvalByAdmin)
export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction):Promise<any>  => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { email, firstName, lastName, designation, companyName, teamName } = req.body;
    await user.update({
      email,
      firstName,
      lastName,
      designation,
      companyName,
      teamName,
      // Do not update approvalByAdmin here
    });
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Delete user
export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { userIds } = req.body; // Expecting an array of user IDs

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ message: 'Invalid user IDs provided.' });
    }

    await User.destroy({
      where: {
        id: userIds,
      },
    });

    res.status(200).json({ message: 'User(s) deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// Approve users
export const approveUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { userIds } = req.body; // Expecting an array of user IDs

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ message: 'Invalid user IDs provided.' });
    }

    await User.update(
      { approvalByAdmin: true },
      {
        where: {
          id: userIds,
        },
      }
    );

    res.status(200).json({ message: 'User(s) approved successfully.' });
  } catch (error) {
    next(error);
  }
};

// Check if a user exists (by email) and return approved status
export const checkUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction):Promise<any>  => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }
    const user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(200).json({
        exists: true,
        approvedByAdmin: user.approvalByAdmin,
        role: user.role,
      });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    next(error);
  }
};

// Get all companies for React Select
export const getAllCompanies = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const companies = await User.findAll({
      attributes: ['companyName'],
      group: ['companyName'],
      order: [['companyName', 'ASC']],
    });

    const formattedCompanies = companies
      .filter(company => company.companyName) // Filter out null/undefined values
      .map(company => ({
        label: company.companyName,
        value: company.companyName,
      }));

    res.status(200).json(formattedCompanies);
  } catch (error) {
    next(error);
  }
};

// Get teams by company name
export const getTeamsByCompany = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { companyName } = req.params;
    
    const teams = await User.findAll({
      attributes: ['teamName'],
      where: { companyName },
      group: ['teamName'],
      order: [['teamName', 'ASC']],
    });

    const formattedTeams = teams
      .filter(team => team.teamName)
      .map(team => ({
        label: team.teamName,
        value: team.teamName,
      }));

    res.status(200).json(formattedTeams);
  } catch (error) {
    next(error);
  }
};

// Get users for React Select
export const getUsersForReactSelect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.auth?.sub;
    const currentUser = await User.findByPk(userId);

    if (!currentUser || !currentUser.companyName) {
      return res
        .status(404)
        .json({ message: "User or company information not found" });
    }

    const companyUsers = await User.findAll({
      where: { companyName: currentUser.companyName },
      attributes: ["id", "firstName", "lastName"],
    });

    const formattedUsers = companyUsers.map((user) => ({
      value: user.id,
      label: `${user.firstName} ${user.lastName}`,
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    next(error);
  }
};

// Check if a user exists (by email) without requiring authentication
export const checkUserNoAuth = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }
    
    const user = await User.findOne({ where: { email } });
    
    return res.status(200).json({
      exists: !!user,
      approvedByAdmin: user ? user.approvalByAdmin : false
    });
  } catch (error) {
    console.error("Error checking user without auth:", error);
    next(error);
  }
};
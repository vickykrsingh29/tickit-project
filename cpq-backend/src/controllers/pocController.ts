import { Request, Response, NextFunction } from "express";
import { Poc } from "../models/Poc";
import { Customer } from "../models/Customer";
import { User } from "../models/User";
import { AuthenticatedRequest } from "../middlewares/auth";

export const createPoc = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
        const pocData = typeof req.body.poc === "string"
        ? JSON.parse(req.body.poc)
        : req.body;
        const { name, designation, department, socialHandles, phone, email, remarks } = pocData;
        const customerId = req.query.customerId as string;
        // Validate required fields
        console.log("req.body:",req.body, "customerId:",customerId);
        if (!name || !designation || !department || !phone || !email ) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }
        
        console.log("customer:",customerId);
        
        // Check if the customer exists
        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        // Create POC
        const newPoc = await Poc.create({
            name,
            designation,
            department,
            socialHandles: socialHandles || {},
            phone,
            email,
            remarks,
            customerId,
        });

        res.status(201).json(newPoc);
    } catch (error) {
        next(error);
    }
};


export const deletePoc = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        // Check if the Poc exists
        const poc = await Poc.findByPk(id);
        if (!poc) {
            return res.status(404).json({ message: "POC not found" });
        }

        // Delete the Poc
        await poc.destroy();

        return res.status(200).json({ message: "POC deleted successfully" });
    } catch (error) {
        console.error("Error deleting POC:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



export const updatePoc = async (req: AuthenticatedRequest, res: Response, next:NextFunction): Promise<any> => {
    try {
        const { id } = req.params;
        const { name, designation, department, socialHandles, phone, email, remarks } = req.body;

        // Check if the POC exists
        const poc = await Poc.findByPk(id);
        if (!poc) {
            return res.status(404).json({ message: "POC not found" });
        }

        // Validate required fields
        if (!name || !designation || !department || !phone || !email) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Update the POC record
        await poc.update({
            name,
            designation,
            department,
            socialHandles,
            phone,
            email,
            remarks,
        });

        return res.status(200).json({ message: "POC updated successfully", poc });
    } catch (error) {
        console.error("Error updating POC:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



// Fetch all unique designations of POCs associated with the user's company
export const getAllDesignations = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
        const userId = (req as any).auth?.sub; // Extract user ID from JWT
        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const customerId = req.query.customerId as string;;

        // Get all customers belonging to the user's company
        // const customers = await Customer.findAll({
        //     where: { companyName: user.companyName },
        //     attributes: ["id"], // Only fetch customer IDs
        // });

        // if (customers.length === 0) {
        //     return res.status(404).json({ message: "No customers found for this company" });
        // }

        // const customerIds = customers.map((customer) => customer.id);

        // Fetch distinct POC designations associated with these customers
        const designations = await Poc.findAll({
            attributes: ["designation"],
            where: { customerId: customerId }, // Filter by customer IDs
            group: ["designation"],
            order: [["designation", "ASC"]],
        });

        const formattedDesignations = designations.map((poc) => ({
            label: poc.designation,
            value: poc.designation,
        }));

        res.status(200).json( formattedDesignations );
    } catch (error) {
        next(error);
    }
};



// Fetch all unique departments of POCs associated with the user's company
export const getAllDepartments = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        // Authenticate user
        const userId = (req as any).auth?.sub;
        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const customerId = req.query.customerId as string;;

        // // Fetch all customers belonging to the user's company
        // const customers = await Customer.findAll({
        //     where: { companyName: user.companyName },
        //     attributes: ["id"], // Fetch only customer IDs
        // });

        // if (customers.length === 0) {
        //     return res.status(404).json({ message: "No customers found for this company" });
        // }

        // const customerIds = customers.map((customer) => customer.id);

        // Fetch distinct POC departments associated with these customers
        const departments = await Poc.findAll({
            attributes: ["department"],
            where: { customerId: customerId }, // Filter by customer IDs
            group: ["department"],
            order: [["department", "ASC"]],
        });

        // Format response
        const formattedDepartments = departments.map((poc) => ({
            label: poc.department,
            value: poc.department,
        }));

        res.status(200).json(formattedDepartments );
    } catch (error) {
        next(error);
    }
};

export const getAllPoc = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        // Authenticate user
        const userId = (req as any).auth?.sub;
        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch all customers belonging to the user's company
        // const customers = await Customer.findAll({
        //     where: { companyName: user.companyName },
        //     attributes: ["id"], // Fetch only customer IDs
        // });

        // if (customers.length === 0) {
        //     return res.status(404).json({ message: "No customers found for this company" });
        // }

        const customerId = req.query.customerId as string;

        // Fetch all POCs associated with these customers
        const pocs = await Poc.findAll({
            where: { customerId: customerId }, // Filter by customer IDs
            include: [
                {
                    model: Customer,
                    attributes: ["id", "companyName"], // Include customer details
                },
            ],
            order: [["name", "ASC"]], // Order by POC name
        });

        res.status(200).json(pocs);
    } catch (error) {
        next(error);
    }
};

export const getPocById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const { id } = req.params;
        const poc = await Poc.findByPk(id, {
            include: [{ all: true }], // Include associations
        });

        if (!poc) {
            return res.status(404).json({ message: "POC not found" });
        }

        res.status(200).json({ poc });
    } catch (error) {
        next(error);
    }
};


export const getPocsForSelect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { customerId } = req.params;
  
      // Check if the customer exists
      const customer = await Customer.findByPk(customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found." });
      }
  
      // Fetch POCs for the given customer
      const pocs = await Poc.findAll({
        where: { customerId },
      });
  
      // Format response for React Select
      const formattedPocs = pocs.map((poc) => ({
        label: poc.name,
        value: poc.id,
        ...poc.toJSON() // Include all other POC details
      }));
  
      res.status(200).json(formattedPocs);
    } catch (error) {
      next(error);
    }
  };

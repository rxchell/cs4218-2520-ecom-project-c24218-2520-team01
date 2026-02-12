import orderModel from "../models/orderModel.js";
import { getOrdersController, getAllOrdersController } from "../controllers/authController.js";

jest.mock("../models/orderModel.js");

describe("Tests for getOrdersController", () => {

    // Set up variables for our test cases
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        jest.clearAllMocks();
    });

    test("Return 200 after fetching orders successfully", async () => {
        /* 
        Assumption: 
        - getOrdersController should return a 200 once the orders has been retrieved successfully.
        - MongoDB will return an emmpty buyer even if the object id for buyer does not exist.
        */
        // Arrange
        req.user = { _id: "123" };

        const mockOrders = [
            { _id: "1", buyer: "user123", products: [], payment: {}, status: "Not Process" },
            { _id: "2", buyer: "user123", products: [], payment: {}, status: "Shipped" },
        ];

        const mockQuery = {
            populate: jest.fn().mockReturnThis(),
            then: function (resolve) {
                resolve(mockOrders);
            }
        };

        orderModel.find.mockReturnValue(mockQuery);

        // Act
        await getOrdersController(req, res);

        // Assert
        expect(orderModel.find).toHaveBeenCalledWith({ buyer: "123" });
        expect(mockQuery.populate).toHaveBeenCalledWith("products", "-photo");
        expect(mockQuery.populate).toHaveBeenCalledWith("buyer", "name");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockOrders);
    });

    test("Return 500 when an error occurs while fetching orders", async () => {
        /* 
        Assumption: MongoDB will throw an error when the buyer id is invalid.
        */
        // Arrange
        req.user = { _id: "123" };

        const error = new Error("Database error");
        orderModel.find.mockImplementation(() => {
            throw error;
        });

        // Act
        await getOrdersController(req, res);

        // Assert
        expect(orderModel.find).toHaveBeenCalledWith({ buyer: "123" });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Error while getting orders",
            error,
        });
    });
});

describe("Tests for getAllOrdersController", () => {

    // Set up variables for our test cases
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        jest.clearAllMocks();
    });

    test("Return 200 after fetching all orders successfully", async () => {
        /* 
        Assumption: 
        - getAllOrdersController should return a 200 once the orders has been retrieved successfully.
        */
        // Arrange
        // Assume all this is in sorted order of creation time
        const mockOrders = [
            { _id: "1", buyer: "user123", products: [], payment: {}, status: "Not Process" },
            { _id: "2", buyer: "user123", products: [], payment: {}, status: "Shipped" },
            { _id: "3", buyer: "user321", products: [], payment: {}, status: "Processing" },
            { _id: "4", buyer: "user4", products: [], payment: {}, status: "Shipped" },
        ];

        const mockQuery = {
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnValue(mockOrders)
        };

        orderModel.find.mockReturnValue(mockQuery);

        // Act
        await getAllOrdersController(req, res);

        // Assert
        expect(orderModel.find).toHaveBeenCalledWith({});
        expect(mockQuery.populate).toHaveBeenCalledWith("products", "-photo");
        expect(mockQuery.populate).toHaveBeenCalledWith("buyer", "name");
        expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: "-1" });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockOrders);
    });

    test("Return 500 when an error occurs while fetching orders", async () => {
        /* 
        Assumption: MongoDB will throw an error when the buyer id is invalid.
        */
        // Arrange
        const error = new Error("Database error");
        orderModel.find.mockImplementation(() => {
            throw error;
        });

        // Act
        await getAllOrdersController(req, res);

        // Assert
        expect(orderModel.find).toHaveBeenCalledWith({});
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Error while getting orders",
            error,
        });
    });
});
import userModel from "../models/userModel.js";
import { getUsersController } from "./authController.js";

// Lim Jia Wei, A0277381W

// Mock userModel
jest.mock("../models/userModel.js")

describe("Tests for getUsersController", () => {

    let request;
    let response;

    const mockUsers = [
        {
            name: "admin",
            email: "admin@test.com",
            phone: "123456789",
        },
        {
            name: "user",
            email: "user@test.com",
            phone: "123456789",
        },
    ];

    beforeEach(() => {
        request = {};
        response = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    })

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("returns 200 after fetching users successfully", async () => {

        // Arrange
        userModel.find.mockResolvedValue(mockUsers);

        // Act
        await getUsersController(request, response);

        // Assert
        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.send).toHaveBeenCalledWith({
            success: true,
            message: "All users fetched successfully",
            users: mockUsers,
        });
        expect(userModel.find).toHaveBeenCalledWith({});

    });

    test("returns 500 after fetching users failed", async () => {

        // Arrange
        userModel.find.mockRejectedValue(mockUsers);

        // Act
        await getUsersController(request, response);

        // Assert
        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.send).toHaveBeenCalledWith({
            success: false,
            message: "Error in getting all users",
            error: mockUsers,
        });
        expect(userModel.find).toHaveBeenCalledWith({});

    });

    test("returns 200 when no users exist", async () => {

        // Arrange
        const mockUsers = [];

        userModel.find.mockResolvedValue(mockUsers);

        // Act
        await getUsersController(request, response);

        // Assert
        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.send).toHaveBeenCalledWith({
            success: true,
            message: "All users fetched successfully",
            users: mockUsers,
        });
        expect(userModel.find).toHaveBeenCalledWith({});

    });

});
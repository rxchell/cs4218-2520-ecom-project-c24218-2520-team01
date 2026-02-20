import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { requireSignIn, isAdmin } from "./authMiddleware.js";

// Mock jsonwebtoken
jest.mock("jsonwebtoken");

// Mock userModel
jest.mock("../models/userModel.js");

describe("authMiddleware", () => {
	let req;
	let res;
	let next;

	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();

		// Setup default request, response, and next function
		req = {
			headers: {},
		};

		res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn().mockReturnThis(),
		};

		next = jest.fn();

		// Mock console.log to suppress output during tests
		jest.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		// Restore console.log
		jest.restoreAllMocks();
	});

	it("requireSignIn should call next() when valid token is provided", async () => {
		// Arrange
		const decodedToken = { _id: "6767", role: 1 };
		req.headers.authorization = "Legit Token";
		JWT.verify.mockReturnValue(decodedToken);

		// Act
		await requireSignIn(req, res, next);

		// Assert
		expect(JWT.verify).toHaveBeenCalledWith(
			req.headers.authorization,
			process.env.JWT_SECRET,
		);
		expect(req.user).toEqual(decodedToken);
		expect(next).toHaveBeenCalled();
	});

	it("requireSignIn should not call next() when no token is provided", async () => {
		// Arrange
		req.headers.authorization = undefined;
		JWT.verify.mockImplementation(() => {
			throw new Error("jwt must be provided");
		});

		// Act
		await requireSignIn(req, res, next);

		// Assert
		expect(JWT.verify).toHaveBeenCalled();
		expect(next).not.toHaveBeenCalled();
		expect(console.log).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.send).toHaveBeenCalledWith({
			success: false,
			message: "Unauthorized",
		});
	});

	it("requireSignIn should not call next() when invalid token is provided", async () => {
		// Arrange
		req.headers.authorization = "invalidToken";
		JWT.verify.mockImplementation(() => {
			throw new Error("invalid token");
		});

		// Act
		await requireSignIn(req, res, next);

		// Assert
		expect(JWT.verify).toHaveBeenCalled();
		expect(next).not.toHaveBeenCalled();
		expect(console.log).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.send).toHaveBeenCalledWith({
			success: false,
			message: "Unauthorized",
		});
	});

	it("requireSignIn should not call next() when token is expired", async () => {
		// Arrange
		req.headers.authorization = "expiredToken";
		const expiredError = new Error("jwt expired");
		expiredError.name = "TokenExpiredError";
		JWT.verify.mockImplementation(() => {
			throw expiredError;
		});

		// Act
		await requireSignIn(req, res, next);

		// Assert
		expect(JWT.verify).toHaveBeenCalled();
		expect(next).not.toHaveBeenCalled();
		expect(console.log).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.send).toHaveBeenCalledWith({
			success: false,
			message: "Unauthorized",
		});
	});

	it("isAdmin should call next() when user is admin", async () => {
		// Arrange
		req.user = { _id: "6767" };
		const adminUser = { _id: "6767", role: 1 };
		userModel.findById.mockResolvedValue(adminUser);

		// Act
		await isAdmin(req, res, next);

		// Assert
		expect(userModel.findById).toHaveBeenCalledWith("6767");
		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});

	it("isAdmin should return 401 when user is not admin", async () => {
		// Arrange
		req.user = { _id: "6767" };
		const regularUser = { _id: "6767", role: 0 };
		userModel.findById.mockResolvedValue(regularUser);

		// Act
		await isAdmin(req, res, next);

		// Assert
		expect(userModel.findById).toHaveBeenCalledWith("6767");
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.send).toHaveBeenCalledWith({
			success: false,
			message: "Unauthorized Access",
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("isAdmin should return 401 when no user is attached to request", async () => {
		// Arrange
		req.user = undefined;
		userModel.findById.mockImplementation(() => {
			throw new Error("User not found");
		});

		// Act
		await isAdmin(req, res, next);

		// Assert
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.send).toHaveBeenCalledWith({
			success: false,
			error: expect.any(Error),
			message: "Error in admin middleware",
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("isAdmin should return 401 when findById throws an error", async () => {
		// Arrange
		req.user = { _id: "6767" };
		const dbError = new Error("Database error");
		userModel.findById.mockRejectedValue(dbError);

		// Act
		await isAdmin(req, res, next);

		// Assert
		expect(userModel.findById).toHaveBeenCalledWith("6767");
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.send).toHaveBeenCalledWith({
			success: false,
			error: dbError,
			message: "Error in admin middleware",
		});
		expect(next).not.toHaveBeenCalled();
	});
});

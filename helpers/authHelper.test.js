import bcrypt from "bcrypt";
import { hashPassword, comparePassword } from "./authHelper.js";

// Mock bcrypt
jest.mock("bcrypt");

describe("authHelper", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("hashPassword should successfully hash a password", async () => {
		// Arrange
		const password = "P@ssword123";
		const hashedPassword = "hashedPassworld";
		bcrypt.hash.mockResolvedValue(hashedPassword);

		// Act
		const result = await hashPassword(password);

		// Assert
		expect(result).toBe(hashedPassword);
		expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
	});

	it("hashPassword should handle errors during hashing", async () => {
		// Arrange
		const password = "P@ssword123";
		const error = new Error("Hashing failed");
		bcrypt.hash.mockRejectedValue(error);
		const consoleSpy = jest.spyOn(console, "log").mockImplementation();

		// Act
		const result = await hashPassword(password);

		// Assert
		expect(result).toBeUndefined();
		expect(consoleSpy).toHaveBeenCalledWith(error);

		// Cleanup
		consoleSpy.mockRestore();
	});

	it("comparePassword should return true when passwords match", async () => {
		// Arrange
		const password = "P@ssword123";
		const hashedPassword = "hashedPassworld";
		bcrypt.compare.mockResolvedValue(true);

		// Act
		const result = await comparePassword(password, hashedPassword);

		// Assert
		expect(result).toBe(true);
		expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
	});

	it("comparePassword should return false when passwords do not match", async () => {
		// Arrange
		const password = "P@ssword123";
		const hashedPassword = "hashedPassworld";
		bcrypt.compare.mockResolvedValue(false);

		// Act
		const result = await comparePassword(password, hashedPassword);

		// Assert
		expect(result).toBe(false);
		expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
	});

	it("comparePassword should handle errors during comparison", async () => {
		// Arrange
		const password = "P@ssword123";
		const hashedPassword = "hashedPassworld";
		const error = new Error("Comparison failed");
		bcrypt.compare.mockRejectedValue(error);

		// Act
		const resultPromise = comparePassword(password, hashedPassword);

		// Assert
		await expect(resultPromise).rejects.toThrow("Comparison failed");
		expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
	});
});
